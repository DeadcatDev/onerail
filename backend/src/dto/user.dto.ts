import type { User } from '../repository/user.repository';
import type { PaginatedResult } from '../repository/repository.types';
import { mapPaginated, PaginatedDTO, toISOOrNull } from './types';

export interface UserDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateCreated: string | null; // ISO string
    organizationId: string;
}

export function toUserDTO(user: User): UserDTO {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateCreated: toISOOrNull(user.dateCreated),
        organizationId: user.organizationId,
    };
}

export function toUserPageDTO(src: PaginatedResult<User>): PaginatedDTO<UserDTO> {
    return mapPaginated(src, toUserDTO);
}
