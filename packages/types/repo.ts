export type RepoSource = 'local' | 'clone' | 'github';

export interface RepoConfig {
    path: string;
    name: string;
    remoteUrl?: string;
    source: RepoSource;
    avatarUrl?: string;
}

export interface GithubRepository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    clone_url: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}
export interface Operation {
    id: string;
    time: string;
    user: string;
    description: string;
}

export type FileStatus = 'Added' | 'Modified' | 'Removed' | 'Conflicted';

export interface ChangedFile {
    path: string;
    status: FileStatus;
}

export interface ChangeSet {
    changeId: string;
    files: ChangedFile[];
}

export interface Commit {
    id: string;
    changeId: string;
    author: string;
    email: string;
    date: string;
    description: string;
    isCurrent: boolean;
    isImmutable: boolean;
    isConflicted: boolean;
    parentIds: string[];
    bookmarks: string[];
}

export interface LogEntry {
    commits: Commit[];
}
