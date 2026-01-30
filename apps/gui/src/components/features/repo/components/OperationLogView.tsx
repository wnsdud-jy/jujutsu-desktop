import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOperationLog } from '../hooks/use-operation-log';
import { useRepoStore } from '@/lib/repo';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Clock,
    Undo2,
    User,
    Terminal,
    Hash,
    RefreshCw,
    History
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function OperationLogView() {
    const { t, i18n } = useTranslation();
    const { currentRepo } = useRepoStore();
    const {
        operations,
        loading,
        fetchOperations,
        restoreOperation
    } = useOperationLog(currentRepo?.path);

    useEffect(() => {
        if (currentRepo?.path) {
            fetchOperations();
        }
    }, [currentRepo?.path, fetchOperations]);

    const dateLocale = i18n.language === 'ko' ? ko : enUS;

    const parseRelativeTime = (timeStr: string) => {
        try {
            const date = new Date(timeStr);
            return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
        } catch {
            return timeStr;
        }
    };

    if (!currentRepo) return null;

    return (
        <Card className="w-full h-full border-none shadow-none bg-transparent flex flex-col">
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <History className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight">
                            {t('operations.title')}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {t('operations.description')}
                        </CardDescription>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchOperations()}
                    disabled={loading}
                    className="h-9 w-9"
                >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="px-6 pb-6 space-y-3">
                        {operations.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                                <History className="h-12 w-12 mb-4" />
                                <p>{t('operations.noHistory')}</p>
                            </div>
                        ) : (
                            operations.map((op, index) => (
                                <div
                                    key={op.id}
                                    className="group relative flex flex-col p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                            <Hash className="h-3 w-3" />
                                            {op.id.substring(0, 12)}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            {parseRelativeTime(op.time)}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Terminal className="h-3.5 w-3.5 text-primary shrink-0" />
                                                <span className="text-sm font-semibold truncate leading-none">
                                                    {op.description.split('\n')[0]}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <User className="h-3.5 w-3.5 shrink-0" />
                                                <span>{op.user}</span>
                                            </div>

                                            {op.description.includes('\n') && (
                                                <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed italic">
                                                    {op.description.split('\n').slice(1).join(' ')}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap gap-1.5 h-8 font-bold"
                                            onClick={() => {
                                                if (window.confirm(t('operations.undoConfirm'))) {
                                                    restoreOperation(op.id);
                                                }
                                            }}
                                        >
                                            <Undo2 className="h-3.5 w-3.5" />
                                            {t('operations.undo')}
                                        </Button>
                                    </div>

                                    {/* Visual timeline connector */}
                                    {index !== operations.length - 1 && (
                                        <div className="absolute left-[-24px] top-[50%] bottom-[-50%] w-[1px] bg-border group-hover:bg-primary/30 transition-colors hidden md:block" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
