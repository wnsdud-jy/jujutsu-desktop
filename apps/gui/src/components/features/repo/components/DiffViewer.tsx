import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DiffViewerProps {
    diff: string | null;
    loading?: boolean;
}

export function DiffViewer({ diff, loading }: DiffViewerProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>{t('changes.refreshing')}</span>
                </div>
            </div>
        );
    }

    if (!diff) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground bg-accent/5 rounded-lg border border-dashed m-4">
                <div className="flex flex-col items-center gap-2">
                    <p>{t('changes.selectFile')}</p>
                </div>
            </div>
        );
    }

    const lines = diff.split('\n');

    return (
        <div className="flex-1 overflow-auto bg-card">
            <div className="min-w-full inline-block align-middle font-mono text-[13px] leading-6">
                <table className="w-full border-collapse">
                    <tbody>
                        {lines.map((line, i) => {
                            const isAddition = line.startsWith('+');
                            const isDeletion = line.startsWith('-');
                            const isHeader = line.startsWith('@@') || line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++');

                            // Don't show markers for additions/deletions if they are the first char
                            // or keep them for classic git diff look

                            return (
                                <tr
                                    key={i}
                                    className={cn(
                                        "group transition-colors",
                                        isAddition && "bg-emerald-500/15 text-emerald-900 dark:text-emerald-300",
                                        isDeletion && "bg-rose-500/15 text-rose-900 dark:text-rose-300",
                                        isHeader && "bg-muted/30 text-muted-foreground font-bold",
                                        !isAddition && !isDeletion && !isHeader && "hover:bg-accent/50"
                                    )}
                                >
                                    <td className="w-12 text-right pr-3 select-none text-muted-foreground/50 border-r border-border/50 px-2 shrink-0">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 whitespace-pre break-all">
                                        {line}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
