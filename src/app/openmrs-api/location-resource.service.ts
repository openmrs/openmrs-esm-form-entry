import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { take, map } from 'rxjs/operators';
import { ReplaySubject, Observable } from 'rxjs';

import { WindowRef } from '../window-ref';
@Injectable()
export class LocationResourceService {
  private locations = new ReplaySubject(1);
  private v = 'full';

  constructor(
    protected http: HttpClient,
    protected windowRef: WindowRef) {
  }

  public getLocations(forceRefresh?: boolean) {
    // If the Subject was NOT subscribed before OR if forceRefresh is requested
    const params = new HttpParams().set('v', 'full');

    if (!this.locations.observers.length || forceRefresh) {
      this.http.get<any>(
        this.windowRef.openmrsRestBase + 'location',
        {
          params
        }
      ).pipe(take(1)).subscribe(
        (data) => this.locations.next(data.results),
        (error) => this.locations.error(error)
      );
    }

    return this.locations;
  }

  public getLocationByUuid(uuid: string, cached: boolean = false, v: string = null):
    Observable<any> {

    let url = this.windowRef.openmrsRestBase + 'location';
    url += '/' + uuid;

    const params: HttpParams = new HttpParams()
      .set('v', (v && v.length > 0) ? v : this.v);
    const request = this.http.get(url, { params });
    return request;
  }

  public searchLocation(searchText: string, cached: boolean = false, v: string = null):
    Observable<any> {

    const url = this.windowRef.openmrsRestBase + 'location';
    const params: HttpParams = new HttpParams()
      .set('q', searchText)
      .set('v', (v && v.length > 0) ? v : this.v);

    return this.http.get<any>(url, {
      params
    }).pipe(
      map((response) => {
        return response.results;
      }));
  }

}
