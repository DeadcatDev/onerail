import { getToken } from '../auth/api';
import { OrderDTO, OrganizationDTO, PaginatedDTO, UserDTO } from './api.dto';
import { API_URL } from './api.const';

async function request<T>(
    input: RequestInfo,
    init: RequestInit = {},
): Promise<T> {
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json');
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(input, { ...init, headers });
    if (!res.ok) {
        let message = `${res.status} ${res.statusText}`;
        try {
            const body = await res.json();
            if (body?.error?.message) message = body.error.message;
        } catch {}
        throw new Error(message);
    }
    return (await res.json()) as T;
}

export async function getOrganization(id: string): Promise<OrganizationDTO> {
    return request<OrganizationDTO>(
        `${API_URL.ORGANIZATION}${encodeURIComponent(id)}`,
    );
}

export async function getUser(id: string): Promise<UserDTO> {
    return request<UserDTO>(`${API_URL.USER}${encodeURIComponent(id)}`);
}

export async function updateUser(
    id: string,
    changes: Partial<Pick<UserDTO, 'firstName' | 'lastName'>>,
): Promise<UserDTO> {
    return request<UserDTO>(`${API_URL.USER}${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(changes),
    });
}

export async function getOrdersByUser(
    userId: string,
    params: { page?: number; limit?: number } = {},
): Promise<PaginatedDTO<OrderDTO>> {
    const search = new URLSearchParams();
    if (params.page) {
        search.set('page', String(params.page));
    }
    if (params.limit) {
        search.set('limit', String(params.limit));
    }
    if (userId) {
        search.set('userId', userId);
    }
    const queryString = search.toString();
    const url = `${API_URL.ORDER}${queryString ? `?${queryString}` : ''}`;
    return request<PaginatedDTO<OrderDTO>>(url);
}

export async function getOrdersByOrganization(
    organizationId: string,
    params: { page?: number; limit?: number } = {},
): Promise<PaginatedDTO<OrderDTO>> {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (organizationId) search.set('organizationId', organizationId);
    const queryString = search.toString();
    const url = `${API_URL.ORDER}${queryString ? `?${queryString}` : ''}`;
    return request<PaginatedDTO<OrderDTO>>(url);
}
