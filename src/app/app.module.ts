import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmptyRouteComponent } from './empty-route/empty-route.component';
import { FeWrapperComponent } from './fe-wrapper/fe-wrapper.component';
import { FormEntryModule } from '@ampath-kenya/ngx-openmrs-formentry/dist/ngx-formentry';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenmrsApiModule } from './openmrs-api/openmrs-api.module';
import { FormSchemaService } from './form-schema/form-schema.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { FormDataSourceService } from './form-data-source/form-data-source.service';
import { FormSubmissionService } from './form-submission/form-submission.service';
import { FormSubmittedComponent } from './form-submitted/form-submitted.component';
import { PrettyEncounterViewerComponent } from './pretty-encounter-viewier/pretty-encounter-viewer.component';
import { EncounterViewerWrapperComponent } from './pretty-encounter-viewier/encounter-viewer-wrapper.component';

@NgModule({
  declarations: [
    AppComponent,
    EmptyRouteComponent,
    FeWrapperComponent,
    FormSubmittedComponent,
    PrettyEncounterViewerComponent,
    EncounterViewerWrapperComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormEntryModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    OpenmrsApiModule
  ],
  providers: [
    FormSchemaService,
    LocalStorageService,
    FormDataSourceService,
    FormSubmissionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
