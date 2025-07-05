import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import { Pipe, PipeTransform } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BillsCreateComponent } from '../bills-create/bills-create.component';
import { DatePipe } from '@angular/common';
import { th } from 'date-fns/locale';
import { format } from 'date-fns/format';


@Component({
  selector: 'app-bills-list',
  templateUrl: './bills-list.component.html',
  styleUrls: ['./bills-list.component.css']
})

export class BillsListComponent implements OnInit {

  page: number = 1;
  itemsPerPage: any = 10;
  bills_list: any = []
  bills_original: any = []
  admin_data: any = {}
  datePipe: any;
  // created_at_formatted: any;

  search_input: any = '';
  showDropdown: boolean = false;
  ckecked_all: boolean = false;
  ckecked_all2: boolean = false;
  bill_type_list = [
    {
      bill_type_id: 1,
      checked: false,
      name: 'ค่าเช่า',
    },
    {
      bill_type_id: 5,
      checked: false,
      name: 'ค่าปรับ',
    },
    {
      bill_type_id: 6,
      checked: false,
      name: 'ค่าซ่อมแอร์',
    },
    {
      bill_type_id: 7,
      checked: false,
      name: 'ค่าล้างแอร์',
    },
    {
      bill_type_id: 8,
      checked: false,
      name: 'อื่นๆ',
    },
  ];
  bill_payment_status_list = [
    {
      payment_status: 'paid',
      checked: false,
      name: 'ชำระแล้ว',
    },
    {
      payment_status: 'unpaid',
      checked: false,
      name: 'ค้างชำระ',
    },
    {
      payment_status: 'late',
      checked: false,
      name: 'ชำระล่าช้า',
    },
    {
      payment_status: 'overdue',
      checked: false,
      name: 'เกินกำหนดชำระ',
    },
  ];
  announcement_all_original: any
  announcement_list: any = [

  ]

