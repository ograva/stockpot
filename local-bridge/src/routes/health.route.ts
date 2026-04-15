import { Router } from 'express';

export const healthRouter = Router();

/**
 * GET /health
 * Liveness check. The User-App calls this on startup to verify the bridge is reachable.
 * A 200 response enables hardware features in the UI; a network error disables them.
 */
healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
