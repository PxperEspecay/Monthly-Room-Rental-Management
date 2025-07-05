import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ServiceService } from 'src/app/service/service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-communities-create',
  templateUrl: './communities-create.component.html',
  styleUrls: ['./communities-create.component.css']
})
export class CommunitiesCreateComponent implements OnInit {

  body_CreateNewCommu: any = {
    "community_name_th": "",
    "community_name_en": "",
    "description": "",
    "img_commu1": "",
    "img_commu2": "",
    "img_commu3": "",
    "address": "",
    "address_moo": "",
    "street": "",
    "province": "",
    "district": "",
    "sub_district": "",
    "zip_code": ""
  }


  env = environment.endpoint_img;


  selectedFiles1: any;
  selectedFiles2: any;
  selectedFiles3: any;
  preview1: any
  fileInfo1: any
  preview2: any
  fileInfo2: any
  preview3: any
  fileInfo3: any


  progress1: any = 0;
  progress2: any = 0;
  progress3: any = 0;
  progressStatus1: any = 'F';
  progressStatus2: any = 'F';
  progressStatus3: any = 'F';
  body: any = {
    name_th: '',
    name_eng: '',
    mon_activation: 0,
    tue_activation: 0,
    wed_activation: 0,
    thu_activation: 0,
    fri_activation: 0,
    sat_activation: 0,
    sun_activation: 0,
    mon_opening_hours: '',
    mon_closing_hours: '',
    tue_opening_hours: '',
    tue_closing_hours: '',
    wed_opening_hours: '',
    wed_closing_hours: '',
    thu_opening_hours: '',
    thu_closing_hours: '',
    fri_opening_hours: '',
    fri_closing_hours: '',
    sat_opening_hours: '',
    sat_closing_hours: '',
    sun_opening_hours: '',
    sun_closing_hours: '',
    th_detail: '',
    eng_detail: '',
    map_url: '',
    activation: 1,
    day_offs: [],
    img_profile: {
      id: 0,
      base64: '',
      file_path: '',
      file_extension: '',
      file_size: '',
      file_name: '',
      preview: '',
    },
    img_upload: [],
    // template_image: null,
    template_image: {
      id: 0,
      base64: '',
      file_path: '',
      file_extension: '',
      file_size: '',
      file_name: '',
      preview: '',
    },
  };

  days = [
    { name: 'จันทร์', check: false, startTime: '', endTime: '' },
    { name: 'อังคาร', check: false, startTime: '', endTime: '' },
    { name: 'พุธ', check: false, startTime: '', endTime: '' },
    { name: 'พฤหัสบดี', check: false, startTime: '', endTime: '' },
    { name: 'ศุกร์', check: false, startTime: '', endTime: '' },
    { name: 'เสาร์', check: false, startTime: '', endTime: '' },
    { name: 'อาทิตย์', check: false, startTime: '', endTime: '' },
  ];

  day_offs = [
    {
      day_off_id: null,
      room_number: '',
      floor: '',
      day_off_type: '',
    },
  ];

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




  constructor(private router: Router, private service: ServiceService) {

  }


  ngOnInit() {

  }

  BackTo() {
    this.router.navigate(['./communities-management']);
  }



