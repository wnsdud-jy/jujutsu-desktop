import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Commit } from '@jujutsu/types';

interface LogState {
    commits: Commit[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchLog: (repoPath: string, revset?: string) => Promise<void>;
    clearLog: () => void;
}

export const useLogStore = create<LogState>((set) => ({
    commits: [],
    loading: false,
    error: null,

    fetchLog: async (repoPath: string, revset?: string) => {
        set({ loading: true, error: null });
        try {
            const commits = await invoke<Commit[]>('jj_get_log', { path: repoPath, revset });
            set({ commits, loading: false });
        } catch (err: unknown) {
            set({
                error: err instanceof Error ? err.message : String(err),
                loading: false
            });
        }
    },

    clearLog: () => {
        set({ commits: [], loading: false, error: null });
    }
}));
