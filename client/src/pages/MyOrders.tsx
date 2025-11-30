import React, { useEffect, useMemo, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Pagination from 'react-bootstrap/Pagination';
import Card from 'react-bootstrap/Card';
import { useAuth } from '../auth/AuthContext';
import {
    getOrdersByUser,
    getOrganization,
    getUser,


} from '../api/api';
import { OrderDTO, PaginatedDTO } from '../api/api.dto';

function usePagination(
    totalPages: number,
    page: number,
    setPage: (p: number) => void,
) {
    return useMemo(() => {
        const items: React.ReactNode[] = [];
        const max = Math.max(1, totalPages);
        for (let p = 1; p <= max; p++) {
            items.push(
                <Pagination.Item
                    key={p}
                    active={p === page}
                    onClick={() => setPage(p)}
                >
                    {p}
                </Pagination.Item>,
            );
        }
        return items;
    }, [totalPages, page, setPage]);
}

export default function MyOrders() {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [data, setData] = useState<PaginatedDTO<OrderDTO> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const [orgNames, setOrgNames] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!user?.id) {
                setError('No user session');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const res = await getOrdersByUser(user.id, { page, limit });
                if (!cancelled) setData(res);
            } catch (e: any) {
                if (!cancelled) setError(e?.message || 'Failed to load orders');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id, page, limit]);

    // Enrich with user/organization names for list view when not provided by API
    useEffect(() => {
        let cancelled = false;
        async function enrich() {
            const items = data?.data || [];
            if (items.length === 0) return;
            // Collect IDs missing from local maps and not present on items themselves
            const needUserIds = Array.from(
                new Set(
                    items
                        .filter((o) => !o.userFullName)
                        .map((o) => o.userId)
                        .filter((id) => !!id && !userNames[id as string]),
                ),
            );
            const needOrgIds = Array.from(
                new Set(
                    items
                        .filter((o) => !o.organizationName)
                        .map((o) => o.organizationId)
                        .filter((id) => !!id && !orgNames[id as string]),
                ),
            );

            try {
                const [users, orgs] = await Promise.all([
                    Promise.all(
                        needUserIds.map((id) => getUser(id).catch(() => null)),
                    ),
                    Promise.all(
                        needOrgIds.map((id) =>
                            getOrganization(id).catch(() => null),
                        ),
                    ),
                ]);
                if (cancelled) return;
                const userMapUpdates: Record<string, string> = {};
                users.forEach((u, idx) => {
                    const id = needUserIds[idx];
                    if (u && id)
                        userMapUpdates[id] =
                            `${u.firstName} ${u.lastName}`.trim();
                });
                const orgMapUpdates: Record<string, string> = {};
                orgs.forEach((o, idx) => {
                    const id = needOrgIds[idx];
                    if (o && id) orgMapUpdates[id] = o.name;
                });
                if (Object.keys(userMapUpdates).length) {
                    setUserNames((prev) => ({ ...prev, ...userMapUpdates }));
                }
                if (Object.keys(orgMapUpdates).length) {
                    setOrgNames((prev) => ({ ...prev, ...orgMapUpdates }));
                }
            } catch {
                // ignore enrichment errors; base data is already shown
            }
        }
        enrich();
        return () => {
            cancelled = true;
        };
    }, [data, userNames, orgNames]);

    const pager = usePagination(data?.totalPages || 1, page, setPage);

    return (
        <Card>
            <Card.Body>
                <Card.Title className="mb-3">My Orders</Card.Title>
                {loading && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <Spinner animation="border" size="sm" />{' '}
                        <span>Loading orders…</span>
                    </div>
                )}
                {error && <Alert variant="danger">{error}</Alert>}
                {!loading && !error && (
                    <>
                        <Table hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Organization</th>
                                    <th className="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.data || []).map((o) => (
                                    <tr key={o.id}>
                                        <td
                                            style={{
                                                maxWidth: 240,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {o.id}
                                        </td>
                                        <td>
                                            {new Date(
                                                o.orderDate,
                                            ).toLocaleString()}
                                        </td>
                                        <td>
                                            {o.userFullName ??
                                                userNames[o.userId] ??
                                                '—'}
                                        </td>
                                        <td>
                                            {o.organizationName ??
                                                orgNames[o.organizationId] ??
                                                '—'}
                                        </td>
                                        <td className="text-end">
                                            {o.totalAmount.toLocaleString(
                                                undefined,
                                                {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                },
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {data && data.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="text-center text-muted"
                                        >
                                            No orders.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                        <div className="d-flex justify-content-center">
                            <Pagination>{pager}</Pagination>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
}
