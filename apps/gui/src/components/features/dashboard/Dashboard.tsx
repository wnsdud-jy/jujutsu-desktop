import { useEffect, useState } from 'react';
import { useRepoStore } from '@/lib/repo';
import { Sidebar } from '@/components/layout/Sidebar';
import { RepoNotFoundView } from '@/components/features/repo/RepoNotFoundView';
import { invoke } from '@tauri-apps/api/core';
import { Loader2 } from 'lucide-react';
import { OperationLogView } from '@/components/features/repo/components/OperationLogView';
import { ChangesView } from '@/components/features/repo/components/ChangesView';
import { CommitStackView } from '@/components/features/repo/components/CommitStackView';
import { SidebarNav, TabId } from '@/components/layout/SidebarNav';

export function Dashboard() {
    const { currentRepo, isCurrentRepoValid, setIsCurrentRepoValid } = useRepoStore();
    const [checking, setChecking] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('history');

    useEffect(() => {
        const checkPath = async () => {
            if (!currentRepo) return;

            setChecking(true);
            try {
                const exists = await invoke<boolean>('check_path_exists', { path: currentRepo.path });
                setIsCurrentRepoValid(exists);

                if (exists) {
                    await invoke('watch_repo', { path: currentRepo.path });
                }
            } catch (error) {
                console.error('Failed to check path or start watcher:', error);
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
                <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
            </Sidebar>

            <main className="flex-1 relative overflow-hidden flex flex-col">
                {checking ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !isCurrentRepoValid ? (
                    <RepoNotFoundView />
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === 'history' && <CommitStackView />}
                        {activeTab === 'changes' && <ChangesView />}
                        {activeTab === 'operations' && <OperationLogView />}
                    </div>
                )}
            </main>
        </div>
    );
}
