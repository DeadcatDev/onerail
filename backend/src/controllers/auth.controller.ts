import { Router, Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { handleError } from './controller.utils';
import { toUserDTO } from '../dto/user.dto';

const router = Router();

router.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body || {};
        const result = await AuthService.login(email, password);
        res.status(200).json({
            token: result.token,
            user: toUserDTO(result.user),
        });
    } catch (err) {
        handleError(err, res);
    }
});

router.get('/api/auth/me', async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Missing or invalid token',
                },
                requestId: (req as any).requestId || null,
                timestamp: new Date().toISOString(),
                path: req.originalUrl,
                method: req.method,
            });
        }
        res.json({ user: toUserDTO(user) });
    } catch (err) {
        handleError(err, res);
    }
});

export = router;
