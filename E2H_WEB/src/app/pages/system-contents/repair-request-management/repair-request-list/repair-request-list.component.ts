import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-repair-request-list',
  templateUrl: './repair-request-list.component.html',
  styleUrls: ['./repair-request-list.component.css']
})
export class RepairRequestListComponent implements OnInit {

  tab = 'all'
  secondary_tab = 'all'
  page = 1
  search_input: any = '';
  showDropdown: boolean = false;
  ckecked_all: boolean = false;
  repair_type_list = [
    {
      type_id: 1,
      checked: false,
      name: 'ไฟฟ้า',
    },
    {
      type_id: 2,
      checked: false,
      name: 'ประปา',
    },
    {
      type_id: 3,
      checked: false,
      name: 'เครื่องปรับอากาศ',
    },
    {
      type_id: 4,
      checked: false,
      name: 'อื่นๆ',
    },
  ];
  filteredData: any[] = [];
  selectedTypeIds: any





  data_All: any = []
  data_All_original: any = []
  data_check_all: any = []
  data_new_repair_request: any = []
  data_data_acknowledged: any = []
  data_scheduled: any = []
  data_pending: any = []
  data_in_progress: any = []
  data_final: any = []
  body: any = {
    optional_filter: {
      search: "",
      citys: [
        {
          city_id: ""
        }
      ],
      start_date: "",
      end_date: ""
    },
  }
  admin_data: any;

  constructor(private router: Router, private service: ServiceService) {

  }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();

