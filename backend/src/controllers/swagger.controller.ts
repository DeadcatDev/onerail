import { Router } from 'express';
// Use require to avoid missing type declarations for swagger-ui-express
const swaggerUi = require('swagger-ui-express');
import { openApiSpec } from '../swagger';

const router = Router();

// Serve OpenAPI document
router.get('/swagger.json', (_req, res) => {
    res.json(openApiSpec);
});

// Serve Swagger UI
router.use('/swagger', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));

export = router;
