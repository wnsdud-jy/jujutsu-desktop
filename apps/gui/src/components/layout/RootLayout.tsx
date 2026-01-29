import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import i18n from '@/i18n/config';

export function RootLayout({ children }: { children: ReactNode }) {
    return (
        <I18nextProvider i18n={i18n}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <div className="min-h-screen bg-background text-foreground">
                    {children}
                </div>
            </ThemeProvider>
        </I18nextProvider>
    );
}
