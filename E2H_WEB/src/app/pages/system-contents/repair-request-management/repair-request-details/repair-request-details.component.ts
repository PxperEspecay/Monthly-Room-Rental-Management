import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-repair-request-details',
  templateUrl: './repair-request-details.component.html',
  styleUrls: ['./repair-request-details.component.css']
})
export class RepairRequestDetailsComponent implements OnInit {

  repair_req_id: any
  status: any
  selectedStatus: string | null = null;

  id: any
  status_id: any
  hotel_bid_id: any
  photo_list: any = []
  selectedImage: string | null = null;

  admin_data: any = {}
  body: any = {
    id: 0,
    hotel_bid_id: 0
  }
  data_RepairRequestDetails: any = {}
  meals_req: any = []

  statusOptions = [
    { value: 'in_progress', label: 'กำลังดำเนินการ' },
    { value: 'cancel', label: 'ยกเลิก' }
  ];
  statusOptions2 = [
    { value: 'completed', label: 'ดำเนินการเสร็จสิ้น' },
    { value: 'cancel', label: 'ยกเลิก' }
  ];

  constructor(private router: Router, private service: ServiceService, private route: ActivatedRoute,) {
    this.route.queryParams.subscribe((params: any) => {
      this.repair_req_id = params?.id
      this.status = params?.status
      this.GetRepairRequestDetails();
    });
    console.log(this.repair_req_id);
    console.log(this.status);

  }

  async ngOnInit(): Promise<void> {

    this.admin_data = await this.service.GetUser();
    // this.GetRepairRequestDetails()
  }

  BackTo() {
    this.router.navigate(['./repair-request-management']);
  }

  openImage(photo_url: string) {
    this.selectedImage = photo_url;
  }

  closeImage() {
    this.selectedImage = null;
  }

