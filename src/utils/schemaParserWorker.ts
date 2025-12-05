// Wrapper for using the schema parser WebWorker

import type { Table, Relation } from '../types';

export interface ParseResult {
  tables: Table[];
  relations: Relation[];
  executionTime?: number;
}

export class SchemaParserWorker {
  private worker: Worker | null = null;

  /**
   * Parse schema using WebWorker
   */
  async parseSchema(schemaString: string): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      try {
        // Create worker from the worker file
        this.worker = new Worker(new URL('./schemaParser.worker.ts', import.meta.url), {
          type: 'module',
        });

        // Set up message handler
        this.worker.onmessage = (e: MessageEvent) => {
          if (e.data.type === 'result') {
            resolve({
              tables: e.data.result.tables,
              relations: e.data.result.relations,
              executionTime: e.data.executionTime,
            });
            this.terminate();
          }
        };

        // Set up error handler
        this.worker.onerror = (error) => {
          reject(error);
          this.terminate();
        };

        // Send parse request
        this.worker.postMessage({
          type: 'parse',
          schemaString,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
