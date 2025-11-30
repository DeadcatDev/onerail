export interface OrganizationDTO {
    id: string;
    name: string;
    industry: string | null;
    dateFounded: string | null;
}

export interface OrderDTO {
    id: string;
    orderDate: string; // ISO
    totalAmount: number;
    userId: string;
    organizationId: string;
    // Optional presentation fields (may be present when fetched individually)
    userFullName?: string;
    organizationName?: string;
}

export interface PaginatedDTO<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface UserDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateCreated: string | null;
    organizationId: string;
}