  async GetRepairRequestDetails() {
    let body = {
      repair_request_id: this.repair_req_id
    }
    let res: any = await this.service.Post('GetRepairRequestsDetails', body);
    // console.log(res);

    if (res.status_code == 8000) {
      this.data_RepairRequestDetails = res.data
      this.status = this.data_RepairRequestDetails.status;
      this.photo_list = [];

      if (this.data_RepairRequestDetails.photo_url) {
        this.data_RepairRequestDetails.photo_url = environment.endpoint_img + this.data_RepairRequestDetails.photo_url;
      }
      if (this.data_RepairRequestDetails.photo_url2) {
        this.data_RepairRequestDetails.photo_url2 = environment.endpoint_img + this.data_RepairRequestDetails.photo_url2;
      }
      if (this.data_RepairRequestDetails.photo_url3) {
        this.data_RepairRequestDetails.photo_url3 = environment.endpoint_img + this.data_RepairRequestDetails.photo_url3;
      }
      if (this.data_RepairRequestDetails.photo_url4) {
        this.data_RepairRequestDetails.photo_url4 = environment.endpoint_img + this.data_RepairRequestDetails.photo_url4;
      }
      if (this.data_RepairRequestDetails.photo_url5) {
        this.data_RepairRequestDetails.photo_url5 = environment.endpoint_img + this.data_RepairRequestDetails.photo_url5;
      }

      if (this.data_RepairRequestDetails.photo_url != null && this.data_RepairRequestDetails.photo_url != '') {
        this.photo_list.push(this.data_RepairRequestDetails.photo_url)
      }
      if (this.data_RepairRequestDetails.photo_url2 != null && this.data_RepairRequestDetails.photo_url2 != '') {
        this.photo_list.push(this.data_RepairRequestDetails.photo_url2)
      }
      if (this.data_RepairRequestDetails.photo_url3 != null && this.data_RepairRequestDetails.photo_url3 != '') {
        this.photo_list.push(this.data_RepairRequestDetails.photo_url3)
      }
      if (this.data_RepairRequestDetails.photo_url4 != null && this.data_RepairRequestDetails.photo_url4 != '') {
        this.photo_list.push(this.data_RepairRequestDetails.photo_url4)
      }
      if (this.data_RepairRequestDetails.photo_url5 != null && this.data_RepairRequestDetails.photo_url5 != '') {
        this.photo_list.push(this.data_RepairRequestDetails.photo_url5)
      }

      if (this.data_RepairRequestDetails.created_at) {
        const { formattedDate, formattedTime } = this.formatThaiDateAndTime(this.data_RepairRequestDetails.created_at);
        this.data_RepairRequestDetails.formattedDate = formattedDate;
        this.data_RepairRequestDetails.formattedTime = formattedTime;
      }

      if (this.data_RepairRequestDetails?.RepairSchedule?.selected_date) {
        const { formattedDate } = this.formatThaiDateAndTime(this.data_RepairRequestDetails.RepairSchedule.selected_date);
        this.data_RepairRequestDetails.RepairSchedule.selected_date = formattedDate;
        console.log(this.data_RepairRequestDetails.RepairSchedule.selected_date, '45454545');

      }
      if (this.data_RepairRequestDetails?.RepairSchedule?.requested_new_date) {
        const { formattedDate } = this.formatThaiDateAndTime(this.data_RepairRequestDetails.RepairSchedule.requested_new_date);
        this.data_RepairRequestDetails.RepairSchedule.requested_new_date = formattedDate;
        console.log(this.data_RepairRequestDetails.RepairSchedule.requested_new_date, '45454545');

      }



      //     if (this.data_RepairRequestDetails['eta'] != null) {
      //       this.data_RepairRequestDetails['date_eta'] = this.data_RepairRequestDetails['eta'].split("T")[0];
      //       this.data_RepairRequestDetails['time_eta'] = this.data_RepairRequestDetails['eta'].split("T")[1].substring(0,5);
      //     }
      //     if (this.data_RepairRequestDetails['etd'] != null) {
      //       this.data_RepairRequestDetails['date_etd'] = this.data_RepairRequestDetails['etd'].split("T")[0];
      //       this.data_RepairRequestDetails['time_etd'] = this.data_RepairRequestDetails['etd'].split("T")[1].substring(0,5);
      //     }
      //     if (this.data_RepairRequestDetails['ecit'] != null) {
      //       this.data_RepairRequestDetails['date_ecit'] = this.data_RepairRequestDetails['ecit'].split("T")[0];
      //       this.data_RepairRequestDetails['time_ecit'] = this.data_RepairRequestDetails['ecit'].split("T")[1].substring(0,5);
      //     }
      //     if (this.data_RepairRequestDetails['ecot'] != null) {
      //       this.data_RepairRequestDetails['date_ecot'] = this.data_RepairRequestDetails['ecot'].split("T")[0];
      //       this.data_RepairRequestDetails['time_ecot'] = this.data_RepairRequestDetails['ecot'].split("T")[1].substring(0,5);
      //     }
      //     this.data_RepairRequestDetails.room_rate_tonight = Number(this.data_RepairRequestDetails.room_rate_tonight ?? 0).toLocaleString('en-GB',{minimumFractionDigits: 2})
      //     this.data_RepairRequestDetails.total_rate_hotel = Number(this.data_RepairRequestDetails.total_rate_hotel ?? 0).toLocaleString('en-GB',{minimumFractionDigits: 2})
      //     this.data_RepairRequestDetails.reatemeal_breakfast = Number(this.data_RepairRequestDetails.reatemeal_breakfast ?? 0).toLocaleString('en-GB',{minimumFractionDigits: 2})
      //     this.data_RepairRequestDetails.reatemeal_lunch = Number(this.data_RepairRequestDetails.reatemeal_lunch ?? 0).toLocaleString('en-GB',{minimumFractionDigits: 2})
      //     this.data_RepairRequestDetails.ratemeal_dinner = Number(this.data_RepairRequestDetails.ratemeal_dinner ?? 0).toLocaleString('en-GB',{minimumFractionDigits: 2})
      //     this.data_RepairRequestDetails.ratemeal_snack = Number(this.data_RepairRequestDetails.ratemeal_snack ?? 0).toLocaleString('en-GB',{minimumFractionDigits: 2})
      //     this.data_RepairRequestDetails.pricetransport = Number(this.data_RepairRequestDetails.pricetransport ?? 0).toLocaleString('en-GB',{minimumFractionDigits: 2})
      // }
      // console.log('data_RepairRequestDetails =',this.data_RepairRequestDetails);

    }
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

  async AcknowledgedRequest() {
    let body = {
      id: this.repair_req_id,
      status: "acknowledged",
      admin_id: this.admin_data.id
    }
    console.log(body);
    {
      Swal.fire({
        title: `<b style="color:#33d1ff;" class="fs-3">ยืนยันการตรวจสอบข้อมูล</b>`,
        text: 'คุณได้ทำการตรวจสอบข้อมูลการแจ้งซ่อมครั้งนี้่แล้ว ?',
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
        if (result.isConfirmed) {
          let res: any = await this.service.Post('UpdateRepairRequestStatus', body);
          if (res.status_code == 8000) {
            Swal.fire({
              title: `<b style="color:#50c878;" class="fs-3">บันทึกข้อมูลสำเร็จ</b>`,
              text: 'ยืนยันการตรวจสอบข้อมูลแจ้งซ่อมนี้เรียบร้อยแล้ว',
              icon: 'success',
              reverseButtons: true,
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'ยืนยัน',
              customClass: {
                confirmButton: 'alert-btn-confirm',
              }
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload()
              }
            })
          }
        } else {
          return;
        }
      });
    }
  }

