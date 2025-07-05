import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import { environment } from 'src/environments/environment';
import { th } from 'date-fns/locale';
import { format } from 'date-fns/format';

@Component({
  selector: 'app-receive-reported-list',
  templateUrl: './receive-reported-list.component.html',
  styleUrls: ['./receive-reported-list.component.css']
})
export class ReceiveReportedListComponent implements OnInit {

  listTab = 1
  issue_reported_list: any = []
  issue_reported_list_original: any = []

  maxSize = 10;
  maxSizeCard = 12;
  p = 1;
  admin_data: any = {}

  search_input: any = '';
  showDropdown: boolean = false;
  ckecked_all: boolean = false;
  ckecked_all_status: boolean = false;
  issue_type_list = [
    {
      urgent_issue: false,
      checked: false,
      name: 'ทั่วไป',
    },
    {
      urgent_issue: true,
      checked: false,
      name: 'เรื่องด่วน',
    },

  ];
  issue_status_list = [
    {
      status: 'waiting_to_check',
      checked: false,
      name: 'รอตรวจสอบ',
    },
    {
      status: 'pending',
      checked: false,
      name: 'รอดำเนินการ',
    },
    {
      status: 'in_progress',
      checked: false,
      name: 'กำลังดำเนินการ',
    },
    {
      status: 'completed',
      checked: false,
      name: 'ดำเนินการเสร็จสิ้น',
    },
    {
      status: 'rejected',
      checked: false,
      name: 'ปฎิเสธคำร้อง',
    },
    {
      status: 'fail',
      checked: false,
      name: 'ดำเนินการไม่สำเร็จ',
    },
    {
      status: 'cancel',
      checked: false,
      name: 'ผู้เช่ายกเลิก',
    },
  ];

  constructor(private router: Router, private service: ServiceService) {

  }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();

    this.GetIssueReportList();

  }

  formatThaiDate(dateString: string) {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }



  async GetIssueReportList() {
    let body = {
      community_id: this.admin_data.location
    }
  
    let res: any = await this.service.Post('GetListIssueForAdmin', body);
    if (res.status_code == 8000) {
      this.issue_reported_list = res.data.map((item: any) => {
        return {
          ...item,
          createdAt_original: item.createdAt, // ⬅️ เก็บค่า raw ไว้สำหรับค้นหาเดือน
          createdAt: this.formatThaiDate(item.createdAt),
          updatedAt: this.formatThaiDate(item.updatedAt)
        }
      });
  
      this.issue_reported_list_original = JSON.parse(JSON.stringify(this.issue_reported_list));
      console.log(this.issue_reported_list, 'issue_reported_list');
    }
  }

  DetailsIssueReported(issue_id: any) {
    this.router.navigate(['./receive-reported-management/details'], {
      queryParams: {
        id: issue_id,
      }
    });
  }

  CheckAllType() {
    this.ckecked_all = !this.ckecked_all;
    this.issue_type_list.forEach(item => item.checked = this.ckecked_all);
    this.UpdateListType();
  }

  HandleType(item: any) {
    item.checked = !item.checked;
    this.ckecked_all = this.issue_type_list.every(item => item.checked);
    this.UpdateListType();
  }

  CheckAllStatus() {
    this.ckecked_all_status = !this.ckecked_all_status;
    this.issue_status_list.forEach(item => item.checked = this.ckecked_all_status);
    this.UpdateListType();
  }

  HandleStatus(item: any) {
    item.checked = !item.checked;
    this.ckecked_all_status = this.issue_status_list.every(item => item.checked);
    this.UpdateListType();
  }

  UpdateListType() {
    this.p = 1;
  
    const selectedUrgent = this.issue_type_list
      .filter(t => t.checked)
      .map(t => t.urgent_issue);
  
    const selectedStatuses = this.issue_status_list
      .filter(s => s.checked)
      .map(s => s.status);
  
    const keyword = this.search_input?.toLowerCase()?.trim();
    let filtered = JSON.parse(JSON.stringify(this.issue_reported_list_original));
  
    if (selectedUrgent.length > 0) {
      filtered = filtered.filter((item: { urgent_issue: boolean; }) => selectedUrgent.includes(item.urgent_issue));
    }
  
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((item: { status: string; }) => selectedStatuses.includes(item.status));
    }
  
    if (keyword) {
      filtered = filtered.filter((item: any) => {
        const title = item.title?.toLowerCase() || '';
        const roomNumber = item.Renter?.Room?.room_number?.toLowerCase() || '';
  
        // ✅ get Thai month keywords from createdAt
        let monthKeywords: string[] = [];
        if (item.createdAt_original) {
          const date = new Date(item.createdAt_original);
          const m = date.getMonth() + 1;
          const y = date.getFullYear();
          monthKeywords = this.getThaiFullMonthYear(m, y);
        }
  
        // ✅ Map status to Thai keywords
        let status_th = '';
        switch (item.status) {
          case 'waiting_to_check':
            status_th = 'รอตรวจสอบ ตรวจ';
            break;
          case 'pending':
            status_th = 'รอดำเนินการ ค้าง ยังไม่ทำ';
            break;
          case 'in_progess':
            status_th = 'กำลังดำเนินการ ดำเนินการ กำลังทำ';
            break;
          case 'completed':
            status_th = 'ดำเนินการเสร็จสิ้น เสร็จแล้ว เสร็จ';
            break;
          case 'rejected':
            status_th = 'ปฏิเสธคำร้อง ปฏิเสธ ไม่รับ';
            break;
          case 'cancel':
            status_th = 'ยกเลิก ยกเลิกคำร้อง';
            break;
        }
  
        return (
          title.includes(keyword) ||
          roomNumber.includes(keyword) ||
          monthKeywords.some(mk => mk.includes(keyword)) ||
          status_th.includes(keyword)
        );
      });
    }
  
    this.issue_reported_list = filtered;
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
  
    return [
      ...names.map(n => n.toLowerCase()),
      ...names.map(n => `${n} ${thaiYear}`.toLowerCase())
    ];
  }
  
  
  

  mapStatusToThai(status: string): string {
    switch (status) {
      case 'waiting_to_check': return 'รอตรวจสอบ ตรวจสอบ';
      case 'pending': return 'รอ รอดำเนินการ ค้าง';
      case 'in_progess': return 'กำลังดำเนินการ ดำเนินการ';
      case 'completed': return 'ดำเนินการเสร็จสิ้น เสร็จแล้ว';
      case 'rejected': return 'ปฏิเสธคำร้อง ปฏิเสธ';
      case 'cancel': return 'ยกเลิก ยกเลิกคำร้อง';
      default: return status;
    }
  }



}
