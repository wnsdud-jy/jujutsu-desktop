export type RepoSource = 'local' | 'clone' | 'github';

export interface RepoConfig {
    path: string;
    name: string;
    remoteUrl?: string;
    source: RepoSource;
    avatarUrl?: string;
}
