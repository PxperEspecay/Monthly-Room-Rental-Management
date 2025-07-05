import { Component, OnInit, Inject } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rooms-details',
  templateUrl: './rooms-details.component.html',
  styleUrls: ['./rooms-details.component.css']
})
export class RoomsDetailsComponent implements OnInit{

  id: any;
  mode : any;
  building_id : any;
  body_room : any = {
    building_id : '',
    room_id : '',
    room_number : '',
    floor : '',
    monthly_rent_amount : '',
    rental_deposit : '',
    garbage_amount : ''
  }

  constructor(private router: Router,private route: ActivatedRoute, private service: ServiceService, public dialogRef: MatDialogRef<RoomsDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any){
    this.id = data.room_id
    console.log(this.id,'KKKKK');

    this.mode = data.mode
    console.log(this.mode,'MMMMM');
    
    
  }

  async ngOnInit(): Promise<void> {   

    this.route.queryParams.subscribe(params => {
      this.building_id = params['building_id']; // เก็บค่า building_id
    });

    if (this.id) {
      await this.GetRoomDetails();
    }
  }

  closeDialog() {
    this.dialogRef.close({

    });
  }

  async GetRoomDetails(){
    let body = {
      room_id : this.id
    }
    let res: any = await this.service.Post('GetRoomDetails',  body );
    if (res.status_code == 8000) {
      this.body_room = res.data
    }
  }

  async SubmitUpdateRoomDetails(){
    this.body_room.room_id = this.id

    let res: any = await this.service.Post('UpdateRoomDetails', this.body_room );
    if (res.status_code == 8000) {
      await Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">อัพเดตข้อมูลเรียบร้อย</b>`,
        // text: 'อัพเดตข้อมูลเรียบร้อย',
        icon: 'success',
        reverseButtons: true,
        showCancelButton: false,
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
          this.closeDialog();
           window.location.reload()
        } else {
          return;
        }
      });
    }
  }

  async SubmitAddNewRoom(){
    this.body_room.building_id = this.building_id
    let res: any = await this.service.Post('AddRoomToBuilding', this.body_room );
    if (res.status_code == 8000) {
      await Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">เพิ่มห้องพักใหม่เรียบร้อย</b>`,
        // text: 'อัพเดตข้อมูลเรียบร้อย',
        icon: 'success',
        reverseButtons: true,
        showCancelButton: false,
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
          this.closeDialog();
           window.location.reload()
        } else {
          return;
        }
      });
    }
  }

}
