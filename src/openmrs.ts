import { setPublicPath } from 'systemjs-webpack-interop';
import { messageOmrsServiceWorker } from '@openmrs/esm-framework';
import {
  setupOfflineEncounterSync,
  setupEncounterRequestInterceptors,
  setupOfflineDataSourcePrecaching,
} from './offline';

setPublicPath('@openmrs/esm-form-entry-app');

const backendDependencies = { 'webservices.rest': '^2.24.0' };
const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  setupEncounterRequestInterceptors();
  setupOfflineEncounterSync();
  setupOfflineDataSourcePrecaching();

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
