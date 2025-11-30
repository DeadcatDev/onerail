export interface UserDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateCreated: string | null;
    organizationId: string;
}

export interface LoginResponse {
    token: string;
    user: UserDTO;
}

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(input: RequestInfo, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json');
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(input, { ...init, headers });
    if (!res.ok) {
        // Try to parse error body
        let message = `${res.status} ${res.statusText}`;
        try {
            const body = await res.json();
            if (body?.error?.message) message = body.error.message;
        } catch {}
        throw new Error(message);
    }
    return (await res.json()) as T;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const data = await request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
}

export async function me(): Promise<{ user: UserDTO }> {
    return request<{ user: UserDTO }>('/api/auth/me');
}

export function logout() {
    setToken(null);
}
