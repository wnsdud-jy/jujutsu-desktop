import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { useAuthStore } from '@/lib/auth';

export const useDeepLink = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const handleUrl = async (url: string) => {
            // Expected format: jujutsu://auth?token=...&username=...&avatar=...
            try {
                if (url.startsWith('jujutsu://auth')) {
                    const urlObj = new URL(url);
                    const token = urlObj.searchParams.get('token');
                    const username = urlObj.searchParams.get('username');
                    const avatar = urlObj.searchParams.get('avatar');

                    if (token) {
                        console.log('Token extracted from deep link');
                        // For now, use placeholder values if GitHub info not provided
                        // TODO: Fetch from GitHub API using token
                        setAuth(
                            token,
                            username || 'User',
                            avatar || 'https://github.com/ghost.png'
                        );
                    }
                }
            } catch (e) {
                console.error('Failed to parse deep link URL:', e);
            }
        };

        // 1. Handle deep links when app is already running (Single Instance)
        const unlisten = listen<string>('deep-link', (event) => {
            console.log('Deep link event received:', event.payload);
            handleUrl(event.payload);
        });

        // 2. Handle deep links when app is started via URL (Deep Link Plugin)
        const initDeepLink = async () => {
            await onOpenUrl((urls) => {
                console.log('Deep link(s) received via plugin:', urls);
                for (const url of urls) {
                    handleUrl(url);
                }
            });
        };

        initDeepLink();

        return () => {
            unlisten.then((f) => f());
        };
    }, [setAuth]);
};
