import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard({ onLogout }: { onLogout: () => void }) {
    const { t } = useTranslation();

    return (
        <div className="w-full max-w-4xl space-y-6">
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('dashboard.title')}</CardTitle>
                    <CardDescription>{t('dashboard.underDevelopment')}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                        className="flex flex-col items-center justify-center space-y-4 py-12"
                    >
                        <div className="text-6xl font-bold text-muted-foreground">
                            {t('dashboard.comingSoon')}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t('dashboard.stayTuned')}
                        </p>
                    </motion.div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button variant="destructive" onClick={onLogout} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            {t('dashboard.logout')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
