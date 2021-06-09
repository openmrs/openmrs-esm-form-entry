import Dexie, { Table } from 'dexie';
import { v4 } from 'uuid';

export async function syncQueuedEncounterRequests() {
  const db = new FormEntryDb();
  const encounterRequests = await db.encounterRequests.toArray();

  for (const { id, request } of encounterRequests) {
    const body = { ...request.body };
    removeAllOfflineUuids(body);

    setUuidObjectToString(body, 'patient');
    setUuidObjectToString(body, 'form');

    for (const obs of body.obs || []) {
      setUuidObjectToString(obs, 'concept');

      for (const groupMember of obs.groupMembers || []) {
        setUuidObjectToString(groupMember, 'concept');
      }
    }

    const res = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await db.encounterRequests.delete(id);
    }
  }
}

export async function getOfflineEncounterForForm(uuid: string) {
  const db = new FormEntryDb();
  const entry = await db.encounterRequests.get({ 'request.body.uuid': uuid });
  const body = entry.request.body;

  setUuidStringToObject(body, 'patient');
  setUuidStringToObject(body, 'form');

  for (const obs of body.obs || []) {
    setUuidStringToObject(obs, 'concept');

    for (const groupMember of obs.groupMembers || []) {
      setUuidStringToObject(groupMember, 'concept');
    }
  }

  console.info('Encounter is', body);
  return body;
}

function setUuidStringToObject(obj: any, key: string) {
  if (typeof obj[key] === 'string') {
    obj[key] = { uuid: obj[key] } as any;
  }
}

function setUuidObjectToString(obj: any, key: string) {
  if (typeof obj[key] === 'object' && typeof obj[key].uuid === 'string') {
    obj[key] = obj[key].uuid;
  }
}

const offlineUuidPrefix = 'OFFLINE+';

export function generateOfflineUuid() {
  return offlineUuidPrefix + v4();
}

export function isOfflineUuid(uuid: string) {
  return uuid.startsWith(offlineUuidPrefix);
}

export function addAllOfflineUuids(obj: any, key = 'uuid') {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (const value of obj) {
        addAllOfflineUuids(value, key);
      }
    } else if (obj[key] === undefined) {
      obj[key] = generateOfflineUuid();
    }

    for (const value of Object.values(obj)) {
      addAllOfflineUuids(value, key);
    }
  }
}

export function removeAllOfflineUuids(obj: any, key = 'uuid') {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (const value of obj) {
        removeAllOfflineUuids(value, key);
      }
    } else if (typeof obj[key] === 'string' && isOfflineUuid(obj[key])) {
      delete obj[key];
    }

    for (const value of Object.values(obj)) {
      removeAllOfflineUuids(value, key);
    }
  }
}

export function mergeEncounterUpdate(original: any, updated: any) {
  const newObs = updated.obs.filter(obs => !obs.uuid);
  const updatedObs = original.obs.map((originalObs) => ({
    ...originalObs,
    ...updated.obs.find((updatedObs) => updatedObs.uuid === originalObs.uuid),
  }));
  const obs = [...newObs, ...updatedObs].filter(obs => !obs.voided);

  // TODO: Orders

  addAllOfflineUuids(newObs);

  return {
    ...original,
    ...updated,
    obs,
  };
}

export class FormEntryDb extends Dexie {
  encounterRequests: Table<QueuedEncounterRequest, number>;

  constructor() {
    super('EsmFormEntry');

    this.version(1).stores({
      encounterRequests: '++id,request.body.uuid',
    });

    this.encounterRequests = this.table('encounterRequests');
  }
}

export interface QueuedEncounterRequest {
  id?: number;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
  };
}
