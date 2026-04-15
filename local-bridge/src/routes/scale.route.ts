import { Router } from 'express';
import { readScaleWeight } from '../adapters/scale.adapter.js';

export const scaleRouter = Router();

/**
 * GET /scale/read
 * Reads the current weight value from a serial-connected weighing scale.
 *
 * Query parameters:
 *   port      - Serial port path (e.g. "COM3" on Windows, "/dev/ttyUSB0" on Linux)
 *   baudRate  - Baud rate (default: 9600)
 *
 * Response: { weight: number, unit: string, raw: string }
 * Error:    { error: string }
 */
scaleRouter.get('/read', async (req, res) => {
  const port =
    typeof req.query['port'] === 'string' ? req.query['port'] : undefined;
  const baudRateStr =
    typeof req.query['baudRate'] === 'string' ? req.query['baudRate'] : '9600';
  const baudRate = parseInt(baudRateStr, 10);

  if (!port) {
    res.status(400).json({ error: 'Query parameter "port" is required.' });
    return;
  }

  if (isNaN(baudRate) || baudRate <= 0) {
    res
      .status(400)
      .json({
        error: 'Query parameter "baudRate" must be a positive integer.',
      });
    return;
  }

  try {
    const result = await readScaleWeight({ port, baudRate });
    res.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error reading scale.';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /scale/ports
 * Lists available serial ports on the host machine. Useful for the HWBR-004 settings screen.
 *
 * Response: { ports: Array<{ path: string, manufacturer?: string }> }
 */
scaleRouter.get('/ports', async (_req, res) => {
  try {
    const { SerialPort } = await import('serialport');
    const ports = await SerialPort.list();
    res.json({
      ports: ports.map((p) => ({
        path: p.path,
        ...(p.manufacturer ? { manufacturer: p.manufacturer } : {}),
      })),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error listing ports.';
    res.status(500).json({ error: message });
  }
});
