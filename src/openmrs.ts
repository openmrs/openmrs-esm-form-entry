import { setPublicPath } from 'systemjs-webpack-interop';

const moduleName = '@openmrs/esm-form-entry-app';

setPublicPath(moduleName);

const backendDependencies = {
  'webservices.rest': '2.24.0',
};

const importTranslation = require.context(
  '../translations',
  false,
  /.json$/,
  'lazy'
);

function setupOpenMRS() {

  return {
    extensions: [
      {
        id: 'form-widget',
        slot: 'form-widget-slot',
        load: () => import('./main.single-spa'),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
