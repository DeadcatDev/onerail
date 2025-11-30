import type { OpenAPIV3 } from 'openapi-types';

const components: OpenAPIV3.ComponentsObject = {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        },
    },
    schemas: {
        ErrorResponse: {
            type: 'object',
            properties: {
                error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string' },
                    },
                    required: ['code', 'message'],
                },
                requestId: { type: 'string', nullable: true },
                timestamp: { type: 'string', format: 'date-time' },
                path: { type: 'string' },
                method: { type: 'string' },
            },
            required: ['error', 'timestamp', 'path', 'method'],
        },
        PaginatedMeta: {
            type: 'object',
            properties: {
                page: { type: 'integer', minimum: 1 },
                limit: { type: 'integer', minimum: 1 },
                total: { type: 'integer', minimum: 0 },
                totalPages: { type: 'integer', minimum: 1 },
            },
            required: ['page', 'limit', 'total', 'totalPages'],
        },
        OrganizationDTO: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                industry: { type: 'string', nullable: true },
                dateFounded: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                },
            },
            required: ['id', 'name', 'industry', 'dateFounded'],
        },
        OrganizationCreate: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                industry: { type: 'string', nullable: true },
                dateFounded: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                },
            },
            required: ['name'],
        },
        OrganizationUpdate: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                industry: { type: 'string', nullable: true },
                dateFounded: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                },
            },
        },
        UserDTO: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                dateCreated: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                },
                organizationId: { type: 'string', format: 'uuid' },
            },
            required: [
                'id',
                'firstName',
                'lastName',
                'email',
                'dateCreated',
                'organizationId',
            ],
        },
        UserCreate: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                dateCreated: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                },
                organizationId: { type: 'string', format: 'uuid' },
            },
            required: ['firstName', 'lastName', 'email', 'organizationId'],
        },
        UserUpdate: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                dateCreated: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                },
                organizationId: { type: 'string', format: 'uuid' },
            },
        },
        OrderDTO: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                orderDate: { type: 'string', format: 'date-time' },
                totalAmount: { type: 'number' },
                userId: { type: 'string', format: 'uuid' },
                organizationId: { type: 'string', format: 'uuid' },
                // Joins
                user: { $ref: '#/components/schemas/UserDTO' },
                organization: { $ref: '#/components/schemas/OrganizationDTO' },
            },
            required: [
                'id',
                'orderDate',
                'totalAmount',
                'userId',
                'organizationId',
            ],
        },
        OrderCreate: {
            type: 'object',
            properties: {
                orderDate: { type: 'string', format: 'date-time' },
                totalAmount: { type: 'number' },
                userId: { type: 'string', format: 'uuid' },
                organizationId: { type: 'string', format: 'uuid' },
            },
            required: ['orderDate', 'totalAmount', 'userId', 'organizationId'],
        },
        OrderUpdate: {
            type: 'object',
            properties: {
                orderDate: { type: 'string', format: 'date-time' },
                totalAmount: { type: 'number' },
                userId: { type: 'string', format: 'uuid' },
                organizationId: { type: 'string', format: 'uuid' },
            },
        },
        PaginatedOrganization: {
            allOf: [
                { $ref: '#/components/schemas/PaginatedMeta' },
                {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/OrganizationDTO',
                            },
                        },
                    },
                    required: ['data'],
                },
            ],
        },
        PaginatedUser: {
            allOf: [
                { $ref: '#/components/schemas/PaginatedMeta' },
                {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UserDTO' },
                        },
                    },
                    required: ['data'],
                },
            ],
        },
        PaginatedOrder: {
            allOf: [
                { $ref: '#/components/schemas/PaginatedMeta' },
                {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/OrderDTO' },
                        },
                    },
                    required: ['data'],
                },
            ],
        },
        SeedOrganizationSummary: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                userCount: { type: 'integer', minimum: 0 },
            },
            required: ['name', 'userCount'],
        },
        SeedResponse: {
            type: 'object',
            properties: {
                organizations: {
                    type: 'array',
                    items: {
                        $ref: '#/components/schemas/SeedOrganizationSummary',
                    },
                },
                users: {
                    type: 'array',
                    items: { type: 'string', format: 'email' },
                },
                orders: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                },
            },
            required: ['organizations', 'users', 'orders'],
        },
    },
};

function paginatedParams(): OpenAPIV3.ParameterObject[] {
    return [
        {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
        },
        {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100 },
        },
    ];
}

