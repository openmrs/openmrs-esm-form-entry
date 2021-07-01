import { setPublicPath } from 'systemjs-webpack-interop';
import { messageOmrsServiceWorker, openmrsFetch, subscribeConnectivity } from '@openmrs/esm-framework';
import { setupOfflineEncounterSync, setupEncounterRequestInterceptors } from './offline';

setPublicPath('@openmrs/esm-form-entry-app');

const backendDependencies = { 'webservices.rest': '2.24.0' };
const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  setupEncounterRequestInterceptors();
  setupOfflineEncounterSync();

  // TODO: This event must be replaced with a better one, e.g. sth like "subscribePrecache".
  subscribeConnectivity(async ({ online }) => {
    if (online) {
      const urlsToCache = [
        '/ws/rest/v1/location?q=&v=custom:(uuid,display)',
        '/ws/rest/v1/provider?q=&v=custom:(uuid,display,person:(uuid))',
      ];

      await Promise.all(
        urlsToCache.map(async (url) => {
          await messageOmrsServiceWorker({
            type: 'registerDynamicRoute',
            pattern: '.+' + url,
          });
          await openmrsFetch(url);
        }),
      );
    }
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/location?q=&v=custom:(uuid,display)',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/clobdata/.+',
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

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/provider.*',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/location.*',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/person.*',
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
