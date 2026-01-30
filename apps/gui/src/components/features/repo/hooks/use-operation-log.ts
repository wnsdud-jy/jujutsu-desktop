import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Operation } from '@jujutsu/types';

/**
 * Hook for managing jj operation logs and restoration.
 */
export function useOperationLog(repoPath?: string) {
    const { t } = useTranslation();
    const [operations, setOperations] = useState<Operation[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOperations = useCallback(async () => {
        if (!repoPath) return;
        setLoading(true);
        try {
            const result = await invoke<Operation[]>('jj_get_operation_log', { path: repoPath });
            setOperations(result);
        } catch (error) {
            console.error('Failed to fetch operation log:', error);
            toast.error(t('repo.error'));
        } finally {
            setLoading(false);
        }
    }, [repoPath, t]);

    const restoreOperation = useCallback(async (id: string) => {
        if (!repoPath) return;
        setLoading(true);
        try {
            const result = await invoke<string>('jj_restore_operation', { path: repoPath, id });
            toast.success(result);
            // Refresh log after restore
            await fetchOperations();
        } catch (error) {
            console.error('Failed to restore operation:', error);
            toast.error(`${t('repo.error')}: ${error}`);
        } finally {
            setLoading(false);
        }
    }, [repoPath, fetchOperations, t]);

    return {
        operations,
        loading,
        fetchOperations,
        restoreOperation
    };
}
