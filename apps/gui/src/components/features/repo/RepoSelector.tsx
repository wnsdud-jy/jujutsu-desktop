import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, FolderOpen, Github, Copy, Loader2, Clock, Trash2, ExternalLink, Globe, Plus } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { revealItemInDir, openUrl } from '@tauri-apps/plugin-opener';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/auth';
import { useRepoStore } from '@/lib/repo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function RepoSelector() {
    const { t } = useTranslation();
    const { token } = useAuthStore();
    const { currentRepo, repositories, addRepository, setCurrentRepo, removeRepository } = useRepoStore();

    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('local');

    const [cloneUrl, setCloneUrl] = useState('');
    const [clonePath, setClonePath] = useState('');
    const [githubRepos, setGithubRepos] = useState<any[]>([]);
    const [fetchingRepos, setFetchingRepos] = useState(false);
    const [selectedGithubRepo, setSelectedGithubRepo] = useState<any>(null);

    const handleAddLocal = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
            });

            if (selected && typeof selected === 'string') {
                if (repositories.some(r => r.path === selected)) {
                    toast.info(t('repo.alreadyExists'));
                    const existing = repositories.find(r => r.path === selected);
                    if (existing) setCurrentRepo(existing);
                    setIsAddModalOpen(false);
                    return;
                }

                setLoading(true);
                try {
                    const isJJ = await invoke<boolean>('is_jj_repo', { path: selected });

                    if (!isJJ) {
                        try {
                            await invoke('jj_init_repo', { path: selected });
                            toast.success(t('repo.initSuccess'));
                        } catch (error) {
                            console.error('Init error:', error);
                            toast.error(`${t('repo.error')}: ${error}`);
                            setLoading(false);
                            return;
                        }
                    }

                    // Try to get remote URL to extract a better name
                    let remoteUrl: string | undefined = undefined;
                    let avatarUrl: string | undefined = undefined;
                    let name = selected.split('/').pop() || t('repo.untitledRepo');

                    try {
                        const urls = await invoke<string[]>('get_repo_remote_urls', { path: selected });
                        if (urls.length > 0) {
                            remoteUrl = urls[0];
                            const urlParts = remoteUrl.split('/');
                            const lastPart = urlParts[urlParts.length - 1].replace(/\.git$/, '');
                            if (lastPart && lastPart !== 'repo') {
                                name = lastPart;
                            }
                            if (remoteUrl.includes('github.com')) {
                                const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
                                if (match) {
                                    avatarUrl = `https://github.com/${match[1]}.png`;
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Failed to get remotes:', e);
                    }

                    addRepository({
                        path: selected,
                        name: name,
                        source: 'local',
                        remoteUrl,
                        avatarUrl
                    });
                    setIsAddModalOpen(false);
                } catch (error) {
                    toast.error(`${t('repo.error')}: ${error}`);
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleClone = async () => {
        if (!cloneUrl || !clonePath) return;

        if (repositories.some(r => r.path === clonePath)) {
            toast.info(t('repo.alreadyExists'));
            const existing = repositories.find(r => r.path === clonePath);
            if (existing) setCurrentRepo(existing);
            setIsAddModalOpen(false);
            return;
        }

        setLoading(true);
        try {
            await invoke('jj_git_clone', { url: cloneUrl, path: clonePath });
            toast.success(t('repo.cloneSuccess'));

            const name = selectedGithubRepo?.name || clonePath.split('/').pop() || t('repo.clonedRepo');
            const avatarUrl = selectedGithubRepo?.owner?.avatar_url;

            addRepository({
                path: clonePath,
                name: name,
                remoteUrl: cloneUrl,
                source: 'clone',
                avatarUrl: avatarUrl
            });

            setIsAddModalOpen(false);
            setCloneUrl('');
            setClonePath('');
            setSelectedGithubRepo(null);
        } catch (error) {
            toast.error(`${t('repo.error')}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchGithubRepos = async () => {
        if (!token) {
            console.error('No token found');
            toast.error(t('login.loginWithGithub'));
            return;
        }
        setFetchingRepos(true);
        try {
            const response = await fetch('http://localhost:3000/github/repos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setGithubRepos(data);
            } else {
                const error = await response.text();
                console.error('Failed to fetch repos:', error);
                toast.error(`${t('repo.error')}: ${error}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(t('repo.error'));
        } finally {
            setFetchingRepos(false);
        }
    };

    const handleGithubImport = (repo: any) => {
        setCloneUrl(repo.clone_url);
        setClonePath('');
        setSelectedGithubRepo(repo);
        setActiveTab('clone');
    };

    const handleOpenExplorer = async (path: string) => {
        try {
            await revealItemInDir(path);
        } catch (error) {
            toast.error(t('repo.error'));
        }
    };

    const handleViewOnGithub = async (url?: string) => {
        if (!url) return;
        let targetUrl = url;
        if (url.startsWith('git@github.com:')) {
            targetUrl = url.replace('git@github.com:', 'https://github.com/').replace(/\.git$/, '');
        } else if (url.startsWith('https://github.com/')) {
            targetUrl = url.replace(/\.git$/, '');
        } else if (url.includes('github.com')) {
            targetUrl = url.replace(/\.git$/, '');
        }
        try {
            await openUrl(targetUrl);
        } catch (error) {
            console.error('Failed to open URL:', error);
            toast.error(t('repo.error'));
        }
    };

    return (
        <div className="flex flex-col w-full">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors w-full text-left group outline-none">
                        <Avatar className="h-10 w-10 shrink-0 rounded-lg shadow-inner">
                            <AvatarImage src={currentRepo?.avatarUrl} alt={currentRepo?.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold rounded-lg text-lg">
                                {currentRepo?.name?.substring(0, 2).toUpperCase() || 'JJ'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <h1 className="text-sm font-bold tracking-tight truncate leading-tight">
                                {currentRepo ? currentRepo.name : t('sidebar.appName')}
                            </h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-60 truncate">
                                {currentRepo ? currentRepo.path : t('sidebar.appTagline')}
                            </p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="start" sideOffset={8}>
                    {/* Management Label */}
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 py-1">
                        {t('repo.management')}
                    </DropdownMenuLabel>

                    {/* Recent Repositories as Sub-menu */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2 focus:bg-accent cursor-pointer">
                            <Clock className="h-4 w-4" />
                            <span>{t('repo.recent')}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-72">
                                {repositories.length === 0 ? (
                                    <div className="p-4 text-xs text-center text-muted-foreground">{t('repo.noRecent')}</div>
                                ) : (
                                    repositories.map((repo) => (
                                        <DropdownMenuItem
                                            key={repo.path}
                                            onClick={() => setCurrentRepo(repo)}
                                            className="flex items-center gap-2 cursor-pointer group"
                                        >
                                            <Avatar className="h-6 w-6 rounded-sm">
                                                <AvatarImage src={repo.avatarUrl} />
                                                <AvatarFallback className="text-[8px] bg-primary/20">{repo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col overflow-hidden flex-1">
                                                <span className={`truncate text-xs ${currentRepo?.path === repo.path ? 'font-bold text-primary' : 'font-medium'}`}>
                                                    {repo.name}
                                                </span>
                                                <span className="text-[9px] opacity-60 truncate">{repo.path}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeRepository(repo.path);
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    {/* Add Repository right below Recent */}
                    <DropdownMenuItem
                        onClick={() => {
                            setIsAddModalOpen(true);
                            setActiveTab('local');
                        }}
                        className="gap-2 cursor-pointer font-bold text-primary focus:text-primary"
                    >
                        <Plus className="h-4 w-4" />
                        {t('repo.add')}
                    </DropdownMenuItem>

                    {currentRepo && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenExplorer(currentRepo.path)} className="gap-2 cursor-pointer">
                                <ExternalLink className="h-4 w-4" />
                                {t('repo.openInExplorer')}
                            </DropdownMenuItem>
                            {currentRepo.remoteUrl && (
                                <DropdownMenuItem onClick={() => handleViewOnGithub(currentRepo.remoteUrl)} className="gap-2 cursor-pointer">
                                    <Globe className="h-4 w-4" />
                                    {t('repo.viewOnGithub')}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => removeRepository(currentRepo.path)}
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4" />
                                {t('repo.notFound.remove')}
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Unified Add Repository Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-2xl min-h-[400px]">
                    <DialogHeader>
                        <DialogTitle>{t('repo.add')}</DialogTitle>
                        <DialogDescription className="sr-only">
                            {t('repo.management')}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={(val) => {
                        setActiveTab(val);
                        if (val === 'github' && githubRepos.length === 0) {
                            fetchGithubRepos();
                        }
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="local" className="gap-2">
                                <FolderOpen className="h-4 w-4" />
                                {t('repo.tab.local')}
                            </TabsTrigger>
                            <TabsTrigger value="clone" className="gap-2">
                                <Copy className="h-4 w-4" />
                                {t('repo.tab.clone')}
                            </TabsTrigger>
                            <TabsTrigger value="github" className="gap-2">
                                <Github className="h-4 w-4" />
                                {t('repo.tab.github')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="local" className="space-y-6 py-4">
                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl gap-4 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleAddLocal}>
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <FolderOpen className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-lg">{t('repo.addLocal')}</p>
                                    <p className="text-sm text-muted-foreground">{t('repo.selectDir')}</p>
                                </div>
                                <Button variant="outline" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); handleAddLocal(); }}>
                                    {t('repo.selectDir')}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="clone" className="space-y-4 py-2">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="url">{t('repo.url')}</Label>
                                    <Input
                                        id="url"
                                        value={cloneUrl}
                                        onChange={(e) => setCloneUrl(e.target.value)}
                                        placeholder="https://github.com/user/repo.git"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="path">{t('repo.path')}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="path"
                                            value={clonePath}
                                            readOnly
                                            placeholder={t('repo.selectDir')}
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={async () => {
                                                const selected = await open({ directory: true });
                                                if (selected && typeof selected === 'string') {
                                                    setClonePath(selected);
                                                }
                                            }}
                                        >
                                            <FolderOpen className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleClone} disabled={loading || !cloneUrl || !clonePath} className="w-full sm:w-auto px-10">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('repo.clone')}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="github" className="py-2">
                            <Command className="rounded-xl border shadow-sm">
                                <CommandInput placeholder={t('repo.searchGithub')} className="h-12" />
                                <CommandList className="max-h-[300px]">
                                    {fetchingRepos ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : !token ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                                            <Github className="h-8 w-8 text-muted-foreground opacity-50" />
                                            <p className="text-sm text-muted-foreground">{t('login.loginWithGithub')}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <CommandEmpty>{t('repo.noReposFound')}</CommandEmpty>
                                            <CommandGroup>
                                                {githubRepos.map((repo) => (
                                                    <CommandItem
                                                        key={repo.id}
                                                        onSelect={() => handleGithubImport(repo)}
                                                        className="cursor-pointer p-3 hover:bg-accent transition-colors"
                                                    >
                                                        <Avatar className="h-10 w-10 mr-3 rounded-md shrink-0 shadow-sm">
                                                            <AvatarImage src={repo.owner.avatar_url} />
                                                            <AvatarFallback className="bg-muted text-xs font-bold">{repo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col overflow-hidden text-left flex-1">
                                                            <span className="font-bold text-sm truncate">{repo.full_name}</span>
                                                            <span className="text-[11px] text-muted-foreground line-clamp-1 italic">
                                                                {repo.description || t('repo.noDescription')}
                                                            </span>
                                                        </div>
                                                        <ExternalLink className="h-4 w-4 opacity-30 group-hover:opacity-100" />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}
                                </CommandList>
                            </Command>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}
