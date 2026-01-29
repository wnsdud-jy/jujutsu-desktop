import { useAuthStore } from './auth';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = useAuthStore.getState().token;
    const headers = new Headers(options.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        useAuthStore.getState().logout();
    }

    return response;
};
