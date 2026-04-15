import { Router } from 'express';
import {
  printReceivingSlip,
  PrintSlipPayload,
} from '../adapters/printer.adapter.js';

export const printerRouter = Router();

/**
 * POST /printer/slip
 * Prints a receiving slip for a purchase order line item on a thermal printer.
 *
 * Request body: PrintSlipPayload
 * Response: { success: true }
 * Error:    { error: string }
 */
printerRouter.post('/slip', async (req, res) => {
  const payload = req.body as PrintSlipPayload;

  if (!payload || typeof payload !== 'object') {
    res.status(400).json({ error: 'Request body must be a JSON object.' });
    return;
  }

  if (!payload.printerPort) {
    res
      .status(400)
      .json({ error: 'printerPort is required in the request body.' });
    return;
  }

  if (
    !payload.lines ||
    !Array.isArray(payload.lines) ||
    payload.lines.length === 0
  ) {
    res
      .status(400)
      .json({ error: 'lines array is required and must not be empty.' });
    return;
  }

  try {
    await printReceivingSlip(payload);
    res.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error printing slip.';
    res.status(500).json({ error: message });
  }
});
