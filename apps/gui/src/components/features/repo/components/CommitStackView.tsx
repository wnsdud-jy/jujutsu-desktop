import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Bookmark, RefreshCw, Undo, Plus, Magnet, Edit3, MessageCircle } from 'lucide-react';
import { useRepoStore } from '@/lib/repo';
import { useLogStore } from '@/lib/log';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

export function CommitStackView() {
    const { t } = useTranslation();
    const currentRepo = useRepoStore(state => state.currentRepo);
    const { commits, loading, fetchLog } = useLogStore();

    useEffect(() => {
        if (currentRepo?.path) {
            fetchLog(currentRepo.path);
        }

        const unlisten = listen('repo-changed', () => {
            if (currentRepo?.path) {
                fetchLog(currentRepo.path);
            }
        });

        return () => {
            unlisten.then(f => f());
        };
    }, [currentRepo?.path, fetchLog]);

    const handleAction = async (command: string) => {
        if (!currentRepo?.path) return;
        try {
            const result = await invoke<string>(`jj_${command}`, { path: currentRepo.path });
            toast.success(t(`actions.${command}Success`) || result);
            fetchLog(currentRepo.path);
        } catch (err) {
            toast.error(String(err));
        }
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden font-sans">
            {/* Action Bar */}
            <div className="h-14 border-b flex items-center px-4 gap-2 bg-muted/5 shrink-0">
                <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg">
                    <Button variant="ghost" size="sm" onClick={() => handleAction('undo')} className="h-8 gap-2 px-3 text-xs font-medium hover:bg-background hover:shadow-sm transition-all" title="jj undo">
                        <Undo className="h-3.5 w-3.5" />
                        <span>Undo</span>
                    </Button>
                    <div className="w-px h-4 bg-border/50 mx-1" />
                    <Button variant="ghost" size="sm" onClick={() => handleAction('new')} className="h-8 gap-2 px-3 text-xs font-medium hover:bg-background hover:shadow-sm transition-all" title="jj new">
                        <Plus className="h-3.5 w-3.5" />
                        <span>New</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAction('absorb')} className="h-8 gap-2 px-3 text-xs font-medium hover:bg-background hover:shadow-sm transition-all" title="jj absorb">
                        <Magnet className="h-3.5 w-3.5" />
                        <span>Absorb</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAction('describe')} className="h-8 gap-2 px-3 text-xs font-medium hover:bg-background hover:shadow-sm transition-all" title="jj describe">
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Msg</span>
                    </Button>
                </div>

                <div className="flex-1" />

                <Button variant="ghost" size="icon" onClick={() => currentRepo && fetchLog(currentRepo.path)} disabled={loading} className="h-9 w-9 rounded-full">
                    <RefreshCw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-8 relative min-h-full">
                    {/* Vertical Graph Line */}
                    <div className="absolute left-[2.95rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-border/60 to-transparent rounded-full" />

                    <div className="space-y-5 relative">
                        {commits.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6 opacity-20" />
                                </div>
                                <p className="text-sm font-medium">{t('log.noHistory')}</p>
                            </div>
                        )}
                        <AnimatePresence initial={false}>
                            {commits.map((commit) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    key={commit.id}
                                    className={cn(
                                        "relative flex gap-6 p-5 rounded-2xl border transition-all group",
                                        commit.isCurrent
                                            ? "bg-primary/[0.02] border-primary/30 ring-1 ring-primary/10 shadow-[0_4px_20px_-4px_rgba(var(--primary),0.1)]"
                                            : "bg-card hover:border-primary/20 hover:bg-accent/5",
                                        commit.isImmutable && "opacity-75 grayscale-[0.2]"
                                    )}
                                >
                                    {/* Node Icon */}
                                    <div className="mt-1 flex flex-col items-center shrink-0">
                                        <div className={cn(
                                            "h-7 w-7 rounded-full border-2 flex items-center justify-center bg-background z-10 transition-all duration-300",
                                            commit.isCurrent ? "border-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]" : "border-muted-foreground/20",
                                            commit.isImmutable && "bg-muted/50 border-muted-foreground/20"
                                        )}>
                                            {commit.isCurrent ? (
                                                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                                            ) : commit.isImmutable ? (
                                                <Lock className="h-3 w-3 text-muted-foreground/60" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-muted-foreground/20 group-hover:bg-primary/40" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5 min-w-0">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={cn(
                                                        "text-[15px] font-semibold truncate tracking-tight",
                                                        commit.isCurrent ? "text-primary" : "text-foreground"
                                                    )}>
                                                        {commit.description || <span className="italic opacity-40 font-normal">{t('repo.noDescription') || 'No description'}</span>}
                                                    </span>
                                                    {commit.isConflicted && (
                                                        <Badge variant="destructive" className="h-4 px-1.5 text-[9px] uppercase font-bold tracking-wider rounded-md">
                                                            Conflict
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground/80">
                                                    <span className="text-foreground bg-muted/60 px-2 py-0.5 rounded-md font-mono tracking-tight">{commit.changeId.slice(0, 7)}</span>
                                                    <span className="h-1 w-1 rounded-full bg-border" />
                                                    <span className="truncate hover:text-foreground transition-colors cursor-default">{commit.author}</span>
                                                </div>
                                            </div>
                                            <time className="text-[11px] font-medium text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-md whitespace-nowrap mt-0.5">
                                                {commit.date}
                                            </time>
                                        </div>

                                        {commit.bookmarks.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {commit.bookmarks.map(bm => (
                                                    <Badge key={bm} variant="outline" className="h-5 px-2 gap-1.5 text-[10px] font-bold border-primary/20 text-primary bg-primary/[0.03] rounded-md shadow-sm">
                                                        <Bookmark className="h-3 w-3" />
                                                        {bm}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
