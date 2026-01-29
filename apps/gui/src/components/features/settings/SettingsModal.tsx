import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import {
    Settings,
    LogOut,
    User,
    ExternalLink,
    Github,
    Monitor,
    Sun,
    Moon,
    Globe,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { openUrl } from '@tauri-apps/plugin-opener';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function SettingsModal() {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { githubUsername, githubAvatarUrl, logout } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const handleLanguageChange = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    const handleLogout = () => {
        logout();
        setOpen(false);
    };

    const handleViewProfile = async () => {
        if (githubUsername) {
            await openUrl(`https://github.com/${githubUsername}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground group transition-all rounded-xl hover:bg-secondary/50"
                >
                    <Settings className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
                    <span className="font-medium text-sm">{t('settings.button')}</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-br from-background to-secondary/10 p-6 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <div className="p-1 px-2 rounded-lg bg-primary text-primary-foreground text-xs">JJ</div>
                            {t('settings.title')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground/80 font-medium">
                            {t('settings.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted/40 backdrop-blur-sm rounded-xl border border-border/50">
                            <TabsTrigger
                                value="general"
                                className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-wider"
                            >
                                <Settings className="h-3.5 w-3.5" />
                                {t('settings.tabs.general')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="account"
                                className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-wider"
                            >
                                <User className="h-3.5 w-3.5" />
                                {t('settings.tabs.account')}
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative overflow-hidden min-h-[320px] mt-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'general' && (
                                    <motion.div
                                        key="general"
                                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="space-y-8 outline-none"
                                    >
                                        {/* Appearance Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                    {theme === 'light' ? <Sun className="h-4 w-4" /> : theme === 'dark' ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                                </div>
                                                <Label className="text-sm font-bold tracking-tight">{t('settings.sections.appearance')}</Label>
                                            </div>

                                            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'light', icon: Sun, label: t('settings.themeLight'), color: 'text-orange-500' },
                                                    { id: 'dark', icon: Moon, label: t('settings.themeDark'), color: 'text-blue-500' },
                                                    { id: 'system', icon: Monitor, label: t('settings.themeSystem'), color: 'text-muted-foreground' }
                                                ].map((opt) => (
                                                    <div key={opt.id}>
                                                        <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                                                        <Label
                                                            htmlFor={opt.id}
                                                            className={cn(
                                                                "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-muted bg-popover/40 p-3 hover:bg-accent/50 cursor-pointer transition-all h-24 relative overflow-hidden group/opt",
                                                                theme === opt.id && "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                                            )}
                                                        >
                                                            <opt.icon className={cn("h-6 w-6 transition-transform group-hover/opt:scale-110", opt.color)} />
                                                            <span className="text-[10px] font-extrabold uppercase tracking-tighter">{opt.label}</span>
                                                            {theme === opt.id && (
                                                                <motion.div
                                                                    layoutId="active-theme"
                                                                    className="absolute top-2 right-2"
                                                                >
                                                                    <div className="rounded-full bg-primary p-0.5">
                                                                        <Check className="h-2 w-2 text-primary-foreground" />
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        <Separator className="opacity-40" />

                                        {/* Language Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <Label className="text-sm font-bold tracking-tight">{t('settings.sections.language')}</Label>
                                            </div>
                                            <Select value={i18n.language} onValueChange={handleLanguageChange}>
                                                <SelectTrigger className="w-full h-11 rounded-xl border-2 bg-muted/20 focus:ring-primary/20 transition-all hover:bg-muted/30">
                                                    <SelectValue placeholder={t('settings.languageSelect')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-2xl border-border/40 backdrop-blur-3xl bg-background/95">
                                                    <SelectItem value="en" className="py-3 rounded-lg focus:bg-primary/5 cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center justify-center w-6 h-4 text-[9px] font-black border border-border/50 rounded bg-muted/50 shadow-sm text-muted-foreground">EN</span>
                                                            <span className="text-sm font-bold">English</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="ko" className="py-3 rounded-lg focus:bg-primary/5 cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center justify-center w-6 h-4 text-[9px] font-black border border-border/50 rounded bg-muted/50 shadow-sm text-muted-foreground">KO</span>
                                                            <span className="text-sm font-bold">한국어</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'account' && (
                                    <motion.div
                                        key="account"
                                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="space-y-6 outline-none"
                                    >
                                        <div className="p-6 rounded-3xl border border-secondary/50 bg-secondary/10 backdrop-blur-md relative overflow-hidden group">
                                            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 duration-700">
                                                <Github className="h-32 w-32" />
                                            </div>
                                            <div className="relative flex items-center gap-6">
                                                <div className="relative h-20 w-20 rounded-full p-1.5 border-2 border-primary/30 bg-background shadow-2xl">
                                                    <img
                                                        src={githubAvatarUrl || 'https://github.com/ghost.png'}
                                                        alt={githubUsername || 'User'}
                                                        className="h-full w-full rounded-full object-cover transition-transform group-hover:scale-110 duration-700"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 border border-border shadow-sm">
                                                        <Github className="h-3 w-3 text-primary" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-2xl truncate leading-tight tracking-tighter mb-1">{githubUsername}</h3>
                                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                                        <span className="text-[9px] text-primary font-black uppercase tracking-widest">
                                                            {t('settings.account.connectedVia')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4">
                                            <Button
                                                variant="outline"
                                                className="w-full h-12 rounded-2xl gap-3 border-2 hover:bg-secondary/30 transition-all font-bold shadow-sm"
                                                onClick={handleViewProfile}
                                            >
                                                <ExternalLink className="h-4 w-4 text-primary" />
                                                {t('settings.account.viewProfile')}
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                className="w-full h-12 rounded-2xl gap-3 shadow-lg hover:shadow-destructive/20 transition-all font-bold"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                {t('settings.account.logout')}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
