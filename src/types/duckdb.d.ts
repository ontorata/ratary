declare module 'duckdb' {
  export class Database {
    constructor(path: string);
    connect(): Connection;
  }

  export interface Connection {
    run(sql: string, ...args: unknown[]): void;
    all(sql: string, ...args: unknown[]): void;
  }
}
