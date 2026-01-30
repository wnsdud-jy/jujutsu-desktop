import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RepoConfig } from '@jujutsu/types';

interface RepoState {
    repositories: RepoConfig[];
    currentRepo: RepoConfig | null;
    isCurrentRepoValid: boolean;
    addRepository: (repo: RepoConfig) => void;
    removeRepository: (path: string) => void;
    setCurrentRepo: (repo: RepoConfig | null) => void;
    setIsCurrentRepoValid: (isValid: boolean) => void;
}

export const useRepoStore = create<RepoState>()(
    persist(
        (set) => ({
            repositories: [],
            currentRepo: null,
            isCurrentRepoValid: true,
            addRepository: (repo) =>
                set((state) => ({
                    repositories: [...state.repositories.filter(r => r.path !== repo.path), repo],
                    currentRepo: repo,
                    isCurrentRepoValid: true,
                })),
            removeRepository: (path) =>
                set((state) => {
                    const nextRepos = state.repositories.filter(r => r.path !== path);
                    const isClosingCurrent = state.currentRepo?.path === path;
                    return {
                        repositories: nextRepos,
                        currentRepo: isClosingCurrent ? (nextRepos[0] || null) : state.currentRepo,
                        isCurrentRepoValid: isClosingCurrent ? true : state.isCurrentRepoValid,
                    };
                }),
            setCurrentRepo: (repo) => set({ currentRepo: repo, isCurrentRepoValid: true }),
            setIsCurrentRepoValid: (isValid) => set({ isCurrentRepoValid: isValid }),
        }),
        {
            name: 'jj-repo-storage',
        }
    )
);
