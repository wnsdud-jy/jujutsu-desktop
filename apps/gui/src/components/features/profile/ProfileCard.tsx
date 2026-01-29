import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/lib/auth';
import { Card } from '@/components/ui/card';

export function ProfileCard() {
    const { t } = useTranslation();
    const { githubUsername, githubAvatarUrl } = useAuthStore();

    if (!githubUsername) {
        return null;
    }

    return (
        <Card className="p-2.5 flex items-center gap-3 bg-secondary/30 backdrop-blur-md border border-secondary/50 shadow-sm transition-all hover:bg-secondary/50">
            <div className="relative flex-shrink-0">
                <img
                    src={githubAvatarUrl || 'https://github.com/ghost.png'}
                    alt={githubUsername}
                    className="w-8 h-8 rounded-full border border-primary/10 object-cover"
                />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-medium truncate">{githubUsername}</span>
                    <Github className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
                <p className="text-[10px] leading-tight text-muted-foreground truncate uppercase tracking-wider font-semibold opacity-70">
                    {t('profile.githubAccount')}
                </p>
            </div>
        </Card>
    );
}
