import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { generateState, OAuth2RequestError } from 'arctic';
import { parseCookies, serializeCookie } from 'oslo/cookie';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { userTable } from './db/schema';
import { lucia, github } from './auth';
import { generateAuthSuccessHTML } from './templates/auth-success.html';

const app = new Elysia()
    .use(cors())
    .get('/', () => 'Auth Server is Running (Lucia + Drizzle)')
    .get('/auth/success', ({ query, set }) => {
        const token = query.token;

        if (!token || typeof token !== 'string') {
            set.status = 400;
            return 'Missing or invalid token';
        }

        set.headers['Content-Type'] = 'text/html; charset=utf-8';
        return generateAuthSuccessHTML(token);
    })
    .get('/auth/github', async ({ set }) => {
        try {
            const state = generateState();
            const url = await github.createAuthorizationURL(state, ['read:user', 'user:email']);

            set.headers['Set-Cookie'] = serializeCookie('github_oauth_state', state, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 10, // 10 minutes
                path: '/',
            });

            return new Response(null, {
                status: 302,
                headers: {
                    'Location': url.toString(),
                    'Set-Cookie': set.headers['Set-Cookie'] as string
                }
            });
        } catch (error) {
            console.error('Error in /auth/github:', error);
            set.status = 500;
            return `Failed to initiate auth: ${error instanceof Error ? error.message : String(error)}`;
        }
    })
    .get('/auth/github/callback', async ({ request, set }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        const cookies = parseCookies(request.headers.get('Cookie') ?? '');
        const storedState = cookies.get('github_oauth_state');

        if (!code || !state || !storedState || state !== storedState) {
            set.status = 400;
            return 'Invalid request';
        }

        try {
            const tokens = await github.validateAuthorizationCode(code);
            const githubUserResponse = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken()}`,
                },
            });
            const githubUser = (await githubUserResponse.json()) as GitHubUser;

            const existingUser = await db
                .select()
                .from(userTable)
                .where(eq(userTable.githubId, githubUser.id))
                .get();

            let userId = existingUser?.id;

            if (!userId) {
                userId = crypto.randomUUID();
                await db.insert(userTable).values({
                    id: userId,
                    githubId: githubUser.id,
                    username: githubUser.login,
                });
            }

            const session = await lucia.createSession(userId!, {});

            // Redirect to success page which will then deep link to app
            const successUrl = `http://localhost:3000/auth/success?token=${session.id}`;
            console.log('Redirecting to success page:', successUrl);

            return new Response(null, {
                status: 302,
                headers: {
                    'Location': successUrl
                }
            });
        } catch (e) {
            console.error(e);
            if (e instanceof OAuth2RequestError) {
                set.status = 400;
                return 'Invalid code';
            }
            set.status = 500;
            return 'Internal Server Error';
        }
    })
    .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

interface GitHubUser {
    id: number;
    login: string;
}
