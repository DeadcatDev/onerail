import type { Organization } from '../repository/organization.repository';
import type { PaginatedResult } from '../repository/repository.types';
import { mapPaginated, PaginatedDTO, toISOOrNull } from './types';

export interface OrganizationDTO {
    id: string;
    name: string;
    industry: string | null;
    dateFounded: string | null; // ISO string
}

export function toOrganizationDTO(organization: Organization): OrganizationDTO {
    return {
        id: organization.id,
        name: organization.name,
        industry: organization.industry ?? null,
        dateFounded: toISOOrNull(organization.dateFounded),
    };
}

export function toOrganizationPageDTO(src: PaginatedResult<Organization>): PaginatedDTO<OrganizationDTO> {
    return mapPaginated(src, toOrganizationDTO);
}