export const openApiSpec: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
        title: 'OneRail Exercise API',
        version: '1.0.0',
        description:
            'REST API for users, organizations, and orders. Returns DTOs only.',
    },
    servers: [{ url: '/', description: 'Current server' }],
    tags: [
        { name: 'user' },
        { name: 'organization' },
        { name: 'order' },
        { name: 'auth' },
        { name: 'system' },
        { name: 'seed' },
    ],
    components,
    security: [{ bearerAuth: [] }],
    paths: {
        '/api/auth/login': {
            post: {
                tags: ['auth'],
                summary: 'Login with email and password',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string' },
                                    password: { type: 'string' },
                                },
                                required: ['email', 'password'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' },
                                        user: {
                                            $ref: '#/components/schemas/UserDTO',
                                        },
                                    },
                                    required: ['token', 'user'],
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    404: {
                        description: 'User not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['auth'],
                summary: 'Get current user (from token)',
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        user: {
                                            $ref: '#/components/schemas/UserDTO',
                                        },
                                    },
                                    required: ['user'],
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/user': {
            get: {
                tags: ['user'],
                summary: 'List users',
                parameters: paginatedParams(),
                responses: {
                    200: {
                        description: 'OK',
                        headers: {
                            'Cache-Control': {
                                description: 'public, max-age=600',
                                schema: {
                                    type: 'string',
                                    example: 'public, max-age=600',
                                },
                            },
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/PaginatedUser',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['user'],
                summary: 'Create user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserCreate' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Created',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UserDTO',
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/user/{id}': {
            get: {
                tags: ['user'],
                summary: 'Get user by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UserDTO',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    404: {
                        description: 'Not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ['user'],
                summary: 'Update user',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserUpdate' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UserDTO',
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    404: {
                        description: 'Not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['user'],
                summary: 'Delete user',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                responses: {
                    204: { description: 'No Content' },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/organization': {
            get: {
                tags: ['organization'],
                summary: 'List organizations',
                parameters: paginatedParams(),
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/PaginatedOrganization',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['organization'],
                summary: 'Create organization',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/OrganizationCreate',
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Created',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/OrganizationDTO',
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/organization/{id}': {
            get: {
                tags: ['organization'],
                summary: 'Get organization by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                responses: {
                    200: {
                        description: 'OK',
                        headers: {
                            'Cache-Control': {
                                description: 'public, max-age=600',
                                schema: {
                                    type: 'string',
                                    example: 'public, max-age=600',
                                },
                            },
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/OrganizationDTO',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    404: {
                        description: 'Not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ['organization'],
                summary: 'Update organization',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/OrganizationUpdate',
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/OrganizationDTO',
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    404: {
                        description: 'Not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['organization'],
                summary: 'Delete organization',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                responses: {
                    204: { description: 'No Content' },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/order': {
            get: {
                tags: ['order'],
                summary: 'List orders',
                parameters: [
                    ...paginatedParams(),
                    {
                        name: 'userId',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', format: 'uuid' },
                        description: 'Filter orders by userId',
                    },
                ],
                responses: {
                    200: {
                        description: 'OK',
                        headers: {
                            ETag: {
                                description:
                                    'Entity tag for conditional requests',
                                schema: { type: 'string' },
                            },
                            'Cache-Control': {
                                description: 'no-cache (use ETag revalidation)',
                                schema: { type: 'string', example: 'no-cache' },
                            },
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/PaginatedOrder',
                                },
                            },
                        },
                    },
                    304: {
                        description:
                            'Not Modified (If-None-Match matched ETag)',
                    },
                    400: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['order'],
                summary: 'Create order',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/OrderCreate',
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Created',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/OrderDTO',
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/order/{id}': {
            get: {
                tags: ['order'],
                summary: 'Get order by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/OrderDTO',
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    404: {
                        description: 'Not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ['order'],
                summary: 'Update order',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/OrderUpdate',
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/OrderDTO',
                                },
                            },
                        },
                    },
                    400: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                    404: {
                        description: 'Not found',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['order'],
                summary: 'Delete order',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                    },
                ],
                responses: { 204: { description: 'No Content' } },
            },
        },
        '/api/health': {
            get: {
                tags: ['system'],
                summary: 'Liveness probe',
                security: [],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            example: 'ok',
                                        },
                                    },
                                    required: ['status'],
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/readiness': {
            get: {
                tags: ['system'],
                summary: 'Readiness probe (checks DB connectivity)',
                description:
                    'Returns 200 when the application and database connection are ready. Returns 503 when the database is not reachable.',
                security: [],
                responses: {
                    200: {
                        description: 'Ready',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            example: 'ready',
                                        },
                                        db: { type: 'string', example: 'ok' },
                                    },
                                    required: ['status'],
                                },
                            },
                        },
                    },
                    503: {
                        description: 'Service Unavailable (DB not reachable)',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            example: 'unavailable',
                                        },
                                        db: { type: 'string', example: 'down' },
                                    },
                                    required: ['status'],
                                },
                            },
                        },
                    },
                },
            },
        },
        '/seed': {
            post: {
                tags: ['seed'],
                summary: 'Seed demo data (unguarded)',
                description:
                    'Creates 2 organizations, 10 users, and 20 orders with random data. Returns a summary of what was created.',
                security: [],
                responses: {
                    200: {
                        description: 'Seeded',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/SeedResponse',
                                },
                            },
                        },
                    },
                    500: {
                        description: 'Server error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ErrorResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export default openApiSpec;
