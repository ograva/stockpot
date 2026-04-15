import { SerialPort } from 'serialport';

/**
 * A single line of text on the receiving slip.
 */
export interface PrintSlipLine {
  /** Text content of the line. */
  text: string;
  /** Whether to print in bold. Defaults to false. */
  bold?: boolean;
  /** Whether to align to the right. Defaults to false (left-aligned). */
  alignRight?: boolean;
}

/**
 * Payload for the POST /printer/slip endpoint.
 */
export interface PrintSlipPayload {
  /** Serial port path of the thermal printer (e.g. "COM4", "/dev/ttyUSB1"). */
  printerPort: string;
  /** Baud rate for the printer serial connection (default: 9600). */
  baudRate?: number;
  /** Lines to print on the slip. */
  lines: PrintSlipLine[];
}

// ESC/POS command bytes
const ESC = 0x1b;
const GS = 0x1d;
const INIT = Buffer.from([ESC, 0x40]);
const BOLD_ON = Buffer.from([ESC, 0x45, 0x01]);
const BOLD_OFF = Buffer.from([ESC, 0x45, 0x00]);
const ALIGN_LEFT = Buffer.from([ESC, 0x61, 0x00]);
const ALIGN_RIGHT = Buffer.from([ESC, 0x61, 0x02]);
const LINE_FEED = Buffer.from([0x0a]);
const PAPER_FEED_AND_CUT = Buffer.from([GS, 0x56, 0x41, 0x10]);

/**
 * Sends a receiving slip to a thermal printer via serial/ESC-POS protocol.
 *
 * Uses raw ESC/POS byte sequences for broad hardware compatibility without
 * requiring a vendor-specific driver or library.
 */
export function printReceivingSlip(payload: PrintSlipPayload): Promise<void> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({
      path: payload.printerPort,
      baudRate: payload.baudRate ?? 9600,
      autoOpen: false,
    });

    port.open((openErr) => {
      if (openErr) {
        reject(
          new Error(
            `Failed to open printer port ${payload.printerPort}: ${openErr.message}`,
          ),
        );
        return;
      }

      const chunks: Buffer[] = [INIT];

      for (const line of payload.lines) {
        chunks.push(line.alignRight ? ALIGN_RIGHT : ALIGN_LEFT);
        if (line.bold) chunks.push(BOLD_ON);
        chunks.push(Buffer.from(line.text + '\n', 'ascii'));
        if (line.bold) chunks.push(BOLD_OFF);
        chunks.push(LINE_FEED);
      }

      chunks.push(PAPER_FEED_AND_CUT);

      const data = Buffer.concat(chunks);

      port.write(data, (writeErr) => {
        if (writeErr) {
          port.close();
          reject(new Error(`Print write error: ${writeErr.message}`));
          return;
        }

        port.drain((drainErr) => {
          port.close();
          if (drainErr) {
            reject(new Error(`Print drain error: ${drainErr.message}`));
          } else {
            resolve();
          }
        });
      });
    });

    port.on('error', (err) => {
      reject(err);
    });
  });
}
