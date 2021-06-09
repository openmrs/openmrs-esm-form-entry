import { setPublicPath } from 'systemjs-webpack-interop';
import {
  messageOmrsServiceWorker,
  subscribeNetworkRequestFailed,
  registerSynchronizationCallback,
} from '@openmrs/esm-framework';
import { FormEntryDb, syncQueuedEncounterRequests, addAllOfflineUuids, mergeEncounterUpdate } from './offline';

setPublicPath('@openmrs/esm-form-entry-app');

const backendDependencies = { 'webservices.rest': '2.24.0' };
const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  subscribeNetworkRequestFailed(async (data) => {
    const createEncounterPattern = /.+\/ws\/rest\/v1\/encounter$/;
    const updateEncounterPattern = /.+\/ws\/rest\/v1\/encounter\/(.+)/;
    if (data.request.method === 'POST') {
      if (createEncounterPattern.test(data.request.url)) {
        const db = new FormEntryDb();
        const { uuid } = JSON.parse(data.request.headers['x-omrs-offline-response-body']);
        const encounterPost = JSON.parse(data.request.body);
        const body = { ...encounterPost, uuid };
        addAllOfflineUuids(body);

        await db.encounterRequests.add({
          request: {
            url: data.request.url,
            method: data.request.method,
            headers: data.request.headers,
            body,
          },
        });
      } else if (updateEncounterPattern.test(data.request.url)) {
        const uuid = updateEncounterPattern.exec(data.request.url)[1];
        const db = new FormEntryDb();
        const entry = await db.encounterRequests.get({ 'request.body.uuid': uuid });
        const existing = entry.request.body;
        const update = JSON.parse(data.request.body);
        const merged = mergeEncounterUpdate(existing, update);
        entry.request.body = merged;
        await db.encounterRequests.put(entry);
      }
    }
  });

  registerSynchronizationCallback(() => syncQueuedEncounterRequests());

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/visit.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/fhir2/R4/Observation.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/obs.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/session.*',
  });

  return {
    extensions: [
      {
        id: 'form-widget',
        slot: 'form-widget-slot',
        load: () => import('./main.single-spa'),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
