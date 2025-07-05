import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service/service.service';
import { MatDialog } from '@angular/material/dialog';
import { RoomsDetailsComponent } from '../rooms-details/rooms-details.component';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.css']
})
export class RoomsListComponent implements OnInit{

  building_id : any
  community_id : any
  rooms_list : any = []

  page: number = 1;
  itemsPerPage : any =  10;



  constructor(private router: Router,private route: ActivatedRoute, private service: ServiceService,private dialogRef: MatDialog){
    this.route.queryParams.subscribe(params => {
      this.community_id = params['community_id']; // เก็บค่า community_id
      this.building_id = params['building_id'];
    });
  }

  ngOnInit(): void {
    this.GetRoomsList()
  }

  BackTo() {
    this.router.navigate(['./communities-management/building-management'], {
      queryParams: { community_id: this.community_id } // ส่ง queryParams กลับไปด้วย
    });
  }

  async GetRoomsList(){
    let body = {
      building_id : this.building_id
    }
    let res: any = await this.service.Post('GetRoomsListByBuildingId',body);
    if (res.status_code == 8000) {
      this.rooms_list = res.data
      console.log(this.rooms_list,'daaaaata');
      
    }
  }

  addNewRoom(){

  }

  openRoomsDetail(id: any, mode:any) {
    let dialog = this.dialogRef.open(RoomsDetailsComponent, {
      width: '70%',
      height: '65%',
      data: { room_id : id, mode : mode }  // ใช้ data ที่นี่
    });

    dialog.componentInstance.id = id;

    // dialog.componentInstance.data = {
    //   commuities_id: id,
    // };
    
  }

  async deleteCurrentRoom(id: any) {
    let body = {
      building_id: this.building_id,
      room_id: id
    }
    await Swal.fire({
      title: `<b style="color:#FC5A5A;" class="fs-3">ยืนยันการลบข้อมูล</b>`,
      text: 'ยืนยันการลบข้อมูล',
      icon: 'warning',
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        cancelButton: 'alert-btn-cancel',
        confirmButton: 'alert-btn-confirm',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        let res: any = await this.service.Post('DeleteRoomFromBuilding', body);
        if (res.status_code == 8000) {
          Swal.fire({
            title: `<b style="color:#50c878;" class="fs-3">ลบข้อมูลสำเร็จ</b>`,
            text: 'ลบข้อมูลห้องพักนี้เรียบร้อยแล้ว',
            icon: 'success',
            reverseButtons: true,
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'ยืนยัน',
            customClass: {
              confirmButton: 'alert-btn-confirm',
            }
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload(); 
            }
          });
        }
      }
    });
}









   

}
