import type { Order } from '../repository/order.repository';
import type { PaginatedResult } from '../repository/repository.types';
import { mapPaginated, PaginatedDTO, toISOOrNull } from './types';
import type { UserDTO } from './user.dto';
import type { OrganizationDTO } from './organization.dto';

export interface OrderDTO {
    id: string;
    orderDate: string;
    totalAmount: number;
    userId: string;
    organizationId: string;
    // Joins
    user?: UserDTO;
    organization?: OrganizationDTO;
}

export function toOrderDTO(order: Order): OrderDTO {
    const amount = typeof (order as any).totalAmount === 'string' ? Number(order.totalAmount) : order.totalAmount;
    return {
        id: order.id,
        orderDate: toISOOrNull(order.orderDate) as string,
        totalAmount: Number.isFinite(amount) ? (amount as number) : 0,
        userId: order.userId,
        organizationId: order.organizationId,
    };
}

export function toOrderPageDTO(src: PaginatedResult<Order>): PaginatedDTO<OrderDTO> {
    return mapPaginated(src, toOrderDTO);
}
