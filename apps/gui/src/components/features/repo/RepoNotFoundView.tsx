import { useTranslation } from 'react-i18next';
import { AlertCircle, Trash2, FolderSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepoStore } from '@/lib/repo';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

export function RepoNotFoundView() {
    const { t } = useTranslation();
    const { currentRepo, removeRepository, addRepository } = useRepoStore();

    if (!currentRepo) return null;

    const handleRemove = () => {
        removeRepository(currentRepo.path);
    };

    const handleReconnect = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
            });

            if (selected && typeof selected === 'string') {
                // 1. Verify it's a jj repository
                const isJJ = await invoke<boolean>('is_jj_repo', { path: selected });
                if (!isJJ) {
                    toast.error(t('repo.notFound.notJJRepo'));
                    return;
                }

                // 2. If the original had a remote URL, ensure the new one matches
                if (currentRepo.remoteUrl) {
                    try {
                        const remotes = await invoke<string[]>('get_repo_remote_urls', { path: selected });
                        const normalize = (u: string) => u.replace(/\.git$/, '').replace(/\/$/, '').toLowerCase();
                        const target = normalize(currentRepo.remoteUrl);
                        const hasMatch = remotes.some(r => normalize(r) === target);

                        if (!hasMatch) {
                            toast.error(t('repo.notFound.mismatch'));
                            return;
                        }
                    } catch (error) {
                        console.error('Remote check failed:', error);
                        toast.error(t('repo.error'));
                        return;
                    }
                }

                const name = selected.split('/').pop() || currentRepo.name;
                addRepository({
                    ...currentRepo,
                    path: selected,
                    name: name,
                });
                toast.success(t('repo.success'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('repo.error'));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in zoom-in duration-300">
            <Card className="max-w-md w-full border-destructive/20 shadow-2xl shadow-destructive/5 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-10 w-10 text-destructive animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {t('repo.notFound.title')}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                        {t('repo.notFound.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 py-4">
                    <div className="bg-muted/50 p-3 rounded-lg border border-border/50 break-all text-xs font-mono text-muted-foreground">
                        {t('repo.notFound.path', { path: currentRepo.path })}
                    </div>
                    <p className="text-sm text-center text-muted-foreground italic">
                        {t('repo.notFound.actionRequired')}
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4">
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive group"
                            onClick={handleRemove}
                        >
                            <Trash2 className="h-4 w-4" />
                            {t('repo.notFound.remove')}
                        </Button>
                        <Button
                            className="w-full gap-2 shadow-lg shadow-primary/20"
                            onClick={handleReconnect}
                        >
                            <FolderSearch className="h-4 w-4" />
                            {t('repo.notFound.reconnect')}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
