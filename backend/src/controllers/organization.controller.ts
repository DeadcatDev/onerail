import { Router, Request, Response } from 'express';
import * as OrganizationService from '../services/organization.service';
import { parsePagination, handleError, setPublicCache, DEFAULT_CACHE_TTL_SECONDS, sendCachedPublic } from './controller.utils';
import { toOrganizationDTO, toOrganizationPageDTO } from '../dto/organization.dto';
import { makeItemKey, makeListKey, cacheGet, cacheSet, invalidateEntity } from '../utils/cache';
import { Organization } from '../repository/organization.repository';

const router = Router();

router.get('/',  async (req: Request, res: Response) => {
    try {
        const pagination = parsePagination(req);
        const key = makeListKey('organization', pagination);
        const cached = cacheGet<Organization[]>(key);
        if (cached) {
            return sendCachedPublic(res, cached, DEFAULT_CACHE_TTL_SECONDS);
        }
        const result = await OrganizationService.getAll(pagination);
        const dto = toOrganizationPageDTO(result);
        cacheSet(key, dto);
        setPublicCache(res, DEFAULT_CACHE_TTL_SECONDS);
        res.send(dto);
    } catch (err) {
        handleError(err, res);
    }
});

router.get('/:id',  async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const key = makeItemKey('organization', id);
        const cached = cacheGet<Organization>(key);
        if (cached) {
            return sendCachedPublic(res, cached, DEFAULT_CACHE_TTL_SECONDS);
        }
        const item = await OrganizationService.getSingle(id);
        const dto = toOrganizationDTO(item);
        cacheSet(key, dto);
        setPublicCache(res, DEFAULT_CACHE_TTL_SECONDS);
        res.send(dto);
    } catch (err) {
        handleError(err, res);
    }
});

router.post('/',  async (req: Request, res: Response) => {
    try {
        const created = await OrganizationService.create(req.body);
        invalidateEntity('organization', created.id);
        res.status(201).send(toOrganizationDTO(created));
    } catch (err) {
        handleError(err, res);
    }
});

router.put('/:id',  async (req: Request, res: Response) => {
    try {
        const updated = await OrganizationService.update(req.params.id, req.body);
        invalidateEntity('organization', updated.id);
        res.send(toOrganizationDTO(updated));
    } catch (err) {
        handleError(err, res);
    }
});

router.delete('/:id',  async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await OrganizationService.remove(id);
        invalidateEntity('organization', id);
        res.sendStatus(204);
    } catch (err) {
        handleError(err, res);
    }
});

export = router;
