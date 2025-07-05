import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service/service.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { BuildingDetailsComponent } from '../building-details/building-details.component';

@Component({
  selector: 'app-building-list',
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.css']
})
export class BuildingListComponent implements OnInit{

  community_id : any
  
  page: number = 1;
  itemsPerPage : any =  10;
  data_building : any = []

  building_id : any
  
  data_builder : any = [
    {
      builder_name : 'ห้องแถวสีชมพู',
      floor : 1,
      room : 7,
      address : '123/55 บ้านฉาง ระยอง',
      photo1 : 'assets/images/pink-house1.jpeg',
      photo2 : 'assets/images/pink-house2.jpeg',
      photo3 : 'assets/images/pink-house3.jpeg',
    },
    {
      builder_name : 'ทาวเฮาท์หลังวัด',
      floor : 2,
      room : 10,
      address : '43/27 บางบัวทอง นนทบุรี',
      photo1 : 'assets/images/condo-1.jpg',
      photo2 : 'assets/images/condo-2.jpg',
      photo3 : 'assets/images/condo-3.jpg',
    },
    {
      builder_name : 'หอพักคุณแม่',
      floor : 3,
      room : 15,
      address : '180/188 บ้านฉาง ระยอง',
      photo1 : 'assets/images/yellow-house1.jpg',
      photo2 : 'assets/images/yellow-house2.jpg',
      photo3 : 'assets/images/yellow-house3.jpg',
    },
    {
      builder_name : 'บ้านพักตากอากาศ',
      floor : 2,
      room : 5,
      address : '234/665 อำเภอเมือง เชียงใหม่',
      photo1 : 'assets/images/switzerland1.jpg',
      photo2 : 'assets/images/switzerland2.jpg',
      photo3 : 'assets/images/switzerland3.jpg',
    },
    
  ]
  
  
  constructor(private router: Router,private route: ActivatedRoute, private service: ServiceService,private dialogRef: MatDialog){
    
  }
  
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {

      this.community_id = params?.community_id
      console.log(this.community_id,'= community_id');



    });
   this.GetBuildingList()
  }

  BackTo(){
    this.router.navigate(['./communities-management']);
  }

  CreateBuilding(){
    this.router.navigate(['./communities-management/create-building'],{
      queryParams: {
        community_id : this.community_id,
      }
    });
    // window.location.href = './create-building'
  }

  RoomList(id: any, commu_id:any) {
    this.router.navigate(['./communities-management/rooms-management'],{
      queryParams: {
        community_id : commu_id,
        building_id : id
      }
    });
    // window.location.href = './create-building'
  }

  async GetBuildingList(){
    let body = {
      community_id: this.community_id
    }
    console.log(body,'body');
    
    let res: any = await this.service.Post('GetBuildingList', body)
    if (res.status_code == 8000) {
      this.data_building = res.data
      for (let i = 0; i < this.data_building.length; i++) {
        if (this.data_building[i]['building']['img_building']) {
          this.data_building[i]['building']['img_building'] = environment.endpoint_img + this.data_building[i]['building']['img_building']
        }
        console.log('ภาพ = ',this.data_building[i]['building']['img_building']);
        
      }
      
    }
    console.log(this.data_building,'this.data_building');
  }

  openBuildingDetail(id: any) {
    let dialog = this.dialogRef.open(BuildingDetailsComponent, {
      width: '70%',
      height: '65%',
      data: { building_id: id }  // ใช้ data ที่นี่
    });

    // dialog.componentInstance.data = {
    //   commuities_id: id,
    // };
    
  }






}
