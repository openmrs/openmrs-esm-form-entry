import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';

import { Observable, ReplaySubject, of } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { PersonResourceService } from './person-resource.service';
import { WindowRef } from '../window-ref';

@Injectable()
export class ProviderResourceService {
  public v = 'full';

  constructor(
    protected http: HttpClient,
    private windowRef: WindowRef,
    protected personService: PersonResourceService) {
  }

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'provider';
  }

  public searchProvider(searchText: string, cached: boolean = false, v: string = null):
    Observable<any> {
    if (this.isEmpty(searchText)) {
      return of([]);
    }
    const url = this.getUrl();
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

  public getProviderByUuid(uuid: string, cached: boolean = false, v: string = null):
    Observable<any> {

    if (this.isEmpty(uuid)) {
      return of(undefined);
    }

    let url = this.getUrl();
    url += '/' + uuid;

    const params: HttpParams = new HttpParams()
      .set('v', (v && v.length > 0) ? v : this.v);
    return this.http.get(url, {
      params
    });
  }
  public getProviderByPersonUuid(uuid: string, v?: string): ReplaySubject<any> {
    const providerResults = new ReplaySubject(1);

    if (this.isEmpty(uuid)) {
      providerResults.next(null);
    } else {
      this.personService.getPersonByUuid(uuid).pipe(take(1)).subscribe(
        (result) => {
          if (result) {
            const response = this.searchProvider(result.display, false, v);
            response.pipe(take(1)).subscribe(
              (providers) => {

                const foundProvider = providers.find((provider) => {
                  return provider.person && provider.person.uuid === uuid;
                });

                if (foundProvider) {
                  if (foundProvider.display === '') {
                    foundProvider.display = foundProvider.person.display;
                  }
                  providerResults.next(foundProvider);
                } else {
                  const msg = 'Error processing request: No provider with given person uuid found';
                  providerResults.error(msg);
                }

              },
              (error) => {
                const msg = 'Error processing request: No person with given uuid found';
                providerResults.error(msg);
              }
            );

          }
        },
        (error) => {
          providerResults.error(error);
        }
      );
    }
    return providerResults;
  }

  private isEmpty(str: string) {
    return (str === undefined || str === null || str.trim().length === 0 || str === 'null' || str === 'undefined');
  }
}
