import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Github, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundPattern } from '@/components/common/BackgroundPattern';

interface LoginPageProps {
    onLogin: () => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await onLogin();
        } finally {
            // Keep loading state until redirect happens
            // Don't set to false as user will be redirected
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center">
            <BackgroundPattern />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md border-2">
                    <CardHeader className="space-y-1 text-center">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.2,
                                type: "spring",
                                stiffness: 200
                            }}
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                        >
                            <span className="text-3xl font-bold text-primary">JJ</span>
                        </motion.div>

                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t('login.title')}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {t('login.subtitle')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full gap-2 bg-[#24292e] text-white hover:bg-[#2ea44f] dark:bg-[#2ea44f] dark:hover:bg-[#24292e]"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t('login.loggingIn')}
                                </>
                            ) : (
                                <>
                                    <Github className="h-5 w-5" />
                                    {t('login.loginWithGithub')}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