  constructor(private router: Router, private service: ServiceService, private dialogRef: MatDialog) {

  }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();
    this.GetBillList()
  }

  async GetBillList() {
    let body = {
      community_id: parseInt(this.admin_data.location)
    };
    let res: any = await this.service.Post('GetBillListByCommunityID', body);
    if (res.status_code == 8000) {
      const formatted = res.data.map((bill: any, index: number) => ({
        ...bill,
        order: index + 1,
        created_at_formatted: this.formatThaiMonthYear(bill.created_at)
      }));

      this.bills_original = JSON.parse(JSON.stringify(formatted)); // ✅ เก็บต้นฉบับไว้กรองภายหลัง
      this.bills_list = [...formatted]; // ใช้แสดงครั้งแรก
    }

    console.log('All Bills List', this.bills_list);
  }

  formatThaiMonthYear(dateString: string): string {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const thaiDate = new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long'
    }).format(date);

    return thaiDate; // เช่น "กุมภาพันธ์ 2567"
  }

  DetailsBill(bill_id: any) {
    this.router.navigate(['./bills-management/details'], {
      queryParams: {
        id: bill_id,
      }
    });
  }

  openBillCreate(id: any, mode: any) {
    let dialog = this.dialogRef.open(BillsCreateComponent, {
      width: '70%',
      height: '65%',
      data: { bill_id: id, mode: mode }  // ใช้ data ที่นี่
    });

    dialog.componentInstance.id = id;

    // dialog.componentInstance.data = {
    //   commuities_id: id,
    // };

  }

  async DeleteAnnouncement(bill_id: any) {
    let body = {
      bill_id: bill_id
    }
    await Swal.fire({
      title: `<b style="color:#FC5A5A;" class="fs-3">ยืนยันการลบบิล</b>`,
      text: 'ยืนยันการลบบิลนี้ ?',
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        let res: any = await this.service.Post('DeleteBill', body);
        if (res.status_code == 8000) {
          Swal.fire({
            title: `<b style="color:#50c878;" class="fs-3">ลบข้อมูลสำเร็จ</b>`,
            text: 'ลบข้อมูลบิลนี้เรียบร้อยแล้ว',
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

  CheckAllType() {
    this.ckecked_all = !this.ckecked_all;
    this.bill_type_list.forEach(item => item.checked = this.ckecked_all);
    this.UpdateBillList();
  }

  HandleType(item: any) {
    item.checked = !item.checked;
    this.ckecked_all = this.bill_type_list.every(item => item.checked);
    this.UpdateBillList();
  }

  HandleStatusBill(item: any) {
    item.checked = !item.checked;
    this.ckecked_all2 = this.bill_payment_status_list.every(item => item.checked);
    this.UpdateBillList();
  }

  CheckAllStatusBill() {
    this.ckecked_all2 = !this.ckecked_all2;
    this.bill_payment_status_list.forEach(item => item.checked = this.ckecked_all2);
    this.UpdateBillList();
  }

  UpdateBillList() {
    this.page = 1;
    const selectedTypes = this.bill_type_list
      .filter(b => b.checked)
      .map(b => b.bill_type_id);

    const selectedStatus = this.bill_payment_status_list
      .filter(s => s.checked)
      .map(s => s.payment_status);

    const keyword = this.search_input?.toLowerCase()?.trim();

    let filtered = JSON.parse(JSON.stringify(this.bills_original));

    // ✅ กรองตามประเภทบิล
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((item: { bill_type_id: any }) =>
        selectedTypes.includes(item.bill_type_id)
      );
    }

    // ✅ กรองตามสถานะการชำระ
    if (selectedStatus.length > 0) {
      filtered = filtered.filter((item: { payment_status: any }) =>
        selectedStatus.includes(item.payment_status)
      );
    }

    // ✅ กรองตาม keyword
    if (keyword) {
      const kw = keyword.toLowerCase();

      filtered = filtered.filter((item: {
        year: any;
        Renter: { first_name: string; last_name: string; Room: { room_number: string } };
        BillType: { type_name: string };
        month: any;
        payment_status: string;
        created_at: string;
      }) => {
        // ผู้เช่า
        const fullName = `${item.Renter?.first_name || ''} ${item.Renter?.last_name || ''}`.toLowerCase();
        const roomNumber = item.Renter?.Room?.room_number?.toLowerCase() || '';

        // ประเภทบิล (ถ้าแสดงชื่อไทยอยู่แล้ว)
        const billType_th = item.BillType?.type_name?.toLowerCase() || '';

        // ✅ เดือน (จาก month ถ้ามี, fallback ใช้ created_at)
        let monthKeywords: string[] = [];

        if (item.month && item.year) {
          monthKeywords = this.getThaiFullMonthYear(Number(item.month), Number(item.year));
        } else if (item.created_at) {
          const date = new Date(item.created_at);
          const m = date.getMonth() + 1;
          const y = date.getFullYear();
          monthKeywords = this.getThaiFullMonthYear(m, y);
        }

        // ✅ สถานะแบบยืดหยุ่น
        let status_th = '';
        switch (item.payment_status) {
          case 'paid':
            status_th = 'ชำระ จ่ายแล้ว';
            break;
          case 'unpaid':
            status_th = 'ยังไม่ชำระ ค้าง ยังไม่ได้จ่าย';
            break;
          case 'late':
            status_th = 'ล่า ช้า ล่าช้า';
            break;
          case 'overdue':
            status_th = 'เกิน เกินกำหนด เกินกำหนดชำระ';
            break;
        }

        return (
          fullName.includes(kw) ||
          roomNumber.includes(kw) ||
          billType_th.includes(kw) ||
          monthKeywords.some(mk => mk.includes(kw)) ||
          status_th.includes(kw)
        );
      });
    }

    // ✅ ตั้งค่าข้อมูลใหม่หลังกรอง
    this.bills_list = filtered;
  }



  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  formatThaiDate(dateString: string) {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  getThaiFullMonthYear(month: number, year: number): string[] {
    const monthsMap: { [key: number]: string[] } = {
      1: ['มกราคม', 'มกรา'],
      2: ['กุมภาพันธ์', 'กุมภา'],
      3: ['มีนาคม', 'มีนา'],
      4: ['เมษายน', 'เมษา'],
      5: ['พฤษภาคม', 'พฤษภา'],
      6: ['มิถุนายน', 'มิถุนา'],
      7: ['กรกฎาคม', 'กรกฎา'],
      8: ['สิงหาคม', 'สิงหา'],
      9: ['กันยายน', 'กันยา'],
      10: ['ตุลาคม', 'ตุลา'],
      11: ['พฤศจิกายน', 'พฤศจิกา'],
      12: ['ธันวาคม', 'ธันวา']
    };

    const thaiYear = year + 543;
    const names = monthsMap[month] || [];

    // คืน array เช่น ['มีนาคม', 'มีนา', 'มีนาคม 2568', 'มีนา 2568']
    return [
      ...names.map(n => n.toLowerCase()),
      ...names.map(n => `${n} ${thaiYear}`.toLowerCase())
    ];
  }


}
