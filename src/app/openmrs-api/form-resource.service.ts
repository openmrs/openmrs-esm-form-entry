import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WindowRef } from '../window-ref';
import { ReplaySubject, Observable } from 'rxjs';

@Injectable()
export class FormResourceService {
  constructor(private http: HttpClient, private windowRef: WindowRef) {}
  public getFormClobDataByUuid(uuid: string, v: string = null): Observable<any> {
    let url = this.windowRef.openmrsRestBase + 'clobdata';
    url += '/' + uuid;

    const params: HttpParams = new HttpParams().set('v', v && v.length > 0 ? v : 'full');

    return this.http.get(url, {
      params,
    });
  }

  public getFormMetaDataByUuid(uuid: string, v: string = null): Observable<any> {
    let url = this.windowRef.openmrsRestBase + 'form';
    url += '/' + uuid;

    const params: HttpParams = new HttpParams().set('v', v && v.length > 0 ? v : 'full');

    return this.http.get(url, {
      params,
    });
  }
}