  async CreateNewCommu() {

    const formData = new FormData();

    formData.append('community_name_th', this.body_CreateNewCommu.community_name_th);
    formData.append('community_name_en', this.body_CreateNewCommu.community_name_en);
    formData.append('description', this.body_CreateNewCommu.description);
    formData.append('address', this.body_CreateNewCommu.address);
    formData.append('address_moo', this.body_CreateNewCommu.address_moo);
    formData.append('street', this.body_CreateNewCommu.street);
    formData.append('province', this.body_CreateNewCommu.province);
    formData.append('district', this.body_CreateNewCommu.district);
    formData.append('sub_district', this.body_CreateNewCommu.sub_district);
    formData.append('zip_code', this.body_CreateNewCommu.zip_code);
    formData.append('office_phone_number', this.body_CreateNewCommu.office_phone_number);
    // formData.append('img_commu1', this.body_CreateNewCommu.img_commu1);
    // formData.append('img_commu2', this.body_CreateNewCommu.img_commu2);
    // formData.append('img_commu3', this.body_CreateNewCommu.img_commu3);
   

    if (this.body_CreateNewCommu.img_commu1) {
      formData.append('img_commu1', this.body_CreateNewCommu.img_commu1); // ส่งไฟล์ภาพ
    }
    if (this.body_CreateNewCommu.img_commu2) {
      formData.append('img_commu2', this.body_CreateNewCommu.img_commu2); // ส่งไฟล์ภาพ
    }
    if (this.body_CreateNewCommu.img_commu3) {
      formData.append('img_commu3', this.body_CreateNewCommu.img_commu3); // ส่งไฟล์ภาพ
    }


    console.log(this.body_CreateNewCommu, 'bodybody');
    let res: any = await this.service.Post('CreateNewCommunity', formData, null)
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">เพิ่มชุมชนสำเร็จแล้ว</b>`,
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
    }
  }

  uploadCover(files: any) {
    for (var i = 0; i < files.length; i++) {
      // if (files[i].size > 20971520) { //20Mb
      //   this.Service.SwalNoTime(`ภาพ ${files[i].name} <br> มีขนาดเกิน 20 MB`, 'error', "");
      // } else {
      let fileToUpload = files[i];
      let reader = new FileReader();
      reader.readAsDataURL(fileToUpload);
      reader.onload = async (e: any) => {
        let type_file: any;
        switch (fileToUpload.type) {
          case 'image/jpeg':
            type_file = 'jpeg';
            break;
          case 'image/jpg':
            type_file = 'jpg';
            break;
          case 'image/png':
            type_file = 'png';
            break;
          case 'application/pdf':
            type_file = 'pdf';
            break;
        }
        this.body.img_profile = {
          id: 0,
          preview: reader.result,
          base64: e.target.result.split(',')[1],
          file_extension: type_file,
          file_size: fileToUpload.size,
          file_name: fileToUpload.name,
        };
        this.progress1 = setInterval(async () => {
          clearInterval(this.progress1);
          this.progressStatus1 = 'T';
          this.progress1 = 100;
        }, 200);
      };
      // }
    }
  }

  async delFileProfile() {
    // await Swal.fire({
    //   title: `<b style="color:#FC5A5A;" class="fs-3">ยืนยันการลบข้อมูล</b>`,
    //   text: 'ยืนยันการลบข้อมูล',
    //   icon: 'warning',
    //   reverseButtons: true,
    //   showCancelButton: true,
    //   confirmButtonColor: '#3085d6',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'ยืนยัน',
    //   cancelButtonText: 'ยกเลิก',
    //   customClass: {
    //     // actions: 'my-actions',
    //     cancelButton: 'alert-btn-cancel',
    //     confirmButton: 'alert-btn-confirm',
    //   },
    // }).then(async (result) => {
    //   if (result.isConfirmed) {
    //     this.body.img_profile = {
    //       id: 0,
    //       base64: '',
    //       file_path: '',
    //       file_extension: '',
    //       file_size: '',
    //       file_name: '',
    //     };
    //   } else {
    //     return;
    //   }
    // });
  }

  uploadImages(files: any) {
    // this.base64 = [];
    for (var i = 0; i < files.length; i++) {
      // if (files[i].size > 20971520) { //20Mb
      //   this.Service.SwalNoTime(`ภาพ ${files[i].name} <br> มีขนาดเกิน 20 MB`, 'error', "");
      // } else {
      let fileToUpload = files[i];
      let reader = new FileReader();
      reader.readAsDataURL(fileToUpload);
      reader.onload = async (e: any) => {
        let type_file: any;
        switch (fileToUpload.type) {
          case 'image/jpeg':
            type_file = 'jpeg';
            break;
          case 'image/jpg':
            type_file = 'jpg';
            break;
          case 'image/png':
            type_file = 'png';
            break;
          case 'application/pdf':
            type_file = 'pdf';
            break;
        }
        this.body.img_upload.push({
          preview: reader.result,
          id: 0,
          base64: e.target.result.split(',')[1],
          file_extension: type_file,
          file_size: fileToUpload.size,
          file_name: fileToUpload.name,
          file_path: '',
        });
        this.progress2 = setInterval(async () => {
          clearInterval(this.progress2);
          this.progressStatus2 = 'T';
          this.progress2 = 100;
        }, 200);
      };
      // }
    }
  }

  async colseIndex(
    index: any,
    id: any,
    file_name: any,
    file_extension: any,
    file_path: any
  ) {
    // await Swal.fire({
    //   title: `<b style="color:#FC5A5A;" class="fs-3">ยืนยันการลบข้อมูล</b>`,
    //   text: 'ยืนยันการลบข้อมูล',
    //   icon: 'warning',
    //   reverseButtons: true,
    //   showCancelButton: true,
    //   confirmButtonColor: '#3085d6',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'ยืนยัน',
    //   cancelButtonText: 'ยกเลิก',
    //   customClass: {
    //     // actions: 'my-actions',
    //     cancelButton: 'alert-btn-cancel',
    //     confirmButton: 'alert-btn-confirm',
    //   },
    // }).then(async (result) => {
    //   if (result.isConfirmed) {
    //     this.body.img_upload.splice(index, 1);
    //     this.Del_img_upload.push({
    //       id: id,
    //       file_name: file_name,
    //       file_extension: file_extension,
    //       file_path: file_path,
    //       base64: '',
    //     });
    //   } else {
    //     return;
    //   }
    // });
    // console.log(this.Del_img_upload, 'delll');
  }

  uploadTemplateImage(files: any) {
    for (var i = 0; i < files.length; i++) {
      let fileToUpload = files[i];
      let reader = new FileReader();
      reader.readAsDataURL(fileToUpload);
      reader.onload = async (e: any) => {
        let type_file: any;
        switch (fileToUpload.type) {
          case 'image/jpeg':
            type_file = 'jpeg';
            break;
          case 'image/jpg':
            type_file = 'jpg';
            break;
          case 'image/png':
            type_file = 'png';
            break;
          case 'application/pdf':
            type_file = 'pdf';
            break;
        }
        this.body.template_image = {
          id: 0,
          preview: reader.result,
          base64: e.target.result.split(',')[1],
          file_extension: type_file,
          file_size: fileToUpload.size,
          file_name: fileToUpload.name,
        };
        this.progress3 = setInterval(async () => {
          clearInterval(this.progress3);
          this.progressStatus3 = 'T';
          this.progress3 = 100;
        }, 200);
      };
      // }
    }
  }

  async delFileTemplate() {
    // await Swal.fire({
    //   title: `<b style="color:#FC5A5A;" class="fs-3">ยืนยันการลบข้อมูล</b>`,
    //   text: 'ยืนยันการลบข้อมูล',
    //   icon: 'warning',
    //   reverseButtons: true,
    //   showCancelButton: true,
    //   confirmButtonColor: '#3085d6',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'ยืนยัน',
    //   cancelButtonText: 'ยกเลิก',
    //   customClass: {
    //     cancelButton: 'alert-btn-cancel',
    //     confirmButton: 'alert-btn-confirm',
    //   },
    // }).then(async (result) => {
    //   if (result.isConfirmed) {
    //     // this.body.template_image = null;
    //     this.body.template_image = {
    //       id: 0,
    //       base64: '',
    //       file_path: '',
    //       file_extension: '',
    //       file_size: '',
    //       file_name: '',
    //     };
    //   } else {
    //     return;
    //   }
    // });
  }

  async toggleButton(index: number, day_off_id: any) {
    // await Swal.fire({
    //   title: `<b style="color:#FC5A5A;" class="fs-3">ยืนยันการลบข้อมูล</b>`,
    //   text: 'ยืนยันการลบข้อมูล',
    //   icon: 'warning',
    //   reverseButtons: true,
    //   showCancelButton: true,
    //   confirmButtonColor: '#3085d6',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'ยืนยัน',
    //   cancelButtonText: 'ยกเลิก',
    //   customClass: {
    //     // actions: 'my-actions',
    //     cancelButton: 'alert-btn-cancel',
    //     confirmButton: 'alert-btn-confirm',
    //   },
    // }).then(async (result) => {
    //   if (result.isConfirmed) {
    //     this.Del_day_offs.push({
    //       day_off_id: day_off_id,
    //     });
    //     if (this.day_offs.length == 1) {
    //       this.day_offs = [
    //         {
    //           day_off_id: null,
    //           day_off_name: '',
    //           day_off_date: '',
    //           day_off_type: '',
    //         },
    //       ];
    //     } else {
    //       this.day_offs.splice(index, 1);
    //     }
    //     this.inputs.splice(index, 1);
    //     this.service.Swal('ทำรายการสำเร็จ', 'success', 'ลบข้อมูลสำเร็จ');
    //   }
    // });
  }

  addNewDayOff() {
    this.day_offs.push({
      day_off_id: null,
      room_number: '',
      floor: '',
      day_off_type: '',
    });
  }

  async CreateUser() {
    console.log(this.day_offs);
    // return
    let res: any = await this.service.Post('CreateUser', this.day_offs)
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
        this.body_CreateNewCommu.img_commu1 = file;
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
        this.body_CreateNewCommu.img_commu2 = file;
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
        this.body_CreateNewCommu.img_commu3 = file;
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
        (document.getElementById('select-img3') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }









  




}
