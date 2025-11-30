export type UUID = string;

export interface PaginationParams {
    page?: number; // 1-based
    limit?: number; // items per page
}

export interface PaginatedResult<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function normalizePagination({ page, limit }: PaginationParams = {}): Required<PaginationParams> & { offset: number } {
    const p = Math.max(1, Number.isFinite(page as number) ? (page as number) : 1);
    const l = Math.min(100, Math.max(1, Number.isFinite(limit as number) ? (limit as number) : 20));
    const offset = (p - 1) * l;
    return { page: p, limit: l, offset };
}
