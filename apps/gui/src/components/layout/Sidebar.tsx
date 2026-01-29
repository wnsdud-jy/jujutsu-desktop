import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsModal } from '@/components/features/settings/SettingsModal';
import { ProfileCard } from '@/components/features/profile/ProfileCard';

interface SidebarProps {
    children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
    const { t } = useTranslation();

    return (
        <aside className="w-64 border-r border-border bg-background flex flex-col h-screen relative">
            {/* Top: Logo/Brand */}
            <div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-inner">
                        <span className="text-lg">JJ</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold tracking-tight">{t('sidebar.appName')}</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-80">
                            {t('sidebar.appTagline')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Middle: Content (navigation will go here) */}
            <div className="flex-1 overflow-y-auto p-3 overflow-x-hidden pb-24">
                {children}
            </div>

            {/* Bottom Area: Settings + Profile (Pinned) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pb-4 space-y-2 border-t border-border/50 bg-background/80 backdrop-blur-xl z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                {/* Fade effect at the top of the sticky area */}
                <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                <SettingsModal />
                <ProfileCard />
            </div>
        </aside>
    );
}
