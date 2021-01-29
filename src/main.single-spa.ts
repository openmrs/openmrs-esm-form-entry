import { enableProdMode, NgZone } from "@angular/core";

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { Router } from "@angular/router";
import { ɵAnimationEngine as AnimationEngine } from "@angular/animations/browser";
import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import singleSpaAngular from "single-spa-angular";
import {
  singleSpaPropsSubject,
  SingleSpaProps,
} from "./single-spa/single-spa-props";
import "zone.js/dist/zone";

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: (singleSpaProps) => {
    singleSpaPropsSubject.next(singleSpaProps as SingleSpaProps);
    return platformBrowserDynamic().bootstrapModule(AppModule);
  },
  template: "<my-app-root />",
  Router,
  // tslint:disable-next-line:object-literal-shorthand
  NgZone: NgZone,
  // tslint:disable-next-line:object-literal-shorthand
  AnimationEngine: AnimationEngine,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;

