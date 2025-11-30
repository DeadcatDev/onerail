import { Router, Request, Response } from 'express';
import * as OrderService from '../services/order.service';
import * as UserService from '../services/user.service';
import * as OrganizationService from '../services/organization.service';
import {
    parsePagination,
    handleError,
    sendCachedWithETag,
    sendAndCacheWithETag,
} from './controller.utils';
import { toOrderDTO, toOrderPageDTO, OrderDTO } from '../dto/order.dto';
import { toUserDTO } from '../dto/user.dto';
import { toOrganizationDTO } from '../dto/organization.dto';
import type { PaginatedDTO } from '../dto/types';
import {
    makeItemKey,
    makeListKey,
    cacheGet,
    invalidateEntity,
} from '../utils/cache';
import { OrderWithJoins } from '../repository/order.repository';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req.query.userId as string) || undefined;
        const organizationId = (req.query.organizationId as string) || undefined;
        const pagination = parsePagination(req);
        const key = makeListKey('order', { ...pagination, userId, organizationId });
        const cached = cacheGet<PaginatedDTO<OrderDTO>>(key);
        if (cached) {
            return sendCachedWithETag(req, res, cached);
        }
        const result = await OrderService.getAll(pagination, { userId, organizationId });
        const dto = toOrderPageDTO(result);
        return sendAndCacheWithETag(req, res, key, dto);
    } catch (err) {
        handleError(err, res);
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const key = makeItemKey('order', id);
        const cached = cacheGet<OrderDTO>(key);
        if (cached) {
            return sendCachedWithETag(req, res, cached);
        }
        const item: OrderWithJoins = await OrderService.getSingle(id, {
            joinUser: true,
            joinOrganization: true,
        });
        const dto: OrderDTO = {
            ...toOrderDTO(item),
            user: item?.user ? toUserDTO(item.user as any) : undefined,
            organization: item?.organization ? toOrganizationDTO(item.organization as any) : undefined,
        };
        return sendAndCacheWithETag(req, res, key, dto);
    } catch (err) {
        handleError(err, res);
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const created = await OrderService.create(req.body);
        invalidateEntity('order', created.id);
        res.status(201).send(toOrderDTO(created));
    } catch (err) {
        handleError(err, res);
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updated = await OrderService.update(req.params.id, req.body);
        invalidateEntity('order', updated.id);
        res.send(toOrderDTO(updated));
    } catch (err) {
        handleError(err, res);
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await OrderService.remove(id);
        invalidateEntity('order', id);
        res.sendStatus(204);
    } catch (err) {
        handleError(err, res);
    }
});

export = router;
