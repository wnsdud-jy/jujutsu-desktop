import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FolderOpen, Copy, Github, Loader2, ExternalLink } from 'lucide-react';
import { GithubRepository } from '@jujutsu/types';
import { open } from '@tauri-apps/plugin-dialog';

interface AddRepoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    loading: boolean;
    cloneUrl: string;
    setCloneUrl: (url: string) => void;
    clonePath: string;
    setClonePath: (path: string) => void;
    githubRepos: GithubRepository[];
    fetchingRepos: boolean;
    token: string | null;
    onAddLocal: () => void;
    onClone: () => void;
    onGithubImport: (repo: GithubRepository) => void;
    fetchGithubRepos: () => void;
}

export function AddRepoModal({
    open: isOpen,
    onOpenChange,
    activeTab,
    onTabChange,
    loading,
    cloneUrl,
    setCloneUrl,
    clonePath,
    setClonePath,
    githubRepos,
    fetchingRepos,
    token,
    onAddLocal,
    onClone,
    onGithubImport,
    fetchGithubRepos
}: AddRepoModalProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl min-h-[400px]">
                <DialogHeader>
                    <DialogTitle>{t('repo.add')}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {t('repo.management')}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val) => {
                    onTabChange(val);
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
                        <div
                            className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl gap-4 hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={onAddLocal}
                        >
                            <div className="p-4 bg-primary/10 rounded-full">
                                <FolderOpen className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg">{t('repo.addLocal')}</p>
                                <p className="text-sm text-muted-foreground">{t('repo.selectDir')}</p>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); onAddLocal(); }}>
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
                                <Button onClick={onClone} disabled={loading || !cloneUrl || !clonePath} className="w-full sm:w-auto px-10">
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
                                                    onSelect={() => onGithubImport(repo)}
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
    );
}
