import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/service/service.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcement-details.component.html',
  styleUrls: ['./announcement-details.component.css']
})
export class AnnouncementDetailsComponent implements OnInit {

  id: any
  selectedFiles1: any;
  preview1: any
  fileInfo1: any
  selectedFiles_banner: any;
  preview_banner: any
  fileInfo_banner: any
  preview_file: any
  fileInfo_pdf: any

  body: any = {
    id: '',
    announcement_type: '',
    banner_announcement: '',
    title_announcement: '',
    body_announcement: '',
    img_announcement: '',
    file_announcement: '',
    admin_id: '',
    community_id: '',
  }
  admin_data: any = {}

  constructor(private router: Router, private route: ActivatedRoute, private service: ServiceService, public dialogRef: MatDialogRef<AnnouncementDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();
    this.GetAnnouncementDetails()
  }

  async GetAnnouncementDetails() {
    let body = {
      id: this.id
    }
    let res: any = await this.service.Post('GetAnnouncementDetails', body);
    if (res.status_code == 8000) {
      this.body = res.data
      if (this.body.banner_announcement && !this.body.banner_announcement.startsWith(environment.endpoint_img)) {
        this.body.banner_announcement = environment.endpoint_img + this.body.banner_announcement
      }
      if (this.body.img_announcement && !this.body.img_announcement.startsWith(environment.endpoint_img)) {
        this.body.img_announcement = environment.endpoint_img + this.body.img_announcement
      }
      if (this.body.file_announcement && !this.body.file_announcement.startsWith(environment.endpoint_img)) {
        this.body.file_announcement = environment.endpoint_img + this.body.file_announcement
      }
    }
    // console.log(this.body,'details announce');

  }

  async SubmitUpdateAnnouncementDetails() {
    const formData = new FormData();

    formData.append('id', this.body.id);
    formData.append('announcement_type', this.body.announcement_type);
    formData.append('title_announcement', this.body.title_announcement);
    formData.append('body_announcement', this.body.body_announcement);
    formData.append('admin_id', this.admin_data.id);
    formData.append('community_id', this.admin_data.location);

    // ตรวจสอบสถานะรูปภาพแต่ละรูป
    if (this.body.banner_announcement === null || this.body.banner_announcement === '') {
      formData.append('banner_announcement', ''); // ส่งค่าว่างในกรณีที่ลบรูปออก
    } else if (typeof this.body.banner_announcement === 'string' && !this.body.banner_announcement.includes(environment.endpoint_img)) {
      formData.append('banner_announcement', this.body.banner_announcement); // ส่ง path เดิมถ้าไม่มีการเปลี่ยนแปลง
    } else if (this.body.banner_announcement instanceof File) {
      formData.append('banner_announcement', this.body.banner_announcement); // ส่งไฟล์ใหม่ถ้ามีการอัปโหลด
    }

    if (this.body.img_announcement === null || this.body.img_announcement === '') {
      formData.append('img_announcement', '');
    } else if (typeof this.body.img_announcement === 'string' && !this.body.img_announcement.includes(environment.endpoint_img)) {
      formData.append('img_announcement', this.body.img_announcement);
    } else if (this.body.img_announcement instanceof File) {
      formData.append('img_announcement', this.body.img_announcement);
    }

    if (this.body.file_announcement === null || this.body.file_announcement === '') {
      formData.append('file_announcement', '');
    } else if (typeof this.body.file_announcement === 'string' && !this.body.file_announcement.includes(environment.endpoint_img)) {
      formData.append('file_announcement', this.body.file_announcement);
    } else if (this.body.file_announcement instanceof File) {
      formData.append('file_announcement', this.body.file_announcement);
    }

    console.log(formData.get('id'));
    console.log(formData.get('announcement_type'));
    console.log(formData.get('title_announcement'));
    console.log(formData.get('body_announcement'));
    console.log(formData.get('admin_id'));
    console.log(formData.get('community_id'));
    console.log(formData.get('banner_announcement'));
    console.log(formData.get('img_announcement'));
    console.log(formData.get('file_announcement'));


    let res: any = await this.service.Post('UpdateAnnouncement', formData, null);

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

  closeDialog() {
    this.dialogRef.close({

    });
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

  UploadFile(event: any) {
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
        this.body.img_announcement = null;
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
        this.body.banner_announcement = null;
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
        cancelButton: 'alert-btn-cancel',
        confirmButton: 'alert-btn-confirm',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // ลบไฟล์จาก API หรือไฟล์ที่เลือก
        this.preview_file = null;
        this.fileInfo_pdf = null;
        this.body.file_announcement = null; // รีเซ็ตไฟล์จาก API
        (document.getElementById('select-documents') as HTMLInputElement).value = ''; // Reset the input file
      } else {
        return;
      }
    });
  }

  extractFileName(url: string): string {
    return url.split('/').pop() || 'Unknown File';
  }

}
