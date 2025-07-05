import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServiceService } from 'src/app/service/service.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-communities-details',
  templateUrl: './communities-details.component.html',
  styleUrls: ['./communities-details.component.css']
})
export class CommunitiesDetailsComponent implements OnInit {

  commuities_id: any;
  commuities_details: any;


  selectedFiles1: any;
  selectedFiles2: any;
  selectedFiles3: any;
  preview1: any
  fileInfo1: any
  preview2: any
  fileInfo2: any
  preview3: any
  fileInfo3: any

  prefix_name_th: any = [
    { 
      id : 1,
      prefix_name_th : 'นาย'
    },
    { 
      id : 2,
      prefix_name_th : 'นาง'
    },
    { 
      id : 3,
      prefix_name_th : 'นางสาว'
    },
  ];


  constructor(
    public dialogRef: MatDialogRef<CommunitiesDetailsComponent>,
    private service: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {

    this.commuities_id = data.commuities_id;
    console.log(this.commuities_id, '= this.commuities_id');


    dialogRef.backdropClick().subscribe(() => {
      dialogRef.close({

      });
    });
  }

  async ngOnInit(): Promise<void> {
    await this.GetCommunitiesDetails()


  }

  async GetCommunitiesDetails() {
    let body = {
      id: this.commuities_id
    }
    let res: any = await this.service.Post('GetCommuDetails', body)
    if (res.status_code == 8000) {
      this.commuities_details = res.data
      if (this.commuities_details.img_commu1 && !this.commuities_details.img_commu1.startsWith(environment.endpoint_img)) {
        this.commuities_details.img_commu1 = environment.endpoint_img + this.commuities_details.img_commu1
      }
      if (this.commuities_details.img_commu2 && !this.commuities_details.img_commu2.startsWith(environment.endpoint_img)) {
        this.commuities_details.img_commu2 = environment.endpoint_img + this.commuities_details.img_commu2
      }
      if (this.commuities_details.img_commu3 && !this.commuities_details.img_commu3.startsWith(environment.endpoint_img)) {
        this.commuities_details.img_commu3 = environment.endpoint_img + this.commuities_details.img_commu3
      }
      if (this.commuities_details.community_name_th) {
        this.commuities_details.community_name_th = this.commuities_details.community_name_th
      }
    }
    console.log(this.preview1, 'this.preview1');

    console.log('this.commuities_details= ', this.commuities_details);
  }

  cancel() {
    this.dialogRef.close({

    });
  }

  BackTo() {

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
        this.commuities_details.img_commu1 = file;
      };
      reader.readAsDataURL(file);

      // Store file info
      this.fileInfo1 = {
        name: file.name,
        size: file.size
      };
    }
  }



  SelectImageCommu2(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview2 = reader.result;
        this.commuities_details.img_commu2 = file;
      };
      reader.readAsDataURL(file);

      // Store file info
      this.fileInfo2 = {
        name: file.name,
        size: file.size
      };
    }
  }
  SelectImageCommu3(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview3 = reader.result;
        this.commuities_details.img_commu3 = file;
      };
      reader.readAsDataURL(file);

      // Store file info
      this.fileInfo3 = {
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
        this.commuities_details.img_commu1 = null;
        (document.getElementById('select-img') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }

  async DeleteImageCommu2() {
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
        this.preview2 = null;
        this.fileInfo2 = null;
        this.commuities_details.img_commu2 = null;
        (document.getElementById('select-img2') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }

  async DeleteImageCommu3() {
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
        this.preview3 = null;
        this.fileInfo3 = null;
        this.commuities_details.img_commu3 = null;
        (document.getElementById('select-img3') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }


  async SubmitEdit_Community() {
    const formData = new FormData();
  
    formData.append('id', this.commuities_details.id);
    formData.append('community_name_th', this.commuities_details.community_name_th);
    formData.append('community_name_en', this.commuities_details.community_name_en);
    formData.append('description', this.commuities_details.description);
    formData.append('address', this.commuities_details.address);
    formData.append('address_moo', this.commuities_details.address_moo);
    formData.append('street', this.commuities_details.street);
    formData.append('province', this.commuities_details.province);
    formData.append('district', this.commuities_details.district);
    formData.append('sub_district', this.commuities_details.sub_district);
    formData.append('zip_code', this.commuities_details.zip_code);
  
    // ตรวจสอบสถานะรูปภาพแต่ละรูป
  if (this.commuities_details.img_commu1 === null || this.commuities_details.img_commu1 === '') {
    formData.append('img_commu1', ''); // ส่งค่าว่างในกรณีที่ลบรูปออก
  } else if (typeof this.commuities_details.img_commu1 === 'string' && !this.commuities_details.img_commu1.includes(environment.endpoint_img)) {
    formData.append('img_commu1', this.commuities_details.img_commu1); // ส่ง path เดิมถ้าไม่มีการเปลี่ยนแปลง
  } else if (this.commuities_details.img_commu1 instanceof File) {
    formData.append('img_commu1', this.commuities_details.img_commu1); // ส่งไฟล์ใหม่ถ้ามีการอัปโหลด
  }

  if (this.commuities_details.img_commu2 === null || this.commuities_details.img_commu2 === '') {
    formData.append('img_commu2', '');
  } else if (typeof this.commuities_details.img_commu2 === 'string' && !this.commuities_details.img_commu2.includes(environment.endpoint_img)) {
    formData.append('img_commu2', this.commuities_details.img_commu2);
  } else if (this.commuities_details.img_commu2 instanceof File) {
    formData.append('img_commu2', this.commuities_details.img_commu2);
  }

  if (this.commuities_details.img_commu3 === null || this.commuities_details.img_commu3 === '') {
    formData.append('img_commu3', '');
  } else if (typeof this.commuities_details.img_commu3 === 'string' && !this.commuities_details.img_commu3.includes(environment.endpoint_img)) {
    formData.append('img_commu3', this.commuities_details.img_commu3);
  } else if (this.commuities_details.img_commu3 instanceof File) {
    formData.append('img_commu3', this.commuities_details.img_commu3);
  }
  
    console.log(formData.get('id'));
    console.log(formData.get('community_name_th'));
    console.log(formData.get('community_name_en'));
    console.log(formData.get('description'));
    console.log(formData.get('address'));
    console.log(formData.get('address_moo'));
    console.log(formData.get('street'));
    console.log(formData.get('province'));
    console.log(formData.get('district'));
    console.log(formData.get('sub_district'));
    console.log(formData.get('zip_code'));
    console.log(formData.get('img_commu1'));
    console.log(formData.get('img_commu2'));
    console.log(formData.get('img_commu3'));
  
    let res: any = await this.service.Post('UpdateCommunity', formData, null);
  
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

}
