import { TestBed, async, inject } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { ProviderResourceService } from './provider-resource.service';
import { OpenmrsApiModule } from './openmrs-api.module';

describe('Service : ProviderResourceService Unit Tests', () => {

  let providerResourceService: ProviderResourceService;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OpenmrsApiModule
      ],
      declarations: [],
      providers: [],
    });

    providerResourceService = TestBed.get(ProviderResourceService);
    httpMock = TestBed.get(HttpTestingController);

  }));

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be injected with all dependencies', () => {
    expect(providerResourceService).toBeTruthy();
    expect(providerResourceService.getUrl()).toBeDefined();
  });

  it('should return a provider when the correct uuid is provided without v', (done) => {
    const providerUuid = 'xxx-xxx-xxx-xxx';
    providerResourceService.getProviderByUuid(providerUuid)
      .subscribe((response) => {
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams).toContain(`provider/${providerUuid}?v=full`);
        done();
      });

    const req = httpMock.expectOne(`${providerResourceService.getUrl()}/${providerUuid}?v=full`);
    req.flush(JSON.stringify({}));
  });

  it('should return a provider when the correct uuid is provided with v', (done) => {
    const providerUuid = 'xxx-xxx-xxx-xxx';
    providerResourceService.getProviderByUuid(providerUuid, false, '9')
      .subscribe((response) => {
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams).toContain(`provider/${providerUuid}?v=9`);
        done();
      });
    const req = httpMock.expectOne(`${providerResourceService.getUrl()}/${providerUuid}?v=9`);
    req.flush(JSON.stringify({}));
  });

  it('should return a list of providers a matching search string is provided without v', (done) => {

    const searchText = 'test';
    const results = [
      {
        uuid: 'uuid',
        identifier: ''
      }
    ];
    providerResourceService.searchProvider(searchText)
      .subscribe((data) => {
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams).toContain(`provider?q=${searchText}&v=full`);
        done();
      });
    const req = httpMock.expectOne(providerResourceService.getUrl() + '?q=' + searchText +
      '&v=full');
    req.flush(JSON.stringify(results));

  });
});
