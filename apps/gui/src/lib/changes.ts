import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { ChangedFile, ChangeSet } from '@jujutsu/types';

interface ChangesState {
    files: ChangedFile[];
    selectedFile: string | null;
    diffContent: string | null;
    currentChangeId: string | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchStatus: (repoPath: string) => Promise<void>;
    fetchDiff: (repoPath: string, filePath: string) => Promise<void>;
    setSelectedFile: (file: string | null) => void;
    clearChanges: () => void;
}

export const useChangesStore = create<ChangesState>((set, get) => ({
    files: [],
    selectedFile: null,
    diffContent: null,
    currentChangeId: null,
    loading: false,
    error: null,

    fetchStatus: async (repoPath: string) => {
        set({ loading: true, error: null });
        try {
            const result = await invoke<ChangeSet>('get_jj_status', { path: repoPath });
            set({
                files: result.files,
                currentChangeId: result.changeId,
                loading: false
            });

            // If a file was selected, refresh its diff
            const { selectedFile } = get();
            if (selectedFile) {
                const stillExists = result.files.find((f: ChangedFile) => f.path === selectedFile);
                if (stillExists) {
                    await get().fetchDiff(repoPath, selectedFile);
                } else {
                    set({ selectedFile: null, diffContent: null });
                }
            }
        } catch (err: unknown) {
            set({ error: err instanceof Error ? err.message : String(err), loading: false });
        }
    },

    fetchDiff: async (repoPath: string, filePath: string) => {
        set({ loading: true, error: null });
        try {
            const diff = await invoke<string>('get_jj_diff', { path: repoPath, filePath });
            set({ diffContent: diff, loading: false });
        } catch (err: unknown) {
            set({ error: err instanceof Error ? err.message : String(err), loading: false });
        }
    },

    setSelectedFile: (file: string | null) => {
        set({ selectedFile: file });
        if (!file) {
            set({ diffContent: null });
        }
    },

    clearChanges: () => {
        set({
            files: [],
            selectedFile: null,
            diffContent: null,
            currentChangeId: null,
            error: null,
            loading: false
        });
    }
}));
