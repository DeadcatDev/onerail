import { z } from 'zod';
import { ValidationError } from './errors';

export const validationMessages = {
    required: 'value is required',
    invalidString: 'value must be a string',
    nonBlank: 'value must not be empty or whitespace',
    invalidDate: 'invalid date',
    dateInPast: 'date must be in the past',
    notNumber: 'must be a number',
    greaterThanZero: 'must be greater than 0',
    emailRequired: 'email is required',
    invalidCredentials: 'invalid credentials',
} as const;

const now = () => new Date();

export const NonBlankString = z
    .string({
        required_error: validationMessages.required,
        invalid_type_error: validationMessages.invalidString,
    })
    .transform((s: string) => (typeof s === 'string' ? s.trim() : (s as any)))
    .refine((s: string) => !!s, { message: validationMessages.nonBlank });

export const PastDate = z
    .union([z.date(), z.coerce.date()])
    .refine((d: Date) => d instanceof Date && !isNaN(d.valueOf()), {
        message: validationMessages.invalidDate,
    })
    .refine((d: Date) => d.getTime() < now().getTime(), {
        message: validationMessages.dateInPast,
    });

export const PositiveNumber = z
    .union([z.number(), z.coerce.number()])
    .refine((n: number) => Number.isFinite(n), {
        message: validationMessages.notNumber,
    })
    .refine((n: number) => n > 0, {
        message: validationMessages.greaterThanZero,
    });

// Schemas
export const OrganizationCreateSchema = z.object({
    name: NonBlankString.describe('name'),
    industry: z.string().trim().max(255).nullable().optional(),
    dateFounded: PastDate.nullable().optional(),
});

export const OrganizationUpdateSchema = z.object({
    name: NonBlankString.describe('name').optional(),
    industry: z.string().trim().max(255).nullable().optional(),
    dateFounded: PastDate.nullable().optional(),
});

export const UserCreateSchema = z.object({
    firstName: NonBlankString.describe('firstName'),
    lastName: NonBlankString.describe('lastName'),
    email: z.string().min(1, validationMessages.required),
    dateCreated: PastDate.nullable().optional(),
    organizationId: z.string().min(1, validationMessages.required),
});

export const UserUpdateSchema = z.object({
    firstName: NonBlankString.describe('firstName').optional(),
    lastName: NonBlankString.describe('lastName').optional(),
    email: z.string().min(1, validationMessages.required).optional(),
    dateCreated: PastDate.nullable().optional(),
    organizationId: z.string().min(1, validationMessages.required).optional(),
});

export const OrderCreateSchema = z.object({
    orderDate: PastDate.describe('orderDate'),
    totalAmount: PositiveNumber.describe('totalAmount'),
    userId: z.string().min(1, validationMessages.required),
    organizationId: z.string().min(1, validationMessages.required),
});

export const OrderUpdateSchema = z.object({
    orderDate: PastDate.optional(),
    totalAmount: PositiveNumber.optional(),
    userId: z.string().min(1, validationMessages.required).optional(),
    organizationId: z.string().min(1, validationMessages.required).optional(),
});

export function parseOrThrow<S extends z.ZodTypeAny>(
    schema: S,
    input: unknown,
): z.infer<S> {
    const res = schema.safeParse(input);
    if (!res.success) {
        const msgs = res.error.issues.map(
            (i: any) =>
                `${(i.path as (string | number)[]).join('.') || 'input'}: ${i.message}`,
        );
        throw new ValidationError(msgs.join('; '));
    }
    return res.data;
}
