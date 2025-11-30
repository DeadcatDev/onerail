export interface PaginatedDTO<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function toISOOrNull(
    d: Date | string | null | undefined,
): string | null {
    if (!d) return null;
    try {
        const date = typeof d === 'string' ? new Date(d) : d;
        if (isNaN(date.valueOf())) return null;
        return date.toISOString();
    } catch {
        return null;
    }
}

export function mapPaginated<S, T>(
    src: {
        data: S[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    },
    mapper: (s: S) => T,
): PaginatedDTO<T> {
    return {
        data: src.data.map(mapper),
        page: src.page,
        limit: src.limit,
        total: src.total,
        totalPages: src.totalPages,
    };
}
