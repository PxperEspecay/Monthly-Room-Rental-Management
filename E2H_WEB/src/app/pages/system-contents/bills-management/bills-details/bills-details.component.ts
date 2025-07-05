import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/service/service.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bills-details',
  templateUrl: './bills-details.component.html',
  styleUrls: ['./bills-details.component.css']
})
export class BillsDetailsComponent implements OnInit {

  renterName: string = 'ศุภกฤต สอาด';
  roomNumber: string = '180/188';
  month: string = 'มกราคม';
  year: string = '2568';
  monthlyRentAmount: string = '2,500';
  garbageAmount: string = '40';
  totalAmount: string = '2540';
  paymentStatus: string = 'unpaid';
  paymentStatusText: string = 'ยังไม่จ่าย';
  dueDate: string = '31 มกราคม 2568';

  bill_id: any
  bill_details: any = {}
  fines: any

  constructor(private service: ServiceService, private router: Router, private route: ActivatedRoute,) {
    this.route.queryParams.subscribe((params: any) => {
      this.bill_id = params?.id
    });
  }

  async ngOnInit(): Promise<void> {
    this.GetBillDetails()
  }

  BackTo() {
    this.router.navigate(['./bills-management']);
  }


  async GetBillDetails() {
    let body: any = {
      id: this.bill_id
    }
    let res: any = await this.service.Post('GetBillDetails', body);
    if (res.status_code === 8000) {
      this.bill_details = res.data
      this.fines = this.bill_details.detail_bill && this.bill_details.detail_bill.trim()
        ? JSON.parse(this.bill_details.detail_bill)
        : [];


      // แปลงเดือนและปีให้เป็นแบบไทย
      if (this.bill_details.month) {
        this.bill_details.month = this.formatThaiMonth(this.bill_details.month);
      }
      if (this.bill_details.year) {
        this.bill_details.year = this.formatThaiYear(this.bill_details.year);
      }
      if (this.bill_details.due_date) {
        this.bill_details.due_date = this.formatThaiDate(this.bill_details.due_date);
      }

      // ถ้ามีรูปภาพ slip
      if (this.bill_details.img_slip) {
        this.bill_details.img_slip = environment.endpoint_img + this.bill_details.img_slip;
      }

      console.log(this.bill_details.img_slip);
    }
  }

  formatThaiMonth(month: number): string {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return months[month - 1] || '';
  }

  formatThaiYear(year: number): string {
    return `${year + 543}`;  // เพิ่ม 543 เพื่อแปลงเป็นพุทธศักราช
  }

  formatThaiDate(dateString: string) {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  }














  printReceipt() {
    const originalContents = document.body.innerHTML; // เก็บ HTML เดิมทั้งหมด
    const receiptContainer = document.querySelector('.receipt-container') as HTMLElement;
    const statusElement = document.querySelector('.status') as HTMLElement;
    const printButton = document.querySelector('.print-button') as HTMLElement;

    if (receiptContainer) {
      // ซ่อน status และ print button
      if (statusElement) statusElement.style.display = 'none';
      if (printButton) printButton.style.display = 'none';

      // เก็บเฉพาะใบเสร็จ
      const receiptContents = receiptContainer.outerHTML;

      // แสดงเฉพาะใบเสร็จ
      document.body.innerHTML = receiptContents;

      // เปิดหน้าต่างปริ้น
      window.print();

      // คืนค่า HTML เดิมหลังปริ้นเสร็จ
      document.body.innerHTML = originalContents;

      // รีโหลดหน้าเว็บเพื่อให้ DOM กลับมาเหมือนเดิม
      window.location.reload();
    }
  }


}
