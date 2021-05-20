import { setPublicPath } from "systemjs-webpack-interop";
import { messageOmrsServiceWorker } from "@openmrs/esm-framework";

setPublicPath("@openmrs/esm-form-entry-app");

const backendDependencies = { "webservices.rest": "2.24.0" };
const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  messageOmrsServiceWorker({
    "type": "registerDynamicRoute",
    "pattern": ".+/visit.+"
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
