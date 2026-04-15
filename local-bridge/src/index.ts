/**
 * StockPot Local Hardware Bridge
 *
 * A lightweight Express server that runs on the kitchen workstation and provides
 * a REST API for the User-App browser to interface with locally connected hardware:
 *   - Weighing scales (via serial/USB)
 *   - Thermal receipt printers (via serial/USB or network)
 *
 * Deployment model (ADL-006):
 *   - Runs on the SAME machine as the browser accessing the User-App.
 *   - The User-App connects to http://localhost:3500 (or a configurable IP).
 *   - CORS is restricted to the ALLOWED_ORIGIN environment variable.
 *   - Does NOT run on Firebase Cloud Functions or any cloud service.
 *
 * Configuration via environment variables:
 *   PORT           - HTTP port to listen on (default: 3500)
 *   ALLOWED_ORIGIN - Origin to allow in CORS headers (default: http://localhost:4400)
 */

import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.route.js';
import { scaleRouter } from './routes/scale.route.js';
import { printerRouter } from './routes/printer.route.js';

const PORT = parseInt(process.env['PORT'] ?? '3500', 10);
const ALLOWED_ORIGIN = process.env['ALLOWED_ORIGIN'] ?? 'http://localhost:4400';

const app = express();

// ─── Security: Restrict CORS to the User-App origin ──────────────────────────
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/scale', scaleRouter);
app.use('/printer', printerRouter);

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[local-bridge] Listening on http://127.0.0.1:${PORT}`);
  console.log(`[local-bridge] Accepting requests from: ${ALLOWED_ORIGIN}`);
});

export { app };