  async ApprovedScheduledRequest() {
    let body = {
      id: this.repair_req_id,
      status: "approved",
      admin_id: this.admin_data.id
    }
    console.log(body);
    {
      Swal.fire({
        title: `<b style="color:#33d1ff;" class="fs-3">ยืนยันการตรวจสอบข้อมูล</b>`,
        text: 'คุณได้ทำการตรวจสอบข้อมูลการนัดหมายครั้งนี้่แล้ว ?',
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
        if (result.isConfirmed) {
          let res: any = await this.service.Post('UpdateRepairRequestStatus', body);
          if (res.status_code == 8000) {
            Swal.fire({
              title: `<b style="color:#50c878;" class="fs-3">บันทึกข้อมูลสำเร็จ</b>`,
              text: 'ยืนยันการตรวจสอบข้อมูลการนัดหมายนี้เรียบร้อยแล้ว',
              icon: 'success',
              reverseButtons: true,
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'ยืนยัน',
              customClass: {
                confirmButton: 'alert-btn-confirm',
              }
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload()
              }
            })
          }
        } else {
          return;
        }
      });
    }
  }

  RejectedScheduled() {
    Swal.fire({
      title: "กรุณากรอกเหตุผลที่ปฏิเสธการนัดหมาย",
      input: "text",
      inputPlaceholder: "พิมพ์เหตุผลที่นี่...",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) {
          return "กรุณาระบุเหตุผล";
        }
        return null;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const reason = result.value;

        try {
          // 🔥 ยิง API ส่งเหตุผล
          const body = {
            id: this.repair_req_id,
            rescheduled_reason_by_admin: reason,
            status: "rejected",
            admin_id: this.admin_data.id
            // เพิ่ม field อื่นถ้าต้องการ เช่น repair_request_id, admin_id, etc.
          };

          const response: any = await this.service.Post('UpdateRepairRequestStatus', body);

          if (response.status_code === 8000) {
            Swal.fire({
              title: "สำเร็จ",
              text: "ปฏิเสธการนัดหมายเรียบร้อยแล้ว",
              icon: "success",
              confirmButtonText: "ตกลง"
            }).then(() => {
              window.location.reload(); // 🔄 รีโหลดหน้าเมื่อผู้ใช้กดตกลง
            });
          } else {
            Swal.fire({
              title: "ผิดพลาด",
              text: "ไม่สามารถปฏิเสธการนัดหมายได้",
              icon: "error",
              confirmButtonText: "ตกลง"
            });
          }

        } catch (error: any) {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: error.message,
            icon: "error",
            confirmButtonText: "ตกลง"
          });
        }
      }
    });
  }

  

  async UpdateStatusRequestInProgress() {
    let body = {
      id: this.repair_req_id,
      status: this.selectedStatus,
      admin_id: this.admin_data.id
    }
    console.log(body);
    
    {
      Swal.fire({
        title: `<b style="color:#33d1ff;" class="fs-3">ยืนยันการเริ่มดำเนินงาน</b>`,
        text: 'คุณได้ทำการตรวจสอบข้อมูลครบถ้วนแล้ว ?',
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
        if (result.isConfirmed) {
          let res: any = await this.service.Post('UpdateRepairRequestStatus', body);
          if (res.status_code == 8000) {
            Swal.fire({
              title: `<b style="color:#50c878;" class="fs-3">บันทึกข้อมูลสำเร็จ</b>`,
              text: 'ยืนยันการเริ่มดำเนินงานเรียบร้อยแล้ว',
              icon: 'success',
              reverseButtons: true,
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'ยืนยัน',
              customClass: {
                confirmButton: 'alert-btn-confirm',
              }
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload()
              }
            })
          }
        } else {
          return;
        }
      });
    }
  }

  async UpdateStatusRequestCompleted() {
    let body = {
      id: this.repair_req_id,
      status: this.selectedStatus,
      admin_id: this.admin_data.id
    }
    console.log(body);
    {
      Swal.fire({
        title: `<b style="color:#33d1ff;" class="fs-3">ดำเนินการเสร็จสิ้น</b>`,
        text: 'ยืนยันการดำเนินการเสร็จสิ้น ?',
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
        if (result.isConfirmed) {
          let res: any = await this.service.Post('UpdateRepairRequestStatus', body);
          if (res.status_code == 8000) {
            Swal.fire({
              title: `<b style="color:#50c878;" class="fs-3">บันทึกข้อมูลสำเร็จ</b>`,
              text: 'ยืนยันการดำเนินการเสร็จสิ้นแล้ว',
              icon: 'success',
              reverseButtons: true,
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'ยืนยัน',
              customClass: {
                confirmButton: 'alert-btn-confirm',
              }
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload()
              }
            })
          }
        } else {
          return;
        }
      });
    }
  }
}
