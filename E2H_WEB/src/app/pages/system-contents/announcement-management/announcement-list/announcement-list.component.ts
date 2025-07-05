import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { th } from 'date-fns/locale';
import { format } from 'date-fns/format';
import { AnnouncementDetailsComponent } from '../announcement-details/announcement-details.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.css']
})
export class AnnouncementListComponent implements OnInit {

  search_input: any = '';
  showDropdown: boolean = false;
  ckecked_all: boolean = false;
  announcement_type_list = [
    {
      type: 'G',
      checked: false,
      name: 'ทั่วไป',
    },
    {
      type: 'I',
      checked: false,
      name: 'สำคัญ',
    },

  ];
  
  listTab = 1
  announcement_list: any = [

  ]
  maxSize = 10;
  maxSizeCard = 12;
  p = 1;
  announcement_id: any
  announcement_all_original: any

  constructor(private router: Router, private service: ServiceService, private dialogRef: MatDialog) {

  }

  ngOnInit(): void {
    this.GetHistoryAnnouncementList()
  }

  CreateNewAnnounce() {
    this.router.navigate(['./announcement-management/create-announcement']);
  }

  async GetHistoryAnnouncementList() {
    let res: any = await this.service.Get('GetHistoryAnnouncements');
    if (res.status_code == 8000) {
      this.announcement_list = JSON.parse(JSON.stringify(res.data));
      this.announcement_all_original = JSON.parse(JSON.stringify(res.data));
      for (let i = 0; i < this.announcement_list.length; i++) {
        let announcement_list = this.announcement_list[i];
        const Fstart = this.announcement_list[i]['createdAt'].split('T')[0].split('-');
        const Ystart = parseInt(Fstart[0], 10) + 543;
        const TH_Ystart = Ystart.toString();
        const TH_start_date = `${TH_Ystart}-${Fstart[1]}-${Fstart[2]}`;
        const createdAt = format(new Date(TH_start_date), 'dd LLL yyyy', {
          locale: th,
        });

        this.announcement_list[i]['createdAt'] = createdAt

        const renter_readed = announcement_list['Renter_read'].filter(
          (recipient: { is_read: boolean }) => recipient.is_read === true
        ).length;

        this.announcement_list[i]['renter_readed'] = renter_readed;
      }
    }
    console.log(this.announcement_list);

  }

  async DeleteAnnouncement(announcement_id: any) {
    let body = {
      id: announcement_id
    }
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        let res: any = await this.service.Post('DeleteAnnouncement', body);
        if (res.status_code == 8000) {
          Swal.fire({
            title: `<b style="color:#50c878;" class="fs-3">ลบข้อมูลสำเร็จ</b>`,
            text: 'ลบข้อมูลประกาศนี้เรียบร้อยแล้ว',
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

  openAnnouncementDetails(id: any) {
    let dialog = this.dialogRef.open(AnnouncementDetailsComponent, {
      width: '60%',
      height: '80%',
      data: { room_id: id }  // ใช้ data ที่นี่
    });

    dialog.componentInstance.id = id;

    // dialog.componentInstance.data = {
    //   commuities_id: id,
    // };

  }

  CheckAllType() {
    this.ckecked_all = !this.ckecked_all;
    this.announcement_type_list.forEach((item) => (item.checked = this.ckecked_all));
    this.UpdateListType();
  }

  HandleType(item: any) {
    item.checked = !item.checked;
    this.ckecked_all = this.announcement_type_list.every((item) => item.checked);
    this.UpdateListType();
  }

  UpdateListType() {
    this.p = 1
    const selectedTypes = this.announcement_type_list
      .filter(item => item.checked)
      .map(item => item.type);

    const keyword = this.search_input?.toLowerCase()?.trim();

    // 1. Clone ข้อมูลต้นฉบับ
    let filtered = JSON.parse(JSON.stringify(this.announcement_all_original));

    // 2. Filter ตามประเภท
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((item: { announcement_type: any; }) =>
        selectedTypes.includes(item.announcement_type)
      );
    }

    // 3. Filter ตาม keyword
    if (keyword) {
      filtered = filtered.filter((item: { title_announcement: string; body_announcement: string; location_name: string; }) =>
        (item.title_announcement?.toLowerCase().includes(keyword)) ||
        (item.body_announcement?.toLowerCase().includes(keyword)) ||
        (item.location_name?.toLowerCase().includes(keyword))
      );
    }

    // 4. แปลง createdAt และนับ renter_readed
    this.announcement_list = filtered.map((item: any) => {
      const formatted = { ...item };

      // 🔁 แปลง createdAt เป็นไทย
      const Fstart = formatted.createdAt.split('T')[0].split('-');
      const Ystart = parseInt(Fstart[0], 10) + 543;
      const TH_Ystart = Ystart.toString();
      const TH_start_date = `${TH_Ystart}-${Fstart[1]}-${Fstart[2]}`;
      formatted.createdAt = format(new Date(TH_start_date), 'dd LLL yyyy', {
        locale: th,
      });

      // 🔁 คำนวณจำนวน renter ที่อ่านแล้ว
      const renter_readed = formatted.Renter_read?.filter(
        (recipient: { is_read: boolean }) => recipient.is_read === true
      ).length || 0;

      formatted.renter_readed = renter_readed;

      return formatted;
    });
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




}
