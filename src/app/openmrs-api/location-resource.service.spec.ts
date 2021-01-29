import { TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { LocationResourceService } from './location-resource.service';
import { HttpTestingController, HttpClientTestingModule, TestRequest } from '@angular/common/http/testing';
import { OpenmrsApiModule } from './openmrs-api.module';
import { WindowRef } from '../window-ref';

class MockCacheStorageService {
  constructor(a, b) {
  }

  public ready() {
    return true;
  }
}
describe('LocationResourceService:', () => {

  let service: LocationResourceService;
  let httpMock: HttpTestingController;
  let windowRef: WindowRef;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        WindowRef
      ]
    });

    service = TestBed.get(LocationResourceService);
    httpMock = TestBed.get(HttpTestingController);
    windowRef = TestBed.get(WindowRef);

  }));

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should inject service', () => {
    expect(service).toBeDefined();
  });

  it('should fetch all locations', (done) => {
    service.getLocations(true)
      .subscribe((result) => {
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams)
          .toContain('/ws/rest/v1/location?v=full');
        done();
      });
    const req = httpMock.expectOne(windowRef.openmrsRestBase + 'location' + '?v=full');
    req.flush([]);
  });

  it('should return an array of location object when getLocation is invoked', (done) => {

    const results = [
      {
        uuid: 'uuid',
        display: 'location'
      }, {
        uuid: 'uuid',
        display: 'location'
      }
    ];
    service.getLocations()
      .subscribe((result) => {
        expect(results).toContain({ uuid: 'uuid', display: 'location' });
        expect(results).toBeDefined();
        done();
      });

    const req = httpMock.expectOne(windowRef.openmrsRestBase + 'location' + '?v=full');
    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams)
      .toContain('/ws/rest/v1/location?v=full');
    req.flush(results);
  });

  it('should return a location when the correct uuid is provided without v', (done) => {
    const locationUuid = 'xxx-xxx-xxx-xxx';
    const results = [
      {
        uuid: 'xxx-xxx-xxx-xxx',
        display: 'location'
      }
    ];

    let req: TestRequest;
    service.getLocationByUuid(locationUuid)
      .subscribe((result) => {
        expect(results[0].uuid).toBe('xxx-xxx-xxx-xxx');
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams).toContain(windowRef.openmrsRestBase + 'location' + '/' + locationUuid + '?v=full');
        done();
      });

    // stubbing
    req = httpMock.expectOne(windowRef.openmrsRestBase + 'location' + '/' + locationUuid + '?v=full');
    req.flush(results);
  });

  it('should return a location when the correct uuid is provided with v', (done) => {
    const locationUuid = 'xxx-xxx-xxx-xxx';
    const results = [
      {
        uuid: 'xxx-xxx-xxx-xxx',
        display: 'location'
      }
    ];
    let req: TestRequest;
    service.getLocationByUuid(locationUuid, false, '9')
      .subscribe((response) => {
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams).toContain(`location/${locationUuid}?v=9`);
        done();
      });

    // stubbing
    req = httpMock.expectOne(windowRef.openmrsRestBase + 'location' + '/' + locationUuid + '?v=9');
    req.flush(results);
  });

  it('should return a list of locations matching search string provided without v', (done) => {
    const searchText = 'test';
    const results = [
      {
        uuid: 'uuid',
        display: ''
      },
      {
        uuid: 'uuid',
        display: ''
      }
    ];
    service.searchLocation(searchText)
      .subscribe((data) => {
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams).toContain(windowRef.openmrsRestBase + 'location' + '?q=' + searchText + '&v=full');
        done();
      });

    const req = httpMock.expectOne(windowRef.openmrsRestBase + 'location' + '?q=' + searchText + '&v=full');
    req.flush(results);
  });
  it('should return a list of locations matching search string provided with v', (done) => {
    const searchText = 'test';
    const results = [
      {
        uuid: 'uuid',
        display: ''
      },
      {
        uuid: 'uuid',
        display: ''
      }
    ];
    service.searchLocation(searchText, false, '9')
      .subscribe((data) => {
        expect(req.request.method).toBe('GET');
        expect(req.request.urlWithParams).toContain(windowRef.openmrsRestBase + 'location' + '?q=' + searchText + '&v=9');
        done();
      });

    const req = httpMock.expectOne(windowRef.openmrsRestBase + 'location' + '?q=' + searchText + '&v=9');
    req.flush(results);
  });

});
