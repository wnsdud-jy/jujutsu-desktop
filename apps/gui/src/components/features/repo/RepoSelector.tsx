import { useTranslation } from 'react-i18next';
import {
    ChevronDown,
    Clock,
    ExternalLink,
    Globe,
    Plus,
    Trash2
} from 'lucide-react';
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
    DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRepoActions } from './hooks/use-repo-actions';
import { RepoList } from './components/RepoList';
import { AddRepoModal } from './components/AddRepoModal';
import { useAuthStore } from '@/lib/auth';

export function RepoSelector() {
    const { t } = useTranslation();
    const { token } = useAuthStore();
    const {
        loading,
        isAddModalOpen,
        setIsAddModalOpen,
        activeTab,
        setActiveTab,
        cloneUrl,
        setCloneUrl,
        clonePath,
        setClonePath,
        githubRepos,
        fetchingRepos,
        handleAddLocal,
        handleClone,
        fetchGithubRepos,
        handleGithubImport,
        handleOpenExplorer,
        handleViewOnGithub,
        removeRepository,
        setCurrentRepo,
        repositories,
        currentRepo
    } = useRepoActions();

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
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 py-1">
                        {t('repo.management')}
                    </DropdownMenuLabel>

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

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2 focus:bg-accent cursor-pointer">
                            <Clock className="h-4 w-4" />
                            <span>{t('repo.recent')}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-72">
                                <RepoList
                                    repositories={repositories}
                                    currentRepoPath={currentRepo?.path}
                                    onSelect={setCurrentRepo}
                                    onRemove={removeRepository}
                                />
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

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

            <AddRepoModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                loading={loading}
                cloneUrl={cloneUrl}
                setCloneUrl={setCloneUrl}
                clonePath={clonePath}
                setClonePath={setClonePath}
                githubRepos={githubRepos}
                fetchingRepos={fetchingRepos}
                token={token}
                onAddLocal={handleAddLocal}
                onClone={handleClone}
                onGithubImport={handleGithubImport}
                fetchGithubRepos={fetchGithubRepos}
            />
        </div>
    );
}
