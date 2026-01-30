import { useTranslation } from 'react-i18next';
import { RepoConfig } from '@jujutsu/types';
import { RepoItem } from './RepoItem';

interface RepoListProps {
    repositories: RepoConfig[];
    currentRepoPath?: string;
    onSelect: (repo: RepoConfig) => void;
    onRemove: (path: string) => void;
}

export function RepoList({ repositories, currentRepoPath, onSelect, onRemove }: RepoListProps) {
    const { t } = useTranslation();

    if (repositories.length === 0) {
        return <div className="p-4 text-xs text-center text-muted-foreground">{t('repo.noRecent')}</div>;
    }

    return (
        <>
            {repositories.map((repo) => (
                <RepoItem
                    key={repo.path}
                    repo={repo}
                    isActive={currentRepoPath === repo.path}
                    onSelect={onSelect}
                    onRemove={onRemove}
                />
            ))}
        </>
    );
}
