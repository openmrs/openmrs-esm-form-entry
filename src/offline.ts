import Dexie, { Table } from 'dexie';
import { NetworkRequestFailedEvent } from '@openmrs/esm-framework';

export async function syncQueuedHttpRequests() {
  const db = new FormEntryDb();
  const httpRequests = await db.httpRequests.toArray();

  if (httpRequests.length > 0) {
    await Promise.all(
      httpRequests.map(async ({ id, request }) => {
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
        await db.httpRequests.delete(id);
      }),
    );
  }
}

export class FormEntryDb extends Dexie {
  httpRequests: Table<QueuedHttpRequest, number>;

  constructor() {
    super('EsmFormEntry');

    this.version(1).stores({
      httpRequests: '++id',
    });

    this.httpRequests = this.table('httpRequests');
  }
}

export interface QueuedHttpRequest extends Pick<NetworkRequestFailedEvent, 'request'> {
  id?: number;
}
