import express from 'express';
import db = require('./persistence');
import userController = require('./controllers/user.controller');
import organizationController = require('./controllers/organization.controller');
import orderController = require('./controllers/order.controller');
import swaggerController = require('./controllers/swagger.controller');
import healthController = require('./controllers/health.controller');
import seedController = require('./controllers/seed.controller');
import authController = require('./controllers/auth.controller');
import { requestLogging } from './middleware/request-logging';
import { authGuard } from './middleware/auth';
import logger from './logger';
import { notFoundHandler, errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limit';

const app = express();

app.set('etag', 'strong');

app.use(requestLogging);
app.use(express.json());

// Open controllers
app.use('/api', healthController);
app.use('/api', swaggerController);
app.use('/api', seedController);

app.use(express.static(__dirname + '/static'));

app.use(authGuard);

app.use(rateLimiter);

// Main controllers
app.use(authController);
app.use('/api/user', userController);
app.use('/api/organization', organizationController);
app.use('/api/order', orderController);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

(async () => {
    try {
        await db.init();
        app.listen(3000, () => logger.info('Listening on port 3000'));
    } catch (err) {
        logger.error('Failed to start server', { err });
        process.exit(1);
    }
})();

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);
