import { useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, RefreshCw } from 'lucide-react';
import { useRepoStore } from '@/lib/repo';
import { useChangesStore } from '@/lib/changes';
import { DiffViewer } from './DiffViewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileStatus } from '@jujutsu/types';

export function ChangesView() {
    const { t } = useTranslation();
    const currentRepo = useRepoStore(state => state.currentRepo);
    const {
        files,
        selectedFile,
        diffContent,
        currentChangeId,
        loading,
        error,
        fetchStatus,
        fetchDiff,
        setSelectedFile
    } = useChangesStore();

    const refresh = useCallback(async () => {
        if (currentRepo?.path) {
            await fetchStatus(currentRepo.path);
        }
    }, [currentRepo, fetchStatus]);

    useEffect(() => {
        refresh();

        // Listen for real-time changes from Rust backend
        const unlisten = listen('repo-changed', () => {
            refresh();
        });

        // Refresh on window focus as a fallback
        const handleFocus = () => refresh();
        window.addEventListener('focus', handleFocus);

        return () => {
            unlisten.then(f => f());
            window.removeEventListener('focus', handleFocus);
        };
    }, [refresh]);

    const handleFileClick = (path: string) => {
        setSelectedFile(path);
        if (currentRepo?.path) {
            fetchDiff(currentRepo.path, path);
        }
    };

    const getStatusBadge = (status: FileStatus) => {
        const labels = {
            Added: 'A',
            Modified: 'M',
            Removed: 'D',
            Conflicted: 'C'
        };

        const colors = {
            Added: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            Modified: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
            Removed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
            Conflicted: "bg-rose-600/10 text-rose-700 dark:text-rose-500 border-rose-600/20"
        };

        return (
            <Badge variant="outline" className={cn("px-1.5 h-5 min-w-[1.25rem] justify-center font-bold text-[10px]", colors[status])}>
                {labels[status]}
            </Badge>
        );
    };

    return (
        <div className="flex h-full overflow-hidden bg-background">
            {/* Sidebar: File List */}
            <div className="w-80 border-r flex flex-col bg-muted/10">
                <div className="p-4 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold">{t('changes.title')}</h2>
                        {currentChangeId && (
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('changes.currentCommit')}:</span>
                                <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">
                                    {currentChangeId.slice(0, 12)}
                                </code>
                            </div>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={refresh} disabled={loading} className="h-8 w-8">
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-0.5">
                        {files.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                {t('changes.noChanges')}
                            </div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {files.map((file) => (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={file.path}
                                        onClick={() => handleFileClick(file.path)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                                            selectedFile === file.path
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
                                        )}
                                    >
                                        <div className="flex-shrink-0">
                                            {getStatusBadge(file.status)}
                                        </div>
                                        <span className="flex-1 truncate text-left font-medium">
                                            {file.path.split('/').pop()}
                                            <span className="block text-[10px] opacity-60 font-normal truncate">
                                                {file.path}
                                            </span>
                                        </span>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content: Diff Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-card/50">
                {selectedFile ? (
                    <div className="flex flex-col h-full">
                        <div className="h-12 border-b px-4 flex items-center justify-between bg-muted/20 shrink-0">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium truncate max-w-md">{selectedFile}</span>
                            </div>
                        </div>
                        {error && (
                            <div className="p-4 m-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                <span>{error}</span>
                            </div>
                        )}
                        <DiffViewer diff={diffContent} loading={loading && !diffContent} />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground bg-accent/5">
                        <div className="flex flex-col items-center gap-4 text-center p-8 max-w-xs">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <FileText className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">{t('changes.selectFile')}</p>
                                <p className="text-sm">{t('changes.noChanges')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
