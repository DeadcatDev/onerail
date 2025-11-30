import { Router } from 'express';
const swaggerUi = require('swagger-ui-express');
import { openApiSpec } from '../swagger';

const router = Router();

router.get('/swagger.json', (_req, res) => {
    res.json(openApiSpec);
});

router.use('/swagger', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));

export = router;
