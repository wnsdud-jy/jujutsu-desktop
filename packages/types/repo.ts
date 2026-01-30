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
