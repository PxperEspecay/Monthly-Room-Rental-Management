import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';

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
  selector: 'app-bills-create',
  templateUrl: './bills-create.component.html',
  styleUrls: ['./bills-create.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-TH' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class BillsCreateComponent implements OnInit {

  fines: any[] = [{ description: '', amount: null }]; // เริ่มต้น 1 ช่อง

  id: any;
  mode: any;

  master_bill_type: any = []

  body_bill_type: any = {
    renter_id: '',
    month: '',
    year: '',
    bill_type_id: '',
    monthly_rent_amount: '',
    garbage_amount: '',
    electricity_price: '',
    water_price: '',
    fee_price: '',
    repair_airconditioner_price: '',
    wash_airconditioner_price: '',
    due_date: ''
  }
  data1: any = {
    id: 122,
    renter_id: 50,
    month: null,
    year: null,
    detail_bill: "[{\"description\":\"มอเตอร์เสีย\",\"amount\":500},{\"description\":\"ซ่อมบอร์ด\",\"amount\":2500}]",
    monthly_rental_price: 0.00,
    garbage_price: 0.00,
    fee_price: 0.00,
    fines_price: 0.00,
    repair_airconditioner_price: 3000.00,
    wash_airconditioner_price: 0.00,
    other_price: 0.00,
    total_amount: 3000.00,
    payment_status: "unpaid",
    due_date: "2025-02-27",
    paid_at: null,
    notification_sent: false,
    img_slip: null,
    trans_ref: null,
    created_at: "2025-02-13T07:04:46.000Z",
    updated_at: "2025-02-13T07:04:46.000Z",
    bill_type_id: 6,
    Renter: {
        id: 50,
        prefix: "นาย",
        first_name: "ศุภกฤต",
        last_name: "สอาด",
        Room: {
            id: 38,
            room_number: "ทดสอบ1",
            building_id: 1
        }
    },
    BillType: {
        type_name: "ค่าซ่อมแอร์"
    }
}

  building_id: any = ''
  admin_data: any = {}
  building_list: any = []
  room_with_renter_list: any = []
  room_id: any = ''
  renter_by_room_id: any = {}
  selected_renter_id: any = ''
  renterFullName: string = "";
  details_price: any = {}

  months: any = [
    { name: "มกราคม", value: 1 },
    { name: "กุมภาพันธ์", value: 2 },
    { name: "มีนาคม", value: 3 },
    { name: "เมษายน", value: 4 },
    { name: "พฤษภาคม", value: 5 },
    { name: "มิถุนายน", value: 6 },
    { name: "กรกฎาคม", value: 7 },
    { name: "สิงหาคม", value: 8 },
    { name: "กันยายน", value: 9 },
    { name: "ตุลาคม", value: 10 },
    { name: "พฤศจิกายน", value: 11 },
    { name: "ธันวาคม", value: 12 }
  ];

  constructor(private router: Router, private route: ActivatedRoute, private service: ServiceService, public dialogRef: MatDialogRef<BillsCreateComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.mode = data.mode
    console.log(this.mode);
    this.id = data.id
    console.log(this.id);
    
    
  }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();
    await this.GetMasterBillTypes()
    await this.GetMasterBuilding()
    await this.GetUnavaliableRoomWithRenter()
    await this.GetRenterByRoomID(this.room_id)
    await this.GetBillDetails()

  }

  closeDialog() {
    this.dialogRef.close({

    });
  }

  onDateChange(event: any) {
    if (event) {
      // ถ้าค่า event เปลี่ยนแปลง ต้องแปลงวันที่ให้เป็น Date object
      const formattedDate = new Date(event);
      this.body_bill_type.due_date = formattedDate;
    }
  }

  async GetMasterBillTypes() {

    let res: any = await this.service.Get('GetMasterBillType');
    if (res.status_code == 8000) {
      this.master_bill_type = res.data;
    }
    console.log(this.master_bill_type, '111');

  }

  async GetMasterBuilding() {
    let body = {
      community_id: this.admin_data.location
    }

    let res: any = await this.service.Post('GetMasterBuildings', body);
    if (res.status_code == 8000) {
      this.building_list = res.data
      console.log(this.building_list, 'master building');

    }
  }

  async GetUnavaliableRoomWithRenter() {
    let body: any = {
      community_id: this.admin_data.location,
      building_id: parseInt(this.building_id)
    }
    let res: any = await this.service.Post('GetUnavaliableRoomWithRenter', body);
    if (res.status_code == 8000) {
      this.room_with_renter_list = res.data
      this.room_with_renter_list.forEach((room: { Renters: any[]; }) => {
        if (room.Renters && room.Renters.length > 0) {
          room.Renters.forEach(renter => {
            // Check if img_profile exists and prepend the endpoint image URL
            if (renter.img_profile) {
              renter.img_profile = environment.endpoint_img + renter.img_profile;
            }
          });
        }
      });
    }
  }

  async GetRenterByRoomID(room_id:any) {
    let body: any = {
      room_id: parseInt(room_id)
    }
    let res: any = await this.service.Post('GetRenterByRoomID', body);
    if (res.status_code == 8000) {
      this.details_price = res.data
      if (res.data && res.data.renters && res.data.renters.length > 0) {
        this.renter_by_room_id = res.data.renters[0];
        this.selected_renter_id = res.data.renters[0].id;

        // รวมค่าชื่อเต็ม
        this.renterFullName = `${this.renter_by_room_id.prefix}${this.renter_by_room_id.first_name} ${this.renter_by_room_id.last_name}`;
      } else {
        this.renter_by_room_id = {};
        this.selected_renter_id = null;
        this.renterFullName = "";
      }

      console.log("ข้อมูลผู้เช่า:", this.renter_by_room_id);
      console.log("ID ผู้เช่าที่จะส่งไป:", this.selected_renter_id);
    }
  }

  
  //   get renterFullName(): string {
  //     if (this.renter_by_room_id && this.renter_by_room_id.first_name) {
  //         return `${this.renter_by_room_id.prefix} ${this.renter_by_room_id.first_name} ${this.renter_by_room_id.last_name}`;
  //     }
  //     return ""; // ถ้าไม่มีข้อมูล ให้แสดงว่าง
  // }

  async SubmitRentalBill() {
    let body: any = {
      renter_id: parseInt(this.selected_renter_id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      month: this.body_bill_type.month,
      year: this.body_bill_type.year,
      monthly_rental_price: this.details_price.monthly_rental_price,
      garbage_price: this.details_price.garbage_price,
      payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body, 'บอดี้');
    let res: any = await this.service.Post('CreateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">ออกบิลค่าเช่าสำเร็จ</b>`,
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
    if (res.status_code === 4001) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">บิลค่าเช่าของเดือนนี้ถูกออกไปแล้ว</b>`,
        icon: 'error',
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
        }
      });
    }
  }

  get totalAmount(): number {
    return this.fines.reduce((acc, fine) => acc + (fine.amount || 0), 0);
  }

  addFine() {
    this.fines.push({ description: '', amount: null });
  }

  // ลบรายการค่าปรับ
  removeFine(index: number) {
    this.fines.splice(index, 1);
  }

  async SubmitFinesBill() {

    const body = {
      renter_id: parseInt(this.selected_renter_id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      detail_bill: JSON.stringify(this.fines), // แปลง JSON Object เป็น String
      fines_price: this.fines.reduce((acc, fine) => acc + (fine.amount || 0), 0), // รวมค่าปรับทั้งหมด
      payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body);
    
    let res: any = await this.service.Post('CreateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">ออกบิลค่าปรับสำเร็จ</b>`,
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

  async SubmitRepairAcBill() {
    const body = {
      renter_id: parseInt(this.selected_renter_id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      detail_bill: JSON.stringify(this.fines), // แปลง JSON Object เป็น String
      repair_airconditioner_price: this.fines.reduce((acc, fine) => acc + (fine.amount || 0), 0),
      payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body);
    
    let res: any = await this.service.Post('CreateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">ออกบิลค่าซ่อมแอร์สำเร็จ</b>`,
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

  async SubmitWashAcBill() {
    const body = {
      renter_id: parseInt(this.selected_renter_id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      detail_bill: JSON.stringify(this.fines), // แปลง JSON Object เป็น String
      wash_airconditioner_price: this.body_bill_type.wash_airconditioner_price,
      payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body);
    
    let res: any = await this.service.Post('CreateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">ออกบิลค่าล้างแอร์สำเร็จ</b>`,
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

  async SubmitOtherBill() {
    const body = {
      renter_id: parseInt(this.selected_renter_id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      detail_bill: JSON.stringify(this.fines), // แปลง JSON Object เป็น String
      other_price: this.fines.reduce((acc, fine) => acc + (fine.amount || 0), 0),
      payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body);
    
    let res: any = await this.service.Post('CreateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">ออกบิลรายการอื่นๆสำเร็จ</b>`,
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

  async GetBillDetails() {
    let body = {
      id: this.id
    }
    let res: any = await this.service.Post('GetBillDetails', body);
    if (res.status_code == 8000) {
      this.body_bill_type = res.data
      this.renterFullName = `${this.body_bill_type.Renter.prefix}${this.body_bill_type.Renter.first_name} ${this.body_bill_type.Renter.last_name}`;
      this.fines = JSON.parse(this.body_bill_type.detail_bill);
      
    }
    console.log(this.body_bill_type,'details Bill');
    console.log(this.body_bill_type.Renter.Room,'details Rooms1111');

  }

  async UpdateWashAcBill() {
    const body = {
      renter_id: parseInt(this.body_bill_type.Renter.id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      bill_id : this.id,
      // detail_bill: JSON.stringify(this.fines), // แปลง JSON Object เป็น String
      wash_airconditioner_price: this.body_bill_type.wash_airconditioner_price,
      // payment_status: 'UpdateBill',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body);
    
    let res: any = await this.service.Post('UpdateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">อัพเดตบิลค่าล้างแอร์สำเร็จ</b>`,
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

  async UpdateRentalBill() {
    let body: any = {
      bill_id : this.id,
      renter_id: parseInt(this.body_bill_type.Renter.id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      month: this.body_bill_type.month,
      year: this.body_bill_type.year,
      monthly_rental_price: this.details_price.monthly_rental_price,
      garbage_price: this.details_price.garbage_price,
      // payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body, 'บอดี้');
    let res: any = await this.service.Post('UpdateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">อัพเดตบิลค่าเช่าสำเร็จ</b>`,
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

  async UpdateFinesBill() {

    const body = {
      bill_id : this.id,
      renter_id: parseInt(this.body_bill_type.Renter.id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      detail_bill: JSON.stringify(this.fines), // แปลง JSON Object เป็น String
      fines_price: this.fines.reduce((acc, fine) => acc + (fine.amount || 0), 0), // รวมค่าปรับทั้งหมด
      // payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body);
    
    let res: any = await this.service.Post('UpdateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">อัพเดตบิลค่าปรับสำเร็จ</b>`,
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

  async UpdateRepairAcBill() {
    const body = {
      bill_id : this.id,
      renter_id: parseInt(this.body_bill_type.Renter.id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      detail_bill: JSON.stringify(this.fines), // แปลง JSON Object เป็น String
      repair_airconditioner_price: this.fines.reduce((acc, fine) => acc + (fine.amount || 0), 0),
      // payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body);
    
    let res: any = await this.service.Post('UpdateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">อัพเดตบิลค่าซ่อมแอร์สำเร็จ</b>`,
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

  async UpdateOtherBill() {
    const body = {
      bill_id : this.id,
      renter_id: parseInt(this.body_bill_type.Renter.id), // ส่งค่า ID ของผู้เช่า
      bill_type_id: parseInt(this.body_bill_type.bill_type_id),
      detail_bill: JSON.stringify(this.fines), // แปลง JSON Object เป็น String
      other_price: this.fines.reduce((acc, fine) => acc + (fine.amount || 0), 0),
      // payment_status: 'unpaid',
      due_date: moment(this.body_bill_type.due_date).format('YYYY-M-D')
    };
    console.log(body);
    
    let res: any = await this.service.Post('UpdateBill', body);
    if (res.status_code == 8000) {
      Swal.fire({
        title: `<b style="color:#006666;" class="fs-3">อัพเดตบิลรายการอื่นๆสำเร็จ</b>`,
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
