const ACCESS_TOKEN_KEY = 'medcore_access_token';

export function getAccessToken(): string | null {
    const directToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (directToken) return directToken;

    // Fallback: extract access_token from active Supabase session in localStorage
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
                const item = localStorage.getItem(key);
                if (item) {
                    const parsed = JSON.parse(item);
                    const token = parsed?.access_token || parsed?.currentSession?.access_token;
                    if (token) {
                        localStorage.setItem(ACCESS_TOKEN_KEY, token);
                        return token;
                    }
                }
            }
        }
    } catch {
        // ignore parse error
    }

    return null;
}

export function setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function hasAccessToken(): boolean {
    return getAccessToken() !== null;
}
