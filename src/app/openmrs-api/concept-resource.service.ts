import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { WindowRef } from '../window-ref';
import { GetConcept } from './types';

@Injectable()
export class ConceptResourceService {
  private static readonly v = 'custom:(uuid,name,conceptClass,answers,setMembers)';

  constructor(protected http: HttpClient, protected windowRef: WindowRef) {}

  public searchConcept(searchText: string): Observable<Array<GetConcept>> {
    const url = this.windowRef.openmrsRestBase + 'concept?q=' + searchText + '&v=' + ConceptResourceService.v;
    return this.http.get<any>(url).pipe(map((response) => response.results));
  }

  public getConceptByUuid(uuid: string): Observable<GetConcept | undefined> {
    const url = this.windowRef.openmrsRestBase + 'concept/' + uuid + '?v=' + ConceptResourceService.v;
    return this.http.get<GetConcept | undefined>(url);
  }
}
