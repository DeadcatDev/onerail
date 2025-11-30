import React, { useEffect, useMemo, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import { useAuth } from '../auth/AuthContext';
import { getOrganization, getOrdersByOrganization, getUser } from '../api/api';
import { OrganizationDTO, OrderDTO, PaginatedDTO } from '../api/api.dto';

function usePagination(totalPages: number, page: number, setPage: (p: number) => void) {
    return useMemo(() => {
        const items: React.ReactNode[] = [];
        const max = Math.max(1, totalPages);
        for (let p = 1; p <= max; p++) {
            items.push(
                <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>
                    {p}
                </Pagination.Item>,
            );
        }
        return items;
    }, [totalPages, page, setPage]);
}

export default function Organization() {
    const { user } = useAuth();
    const [org, setOrg] = useState<OrganizationDTO | null>(null);
    const [orgLoading, setOrgLoading] = useState<boolean>(true);
    const [orgError, setOrgError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [orders, setOrders] = useState<PaginatedDTO<OrderDTO> | null>(null);
    const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [userNames, setUserNames] = useState<Record<string, string>>({});

    // Load organization details
    useEffect(() => {
        let cancelled = false;
        async function loadOrg() {
            if (!user?.organizationId) {
                setOrgError('No organization assigned.');
                setOrgLoading(false);
                return;
            }
            try {
                const data = await getOrganization(user.organizationId);
                if (!cancelled) setOrg(data);
            } catch (e: any) {
                if (!cancelled) setOrgError(e?.message || 'Failed to load organization');
            } finally {
                if (!cancelled) setOrgLoading(false);
            }
        }
        loadOrg();
        return () => {
            cancelled = true;
        };
    }, [user?.organizationId]);

    // Load organization orders
    useEffect(() => {
        let cancelled = false;
        async function loadOrders() {
            if (!user?.organizationId) {
                setOrdersError('No organization assigned.');
                setOrdersLoading(false);
                return;
            }
            setOrdersLoading(true);
            setOrdersError(null);
            try {
                const data = await getOrdersByOrganization(user.organizationId, { page, limit });
                if (!cancelled) setOrders(data);
            } catch (e: any) {
                if (!cancelled) setOrdersError(e?.message || 'Failed to load orders');
            } finally {
                if (!cancelled) setOrdersLoading(false);
            }
        }
        loadOrders();
        return () => {
            cancelled = true;
        };
    }, [user?.organizationId, page, limit]);

    // Enrich user names for list view if not provided
    useEffect(() => {
        let cancelled = false;
        async function enrichUsers() {
            const items = orders?.data || [];
            if (items.length === 0) return;
            const needUserIds = Array.from(
                new Set(
                    items
                        .filter((o) => !o.userFullName)
                        .map((o) => o.userId)
                        .filter((id) => !!id && !userNames[id as string]),
                ),
            );
            if (needUserIds.length === 0) return;
            try {
                const users = await Promise.all(
                    needUserIds.map((id) => getUser(id).catch(() => null)),
                );
                if (cancelled) return;
                const updates: Record<string, string> = {};
                users.forEach((u, idx) => {
                    const id = needUserIds[idx];
                    if (u && id) updates[id] = `${u.firstName} ${u.lastName}`.trim();
                });
                if (Object.keys(updates).length) {
                    setUserNames((prev) => ({ ...prev, ...updates }));
                }
            } catch {
                // ignore
            }
        }
        enrichUsers();
        return () => {
            cancelled = true;
        };
    }, [orders, userNames]);

    const pager = usePagination(orders?.totalPages || 1, page, setPage);

    if (orgLoading) {
        return (
            <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" /> <span>Loading organization…</span>
            </div>
        );
    }

    if (orgError) {
        return <Alert variant="danger">{orgError}</Alert>;
    }

    if (!org) {
        return <Alert variant="warning">Organization not found.</Alert>;
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title className="mb-3">Organization</Card.Title>
                <div className="mb-2"><strong>Name:</strong> {org.name}</div>
                <div className="mb-2"><strong>Industry:</strong> {org.industry || '—'}</div>
                <div className="mb-3"><strong>Date Founded:</strong> {org.dateFounded ? new Date(org.dateFounded).toLocaleDateString() : '—'}</div>
                <div className="text-muted mb-4"><small>ID: {org.id}</small></div>

                <h5 className="mb-3">Organization Orders</h5>
                {ordersLoading && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <Spinner animation="border" size="sm" /> <span>Loading orders…</span>
                    </div>
                )}
                {ordersError && <Alert variant="danger">{ordersError}</Alert>}
                {!ordersLoading && !ordersError && (
                    <>
                        <Table hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th className="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(orders?.data || []).map((o) => (
                                    <tr key={o.id}>
                                        <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.id}</td>
                                        <td>{new Date(o.orderDate).toLocaleString()}</td>
                                        <td>{o.userFullName ?? userNames[o.userId] ?? '—'}</td>
                                        <td className="text-end">{o.totalAmount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                                    </tr>
                                ))}
                                {orders && orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted">No orders.</td>
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
