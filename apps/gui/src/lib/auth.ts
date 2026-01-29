import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    githubUsername: string | null;
    githubAvatarUrl: string | null;
    setAuth: (token: string, username: string, avatarUrl: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            githubUsername: null,
            githubAvatarUrl: null,
            setAuth: (token, username, avatarUrl) =>
                set({ token, githubUsername: username, githubAvatarUrl: avatarUrl }),
            logout: () => set({ token: null, githubUsername: null, githubAvatarUrl: null }),
        }),
        {
            name: 'jj-auth-storage',
        }
    )
);
