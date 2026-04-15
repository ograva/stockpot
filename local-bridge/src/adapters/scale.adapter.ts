import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

export interface ScaleReadOptions {
  /** Serial port path (e.g. "COM3", "/dev/ttyUSB0"). */
  port: string;
  /** Baud rate (default: 9600). */
  baudRate: number;
}

export interface ScaleReadResult {
  /** Parsed weight value. */
  weight: number;
  /** Unit of measure as reported by the scale (e.g. "kg", "g"). */
  unit: string;
  /** Raw string received from the scale before parsing. */
  raw: string;
}

/**
 * Opens a serial connection to the scale, reads one line, parses it, and closes the port.
 *
 * Scale output format assumed: "  1.234 kg" (leading whitespace, number, unit).
 * This is a common format for many commercial kitchen scales. The regex is lenient
 * to accommodate minor variations.
 *
 * Timeout: 3 seconds. Rejects if no data is received within the timeout window.
 */
export function readScaleWeight(
  options: ScaleReadOptions,
): Promise<ScaleReadResult> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({
      path: options.port,
      baudRate: options.baudRate,
      autoOpen: false,
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      port.close(() =>
        reject(new Error(`Scale timeout: no data received on ${options.port}`)),
      );
    }, 3000);

    parser.once('data', (line: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      port.close();

      const raw = String(line).trim();
      // Match: optional sign, digits, optional decimal, whitespace, unit letters
      const match = raw.match(/^([+-]?\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
      if (!match) {
        reject(new Error(`Unrecognised scale output: "${raw}"`));
        return;
      }

      resolve({
        weight: parseFloat(match[1]),
        unit: match[2].toLowerCase(),
        raw,
      });
    });

    port.open((err) => {
      if (err) {
        settled = true;
        clearTimeout(timeout);
        reject(
          new Error(`Failed to open port ${options.port}: ${err.message}`),
        );
      }
    });

    port.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(err);
    });
  });
}
