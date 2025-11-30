import { Router, Request, Response } from 'express';
import * as OrganizationRepository from '../repository/organization.repository';
import * as UserRepository from '../repository/user.repository';
import * as OrderRepository from '../repository/order.repository';
import logger from '../logger';

const router = Router();

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const AVAILABLE_INDUSTRIES = ['IT', 'Transport', 'Package Provider'] as const;

function randomPastDate(daysBack: number = 365): Date {
    const days = randInt(1, Math.max(1, daysBack));
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(randInt(0, 23), randInt(0, 59), randInt(0, 59), 0);
    return d;
}

function randomAmount(min = 5, max = 500): number {
    const cents = randInt(min * 100, max * 100);
    return Math.round(cents) / 100;
}

function randomName(): { first: string; last: string } {
    const firsts = [
        'Alex',
        'Jamie',
        'Taylor',
        'Jordan',
        'Casey',
        'Riley',
        'Morgan',
        'Avery',
        'Parker',
        'Reese',
    ];
    const lasts = [
        'Smith',
        'Johnson',
        'Brown',
        "O'Neil",
        'Garcia',
        'Davis',
        'Miller',
        'Wilson',
        'Moore',
        'Taylor',
    ];
    return {
        first: firsts[randInt(0, firsts.length - 1)],
        last: lasts[randInt(0, lasts.length - 1)],
    };
}

router.post('/seed', async (_req: Request, res: Response) => {
    try {
        const organizations = [] as { id: string; name: string }[];
        for (let i = 0; i < 2; i++) {
            const suffix = String(randInt(100000, 999999)).padStart(6, '0');
            const name = `OneRail${suffix}`;
            const created = await OrganizationRepository.create({
                name,
                industry:
                    AVAILABLE_INDUSTRIES[
                        randInt(0, AVAILABLE_INDUSTRIES.length - 1)
                    ],
                dateFounded: randomPastDate(365 * 10),
            });
            organizations.push({ id: created.id, name: created.name });
        }

        const users = [] as {
            id: string;
            email: string;
            organizationId: string;
        }[];
        for (let i = 0; i < 10; i++) {
            const { first, last } = randomName();
            const organization =
                organizations[randInt(0, organizations.length - 1)];
            const email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(100, 999)}@yopmail.com`;
            const created = await UserRepository.create({
                firstName: first,
                lastName: last,
                email,
                organizationId: organization.id,
                dateCreated: new Date(),
            });
            users.push({
                id: created.id,
                email: created.email,
                organizationId: created.organizationId,
            });
        }

        const orders = [] as { id: string }[];
        for (let i = 0; i < 20; i++) {
            const user = users[randInt(0, users.length - 1)];
            const created = await OrderRepository.create({
                orderDate: randomPastDate(365),
                totalAmount: randomAmount(10, 1000),
                userId: user.id,
                organizationId: user.organizationId,
            });
            orders.push({ id: created.id });
        }

        const organizationsRes = organizations.map((organization) => ({
            name: organization.name,
            userCount: users.filter((u) => u.organizationId === organization.id)
                .length,
        }));
        const usersMapped = users.map((user) => ({
          id: user.id,
          email: user.email
        }));
        const orderIds = orders.map((order) => order.id);

        logger.info('Seed completed', {
            organizations: organizationsRes,
            users: users.length,
            orders: orderIds.length,
        });

        res.status(201).json({
            organizations: organizationsRes,
            users: usersMapped,
            orders: orderIds,
        });
    } catch (err: any) {
        logger.error('Seed failed', { err });
        res.status(500).json({
            error: { code: 'INTERNAL_SERVER_ERROR', message: 'Seeding failed' },
            requestId: ({} as any).requestId || null,
            timestamp: new Date().toISOString(),
            path: '/seed',
            method: 'POST',
        });
    }
});

export = router;
