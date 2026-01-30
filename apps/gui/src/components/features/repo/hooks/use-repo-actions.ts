import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { revealItemInDir, openUrl } from '@tauri-apps/plugin-opener';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth';
import { useRepoStore } from '@/lib/repo';
import { GithubRepository } from '@jujutsu/types';

export function useRepoActions() {
    const { t } = useTranslation();
    const { token } = useAuthStore();
    const { repositories, addRepository, setCurrentRepo, removeRepository, currentRepo } = useRepoStore();

    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('local');

    const [cloneUrl, setCloneUrl] = useState('');
    const [clonePath, setClonePath] = useState('');
    const [githubRepos, setGithubRepos] = useState<GithubRepository[]>([]);
    const [fetchingRepos, setFetchingRepos] = useState(false);
    const [selectedGithubRepo, setSelectedGithubRepo] = useState<GithubRepository | null>(null);

    const handleAddLocal = useCallback(async () => {
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
    }, [repositories, t, setCurrentRepo, addRepository]);

    const handleClone = useCallback(async () => {
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
    }, [cloneUrl, clonePath, repositories, t, selectedGithubRepo, addRepository, setCurrentRepo]);

    const fetchGithubRepos = useCallback(async () => {
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
                const errorText = await response.text();
                console.error('Failed to fetch repos:', errorText);
                toast.error(`${t('repo.error')}: ${errorText}`);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error(t('repo.error'));
        } finally {
            setFetchingRepos(false);
        }
    }, [token, t]);

    const handleGithubImport = useCallback((repo: GithubRepository) => {
        setCloneUrl(repo.clone_url);
        setClonePath('');
        setSelectedGithubRepo(repo);
        setActiveTab('clone');
    }, []);

    const handleOpenExplorer = useCallback(async (path: string) => {
        try {
            await revealItemInDir(path);
        } catch (err) {
            console.error('Explorer error:', err);
            toast.error(t('repo.error'));
        }
    }, [t]);

    const handleViewOnGithub = useCallback(async (url?: string) => {
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
        } catch (err) {
            console.error('Failed to open URL:', err);
            toast.error(t('repo.error'));
        }
    }, [t]);

    return {
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
        selectedGithubRepo,
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
    };
}
