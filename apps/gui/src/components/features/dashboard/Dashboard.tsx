import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/Sidebar';

export function Dashboard() {
    const { t } = useTranslation();

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
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
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
