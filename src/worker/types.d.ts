// Global types for Cloudflare Workers
declare global {
  interface D1Database {
    prepare(sql: string): D1PreparedStatement;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    run(): Promise<D1Result>;
    all(): Promise<D1Result>;
    first(): Promise<any>;
  }

  interface D1Result {
    success: boolean;
    meta: {
      changes: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
    };
    results?: any[];
  }

  var console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
  };
}

export {};
