import { setPublicPath } from "systemjs-webpack-interop";
import {
  messageOmrsServiceWorker,
  subscribeNetworkRequestFailed,
  registerSynchronizationCallback,
} from "@openmrs/esm-framework";
import { FormEntryDb, syncQueuedHttpRequests } from "./offline";

setPublicPath("@openmrs/esm-form-entry-app");

const backendDependencies = { "webservices.rest": "2.24.0" };
const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  subscribeNetworkRequestFailed(async (data) => {
    const db = new FormEntryDb();
    await db.httpRequests.add({ request: data.request });
  });

  registerSynchronizationCallback(() => syncQueuedHttpRequests());

  messageOmrsServiceWorker({
    type: "registerDynamicRoute",
    pattern: ".+/visit.+",
  });

  messageOmrsServiceWorker({
    type: "registerDynamicRoute",
    pattern: ".+/ws/fhir2/R4/Observation.+",
  });

  messageOmrsServiceWorker({
    type: "registerDynamicRoute",
    pattern: ".+/ws/rest/v1/obs.+",
  });

  messageOmrsServiceWorker({
    type: "registerDynamicRoute",
    pattern: ".+/ws/rest/v1/appui/session.*",
  });

  return {
    extensions: [
      {
        id: "form-widget",
        slot: "form-widget-slot",
        load: () => import("./main.single-spa"),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
