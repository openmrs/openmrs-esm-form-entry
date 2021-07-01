import { Injectable } from '@angular/core';
import { take, map } from 'rxjs/operators';

import { ProviderResourceService } from '../openmrs-api/provider-resource.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

import { LocationResourceService } from '../openmrs-api/location-resource.service';
import { ConceptResourceService } from '../openmrs-api/concept-resource.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { GetLocation, GetProvider } from '../openmrs-api/types';

@Injectable()
export class FormDataSourceService {
  constructor(
    private providerResourceService: ProviderResourceService,
    private locationResourceService: LocationResourceService,
    private conceptResourceService: ConceptResourceService,
    private localStorageService: LocalStorageService,
  ) {}

  public getDataSources() {
    return {
      location: {
        resolveSelectedValue: this.getLocationByUuid.bind(this),
        searchOptions: this.findLocation.bind(this),
      },
      provider: {
        resolveSelectedValue: this.getProviderByUuid.bind(this),
        searchOptions: this.findProvider.bind(this),
      },
      drug: {
        resolveSelectedValue: this.resolveConcept.bind(this),
        searchOptions: this.findDrug.bind(this),
      },
      problem: {
        resolveSelectedValue: this.resolveConcept.bind(this),
        searchOptions: this.findProblem.bind(this),
      },
      conceptAnswers: this.getWhoStagingCriteriaDataSource(),
    };
  }

  private getWhoStagingCriteriaDataSource() {
    const sourceChangedSubject = new Subject();

    const datasource = {
      cachedOptions: [],
      dataSourceOptions: {
        concept: undefined,
      },
      resolveSelectedValue: undefined,
      searchOptions: undefined,
      dataFromSourceChanged: sourceChangedSubject.asObservable(),
      changeConcept: undefined,
    };

    const find = (uuid: string) => {
      if (datasource.cachedOptions.length > 0) {
        return Observable.create((observer: Subject<any>) => {
          observer.next(datasource.cachedOptions);
        });
      }
      const valuesObservable = this.getConceptSetMembers(datasource.dataSourceOptions.concept);
      valuesObservable.subscribe((results) => {
        datasource.cachedOptions = results;
      });
      return valuesObservable;
    };

    const changeConcept = (uuid: string) => {
      datasource.dataSourceOptions.concept = uuid;
      datasource.cachedOptions = [];
      sourceChangedSubject.next([]);
      find(uuid).subscribe((results) => {
        sourceChangedSubject.next(results);
      });
    };

    datasource.resolveSelectedValue = this.resolveConcept.bind(this);
    datasource.searchOptions = find;
    datasource.changeConcept = changeConcept;

    return datasource;
  }

  public findProvider(searchText): Observable<any[]> {
    const providerSearchResults = new BehaviorSubject<any[]>([]);
    const findProvider = this.providerResourceService.searchProvider(searchText);
    findProvider.subscribe(
      (providers) => {
        const mappedProviders = providers.filter((p) => !!p.person).map(this.mapProvider);
        this.setCachedProviderSearchResults(mappedProviders);
        providerSearchResults.next(mappedProviders.slice(0, 10));
      },
      (error) => {
        providerSearchResults.error(error); // test case that returns error
      },
    );
    return providerSearchResults.asObservable();
  }

  public getProviderByUuid(uuid): Observable<any> {
    return this.providerResourceService.getProviderByUuid(uuid).pipe(map(this.mapProvider));
  }

  private mapProvider(provider: GetProvider) {
    return {
      label: provider.display,
      value: provider.uuid,
      providerUuid: (provider as any).uuid,
    };
  }

  public getPatientObject(patient: any): object {
    return {
      sex: patient.person.gender,
      birthdate: patient.person.birthdate,
      age: patient.person.age,
    };
  }

  public findLocation(searchText) {
    return this.locationResourceService.searchLocation(searchText).pipe(
      map((locations) => locations.map(this.mapLocation)),
      take(10),
    );
  }

