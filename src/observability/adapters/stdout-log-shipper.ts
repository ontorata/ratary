import type { LogEntry } from '../types/log.types.js';
import type { ILogShipper } from '../ports/ilog-shipper.port.js';

/** No-op log shipper. */
export class NoOpLogShipper implements ILogShipper {
  async ship(_entry: LogEntry): Promise<void> {
    // intentionally empty
  }

  async flush(): Promise<void> {
    // intentionally empty
  }
}

/** Stdout structured JSON log shipper (default). */
export class StdoutLogShipper implements ILogShipper {
  async ship(entry: LogEntry): Promise<void> {
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  }

  async flush(): Promise<void> {
    // stdout is line-buffered per write
  }
}
