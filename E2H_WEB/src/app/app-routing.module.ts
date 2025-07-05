import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLoginComponent } from './pages/auth-login/auth-login/auth-login.component';
import { TemplateAuthComponent } from './template/template-auth/template-auth.component';
import { SystemContentsComponent } from './template/system-contents/system-contents.component';
import { BuildingListComponent } from './pages/system-contents/building-management/building-list/building-list.component';
import { BuildingCreateBuildingComponent} from './pages/system-contents/building-management/building-create-building/building-create-building.component';
import { BuildingDetailsComponent } from './pages/system-contents/building-management/building-details/building-details.component';
import { AdminListComponent } from './pages/system-contents/admin-management/admin-list/admin-list.component';
import { AdminCreateComponent } from './pages/system-contents/admin-management/admin-create/admin-create.component';
import { AdminDetailsComponent } from './pages/system-contents/admin-management/admin-details/admin-details.component';
import { RenterListComponent } from './pages/system-contents/renter-management/renter-list/renter-list.component';
import { RenterDetailsComponent } from './pages/system-contents/renter-management/renter-details/renter-details.component';
import { RenterCreateComponent } from './pages/system-contents/renter-management/renter-create/renter-create.component';
import { CommunitiesListComponent } from './pages/system-contents/communities-management/communities-list/communities-list.component';
import { CommunitiesCreateComponent } from './pages/system-contents/communities-management/communities-create/communities-create.component';
import { RoomsListComponent } from './pages/system-contents/building-management/rooms-list/rooms-list.component';
import { AnnouncementListComponent } from './pages/system-contents/announcement-management/announcement-list/announcement-list.component';
import { AnnouncementCreateComponent } from './pages/system-contents/announcement-management/announcement-create/announcement-create.component';
import { RoomListComponent } from './pages/system-contents/room-management/room-list/room-list.component';
import { ReceiveReportedListComponent } from './pages/system-contents/receive-reported/receive-reported-list/receive-reported-list.component';
import { ReceiveReportedDetailsComponent } from './pages/system-contents/receive-reported/receive-reported-details/receive-reported-details.component';
import { BillsListComponent } from './pages/system-contents/bills-management/bills-list/bills-list.component';
import { BillsDetailsComponent } from './pages/system-contents/bills-management/bills-details/bills-details.component';
import { RepairRequestListComponent } from './pages/system-contents/repair-request-management/repair-request-list/repair-request-list.component';
import { RepairRequestDetailsComponent } from './pages/system-contents/repair-request-management/repair-request-details/repair-request-details.component';
import { DashboardListComponent } from './pages/system-contents/dashboard-management/dashboard-list/dashboard-list.component';
import { DashboardDetailComponent } from './pages/system-contents/dashboard-management/dashboard-detail/dashboard-detail.component';

import { AuthGuard } from './auth.guard'; // นำเข้า AuthGuard

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {
    path: '',
    component: TemplateAuthComponent,
    children: [
      {path: 'login', component: AuthLoginComponent},
    ]
  },
  // {
  //   path: 'building-list',
  //   component: BuildingListComponent,
    
  // },
  {
    path: '',
    component: SystemContentsComponent,
    canActivate: [AuthGuard], // เพิ่ม AuthGuard ที่นี่
    children: [
      {
        path: 'renter-management',
        children: [
          {
            path: '',
            component: RenterListComponent
          },
          {
            path: 'details',
            component: RenterDetailsComponent
          },
          {
            path: 'create-new-renter',
            component: RenterCreateComponent
          },
        ],
        data: { 
          breadcrumbTh: 'ผู้เช่าอยู่' ,
          role: ['admin', 'super admin']},
      },
      {
        path: 'communities-management',
        children: [
          {
            path: '',
            component: CommunitiesListComponent
          },
          {
            path: 'create-communities',
            component: CommunitiesCreateComponent
          },
          {
            path: 'building-management',
            component: BuildingListComponent,
            // children:[
            //   {path : 'create-building'}
            // ]
          },
          {
            path: 'create-building',
            component: BuildingCreateBuildingComponent
          },
          {
            path: 'rooms-management',
            component: RoomsListComponent
          },
        ],
        data: { breadcrumbTh: 'ชุมชนและอาคาร' , role: ['super admin'] },
      },
      {
        path: 'admin-management',
        children: [
          {
            path: '',
            component: AdminListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: 'details',
            component: AdminDetailsComponent,
            // canActivate: [AuthGuard],
          },
          {
            path: 'create-admin',
            component: AdminCreateComponent,
            canActivate: [AuthGuard],
          },
        ],
        data: { breadcrumbTh: 'จัดการผู้ดูแลระบบ' , role: ['admin','super admin'] },
      },
      // {
      //   path: 'building-details',
      //   children: [
      //     {
      //       path: '',
      //       component: BuildingDetailsComponent
      //     }
      //   ],
      //   data: { breadcrumbTh: 'อาคารและห้องพัก' },
      // },
      // {
      //   path: 'building-create-building',
      //   children: [
      //     {
      //       path: '',
      //       component: BuildingCreateBuildingComponent
      //     }
      //   ],
      //   data: { breadcrumbTh: 'อาคารและห้องพัก' },
      // },
      {
        path: 'announcement-management',
        children: [
          {
            path: '',
            component: AnnouncementListComponent
          },
          {
            path: 'create-announcement',
            component: AnnouncementCreateComponent
          },
        ],
        data: { 
          breadcrumbTh: 'แจ้งเตือน และ ประกาศ' ,
          role: ['admin', 'super admin']},
      },
      {
        path: 'room-management',
        children: [
          {
            path: '',
            component: RoomListComponent
          },
         
        ],
        data: { 
          breadcrumbTh: 'ข้อมูลห้องเช่า' ,
          role: ['admin', 'super admin']},
      },
      {
        path: 'receive-reported-management',
        children: [
          {
            path: '',
            component: ReceiveReportedListComponent
          },
          {
            path: 'details',
            component: ReceiveReportedDetailsComponent
          },
         
        ],
        data: { 
          breadcrumbTh: 'รับแจ้งเรื่อง' ,
          role: ['admin', 'super admin']},
      },
      {
        path: 'bills-management',
        children: [
          {
            path: '',
            component: BillsListComponent
          },
          {
            path: 'details',
            component: BillsDetailsComponent
          },
         
        ],
        data: { 
          breadcrumbTh: 'บิล และ ค่าเช่า' ,
          role: ['admin', 'super admin']},
      },
      {
        path: 'repair-request-management',
        children: [
          {
            path: '',
            component: RepairRequestListComponent
          },
          {
            path: 'details',
            component: RepairRequestDetailsComponent
          },
         
        ],
        data: { 
          breadcrumbTh: 'รับแจ้งซ่อม' ,
          role: ['admin', 'super admin']},
      },
      {
        path: 'dashboard-management',
        children: [
          {
            path: '',
            component: DashboardListComponent
          },
          {
            path: 'details',
            component: DashboardDetailComponent
          },
         
        ],
        data: { 
          breadcrumbTh: 'แดชบอร์ด' ,
          role: ['admin', 'super admin']},
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