  public getLocationByUuid(uuid) {
    return this.locationResourceService.getLocationByUuid(uuid).pipe(map(this.mapLocation));
  }

  private mapLocation(location?: GetLocation) {
    return (
      location && {
        label: location.display,
        value: location.uuid,
      }
    );
  }

  public resolveConcept(uuid): Observable<any> {
    return new Observable((observer) => {
      this.conceptResourceService.getConceptByUuid(uuid).subscribe(
        (result: any) => {
          if (result) {
            const mappedConcept = {
              label: result.name.display,
              value: result.uuid,
            };
            observer.next(mappedConcept);
          }
        },
        (error) => {
          observer.next(error);
        },
      );
    });
  }

  public getConceptAnswers(uuid) {
    const conceptResult: BehaviorSubject<any> = new BehaviorSubject<any>({});
    const v = 'custom:(uuid,name,conceptClass,answers)';
    this.conceptResourceService
      .getConceptByUuid(uuid, true, v)
      .pipe(take(1))
      .subscribe(
        (result) => {
          const mappedConcepts = this.mapConcepts(result.answers);
          conceptResult.next(mappedConcepts);
        },
        (error) => {
          conceptResult.error(error);
        },
      );
    return conceptResult.asObservable();
  }

  public getConceptSetMembers(uuid) {
    const conceptResult: BehaviorSubject<any> = new BehaviorSubject<any>({});
    const v = 'custom:(uuid,name,conceptClass,setMembers)';
    this.conceptResourceService.getConceptByUuid(uuid, true, v).subscribe(
      (result) => {
        let mappedConcepts: Array<any> = this.mapConcepts(result.setMembers);
        mappedConcepts = mappedConcepts.sort((a, b) => {
          return a.label > b.label ? 1 : 0;
        });
        conceptResult.next(mappedConcepts);
      },
      (error) => {
        conceptResult.error(error);
      },
    );
    return conceptResult.asObservable();
  }

  public findDrug(searchText) {
    const conceptResults: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    this.conceptResourceService.searchConcept(searchText).subscribe((concepts) => {
      const filtered = concepts.filter((concept: any) => {
        if (concept.conceptClass && concept.conceptClass.uuid === '8d490dfc-c2cc-11de-8d13-0010c6dffd0f') {
          return true;
        } else {
          return false;
        }
      });
      const mappedDrugs = this.mapConcepts(filtered);
      conceptResults.next(mappedDrugs);
    });
    return conceptResults.asObservable();
  }

  public findProblem(searchText) {
    const conceptResults: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    this.conceptResourceService.searchConcept(searchText).subscribe((concepts) => {
      const filtered = concepts.filter((concept: any) => {
        if (concept.conceptClass && concept.conceptClass.uuid === '8d4918b0-c2cc-11de-8d13-0010c6dffd0f') {
          return true;
        }
        if (concept.conceptClass && concept.conceptClass.uuid === '8d492b2a-c2cc-11de-8d13-0010c6dffd0f') {
          return true;
        }
        if (concept.conceptClass && concept.conceptClass.uuid === '8d492954-c2cc-11de-8d13-0010c6dffd0f') {
          return true;
        }
        if (concept.conceptClass && concept.conceptClass.uuid === '8d491a9a-c2cc-11de-8d13-0010c6dffd0f') {
          return true;
        }
      });
      const mappedProblems = this.mapConcepts(filtered);
      conceptResults.next(mappedProblems);
    });
    return conceptResults.asObservable();
  }
  public mapConcepts(concepts) {
    const mappedConcepts = concepts.map((concept) => {
      return {
        value: concept.uuid,
        label: concept.name.display,
      };
    });
    return mappedConcepts;
  }

  public getCachedProviderSearchResults(): any {
    const sourcekey = 'cachedproviders';
    return this.localStorageService.getObject(sourcekey);
  }

  private setCachedProviderSearchResults(searchProviderResults): void {
    const sourcekey = 'cachedproviders';
    this.localStorageService.setObject(sourcekey, searchProviderResults);
  }
}
