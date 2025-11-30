import { Router } from 'express';
import logger from '../logger';
import { getModels } from '../repository/_client';

const router = Router();

router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

router.get('/readiness', async (_req, res) => {
    try {
        const { sequelize } = await getModels();
        await sequelize.authenticate();
        return res.json({ status: 'ready', db: 'ok' });
    } catch (err) {
        logger.error('Readiness check failed: database not reachable', { err });
        return res.status(503).json({ status: 'unavailable', db: 'down' });
    }
});

export = router;
