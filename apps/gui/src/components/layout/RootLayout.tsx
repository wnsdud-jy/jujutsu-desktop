import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import i18n from '@/i18n/config';

export function RootLayout({ children }: { children: ReactNode }) {
    return (
        <I18nextProvider i18n={i18n}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <div className="min-h-screen bg-background text-foreground">
                    <div className="fixed top-4 right-4 z-50 flex gap-2">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                    <main className="container mx-auto flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </ThemeProvider>
        </I18nextProvider>
    );
}
