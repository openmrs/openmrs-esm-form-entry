import { Component, OnInit, Input } from '@angular/core';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { FormSchemaService } from '../form-schema/form-schema.service';
import { EncounterAdapter, FormFactory, Form, DataSources } from '@ampath-kenya/ngx-openmrs-formentry/dist/ngx-formentry';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
// import { FileUploadResourceService } from '../../../etl-api/file-upload-resource.service';
// import { Patient } from 'src/app/models/patient.model';
import { flatMap, delay } from 'rxjs/operators';
import { take } from 'rxjs/operators';

@Component({
    selector: 'my-app-pretty-encounter-viewer',
    templateUrl: './pretty-encounter-viewer.component.html',
    styleUrls: []
})
export class PrettyEncounterViewerComponent implements OnInit {

    // tslint:disable-next-line:variable-name
    private _encounterUuid: string;
    @Input()
    public set encounterUuid(encounterUuid: string) {
        if (encounterUuid) {
            this._encounterUuid = encounterUuid;
            this.displayEncounterObs(this._encounterUuid);
        }
    }

    public selectedEncounter: any;
    public form: Form;
    public showLoader: boolean;
    public error: boolean;
    public errorMessage: string;
    private patient: any;
    public loaderText: string;

    constructor(private encounterResourceService: EncounterResourceService,
                private formSchemaService: FormSchemaService,
                private encounterAdapter: EncounterAdapter,
                private formFactory: FormFactory,
                // private fileUploadResourceService: FileUploadResourceService,
                private dataSources: DataSources,
                private formDataSourceService: FormDataSourceService) { }

    public ngOnInit() {
    }

    public wireDataSources() {
        // this.dataSources.registerDataSource('file', {
        //     fileUpload: this.fileUploadResourceService.upload.bind(this.fileUploadResourceService),
        //     fetchFile: this.fileUploadResourceService.getFile.bind(this.fileUploadResourceService)
        // });
        this.dataSources.registerDataSource('location',
            this.formDataSourceService.getDataSources().location);
        this.dataSources.registerDataSource('provider',
            this.formDataSourceService.getDataSources().provider);
        this.dataSources.registerDataSource('drug',
            this.formDataSourceService.getDataSources().drug);
        this.dataSources.registerDataSource('problem',
            this.formDataSourceService.getDataSources().problem);
        this.dataSources.registerDataSource('personAttribute',
            this.formDataSourceService.getDataSources().location);
    }

    public displayEncounterObs(encounterUuid: string) {
        this.initializeLoader();
        if (this.selectedEncounter) {
            if (encounterUuid === this.selectedEncounter.uuid) { return; }
        }
        this.form = undefined;
        this.encounterResourceService.getEncounterByUuid(encounterUuid).pipe(
            flatMap((encounterWithObs) => {
                this.patient = encounterWithObs.patient;
                this.selectedEncounter = encounterWithObs;
                this.wireDataSources();
                if (encounterWithObs.form) {
                    if (this.isPOCForm(encounterWithObs.form)) {
                        return this.formSchemaService.getFormSchemaByUuid(encounterWithObs.form.uuid);
                    } else {
                        this.showErrorMessage(`This encounter was done using an Infopath form.
                                Please use the obs viewer to view the obs for this encounter.`);
                    }
                } else {
                    this.showErrorMessage(`This encounter has no form.`);
                }
            })).pipe(
            take(1)).subscribe((compiledSchema) => {
                const unpopulatedform = this.formFactory.createForm(compiledSchema, this.dataSources);
                this.encounterAdapter.populateForm(unpopulatedform, this.selectedEncounter);
                this.form = unpopulatedform;
                this.showLoader = false;
                this.error = false;
            });
    }

    private isPOCForm(form) {
        return form.name.indexOf('POC') > -1;
    }

    private showErrorMessage(errorMessage: string) {
        this.showLoader = false;
        this.error = true;
        this.errorMessage = errorMessage;
    }

    private initializeLoader() {
        this.error = false;
        this.showLoader = true;
        this.loaderText = `Fetching Encounter...`;
    }
}
