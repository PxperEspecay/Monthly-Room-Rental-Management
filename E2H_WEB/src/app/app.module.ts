import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { NgxPaginationModule } from 'ngx-pagination';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';


import { NgxPrintModule } from 'ngx-print';

import { ThaiDatePipe } from './pipes/thai-date.pipe';



import { AuthLoginComponent } from './pages/auth-login/auth-login/auth-login.component';
import { TemplateAuthComponent } from './template/template-auth/template-auth.component';
import { SystemContentsComponent } from './template/system-contents/system-contents.component';
import { RenterDetailsComponent } from './pages/system-contents/renter-management/renter-details/renter-details.component';
import { BuildingListComponent } from './pages/system-contents/building-management/building-list/building-list.component';
import { BuildingDetailsComponent } from './pages/system-contents/building-management/building-details/building-details.component';
import { BuildingCreateBuildingComponent } from './pages/system-contents/building-management/building-create-building/building-create-building.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminListComponent } from './pages/system-contents/admin-management/admin-list/admin-list.component';
import { AdminDetailsComponent } from './pages/system-contents/admin-management/admin-details/admin-details.component';
import { AdminCreateComponent } from './pages/system-contents/admin-management/admin-create/admin-create.component';
import { RenterListComponent } from './pages/system-contents/renter-management/renter-list/renter-list.component';
import { RenterCreateComponent } from './pages/system-contents/renter-management/renter-create/renter-create.component';
import { CommunitiesListComponent } from './pages/system-contents/communities-management/communities-list/communities-list.component';
import { CommunitiesCreateComponent } from './pages/system-contents/communities-management/communities-create/communities-create.component';
import { CommunitiesDetailsComponent } from './pages/system-contents/communities-management/communities-details/communities-details.component';
import { RoomsListComponent } from './pages/system-contents/building-management/rooms-list/rooms-list.component';
import { RoomsDetailsComponent } from './pages/system-contents/building-management/rooms-details/rooms-details.component';
import { DatePipe } from '@angular/common';
import { AnnouncementListComponent } from './pages/system-contents/announcement-management/announcement-list/announcement-list.component';
import { AnnouncementCreateComponent } from './pages/system-contents/announcement-management/announcement-create/announcement-create.component';
import { RoomListComponent } from './pages/system-contents/room-management/room-list/room-list.component';
import { AnnouncementDetailsComponent } from './pages/system-contents/announcement-management/announcement-details/announcement-details.component';
import { ReceiveReportedListComponent } from './pages/system-contents/receive-reported/receive-reported-list/receive-reported-list.component';
import { ReceiveReportedDetailsComponent } from './pages/system-contents/receive-reported/receive-reported-details/receive-reported-details.component';
import { BillsListComponent } from './pages/system-contents/bills-management/bills-list/bills-list.component';
import { BillsDetailsComponent } from './pages/system-contents/bills-management/bills-details/bills-details.component';
import { BillsCreateComponent } from './pages/system-contents/bills-management/bills-create/bills-create.component';
import { RepairRequestListComponent } from './pages/system-contents/repair-request-management/repair-request-list/repair-request-list.component';
import { RepairRequestDetailsComponent } from './pages/system-contents/repair-request-management/repair-request-details/repair-request-details.component';
import { DashboardListComponent } from './pages/system-contents/dashboard-management/dashboard-list/dashboard-list.component';
import { DashboardDetailComponent } from './pages/system-contents/dashboard-management/dashboard-detail/dashboard-detail.component';



@NgModule({
  declarations: [
    AppComponent,
    AuthLoginComponent,
    TemplateAuthComponent,
    SystemContentsComponent,
    BuildingListComponent,
    RenterDetailsComponent,
    BuildingDetailsComponent,
    BuildingCreateBuildingComponent,
    AdminListComponent,
    AdminDetailsComponent,
    AdminCreateComponent,
    RenterListComponent,
    RenterCreateComponent,
    CommunitiesListComponent,
    CommunitiesCreateComponent,
    CommunitiesDetailsComponent,
    RoomsListComponent,
    RoomsDetailsComponent,
    AnnouncementListComponent,
    AnnouncementCreateComponent,
    RoomListComponent,
    AnnouncementDetailsComponent,
    ReceiveReportedListComponent,
    ReceiveReportedDetailsComponent,
    BillsListComponent,
    BillsDetailsComponent,
    BillsCreateComponent,
    ThaiDatePipe,
    RepairRequestListComponent,
    RepairRequestDetailsComponent,
    DashboardListComponent,
    DashboardDetailComponent,
    
  ],
  imports: [
    
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,

    


    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    

    NgxPaginationModule,
    NgxPrintModule,
    




  ],
  providers: [
    [DatePipe],
    // { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FORMATS }
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    // { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
