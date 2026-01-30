import { useTranslation } from 'react-i18next';
import { History, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'log' | 'changes';

interface SidebarNavProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
    const { t } = useTranslation();

    const items = [
        {
            id: 'log' as TabId,
            label: t('sidebar.nav.log'),
            icon: History
        },
        {
            id: 'changes' as TabId,
            label: t('sidebar.nav.changes'),
            icon: FileCode
        }
    ];

    return (
        <nav className="flex flex-col gap-1">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                        activeTab === item.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    )}
                >
                    <item.icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        activeTab === item.id ? "text-primary-foreground" : "group-hover:text-primary"
                    )} />
                    <span className="truncate">{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
