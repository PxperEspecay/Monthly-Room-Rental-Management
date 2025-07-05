import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-building-details',
  templateUrl: './building-details.component.html',
  styleUrls: ['./building-details.component.css']
})
export class BuildingDetailsComponent implements OnInit {

  selectedFiles1: any;
  preview1: any
  fileInfo1: any


  body_CreateNewBuilding: any = {
    img_building: '',
    building_name: '',
    community_id: 0,
    floors: 0,
    rooms: [
      {
        room_number: '',
        floor: 1
      },
      {
        room_number: '',
        floor: 1
      }
    ]
  }

  new_room = [
    {
      room_id: null,
      room_number: '',
      floor: '',
    },
  ];

  building_id: any
  building_details: any = {}


  constructor(private router: Router, private service: ServiceService, public dialogRef: MatDialogRef<BuildingDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.building_id = data.building_id;
    // console.log(this.building_id,'this.building_id');



  }

  ngOnInit(): void {
    this.GetBuildingDetails()
  }

  BackTo() {
    this.router.navigate(['./building-management']);
  }

  closeDialog() {
    this.dialogRef.close({

    });
  }

  async GetBuildingDetails() {
    let body = {
      building_id: this.building_id
    }
    let res: any = await this.service.Post('GetBuildingDetails', body);
    if (res.status_code == 8000) {
      this.building_details = res.data
      // console.log(this.building_details,'= this.building_details');
      if (this.building_details.img_building && !this.building_details.img_building.startsWith(environment.endpoint_img)) {
        this.building_details.img_building = environment.endpoint_img + this.building_details.img_building
      }

    }
  }

  async SubmitEditBuildingDetails() {
    let body = {
      id: this.building_id,

    }

    const formData = new FormData();

    formData.append('id', this.building_id);
    formData.append('building_name', this.building_details.building_name);
    formData.append('floor', this.building_details.floor);

    // ตรวจสอบสถานะรูปภาพแต่ละรูป
    if (this.building_details.img_building === null || this.building_details.img_building === '') {
      formData.append('img_building', ''); // ส่งค่าว่างในกรณีที่ลบรูปออก
    } else if (typeof this.building_details.img_building === 'string' && !this.building_details.img_building.includes(environment.endpoint_img)) {
      formData.append('img_building', this.building_details.img_building); // ส่ง path เดิมถ้าไม่มีการเปลี่ยนแปลง
    } else if (this.building_details.img_building instanceof File) {
      formData.append('img_building', this.building_details.img_building); // ส่งไฟล์ใหม่ถ้ามีการอัปโหลด
    }

    console.log(formData.get('id'));
    console.log(formData.get('building_name'));
    console.log(formData.get('floor'));
    console.log(formData.get('img_commu1'));

    let res: any = await this.service.Post('UpdateBuildingDetails', formData, null);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">แก้ไขข้อมูลสำเร็จแล้ว</b>`,
        icon: 'success',
        reverseButtons: true,
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        customClass: {
          confirmButton: 'alert-btn-confirm',
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      }); 
    }
  }




  showMegaByte(size: number): string {
    return (size / (1024 * 1024)).toFixed(2);
  }

  SelectImageCommu1(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview1 = reader.result;
        this.building_details.img_building = file;
      };
      reader.readAsDataURL(file);

      // Store file info
      this.fileInfo1 = {
        name: file.name,
        size: file.size
      };
    }
  }

  async DeleteImageCommu1() {
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
        // actions: 'my-actions',
        cancelButton: 'alert-btn-cancel',
        confirmButton: 'alert-btn-confirm',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.preview1 = null;
        this.fileInfo1 = null;
        this.building_details.img_building = null;
        (document.getElementById('select-img') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }

 

  

}
