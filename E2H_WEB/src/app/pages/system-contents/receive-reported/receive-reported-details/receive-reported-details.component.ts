import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/service/service.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-receive-reported-details',
  templateUrl: './receive-reported-details.component.html',
  styleUrls: ['./receive-reported-details.component.css']
})
export class ReceiveReportedDetailsComponent implements OnInit {

  selectedStatus: string | null = null;

  admin_data: any
  issue_id: any
  issue_details: any = {}
  photo_list: any = []
  selectedImage: string | null = null;

  statusOptions = [
    { value: 'pending', label: 'รอดำเนินการ' },
    { value: 'in_progress', label: 'กำลังดำเนินการ' },
    { value: 'completed', label: 'ดำเนินการเสร็จสิ้น' },
    { value: 'rejected', label: 'ปฎิเสธคำร้อง' },
  ];
  statusOptions2 = [
    { value: 'in_progress', label: 'กำลังดำเนินการ' },
    { value: 'completed', label: 'ดำเนินการเสร็จสิ้น' },
    { value: 'rejected', label: 'ปฎิเสธคำร้อง' },
  ];
  statusOptions3 = [
    { value: 'completed', label: 'ดำเนินการเสร็จสิ้น' },
    { value: 'fail', label: 'ไม่สำเร็จ' },
  ];



  constructor(private service: ServiceService, private router: Router, private route: ActivatedRoute,) {
    this.route.queryParams.subscribe((params: any) => {
      this.issue_id = params?.id
      this.GetDetailsIssue()
    });
  }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }


  BackTo() {
    this.router.navigate(['./receive-reported-management']);
  }

  formatThaiDateAndTime(dateString: string) {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const date = new Date(dateString);

    // แปลงวันที่
    const formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;

    // แปลงเวลา (ในรูปแบบ 17.39 น.)
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}.${minutes} น.`;

    return { formattedDate, formattedTime };
  }

  async GetDetailsIssue() {
    let body = {
      id: this.issue_id
    }
    let res: any = await this.service.Post('GetIssueDetails', body);
    if (res.status_code == 8000) {
      this.issue_details = res.data
      this.photo_list = []

      if (this.issue_details.image_1) {
        this.issue_details.image_1 = environment.endpoint_img + this.issue_details.image_1;
      }
      if (this.issue_details.image_2) {
        this.issue_details.image_2 = environment.endpoint_img + this.issue_details.image_2;
      }
      if (this.issue_details.image_3) {
        this.issue_details.image_3 = environment.endpoint_img + this.issue_details.image_3;
      }
      if (this.issue_details.image_4) {
        this.issue_details.image_4 = environment.endpoint_img + this.issue_details.image_4;
      }
      if (this.issue_details.image_5) {
        this.issue_details.image_5 = environment.endpoint_img + this.issue_details.image_5;
      }

      if (this.issue_details.image_1 != null && this.issue_details.image_1 != '') {
        this.photo_list.push(this.issue_details.image_1)
      }
      if (this.issue_details.image_2 != null && this.issue_details.image_2 != '') {
        this.photo_list.push(this.issue_details.image_2)
      }
      if (this.issue_details.image_3 != null && this.issue_details.image_3 != '') {
        this.photo_list.push(this.issue_details.image_3)
      }
      if (this.issue_details.image_4 != null && this.issue_details.image_4 != '') {
        this.photo_list.push(this.issue_details.image_4)
      }
      if (this.issue_details.image_5 != null && this.issue_details.image_5 != '') {
        this.photo_list.push(this.issue_details.image_5)
      }

      if (this.issue_details.createdAt) {
        const { formattedDate, formattedTime } = this.formatThaiDateAndTime(this.issue_details.createdAt);
        this.issue_details.formattedDate = formattedDate;
        this.issue_details.formattedTime = formattedTime;
      }
    }
    console.log(this.issue_details, 'รายละเอียด');

  }



  async AcknowledgeIssue(selectedStatus: string) {
    let body = {
      id: this.issue_id,
      admin_isread: true
    }
    let res: any = await this.service.Post('AcceptIssue', body);
    if (res.status_code === 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">รับเรื่องแล้ว</b>`,
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

  async SubmitStatus() {
    if (this.selectedStatus === 'pending' || this.selectedStatus === 'rejected') {
      // ถ้าเลือก pending หรือ rejected ให้กรอกเหตุผล
      const result = await Swal.fire({
        title: `กรุณากรอกเหตุผลที่${this.selectedStatus === 'pending' ? 'รอดำเนินการ' : 'ปฏิเสธ'}`,
        input: 'text',
        inputPlaceholder: 'พิมพ์เหตุผลที่นี่...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
        inputValidator: (value) => {
          if (!value) return 'กรุณาระบุเหตุผล';
          return null;
        }
      });
  
      if (!result.isConfirmed) return;
  
      // เตรียม body พร้อมเหตุผลตาม status
      const body = {
        issue_id: this.issue_id,
        status: this.selectedStatus,
        admin_id: this.admin_data.location,
        pending_reason_by_admin: this.selectedStatus === 'pending' ? result.value : null,
        reject_reason_by_admin: this.selectedStatus === 'rejected' ? result.value : null,
      };

      console.log(body , 'ก่อนส่ง');
      
      this.submitToApi(body);
    } else {
      // กรณีอื่น ๆ (เช่น in_progress หรือ completed) ใช้ confirm ทั่วไป
      Swal.fire({
        title: `<b style="color:#33d1ff;" class="fs-3">ยืนยันการตรวจสอบข้อมูล</b>`,
        text: 'คุณได้ทำการตรวจสอบข้อมูลรั้งนี้่แล้ว ?',
        icon: 'info',
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
      }).then(async (result) => {
        if (!result.isConfirmed) return;
  
        const body = {
          issue_id: this.issue_id,
          status: this.selectedStatus,
          admin_id: this.admin_data.location,
          pending_reason_by_admin: null,
          reject_reason_by_admin: null
        };
  
        this.submitToApi(body);
      });
    }
  }
  
  // ฟังก์ชันแยกเพื่อยิง API และแสดงผลลัพธ์
  private async submitToApi(body: any) {
    try {
      const res: any = await this.service.Post('UpdateIssueStatus', body);
      if (res.status_code === 8000) {
        await Swal.fire({
          title: `<b style="color:#50c878;" class="fs-3">บันทึกข้อมูลสำเร็จ</b>`,
          text: 'ยืนยันการตรวจสอบข้อมูลแจ้งซ่อมนี้เรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'ยืนยัน',
          customClass: {
            confirmButton: 'alert-btn-confirm',
          }
        });
        window.location.reload();
      } else {
        Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      }
    } catch (error: any) {
      Swal.fire('เกิดข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดบางอย่าง', 'error');
    }
  }

  AcknowledgeIssueWithStatus() {
    if (!this.selectedStatus) return;

    // 👇 ส่งสถานะที่เลือกไปใช้ต่อ
    this.AcknowledgeIssue(this.selectedStatus);
  }

}
