import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service/service.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-details',
  templateUrl: './admin-details.component.html',
  styleUrls: ['./admin-details.component.css']
})
export class AdminDetailsComponent implements OnInit {

  role: any
  id: any
  selectedFiles: any;
  preview: any

  admin_details: any = {

  }

  location: any = [
    {
      id: 1,
      name_th: 'ห้องแถวสีชมพู'
    },
    {
      id: 2,
      name_th: 'ทาวเฮาท์หลังวัด'
    },
    {
      id: 3,
      name_th: 'ตึกใหญ่หลังตลาด'
    },
  ]


  check_action = 'read'
  action: any = 0

  constructor(private router: Router, private route: ActivatedRoute, private service: ServiceService) {
    this.route.queryParams.subscribe((params: any) => {

      this.id = params?.id
      // console.log(this.id);



    });
  }

  async ngOnInit(): Promise<void> {
    this.role = await this.service.GetRoleUser();
    console.log(this.role, 'BBBBB');

    this.GetDetailsAdmin()
  }

  BackTo() {
    this.router.navigate(['./admin-management']);
  }

  async GetDetailsAdmin() {
    this.id = parseInt(this.id)
    let body = {
      id: this.id
    }
    let res: any = await this.service.Post('GetAdminDetails', body)
    if (res.status_code == 8000) {
      this.admin_details = res.data
      // if (this.admin_details.profile_photo) {
      //   this.admin_details.profile_photo = environment.endpoint_img + this.admin_details.profile_photo
      // }
      this.admin_details.full_profile_photo = environment.endpoint_img + this.admin_details.profile_photo;
    }
    console.log('this.admin_details', this.admin_details);

  }

  EditProfile(action: any) {
    console.log(action);

    if (action == 'edit') {
      this.check_action = 'edit'
      // const locationId = this.TypeUser.find((item: { name_th: any; }) => item.name_th === this.admin_details.location)?.id;

      // // กำหนดค่า location ให้เป็น ID
      // this.admin_details.location = locationId;
    }
    else {
      this.check_action = 'read'
    }

    // console.log('ac =',this.action);

  }

  SelectImage(event: any) {
    this.selectedFiles = event.target.files[0];
    let type = this.selectedFiles.type;
    if (type === 'image/jpg' || type === 'image/jpeg' || type === 'image/png') {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (e: any) => {
        this.preview = e.target.result;
        var base64_data: any = reader.result;
        if (typeof base64_data !== 'string') {
          const uint8Array = new Uint8Array(base64_data);
          const decoder = new TextDecoder();
          base64_data = decoder.decode(uint8Array);
        }
        const parts = base64_data.split(',');
        this.admin_details.profile_photo = {
          id: 0,
          base64: parts[1],
          file_type: this.selectedFiles.type,
          file_size: this.selectedFiles.size,
          file_name: this.selectedFiles.name,
        };
        console.log(this.admin_details, 'ddddd');
      };
    } else return;
  }

  SelectImage2(event: any) {
    this.selectedFiles = event.target.files[0]; // เลือกไฟล์ที่ผู้ใช้เลือก
    let type = this.selectedFiles.type;

    if (type === 'image/jpg' || type === 'image/jpeg' || type === 'image/png') {
      let reader = new FileReader(); // ใช้ FileReader เพื่ออ่านไฟล์
      reader.readAsDataURL(this.selectedFiles); // อ่านไฟล์เป็น Data URL

      reader.onload = (e: any) => {
        this.preview = e.target.result; // ตั้งค่าภาพตัวอย่าง
        this.admin_details.profile_photo = {
          id: 0,
          base64: e.target.result.split(',')[1], // เก็บค่า Base64
          file_type: this.selectedFiles.type,
          file_size: this.selectedFiles.size,
          file_name: this.selectedFiles.name,
        };
        console.log(this.admin_details, 'ddddd'); // แสดงข้อมูลใน console
      };
    } else {
      // แสดงข้อความผิดพลาดถ้าไฟล์ไม่ใช่รูปภาพ
      alert('โปรดเลือกรูปภาพในรูปแบบ JPG, JPEG หรือ PNG');
    }
  }


  async SubmitEdit() {

    // ใช้ชื่อไฟล์หรือพาธจาก admin_details โดยไม่ต้องรวม URL
    let imageUrl = this.admin_details.profile_photo; // ใช้พาธเดิมจาก API

    // สร้าง payload สำหรับการอัปเดต
    const payload = {
      id: this.admin_details.id,
      profile_photo: imageUrl, // ส่งเฉพาะพาธเดิม
      prefix: this.admin_details.prefix,
      first_name: this.admin_details.first_name,
      last_name: this.admin_details.last_name,
      nickname: this.admin_details.nickname,
      email: this.admin_details.email,
      phone_number: this.admin_details.phone_number,
      address: this.admin_details.address,
      address_moo: this.admin_details.address_moo,
      street: this.admin_details.street,
      province: this.admin_details.province,
      district: this.admin_details.district,
      sub_district: this.admin_details.sub_district,
      zip_code: this.admin_details.zip_code,
      identity_card_number: this.admin_details.identity_card_number,
      location: this.admin_details.location,
      role_id: this.admin_details.role_id,
    };



    let res: any = await this.service.Post('UpdateAdmin', payload);
    // console.log('Body',this.admin_details);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">แก้ไขข้อมูลสำเร็จแล้ว</b>`,
        // text: 'แก้ไขข้อมูลสำเร็จแล้ว',
        icon: 'success',
        reverseButtons: true,
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        // cancelButtonText: 'ยกเลิก',
        customClass: {
          // cancelButton: 'alert-btn-cancel',
          confirmButton: 'alert-btn-confirm',
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          window.location.reload()
        }
      });
    }
  }

  async SubmitEdit2() {
    const formData = new FormData();

    // เพิ่มข้อมูลที่คุณต้องการอัปเดต
    formData.append('id', this.admin_details.id.toString());
    // เพิ่มข้อมูลอื่น ๆ ที่เกี่ยวข้อง
    formData.append('prefix', this.admin_details.prefix);
    formData.append('first_name', this.admin_details.first_name);
    formData.append('last_name', this.admin_details.last_name);
    formData.append('nickname', this.admin_details.nickname);
    formData.append('email', this.admin_details.email);
    formData.append('phone_number', this.admin_details.phone_number);
    formData.append('address', this.admin_details.address);
    formData.append('address_moo', this.admin_details.address_moo);
    formData.append('street', this.admin_details.street);
    formData.append('province', this.admin_details.province);
    formData.append('district', this.admin_details.district);
    formData.append('sub_district', this.admin_details.sub_district);
    formData.append('zip_code', this.admin_details.zip_code);
    formData.append('identity_card_number', this.admin_details.identity_card_number);
    formData.append('location', this.admin_details.location);
    formData.append('role_id', this.admin_details.role_id.toString());

    // ตรวจสอบว่ามีการเลือกรูปภาพหรือไม่
    if (this.selectedFiles) {
      formData.append('profile_photo', this.selectedFiles); // ส่งไฟล์ภาพ
    }

    // แสดงข้อมูลใน console เพื่อตรวจสอบว่า FormData ถูกสร้างขึ้นถูกต้อง
    formData.forEach((value, key) => {
      console.log(key + ': ' + value);
    });

    let res: any = await this.service.Post('UpdateAdmin', formData, null);

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
