import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ServiceService } from 'src/app/service/service.service';
import moment from 'moment';
// import { DatePipe } from '@angular/common';
import { MAT_DATE_LOCALE,DateAdapter,MAT_DATE_FORMATS,MatDateFormats } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-renter-create',
  templateUrl: './renter-create.component.html',
  styleUrls: ['./renter-create.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-TH' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class RenterCreateComponent implements OnInit{

  page : any = 1
  item : any

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
  prefix_name_en: any = [
    { 
      id : 1,
      prefix_name_en : 'Mr.'
    },
    { 
      id : 2,
      prefix_name_en : 'Mrs.'
    },
    { 
      id : 3,
      prefix_name_en : 'Miss'
    },
  ];
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

  body :any = {
    national_type: 'T',
    identity_card_number: '',
    passport_number: '',
    gender: '',
    prefix: 0,
    first_name: '',
    middle_name: '',
    last_name: '',
    nick_name: '',
    birth_date: '',
    email: '',
    phone_number:'',
    address: '',
    address_moo: '',
    sub_district: '',
    district: '',
    province: '',
    zip_code: '',
    emergency_prefix: '',
    emergency_first_name: '',
    emergency_middle_name: '',
    emergency_last_name: '',
    emergency_relationship: '',
    emergency_phone_number: '',
    file_contract : '',
    community_id: 0,
    building_id: '',
    room_id: '',
    role_id: 0,
    start_contract: '',
    end_contract: '',
    billing_day : ''
  }

  building_list : any = []
  avaliable_room_list : any = []
  location_list : any = []
  admin_data : any = {}

  upload_filesList = [];
  base64: any = [];
  env = environment.endpoint_img;
  file_type : any
  fileInfo1:any
  preview1:any
  
  constructor(private router: Router,private service: ServiceService,){

  }
  
  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();
    
    this.GetMasterLocation()
    this.GetMasterBuilding()
    // this.GetMasterAvaliableRoom()
  }

  

  onDateChange(event: any) {
    if (event) {
      // ถ้าค่า event เปลี่ยนแปลง ต้องแปลงวันที่ให้เป็น Date object
      const formattedDate = new Date(event);
      this.body.birth_date = formattedDate;
    }
  }

  async GetMasterLocation(){
    let res:any = await this.service.Get('GetMasterLocation');
    if (res.status_code == 8000) {
      this.location_list = res.data
    }
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

  async GetMasterAvaliableRoom(){
    let body = {
      community_id : this.admin_data.location,
      building_id : this.body.building_id,
      role_id : this.body.role_id
    }

    let res:any = await this.service.Post('GetAvailableRooms',body);
    if (res.status_code == 8000) {
      this.avaliable_room_list = res.data
      console.log(this.avaliable_room_list,'master avaliable room');
      
    }
  }

  

  BackTo(){
    this.router.navigate(['./renter-management']);
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    let month: string | number = today.getMonth() + 1;
    let day: string | number = today.getDate();

    if (month < 10) {
      month = '0' + month;
    }

    if (day < 10) {
      day = '0' + day;
    }

    return `${year}-${month}-${day}`;
  }

  check(){
    console.log(this.body);
    
  }

  NextPage(item:any){
    this.page = item
    console.log(this.page,'page');
    
  }

  async CreateRenter(){
    const formData = new FormData();

    // this.body.birth_date = this.datePipe.transform(this.body.birth_date, 'dd-mm-yyyy');
    // this.body.end_date = moment(this.body.end_date).format('YYYY-MM-DD');

    formData.append('national_type', this.body.national_type);
    formData.append('identity_card_number', this.body.identity_card_number);
    formData.append('passport_number', this.body.passport_number);
    formData.append('gender', this.body.gender);
    formData.append('prefix', this.body.prefix);
    formData.append('first_name', this.body.first_name);
    formData.append('middle_name', this.body.middle_name);
    formData.append('last_name', this.body.last_name);
    formData.append('nick_name', this.body.nick_name);
    formData.append('birth_date', this.body.birth_date);
    formData.append('email', this.body.email);
    formData.append('phone_number', this.body.phone_number);
    formData.append('address', this.body.address);
    formData.append('address_moo', this.body.address_moo);
    formData.append('sub_district', this.body.sub_district);
    formData.append('district', this.body.district);
    formData.append('province', this.body.province);
    formData.append('zip_code', this.body.zip_code);
    formData.append('emergency_prefix', this.body.emergency_prefix);
    formData.append('emergency_first_name', this.body.emergency_first_name);
    formData.append('emergency_middle_name', this.body.emergency_middle_name);
    formData.append('emergency_last_name', this.body.emergency_last_name);
    formData.append('emergency_relationship', this.body.emergency_relationship);
    formData.append('emergency_phone_number', this.body.emergency_phone_number);
    formData.append('file_contract', this.body.file_contract);
    formData.append('community_id', this.admin_data.location);
    formData.append('building_id', this.body.building_id);
    formData.append('room_id', this.body.room_id);
    formData.append('role_id', this.body.role_id);
    formData.append('start_contract', this.body.start_contract);
    formData.append('end_contract', this.body.end_contract);
    formData.append('billing_day', this.body.billing_day);

    // console.log(formData.append('birth_date', this.body.birth_date),'dddddd');
    console.log('birth_date:', formData.get('birth_date'));
    
    let res:any = await this.service.Post('CreateRenter',formData, null)
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">เพิ่มผู้เช่าใหม่สำเร็จ</b>`,
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
          await this.UpdateStatusRoom()
          this.BackTo()
        }
      });
    }
  }

  async UpdateStatusRoom(){
    let body : any = {
      room_id : this.body.room_id,
      status_room : 'N'
    }
    let res:any = await this.service.Post('UpdateRoomStatus',body);
  }

  

  UploadFile(event:any){
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview1 = 'assets/system_icons/icon_pdf.png';
        this.body.file_contract = file;
      };
      reader.readAsDataURL(file);

      // Store file info
      this.fileInfo1 = {
        name: file.name,
        size: file.size
      };
    }
  }

  showMegaByte(size: number): string {
    return (size / (1024 * 1024)).toFixed(2);
  }

  async DeleteContractFile() {
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
        (document.getElementById('select-img') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }

}
