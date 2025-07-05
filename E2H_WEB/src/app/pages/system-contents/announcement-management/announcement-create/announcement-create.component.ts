import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import moment from 'moment';
import { environment } from 'src/environments/environment';
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
  selector: 'app-announcement-create',
  templateUrl: './announcement-create.component.html',
  styleUrls: ['./announcement-create.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-TH' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class AnnouncementCreateComponent implements OnInit{

  body : any = {
    announcement_type : '',
    banner_announcement : '',
    title_announcement : '',
    body_announcement : '',
    img_announcement : '',
    file_announcement : '',
    admin_id : '',
    community_id : '',
    target_renter_ids : []
  }

  ckecked_all: boolean = false;

  target_type : any = ''
  master_renter_list : any = { }
  building_id : any
  location_list : any = []

  selectedFiles1: any;
  preview1: any
  fileInfo1: any
  selectedFiles_banner: any;
  preview_banner: any
  fileInfo_banner: any
  preview_file : any
  fileInfo_pdf : any

  building_list: any = [
    { 
      id : 0,
      building_name : 'ทั้งหมด'
    },
    { 
      id : 1,
      building_name : 'อาคาร A'
    },
    { 
      id : 2,
      building_name : 'อาคาร B'
    },
    { 
      id : 3,
      building_name : 'อาคาร C'
    },
  ];
  room_list: any = [
    { 
      id : 0,
      room_number : 'ทั้งหมด'
    },
    { 
      id : 1,
      room_number : 'A101'
    },
    { 
      id : 2,
      room_number : 'A102'
    },
    { 
      id : 3,
      room_number : 'A103'
    },
  ];

  community_id:any
  admin_data : any = {}
  constructor(private router: Router, private service: ServiceService){

  }
  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();

    await this.GetMasterRenterList()
    await this.GetMasterLocation()
    await this.GetMasterBuilding()
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

  BackTo(){
    this.router.navigate(['./announcement-management']);
  }

  showMegaByte(size: number): string {
    return (size / (1024 * 1024)).toFixed(2);
  }

  SelectImageAnnouncement(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview1 = reader.result;
        this.body.img_announcement = file;
      };
      reader.readAsDataURL(file);

      // Store file info
      this.fileInfo1 = {
        name: file.name,
        size: file.size
      };
    }
  }
  SelectImageBanner(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview_banner = reader.result;
        this.body.banner_announcement = file;
      };
      reader.readAsDataURL(file);

      // Store file info
      this.fileInfo_banner = {
        name: file.name,
        size: file.size
      };
    }
  }

  UploadFile(event:any){
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.preview_file = 'assets/system_icons/icon_pdf.png';
        this.body.file_announcement = file;
      };
      reader.readAsDataURL(file);

      // Store file info
      this.fileInfo_pdf = {
        name: file.name,
        size: file.size
      };
    }
  }

  async DeleteImageAnnouncement() {
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
  async DeleteImageBanner() {
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
        this.preview_banner = null;
        this.fileInfo_banner = null;
        (document.getElementById('select-img') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }

  async DeleteFileAnnouncement() {
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
        this.preview_file = null;
        this.fileInfo_pdf = null;
        (document.getElementById('select-img') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }

  async SubmitCreateAnnouncement(){
    const formData = new FormData();
  
    formData.append('announcement_type', this.body.announcement_type);
    
    // เช็คว่ามีภาพหรือไม่ แล้วเพิ่มเข้าไปใน formData
    if (this.body.banner_announcement) {
      formData.append('banner_announcement', this.body.banner_announcement); 
    }
  
    formData.append('title_announcement', this.body.title_announcement);
    formData.append('body_announcement', this.body.body_announcement);
  
    if (this.body.img_announcement) {
      formData.append('img_announcement', this.body.img_announcement); 
    }
    if (this.body.file_announcement) {
      formData.append('file_announcement', this.body.file_announcement); 
    }
  
    formData.append('admin_id', this.admin_data.id);
  
    // ถ้าเป็น super admin ให้ใช้ location จาก master location
    if (this.admin_data.role === 'super admin') {
      formData.append('community_id', this.admin_data.location);
    } else {
      // กรณีผู้ใช้งานทั่วไป ให้ใช้ community_id ของ admin
      formData.append('community_id', this.admin_data.location);
    }
  
    // เพิ่ม target_renter_ids เป็น JSON string
    formData.append('target_renter_ids', JSON.stringify(this.body.target_renter_ids));
  
    console.log('announcement_type:', formData.get('announcement_type'));
    console.log('banner_announcement:', formData.get('banner_announcement'));
    console.log('title_announcement:', formData.get('title_announcement'));
    console.log('body_announcement:', formData.get('body_announcement'));
    console.log('img_announcement:', formData.get('img_announcement'));
    console.log('file_announcement:', formData.get('file_announcement'));
    console.log('admin_id:', formData.get('admin_id'));
    console.log('community_id:', formData.get('community_id'));
  
  
    let res:any = await this.service.Post('CreateAnnouncement', formData, null);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">เพิ่มประกาศใหม่สำเร็จแล้ว</b>`,
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
          this.BackTo();
        }
      });
    }
  }

  async SubmitCreateAnnouncementAdmin(){
    const formData = new FormData();

    formData.append('announcement_type', this.body.announcement_type);
    
    // เช็คว่ามีภาพหรือไม่ แล้วเพิ่มเข้าไปใน formData
    if (this.body.banner_announcement) {
      formData.append('banner_announcement', this.body.banner_announcement); 
    }

    formData.append('title_announcement', this.body.title_announcement);
    formData.append('body_announcement', this.body.body_announcement);

    if (this.body.img_announcement) {
      formData.append('img_announcement', this.body.img_announcement); 
    }
    if (this.body.file_announcement) {
      formData.append('file_announcement', this.body.file_announcement); 
    }

    formData.append('admin_id', this.admin_data.id);
    formData.append('community_id', this.admin_data.location);

    // เพิ่ม target_renter_ids เป็น JSON string
    formData.append('target_renter_ids', JSON.stringify(this.body.target_renter_ids));

    console.log('announcement_type:', formData.get('announcement_type'));
    console.log('banner_announcement:', formData.get('banner_announcement'));
    console.log('title_announcement:', formData.get('title_announcement'));
    console.log('body_announcement:', formData.get('body_announcement'));
    console.log('img_announcement:', formData.get('img_announcement'));
    console.log('file_announcement:', formData.get('file_announcement'));
    console.log('admin_id:', formData.get('admin_id'));
    console.log('community_id:', formData.get('community_id'));


    let res:any = await this.service.Post('CreateAnnouncement',formData, null);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">เพิ่มประกาศใหม่สำเร็จแล้ว</b>`,
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
          this.BackTo();
        }
      });
    }
  }

  async GetMasterRenterList() {
    let body = {
      community_id: this.admin_data.location,
      building_id: parseInt(this.building_id)
    };
  
    let res: any = await this.service.Post('GetMasterRenterList', body);
    if (res.status_code == 8000) {
      this.master_renter_list = res.data;
      for (let i = 0; i < this.master_renter_list.length; i++) {
        // เพิ่ม field full_name โดยการรวม first_name และ last_name
        this.master_renter_list[i].full_name = this.master_renter_list[i].first_name + ' ' + this.master_renter_list[i].last_name;
  
        if (this.master_renter_list[i].img_profile) {
          this.master_renter_list[i].img_profile = environment.endpoint_img + this.master_renter_list[i].img_profile;
        }
      }
      console.log(this.master_renter_list, 'renter list');
    }
  }

  

  CheckAllMasterRenter() {
    this.ckecked_all = !this.ckecked_all;
    this.master_renter_list.forEach((item: { checked: boolean; }) => (item.checked = this.ckecked_all));
    this.UpdateListMasterRenter();
  }

  HandleMasterRenter(item: any) {
    item.checked = !item.checked;
    this.ckecked_all = this.master_renter_list.every((item: { checked: any; }) => item.checked);
    this.UpdateListMasterRenter();
  }

  // UpdateListMasterRenter() {
  //   let selected = [];
  //   selected = this.master_renter_list.filter((item: { checked: any; }) => item.checked);
  //   this.body.target_renter_ids = selected;
  //   console.log(this.body.target_renter_ids);
  // }

  UpdateListMasterRenter() {
    // กรองเฉพาะค่า id ของผู้เช่าที่เลือก
    let selected = this.master_renter_list.filter((item: { checked: any; }) => item.checked);
    
    // สร้างอาเรย์ของ id ของผู้เช่าที่เลือก
    this.body.target_renter_ids = selected.map((item: { id: any; }) => item.id);
    
    console.log(this.body.target_renter_ids); // แสดง id ที่เลือก
  }
  


}
