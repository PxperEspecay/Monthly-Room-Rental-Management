import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service/service.service';
@Component({
  selector: 'app-building-create-building',
  templateUrl: './building-create-building.component.html',
  styleUrls: ['./building-create-building.component.css']
})
export class BuildingCreateBuildingComponent implements OnInit {
  env = environment.endpoint_img;

  selectedFiles1: any;
  preview1: any
  fileInfo1: any
  

  body_CreateNewBuilding : any = {
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



  

  community_id: any

  constructor(private router: Router, private route: ActivatedRoute, private service: ServiceService) {

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.community_id = params['community_id']; // เก็บค่า community_id
    });
  }



  BackTo() {
    this.router.navigate(['./communities-management/building-management'], {
      queryParams: { community_id: this.community_id } // ส่ง queryParams กลับไปด้วย
    });
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


  Del_day_offs: any = [];
  inputs: any = [''];
  async toggleButton(index: number, day_off_id: any) {
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
        this.Del_day_offs.push({
          day_off_id: day_off_id,
        });
        if (this.new_room.length == 1) {
          this.new_room = [
            {
              room_id: null,
              room_number: '',
              floor: '',
            },
          ];
        } else {
          this.new_room.splice(index, 1);
        }
        this.inputs.splice(index, 1);
        this.service.Swal('ทำรายการสำเร็จ', 'success', 'ลบข้อมูลสำเร็จ');
      }
    });
  }

  addNewDayOff() {
    this.new_room.push({
      room_id: null,
      room_number: '',
      floor: '',
    });
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
        this.body_CreateNewBuilding.img_building = file;
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
        (document.getElementById('select-img') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }

  async CreateNewBuilding() {
    const formData = new FormData();
  
    // เช็คว่ามีภาพหรือไม่ แล้วเพิ่มเข้าไปใน formData
    if (this.body_CreateNewBuilding.img_building) {
      formData.append('img_building', this.body_CreateNewBuilding.img_building); // ส่งไฟล์ภาพ
    }
    
    // เพิ่มข้อมูลอื่นๆ ลงใน formData
    formData.append('building_name', this.body_CreateNewBuilding.building_name);
    formData.append('community_id', this.community_id);
    formData.append('floors', this.body_CreateNewBuilding.floors.toString());
  
    // สร้างอาเรย์ของ rooms
    const roomsArray = this.new_room.map((room) => ({
      room_number: room.room_number,
      floor: room.floor,
    }));
  
    // เพิ่ม rooms เป็น JSON string ใน formData
    formData.append('rooms', JSON.stringify(roomsArray));
  
    // แสดงค่าของ FormData ในคอนโซล
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

  
    // เรียก API เพื่อสร้างอาคารใหม่
    let res: any = await this.service.Post('CreateBuilding', formData, null);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">เพิ่มชุมชนสำเร็จแล้ว</b>`,
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
  

 

}
