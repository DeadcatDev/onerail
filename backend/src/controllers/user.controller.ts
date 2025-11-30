import { Router, Request, Response } from 'express';
import * as UserService from '../services/user.service';
import {
    parsePagination,
    handleError,
    setPublicCache,
    DEFAULT_CACHE_TTL_SECONDS,
    sendCachedPublic,
} from './controller.utils';
import { toUserDTO, toUserPageDTO } from '../dto/user.dto';
import {
    makeItemKey,
    makeListKey,
    cacheGet,
    cacheSet,
    invalidateEntity,
} from '../utils/cache';
import { User } from '../repository/user.repository';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const pagination = parsePagination(req);
        const key = makeListKey('user', pagination);
        const cached = cacheGet<User[]>(key);
        if (cached) {
            return sendCachedPublic(res, cached, DEFAULT_CACHE_TTL_SECONDS);
        }
        const result = await UserService.getAll(pagination);
        const dto = toUserPageDTO(result);
        cacheSet(key, dto);
        setPublicCache(res, DEFAULT_CACHE_TTL_SECONDS);
        res.send(dto);
    } catch (err) {
        handleError(err, res);
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const key = makeItemKey('user', id);
        const cached = cacheGet<User>(key);
        if (cached) {
            return sendCachedPublic(res, cached, DEFAULT_CACHE_TTL_SECONDS);
        }
        const item = await UserService.getSingle(id);
        const dto = toUserDTO(item);
        cacheSet(key, dto);
        setPublicCache(res, DEFAULT_CACHE_TTL_SECONDS);
        res.send(dto);
    } catch (err) {
        handleError(err, res);
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const created = await UserService.create(req.body);
        invalidateEntity('user', created.id);
        res.status(201).send(toUserDTO(created));
    } catch (err) {
        handleError(err, res);
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updated = await UserService.update(req.params.id, req.body);
        invalidateEntity('user', updated.id);
        res.send(toUserDTO(updated));
    } catch (err) {
        handleError(err, res);
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await UserService.remove(id);
        invalidateEntity('user', id);
        res.sendStatus(204);
    } catch (err) {
        handleError(err, res);
    }
});

export = router;
