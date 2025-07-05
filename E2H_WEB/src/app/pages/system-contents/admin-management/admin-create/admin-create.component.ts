import { Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceService } from 'src/app/service/service.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-admin-create',
  templateUrl: './admin-create.component.html',
  styleUrls: ['./admin-create.component.css']
})
export class AdminCreateComponent implements OnInit {

  password_check: any = ''
  confirm_password: any = ''

  selectedFiles: any;
  preview: any
  prefix_name: any = [
    {
      id: 1,
      prefix_name_th: 'นาย'
    },
    {
      id: 2,
      prefix_name_th: 'นาง'
    },
    {
      id: 3,
      prefix_name_th: 'นางสาว'
    },
  ];
  role: any = [
    {
      id: 1,
      role_name: 'ผู้ดูแลระบบ'
    },
    {
      id: 2,
      role_name: 'ผู้เช่า'
    },

  ];
  user_code: any = '';
  location_list: any = [];

  data: any = {
    img_profile: {},
    district_id: '',
    province_id: '',
    sub_district_id: '',
    flag_register: '1',
    prefix_name: '',
    first_name: '',
    last_name: '',
    nick_name: '',
    role_id: '',
    flag_active: '',
    email: '',
    password: '',
    affiliation: '',
    identity_number: '',
    employee_id: '',
    position: '',
    address: '',
    province: '',
    district: '',
    zipcode: '',
    sub_istrict: '',
    base64_images: '',
    mobile_number: '',
  };

  body: any = {
    profile_photo: '',
    prefix: '',
    first_name: '',
    last_name: '',
    nickname: '',
    email: '',
    phone_number: '',
    address: '',
    address_moo: '',
    street: '',
    province: '',
    district: '',
    sub_district: '',
    zip_code: '',
    identity_card_number: '',
    location: '',
    username: '',
    password: '',
    role_id: ''
  }


  constructor(private router: Router, private service: ServiceService) {

  }
  ngOnInit(): void {
    this.GetMasterLocation()
  }

  showDetails() {
    // แทนที่จะเรียก ShowAgreementDetails เราจะส่งข้อมูลไปยัง Child Component
  }

  BackTo() {
    this.router.navigate(['./admin-management']);
  }

  async GetMasterLocation(){
    let res: any = await this.service.Get('GetMasterLocation');
    if (res.status_code == 8000) {
      this.location_list = res.data
      
    }
    console.log('Location List', this.location_list);
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
        this.data.img_profile = {
          id: 0,
          base64: parts[1],
          file_type: this.selectedFiles.type,
          file_size: this.selectedFiles.size,
          file_name: this.selectedFiles.name,
        };
        console.log(this.data, 'ddddd');
      };
    } else return;
  }

  CheckPasswords() {
    if (this.password_check === this.confirm_password) {
      return true
    } else {
      return false
    }

  }

  async CreateAdmin() {
    if (this.CheckPasswords()) {
      this.body.password = this.password_check
      console.log('Passwords match, proceed to submit.');
    } else {
      console.log('Passwords do not match.');
    }
    this.body.role_id = 2

    console.log(this.body);
    // return
    let res: any = await this.service.Post('CreateAdmin', this.body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">เพิ่มผู้ดูแลระบบสำเร็จแล้ว</b>`,
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
          this.BackTo()
        } 
      });
    } else {

    }
  }
}
