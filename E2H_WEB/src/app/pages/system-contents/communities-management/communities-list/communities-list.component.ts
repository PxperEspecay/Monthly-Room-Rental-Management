import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceService } from 'src/app/service/service.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CommunitiesDetailsComponent } from '../communities-details/communities-details.component';

@Component({
  selector: 'app-communities-list',
  templateUrl: './communities-list.component.html',
  styleUrls: ['./communities-list.component.css']
})
export class CommunitiesListComponent implements OnInit {

  page: number = 1;
  itemsPerPage: any = 10;

  data_community: any = [

  ]


  constructor(private router: Router, private service: ServiceService, private dialogRef: MatDialog) {

  }


  ngOnInit() {
    this.GetCommunityList()
  }

  // async GetCommunityList() {
  //   let res: any = await this.service.Get('GetCommuList')
  //   if (res.status_code == 8000) {
  //     this.data_community = res.data
  //     for (let i = 0; i < this.data_community.length; i++) {
  //       this.data_community[i]['full_address'] = this.data_community[i]['address'] + ' ' + 'หมู่' + this.data_community[i]['address_moo'] + ' ' + this.data_community[i]['sub_district'] + ' ' + this.data_community[i]['district'] + ' ' + this.data_community[i]['province'];
        
  //       if (this.data_community[i].img_commu1) {
  //         this.data_community[i].img_commu1 = environment.endpoint_img + this.data_community[i].img_commu1;
  //       }
  //       if (this.data_community[i].img_commu2) {
  //         this.data_community[i].img_commu2 = environment.endpoint_img + this.data_community[i].img_commu2;
  //       }
  //       if (this.data_community[i].img_commu3) {
  //         this.data_community[i].img_commu3 = environment.endpoint_img + this.data_community[i].img_commu3;
  //       }
  //     }
      
  //   }
  //   console.log(this.data_community, 'Data Commu');

  // }

  async GetCommunityList() {
    let res: any = await this.service.Get('GetCommuList');
    if (res.status_code == 8000) {
      this.data_community = res.data;
      
      for (let i = 0; i < this.data_community.length; i++) {
        // สร้าง full address
        this.data_community[i]['full_address'] = this.data_community[i]['address'] + ' ' + 'หมู่' + this.data_community[i]['address_moo'] + ' ' + this.data_community[i]['sub_district'] + ' ' + this.data_community[i]['district'] + ' ' + this.data_community[i]['province'];
        
        // ตรวจสอบและต่อ URL ของรูปภาพ
        if (this.data_community[i].img_commu1 && !this.data_community[i].img_commu1.startsWith(environment.endpoint_img)) {
          this.data_community[i].img_commu1 = environment.endpoint_img + this.data_community[i].img_commu1;
        }
        if (this.data_community[i].img_commu2 && !this.data_community[i].img_commu2.startsWith(environment.endpoint_img)) {
          this.data_community[i].img_commu2 = environment.endpoint_img + this.data_community[i].img_commu2;
        }
        if (this.data_community[i].img_commu3 && !this.data_community[i].img_commu3.startsWith(environment.endpoint_img)) {
          this.data_community[i].img_commu3 = environment.endpoint_img + this.data_community[i].img_commu3;
        }
      }
      
    }
    console.log(this.data_community, 'Data Commu');
  }
  

  CreateBuilding() {
    this.router.navigate(['./communities-management/create-communities']);
    // window.location.href = './create-building'
  }

  BuildingAndRoomsDetails(community_id:any) {
    this.router.navigate(['./communities-management/building-management'],{
      queryParams: {
        community_id : community_id,
      }
    });
  }

  openCommunitiesDetail(id: any) {
    let dialog = this.dialogRef.open(CommunitiesDetailsComponent, {
      width: '70%',
      height: '95%',
      data: { commuities_id: id }  // ใช้ data ที่นี่
    });

    // dialog.componentInstance.data = {
    //   commuities_id: id,
    // };
    
  }

}