    this.GetRepairRequestsListForAdmin();
  }

  async ChangeTabs(item: any) {
    if (item == 'all') {
      this.tab = 'all'
    }
    if (item == 'aogtion') {
      this.tab = 'aogtion'
    }
    if (item == 'bids') {
      this.tab = 'bids'
    }
    if (item == 'confirm') {
      this.tab = 'confirm'
    }
    if (item == 'final') {
      this.tab = 'final'
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  async ChangeSecondaryTabs(item: any) {
    if (item == 'all') {
      this.secondary_tab = 'all'
    }
    if (item == 'created auction') {
      this.secondary_tab = 'created auction'
    }
    // if (item == 'ended auction') {
    //   this.secondary_tab = 'ended auction'
    // }
    if (item == 'scheduled') {
      this.secondary_tab = 'scheduled'
    }
  }

  formatThaiDate(dateString: string) {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const date = new Date(dateString);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  async GetRepairRequestsListForAdmin() {
    let body = {
      community_id: this.admin_data.location
    }
    let res: any = await this.service.Post('GetRepairRequestsListForAdmin', body);
    if (res.status_code == 8000) {
      this.data_All = JSON.parse(JSON.stringify(res.data));
      this.data_All_original = JSON.parse(JSON.stringify(res.data));
      this.filteredData = this.data_All
      this.data_check_all = []
      this.data_new_repair_request = []
      this.data_data_acknowledged = []
      this.data_scheduled = []
      this.data_pending = []
      this.data_in_progress = []


      await Promise.all(this.data_All.map(async (v: any, i: string | number) => {
        if (this.data_All[i]['status'] == 'waiting_to_check' || this.data_All[i]['status'] == 'scheduled') {

          if (this.data_All[i].created_at) {
            this.data_All[i].created_at = this.formatThaiDate(this.data_All[i].created_at);
          }
          this.data_All[i]['issue_description'] = this.data_All[i]['issue_description'].slice(0, 20) + '...';


          this.data_check_all.push(this.data_All[i]);
        }
        if (this.data_All[i]['status'] == 'waiting_to_check') {



          this.data_new_repair_request.push(this.data_All[i]);
        }
        if (this.data_All[i]['status'] == 'acknowledged') {

          if (this.data_All[i].created_at) {
            this.data_All[i].created_at = this.formatThaiDate(this.data_All[i].created_at);
          }
          this.data_All[i]['issue_description'] = this.data_All[i]['issue_description'].slice(0, 20) + '...';



          this.data_data_acknowledged.push(this.data_All[i]);
        }
        if (this.data_All[i]['status'] == 'scheduled') {




          this.data_scheduled.push(this.data_All[i]);
        }
        if (this.data_All[i]['status'] == 'pending') {
          if (this.data_All[i].created_at) {
            this.data_All[i].created_at = this.formatThaiDate(this.data_All[i].created_at);
          }
          this.data_All[i]['issue_description'] = this.data_All[i]['issue_description'].slice(0, 20) + '...';



          this.data_pending.push(this.data_All[i]);
        }
        if (this.data_All[i]['status'] == 'in_progress') {
          if (this.data_All[i].created_at) {
            this.data_All[i].created_at = this.formatThaiDate(this.data_All[i].created_at);
          }
          this.data_All[i]['issue_description'] = this.data_All[i]['issue_description'].slice(0, 20) + '...';


          this.data_in_progress.push(this.data_All[i]);
        }
        if (this.data_All[i]['status'] == 'completed') {

          if (this.data_All[i].created_at) {
            this.data_All[i].created_at = this.formatThaiDate(this.data_All[i].created_at);
          }
          this.data_All[i]['issue_description'] = this.data_All[i]['issue_description'].slice(0, 20) + '...';



          this.data_final.push(this.data_All[i]);
        }
      }));

      // console.log('data รอดำเนินการ =', this.data_pending);
      // console.log('data ทั้งหมด =', this.data_All);
      // console.log('data คำร้องใหม่ =', this.data_new_repair_request);
      // console.log('data คำร้องนัดหมาย =', this.data_scheduled);
      // console.log('data รอตรวจสอบ =', this.data_check_all);
      // console.log('data กำลังดำเนินการ =', this.data_in_progress);
    }
  }

  MoreDetail(repair_req_id: any, status: any) {
    this.router.navigate(['./repair-request-management/details'], {
      queryParams: {
        id: repair_req_id,
        status: status,
      }
    });
  }

  CheckAllType() {
    this.ckecked_all = !this.ckecked_all;
    this.repair_type_list.forEach((item) => (item.checked = this.ckecked_all));
    this.UpdateListType();
  }

  HandleType(item: any) {
    item.checked = !item.checked;
    this.ckecked_all = this.repair_type_list.every((item) => item.checked);
    this.UpdateListType();
  }

  UpdateListType() {
    this.page = 1
    // 1. ดึงประเภทงานที่เลือกไว้
    const selected = this.repair_type_list.filter(item => item.checked);
    this.body.user_types = selected;
    const selectedTypeIds = selected.map(item => item.type_id);

    // 2. เริ่มจากข้อมูลต้นฉบับ
    let filtered = JSON.parse(JSON.stringify(this.data_All_original)); // ป้องกันแปลงซ้ำ

    // 3. กรองตามประเภทงาน
    if (selectedTypeIds.length > 0) {
      filtered = filtered.filter((item: { type_repair_id: number; }) =>
        selectedTypeIds.includes(item.type_repair_id)
      );
    }

    // 4. กรองตามคำค้นหา
    const keyword = this.search_input?.toLowerCase()?.trim();
    if (keyword) {
      filtered = filtered.filter((item: {
        issue_description: string;
        repair_code: string;
        status: string;
        Renter: {
          first_name: string;
          last_name: string;
          nick_name: string;
          Room: {
            room_number: string;
            Building: {
              building_name: string;
            };
          };
        };
      }) =>
        (item.issue_description && item.issue_description.toLowerCase().includes(keyword)) ||
        (item.repair_code && item.repair_code.toLowerCase().includes(keyword)) ||
        (item.status && item.status.toLowerCase().includes(keyword)) ||
        (item.Renter?.first_name && item.Renter.first_name.toLowerCase().includes(keyword)) ||
        (item.Renter?.last_name && item.Renter.last_name.toLowerCase().includes(keyword)) ||
        (item.Renter?.nick_name && item.Renter.nick_name.toLowerCase().includes(keyword)) ||
        (item.Renter?.Room?.room_number && item.Renter.Room.room_number.toLowerCase().includes(keyword)) ||
        (item.Renter?.Room?.Building?.building_name &&
          item.Renter.Room.Building.building_name.toLowerCase().includes(keyword)
        )
      );
    }

    // 5. ล้างข้อมูลก่อน และเตรียม array แสดงผล
    this.data_All = []; // ✅ แทนที่ filtered ด้วย processedItem ที่แปลงแล้ว
    this.data_check_all = [];
    this.data_new_repair_request = [];
    this.data_data_acknowledged = [];
    this.data_scheduled = [];
    this.data_pending = [];
    this.data_in_progress = [];
    this.data_final = [];

    // 6. แปลงข้อมูล และแบ่งตาม status พร้อมใส่ลง data_All
    filtered.forEach((item: any) => {
      const processedItem = { ...item };

      if (processedItem.created_at) {
        processedItem.created_at = this.formatThaiDate(processedItem.created_at);
      }

      if (processedItem.issue_description) {
        processedItem.issue_description = processedItem.issue_description.slice(0, 20) + '...';
      }

      // ✅ ใส่ลง tab "ทั้งหมด"
      this.data_All.push(processedItem);

      // ✅ แบ่งใส่ตาม status
      switch (processedItem.status) {
        case 'waiting_to_check':
          this.data_check_all.push(processedItem);
          this.data_new_repair_request.push(processedItem);
          break;
        case 'acknowledged':
          this.data_data_acknowledged.push(processedItem);
          break;
        case 'scheduled':
          this.data_check_all.push(processedItem);
          this.data_scheduled.push(processedItem);
          break;
        case 'pending':
          this.data_pending.push(processedItem);
          break;
        case 'in_progress':
          this.data_in_progress.push(processedItem);
          break;
        case 'completed':
          this.data_final.push(processedItem);
          break;
      }
    });
  }




  // FilterByRepairType() {
  //   // 1. ดึง type_id ของประเภทที่ถูกเลือกไว้
  //   const selectedTypeIds = this.repair_type_list
  //     .filter(item => item.checked)
  //     .map(item => item.type_id);

  //   // 2. ถ้าไม่มีการเลือกเลย แสดงทั้งหมด
  //   if (selectedTypeIds.length === 0) {
  //     this.filteredData = this.data_All;
  //     return;
  //   }

  //   // 3. กรองข้อมูลที่ตรงกับประเภทงานที่เลือกไว้
  //   this.filteredData = this.data_All.filter((item: { repair_type_id: number; }) =>
  //     selectedTypeIds.includes(item.repair_type_id) // <-- ตรวจตรงนี้ว่าค่า field ตรงกับของคุณไหม
  //   );
  //   console.log('111');

  // }

}
