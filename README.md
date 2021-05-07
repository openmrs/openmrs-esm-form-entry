# OpenMRS ESM FormEntry

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.20.

## Development server

Run `npm run serve:single-spa` for a dev server. Navigate to `https://localhost:4202/`. The app will automatically reload if you change any of the source files. Note that webpack will give out a warning 'WARNING: --deploy-url and/or --base-href contain unsupported values for ng serve. Default serve path of '/' used. Use --serve-path to override.', but ignore it as this enables the fonts and icons from boostrap to be served correctly during development time. 

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Build Single SPA
1. Build single spa
`npm run build:single-spa`

2. Serve dist of single spa
`npm run serve:dist`

3. Serve single spa
`npm run serve:single-spa`

Optionally, build and server single spa
`npm run build-serve:dist`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Known issues
1. `ng serve --prod true` does not work as the replace plugin under extra-webpack.config.js fails. In order for this to work, comment out the find replace plugin. Alternative is to use `npm run build-serve:dist`
