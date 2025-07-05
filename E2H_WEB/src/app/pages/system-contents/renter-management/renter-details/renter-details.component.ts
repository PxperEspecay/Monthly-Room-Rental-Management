import { Component, Injectable, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/service/service.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MAT_DATE_LOCALE,DateAdapter,MAT_DATE_FORMATS,MatDateFormats } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'LL', // เช่น 1 มกราคม 2568
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

const moment = _moment;

@Injectable()
export class ThaiDateAdapter extends MomentDateAdapter {
  override format(date: _moment.Moment, displayFormat: string): string {
    const locale = this.locale; // ✅ ใช้ property locale แทน getLocale()
    const buddhistYear = date.clone().add(543, 'year');
    return buddhistYear.locale(locale).format(displayFormat);
  }
}

@Component({
  selector: 'app-renter-details',
  templateUrl: './renter-details.component.html',
  styleUrls: ['./renter-details.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
    { provide: DateAdapter, useClass: ThaiDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class RenterDetailsComponent implements OnInit {

  body_user: any = {
    prefix: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    identity_card_number: "",
    username: "",
    password: ""
  }

  id:any = 0
  edit_mode:any = 0

  renter_id : any
  renter_data: any = {}
  fileInfo1 : any
  preview1 : any

  check_action : any = 'read'
  display_start_contract : any
  display_end_contract : any
  display_birth_date : any
  building_list : any = []
  avaliable_room_list : any = []
  location_list : any = []
  admin_data : any = {}

  role_list : any = [
    {
      id : 3,
      role_name : 'ผู้เช่าหลัก'
    },
    {
      id : 4,
      role_name : 'ผู้เช่าร่วม'
    },
  ]

  

  constructor(private service: ServiceService,private router: Router,private route: ActivatedRoute,private adapter: DateAdapter<any>) {
    this.adapter.setLocale('th');
    moment.locale('th');
    
    this.route.queryParams.subscribe((params: any) => {
      this.renter_id = params?.id
    });
  }


  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();
    
    this.GetMasterBuilding()
    this.GetRenterDetails();
  }

  getFileNameFromUrl(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1);
  }

  async GetMasterBuilding(){
    let body = {
      community_id : this.admin_data.location
    }

    let res:any = await this.service.Post('GetMasterBuildings',body);
    if (res.status_code == 8000) {
      this.building_list = res.data
      console.log(this.building_list,'master building');
      
    }
  }

  async GetMasterAvaliableRoom() {
    const body = {
      community_id: this.admin_data.location,
      building_id: this.renter_data.building_id,
      role_id: this.renter_data.role_id
    };
  
    const res: any = await this.service.Post('GetAvailableRooms', body);
  
    if (res.status_code === 8000) {
      this.avaliable_room_list = res.data || [];
  
      const currentRoomId = this.renter_data.room_id;
  
      // ✅ ถ้ามี room_id เดิม และยังไม่อยู่ในรายการห้องว่าง
      const alreadyInList = this.avaliable_room_list.some((room: any) => room.id === currentRoomId);
  
      if (currentRoomId && !alreadyInList) {
        // 🔁 ดึงห้องเดิมจาก API แยก
        const roomRes: any = await this.service.Post('GetRoomById', { id: currentRoomId });
        if (roomRes.status_code === 8000 && roomRes.data) {
          // ✅ เพิ่มห้องเดิมเข้า list ด้านบนสุด
          this.avaliable_room_list.unshift(roomRes.data);
        }
      }
  
      console.log(this.avaliable_room_list, 'master avaliable room');
    }
  }

  async UpdateStatusRoom(){
    let body : any = {
      room_id : this.renter_data.room_id,
      status_room : 'N'
    }
    let res:any = await this.service.Post('UpdateRoomStatus',body);
  }
  

  async GetRenterDetails() {
    const body: any = {
      id: this.renter_id,
    };
  
    try {
      const res: any = await this.service.Post('GetRenterDetails', body);
  
      if (res.status_code === 8000) {
        this.renter_data = res.data;
        await this.GetMasterAvaliableRoom();
  
        // ✅ แปลง file_contract สำหรับแสดงและ mock ข้อมูลไฟล์
        if (this.renter_data.file_contract) {
          const fileName = this.renter_data.file_contract;
          const fullUrl = environment.endpoint_img + fileName;
  
          this.renter_data.file_contract = fullUrl;
  
          this.fileInfo1 = {
            name: this.getFileNameFromUrl(fullUrl),
            size: 1048576, // mock ขนาดไฟล์
            type: 'application/pdf',
            url: fullUrl,
          };
  
          this.preview1 = 'assets/system_icons/icon_pdf.png';
        }
  
       

        if (this.renter_data.img_profile) {
          this.renter_data.img_profile = environment.endpoint_img + this.renter_data.img_profile;
        }
  
        // ✅ แปลง start_contract & end_contract เป็น Date object สำหรับใช้กับ mat-datepicker
        if (this.renter_data.start_contract) {
          this.renter_data.start_contract = new Date(this.renter_data.start_contract);
        }
  
        if (this.renter_data.end_contract) {
          this.renter_data.end_contract = new Date(this.renter_data.end_contract);
        }

        if (this.renter_data.birth_date) {
          this.renter_data.birth_date = new Date(this.renter_data.birth_date);
        }
  
        // ✅ (ถ้าต้องการแสดงวันสัญญาเป็นข้อความไทยแยก) — Optional
        this.display_start_contract = this.formatThaiDate(this.renter_data.start_contract);
        this.display_end_contract = this.formatThaiDate(this.renter_data.end_contract);
        this.display_birth_date = this.formatThaiDate(this.renter_data.birth_date);
  
      }
    } catch (error) {
      console.error('Error fetching renter details:', error);
    }
  }
  

  formatThaiDate(dateString: string) {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  async CreateUser() {
    console.log(this.body_user);
    // return
    let res: any = await this.service.Post('CreateUser', this.body_user)
  }

  EditMode(action: any) {
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

  async EditUser(item:any) {
    console.log('item =',item);
    console.log(this.body_user);
    // return
    let res: any = await this.service.Post('UpdateUser', this.body_user)
  }

  async DeleteUser(item:any){
    this.id = item
    let body:any = {
      "id" : this.id
    }
    console.log('บอดี้ก่อนส่ง',body);
    if (item) {
      Swal.fire({
        customClass: {
          icon: 'swal-send-ic',
          confirmButton: 'btn-swal-red',
          cancelButton: 'btn-swal-white-cancel',
        },
        title: 'Delete User',
        text: 'Do you want to Delete this user?',
        iconHtml:
          "<img src='assets/alert-icons/icon-warning-alert.png'class='swal-icon-size'",
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'No',
        confirmButtonText: 'Yes',
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          
          let res:any = await this.service.Post('DeleteUser', body)

        } else {
          Swal.close();
        }
      });
      }
    console.log(this.id);
    return
  }

  BackTo(){
    this.router.navigate(['./renter-management']);
  }

  showMegaByte(size: number): string {
    return (size / (1024 * 1024)).toFixed(2);
  }

  SelectFileContract(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.renter_data.file_contract = file;
  
      // เก็บข้อมูลไฟล์
      this.fileInfo1 = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: null
      };
  
      // ถ้าเป็น PDF → ใช้ไอคอน
      if (file.type === 'application/pdf') {
        this.preview1 = 'assets/system_icons/icon_pdf.png';
      } else {
        // กรณีที่ไม่ใช่ pdf (ป้องกันกรณีผิดพลาด)
        this.preview1 = null;
      }
    }}

  async DeleteFileContract() {
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
          (document.getElementById('select-FileContract') as HTMLInputElement).value = ''; // Reset the input file
        } else {
          return;
        }
      });
    }

    async EditRenterDetail() {
      const formData = new FormData();
    
      const renter = this.renter_data;
    
      formData.append('renter_id', renter.id.toString());
      formData.append('gender', renter.gender || '');
      formData.append('national_type', renter.national_type || '');
      formData.append('identity_card_number', renter.identity_card_number || '');
      formData.append('passport_number', renter.passport_number || '');
      formData.append('prefix', renter.prefix || '');
      formData.append('first_name', renter.first_name || '');
      formData.append('middle_name', renter.middle_name || '');
      formData.append('last_name', renter.last_name || '');
      formData.append('nick_name', renter.nick_name || '');
      formData.append('birth_date', renter.birth_date || '');
      formData.append('email', renter.email || '');
      formData.append('phone_number', renter.phone_number || '');
      formData.append('address', renter.address || '');
      formData.append('address_moo', renter.address_moo || '');
      formData.append('sub_district', renter.sub_district || '');
      formData.append('district', renter.district || '');
      formData.append('province', renter.province || '');
      formData.append('zip_code', renter.zip_code || '');
    
      formData.append('emergency_prefix', renter.emergency_prefix || '');
      formData.append('emergency_first_name', renter.emergency_first_name || '');
      formData.append('emergency_middle_name', renter.emergency_middle_name || '');
      formData.append('emergency_last_name', renter.emergency_last_name || '');
      formData.append('emergency_relationship', renter.emergency_relationship || '');
      formData.append('emergency_phone_number', renter.emergency_phone_number || '');
    
      formData.append('community_id', renter.community_id?.toString() || '');
      formData.append('building_id', renter.building_id?.toString() || '');
      formData.append('room_id', renter.room_id?.toString() || '');
      formData.append('role_id', renter.role_id?.toString() || '');
    
      formData.append('start_contract', renter.start_contract || '');
      formData.append('end_contract', renter.end_contract || '');
      formData.append('billing_day', renter.billing_day || '');
    
      // ✅ ถ้ามีการอัปโหลดไฟล์สัญญาใหม่
      if (this.renter_data.file_contract instanceof File) {
        formData.append('file_contract', this.renter_data.file_contract);
      }
    
      // 🛠️ log สำหรับตรวจสอบ (ลบได้ตอน production)
      formData.forEach((value, key) => {
        console.log(key + ':', value);
      });
      
      
      // ✅ ส่งไป backend
      let res: any = await this.service.Post('EditDetailRenter', formData, null);
    
      if (res.status_code == 8000) {
        Swal.fire({
          title: `<b style="color:#006666;" class="fs-3">แก้ไขข้อมูลสำเร็จแล้ว</b>`,
          icon: 'success',
          reverseButtons: true,
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'ตกลง',
          customClass: {
            confirmButton: 'alert-btn-confirm',
          },
        }).then(() => {
          window.location.reload();
        });
      }
    }
    

  
  

}
