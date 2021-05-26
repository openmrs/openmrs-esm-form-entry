import Dexie, { Table } from "dexie";
import { NetworkRequestFailedEvent } from "@openmrs/esm-offline";
import { openmrsFetch } from "@openmrs/esm-api";

export async function syncQueuedHttpRequests() {
  const db = new FormEntryDb();
  const httpRequests = await db.httpRequests.toArray();

  if (httpRequests.length > 0) {
    await Promise.all(
      httpRequests.map(({ request }) =>
        openmrsFetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        })
      )
    );
  }
}

export class FormEntryDb extends Dexie {
  httpRequests: Table<QueuedHttpRequest, number>;

  constructor() {
    super("EsmFormEntry");

    this.version(1).stores({
      httpRequests: "++id",
    });

    this.httpRequests = this.table("httpRequests");
  }
}

export interface QueuedHttpRequest
  extends Pick<NetworkRequestFailedEvent, "request"> {
  id?: number;
}
