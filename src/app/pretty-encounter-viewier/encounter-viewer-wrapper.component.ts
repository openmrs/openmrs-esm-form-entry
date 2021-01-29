import { Component, OnInit, Input, Inject } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { SingleSpaProps, singleSpaPropsSubject } from 'src/single-spa/single-spa-props';
import { take } from 'rxjs/operators';

@Component({
    selector: 'my-app-encounter-viewer-wrapper',
    templateUrl: './encounter-viewer-wrapper.component.html',
    styleUrls: []
})
export class EncounterViewerWrapperComponent implements OnInit {
    singleSpaProps: SingleSpaProps;
    public encounterUuid: string;

    ngOnInit(): void {
        this.loadEncounterViewer()
        .subscribe((encounter) => {
            console.log('encounter loaded', this.encounterUuid);
        }, (err) => {
            console.error('Error rendering encounter', err);
        });
    }

    public loadEncounterViewer(): Observable<any> {
        const subject = new ReplaySubject<any>(1);
        this.getProps()
        .pipe(take(1))
        .subscribe((props) => {
            this.encounterUuid = props.encounterUuid;
            subject.next(props.encounterUuid);
        }, (err) => {
            subject.error(err);
        });
        return subject.asObservable();
    }

    public getProps(): Observable<SingleSpaProps> {
        const subject = new ReplaySubject<SingleSpaProps>(1);
        singleSpaPropsSubject
          .pipe(take(1))
          .subscribe((props) => {
            this.singleSpaProps = props;
            const encounterUuid = props.encounterUuid;
            if (!(encounterUuid && typeof encounterUuid === 'string')) {
              subject.error('Encounter UUID is required. props.encounterUuid missing');
              return;
            }
            subject.next(props);
          }, (err) => {
            subject.error(err);
          });
        return subject.asObservable();
    }
}
