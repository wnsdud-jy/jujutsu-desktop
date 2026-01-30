import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRepoStore } from '@/lib/repo';
import { Sidebar } from '@/components/layout/Sidebar';
import { RepoNotFoundView } from '@/components/features/repo/RepoNotFoundView';
import { invoke } from '@tauri-apps/api/core';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
    const { t } = useTranslation();
    const { currentRepo, isCurrentRepoValid, setIsCurrentRepoValid } = useRepoStore();
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        const checkPath = async () => {
            if (!currentRepo) return;

            setChecking(true);
            try {
                const exists = await invoke<boolean>('check_path_exists', { path: currentRepo.path });
                setIsCurrentRepoValid(exists);
            } catch (error) {
                console.error('Failed to check path:', error);
                setIsCurrentRepoValid(false);
            } finally {
                setChecking(false);
            }
        };

        checkPath();
    }, [currentRepo, setIsCurrentRepoValid]);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <Sidebar>
                {/* Sidebar Navigation items can be added here */}
                <div className="flex flex-col gap-1">
                    {/* Placeholder for future nav items */}
                </div>
            </Sidebar>

            <main className="flex-1 relative overflow-hidden flex flex-col">
                {checking ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !isCurrentRepoValid ? (
                    <RepoNotFoundView />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">{t('dashboard.title')}</h1>
                        <div className="max-w-md space-y-2">
                            <p className="text-xl text-muted-foreground">{t('dashboard.comingSoon')}</p>
                            <p className="text-muted-foreground italicOpacity-70">
                                {t('dashboard.underDevelopment')}
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
