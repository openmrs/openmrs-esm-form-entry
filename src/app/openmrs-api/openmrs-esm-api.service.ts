import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OpenmrsEsmApiService {

  constructor() { }

  public getCurrentPatient(): Observable<any> {
    // HACK: Required to enable unit tests to run
    const backend = require('@openmrs/esm-api');
    return backend.getCurrentPatient();
  }
  public getCurrentUser(): Observable<any> {
    // HACK: Required to enable unit tests to run
    const backend = require('@openmrs/esm-api');
    return backend.getCurrentUser();
  }
  public  openmrsFetch(url): Observable<any> {
    // HACK: Required to enable unit tests to run
    const backend = require('@openmrs/esm-api');
    return backend.openmrsObservableFetch(url);
  }

  public getCurrentUserLocation(): Observable<any> {
    return this.openmrsFetch('/ws/rest/v1/appui/session').pipe(map(resp => resp.data));
  }
}
