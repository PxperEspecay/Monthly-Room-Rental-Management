// Refactored version of DashboardListComponent with original structure preferred by user
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ServiceService } from 'src/app/service/service.service';
import { environment } from 'src/environments/environment';

Chart.register(...registerables, ChartDataLabels);

 // 🟡 เพิ่ม plugin นี้
 const noDataPlugin = {
  id: 'noDataPlugin',
  beforeDraw(chart: any) {
    const { width, height, ctx } = chart;
    const total = chart.data.datasets?.[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0;
    if (total === 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Prompt';
      ctx.fillStyle = '#999';
      ctx.fillText('ไม่มีข้อมูล', width / 2, height / 2);
      ctx.restore();
    }
  }
};

Chart.register(noDataPlugin);

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.css']
})
export class DashboardListComponent implements OnInit {
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typeCanvas') typeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('issueCanvas') issueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('issueStatusCanvas') issueStatusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('announceCanvas') announceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('announceSeenCanvas') announceSeenCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('billTypeCanvas') billTypeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('billStatusCanvas') billStatusCanvas!: ElementRef<HTMLCanvasElement>;

  admin_data: any = {};
  location_list: any[] = [];
  building_list: any[] = [];
  building_id: any;
  room_with_renter_list: any[] = [];
  room_with_renter_list_filtered: any[] = [];
  total_room: number = 0;
  available_room: number = 0;
  unavailable_room: number = 0;
  total_renter: number = 0;

  page = 1;
  search_input = '';
  showDropdown = false;
  ckecked_all = false;
  room_status_list = [
    { status: 'Y', name: 'ว่าง', checked: false },
    { status: 'N', name: 'ไม่ว่าง', checked: false }
  ];

  barChart: any;
  pieChart: any;
  statusChart: any;
  typeChart: any;
  issueChart: any;
  issueStatusChart: any;
  announceChart: any;
  announceSeenChart: any;
  billTypeChart: any;
  billStatusChart: any;

  labels: string[] = [];
  monthlyIncome: number[] = [];
  genderMale = 0;
  genderFemale = 0;
  repairTypes: string[] = [];
  typeCounts: number[] = [];
  statusLabels: string[] = [];
  statusCounts: number[] = [];
  issueLabels: string[] = [];
  issueCounts: number[] = [];
  issueStatusLabels: string[] = [];
  issueStatusCounts: number[] = [];
  announceLabels: string[] = [];
  announceCounts: number[] = [];
  billTypeLabels: string[] = [];
  billTypeCounts: number[] = [];
  billStatusLabels: string[] = [];
  billStatusCounts: number[] = [];

  constructor(private router: Router, private service: ServiceService) { }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();
    await this.GetMasterLocation();
    await this.GetMasterBuilding();
    await this.GetRoomsListWithRenter();
    await this.GetDashboardData();
    // this.initCharts();

    setTimeout(() => this.initCharts(), 50);


  }

  async GetMasterLocation() {
    const res: any = await this.service.Get('GetMasterLocation');
    if (res.status_code === 8000) this.location_list = res.data;
  }

  async GetMasterBuilding() {
    const res: any = await this.service.Post('GetMasterBuildings', {
      community_id: this.admin_data.location // ✅ ใช้ location ที่เลือกใน dropdown
    });
    if (res.status_code === 8000) {
      this.building_list = res.data;
      this.building_id = 0; // ✅ reset ค่าอาคารทุกครั้งที่เปลี่ยนสถานที่
    }
  }

  async GetRoomsListWithRenter() {
    const body = {
      community_id: this.admin_data.location, // ✅ จาก dropdown
      building_id: parseInt(this.building_id)
    };
    const res: any = await this.service.Post('GetRoomsListWithRenter', body);
    if (res.status_code === 8000) {
      const data = res.data;
      this.total_room = data.total_room;
      this.available_room = data.available_room;
      this.unavailable_room = data.unavailable_room;
      this.total_renter = data.total_renter;
      this.room_with_renter_list = data.room_with_renter;
      this.room_with_renter_list_filtered = JSON.parse(JSON.stringify(data.room_with_renter));
      this.applyProfileImages(this.room_with_renter_list);
      this.applyProfileImages(this.room_with_renter_list_filtered);
      this.UpdateListType();
    }
  }

  async GetDashboardData() {
    const body = {
      community_id: this.admin_data.location,
      building_id: parseInt(this.building_id)
    };
    // if (this.building_id && this.building_id !== 0) {
    //   body.building_id = parseInt(this.building_id);
    // }
    const res: any = await this.service.Post('GetDashboardData', body);
    if (res.status_code === 8000) {
      this.processDashboardData(res.data);
    }
  }

  processDashboardData(data: any) {
    this.labels = data.bill?.income_by_month ? Object.keys(data.bill.income_by_month).map(this.convertMonthToThai) : ['ไม่มีข้อมูล'];
    this.monthlyIncome = data.bill?.income_by_month ? Object.values(data.bill.income_by_month) : [0];
    this.genderMale = data.genderRatio?.male || 0;
    this.genderFemale = data.genderRatio?.female || 0;
    this.repairTypes = data.repair?.type ? Object.keys(data.repair.type) : ['ไม่มีข้อมูล'];
    this.typeCounts = data.repair?.type ? Object.values(data.repair.type) : [0];
    this.statusLabels = data.repair?.status ? Object.keys(data.repair.status).map(this.formatStatus) : ['ไม่มีข้อมูล'];
    this.statusCounts = data.repair?.status ? Object.values(data.repair.status) : [0];
    const issueTotal = data.totalIssue || 0;
    const urgent = data.issueTypesCount?.urgent || 0;
    const normal = data.issueTypesCount?.normal || 0;
    this.issueLabels = ['ทั้งหมด', 'เรื่องด่วน', 'เรื่องทั่วไป'];
    this.issueCounts = [issueTotal, urgent, normal];
    this.issueStatusLabels = data.issueStatusCounts ? Object.keys(data.issueStatusCounts).map(this.formatIssueStatus) : ['ไม่มีข้อมูล'];
    this.issueStatusCounts = data.issueStatusCounts ? Object.values(data.issueStatusCounts) : [0];
    const announceTotal = data.announcements?.total || 0;
    const announceSeen = data.announcements?.seen || 0;
    const announceUnseen = data.announcements?.unseen || 0;
    this.announceLabels = ['ทั้งหมด', 'เห็นแล้ว', 'ยังไม่เห็น'];
    this.announceCounts = [announceTotal, announceSeen, announceUnseen];
    this.billTypeLabels = data.bill?.bill_type ? Object.keys(data.bill.bill_type) : ['ไม่มีข้อมูล'];
    this.billTypeCounts = data.bill?.bill_type ? Object.values(data.bill.bill_type) : [0];
    this.billStatusLabels = data.bill?.bill_status ? Object.keys(data.bill.bill_status).map(this.formatBillStatus) : ['ไม่มีข้อมูล'];
    this.billStatusCounts = data.bill?.bill_status ? Object.values(data.bill.bill_status) : [0];

    console.log('📊 Dashboard Data:', data); // ✅ ดูว่าเข้ามาไหม

    this.labels = data.bill?.income_by_month ? Object.keys(data.bill.income_by_month).map(this.convertMonthToThai) : ['ไม่มีข้อมูล'];
    this.monthlyIncome = data.bill?.income_by_month ? Object.values(data.bill.income_by_month) : [0];

    console.log('💵 รายรับ:', this.labels, this.monthlyIncome); // ✅

    this.billTypeLabels = data.bill?.bill_type ? Object.keys(data.bill.bill_type) : ['ไม่มีข้อมูล'];
    this.billTypeCounts = data.bill?.bill_type ? Object.values(data.bill.bill_type) : [0];

    console.log('🧾 ประเภทบิล:', this.billTypeLabels, this.billTypeCounts); // ✅
    this.updateCharts();
  }

  applyProfileImages(rooms: any[]) {
    rooms.forEach(room => {
      room.Renters?.forEach((renter: any) => {
        if (renter.img_profile && !renter.img_profile.startsWith('http')) {
          renter.img_profile = environment.endpoint_img + renter.img_profile;
        }
      });
    });
  }




  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'waiting_to_check': 'รอตรวจสอบ',
      'acknowledged': 'รับทราบแล้ว',
      'pending': 'รอดำเนินการ',
      'scheduled': 'นัดหมายแล้ว',
      'completed': 'เสร็จสิ้น',
      'in_progress': 'กำลังดำเนินการ'
    };
    return statusMap[status] || status;
  }

  formatIssueStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'waiting_to_check': 'รอตรวจสอบ',
      'pending': 'รอดำเนินการ',
      'in_progress': 'กำลังดำเนินการ',
      'completed': 'เสร็จสิ้น',
      'rejected': 'ปฏิเสธ',
      'fail': 'ล้มเหลว',
      'cancel': 'ยกเลิก'
    };
    return statusMap[status] || status;
  }

  formatBillStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'paid': 'จ่ายแล้ว',
      'unpaid': 'ยังไม่จ่าย',
      'late': 'จ่ายช้า',
      'overdue': 'เกินกำหนด'
    };
    return statusMap[status] || status;
  }

  // ฟังก์ชันแปลงเลขเดือนเป็นชื่อเดือนภาษาไทย
  convertMonthToThai(month: string): string {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const monthNumber = parseInt(month);
    if (monthNumber >= 1 && monthNumber <= 12) {
      return thaiMonths[monthNumber - 1];
    }
    return month;
  }

  onBuildingChange() {
    this.GetRoomsListWithRenter();
    this.GetDashboardData();
  }

  onLocationChange() {
    this.building_id = 0;
    this.GetMasterBuilding();
    this.GetRoomsListWithRenter();
    this.GetDashboardData(); // ✅ อัปเดตข้อมูลกราฟด้วย
  }



  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  CheckAllType() {
    this.ckecked_all = !this.ckecked_all;
    this.room_status_list.forEach(item => item.checked = this.ckecked_all);
    this.UpdateListType();
  }

  HandleType(item: any) {
    item.checked = !item.checked;
    this.ckecked_all = this.room_status_list.every(item => item.checked);
    this.UpdateListType();
  }

  UpdateListType() {
    this.page = 1; // reset pagination กลับไปหน้าแรก

    const selectedStatus = this.room_status_list
      .filter(item => item.checked)
      .map(item => item.status); // สมมุติว่าใน list มี field ชื่อ status เช่น 'Y', 'N'

    const keyword = this.search_input?.toLowerCase()?.trim();
    let filtered = JSON.parse(JSON.stringify(this.room_with_renter_list)); // clone ป้องกันของเดิมเสีย

    // ✅ กรองตามสถานะห้อง
    if (selectedStatus.length > 0) {
      filtered = filtered.filter((room: { status_room: string }) =>
        selectedStatus.includes(room.status_room)
      );
    }

    // ✅ กรองตาม keyword
    if (keyword) {
      filtered = filtered.filter((room: { room_number: string, Renters: any[] }) => {
        const roomNumber = room.room_number?.toLowerCase() || '';
        const renterFullName = room.Renters?.map(r =>
          `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase()
        ).join(' ') || '';

        return (
          roomNumber.includes(keyword) ||
          renterFullName.includes(keyword)
        );
      });
    }

    filtered.forEach((room: { Renters: any[] }) => {
      if (room.Renters && room.Renters.length > 0) {
        room.Renters.forEach(renter => {
          if (renter.img_profile && !renter.img_profile.startsWith('http')) {
            renter.img_profile = environment.endpoint_img + renter.img_profile;
          }
        });
      }
    });

    this.room_with_renter_list_filtered = filtered;
  }

  updateCharts() {
    if (this.barChart) {
      this.barChart.data.labels = this.labels;
      this.barChart.data.datasets[0].data = this.monthlyIncome;
      this.barChart.update();
    }
  
    if (this.pieChart) {
      this.pieChart.data.datasets[0].data = [this.genderMale, this.genderFemale];
      this.pieChart.update();
    }
  
    if (this.typeChart) {
      this.typeChart.data.labels = this.repairTypes;
      this.typeChart.data.datasets[0].data = this.typeCounts;
      this.typeChart.update();
    }
  
    if (this.statusChart) {
      this.statusChart.data.labels = this.statusLabels;
      this.statusChart.data.datasets[0].data = this.statusCounts;
      this.statusChart.update();
    }
  
    if (this.issueChart) {
      this.issueChart.data.labels = this.issueLabels;
      this.issueChart.data.datasets[0].data = this.issueCounts;
      this.issueChart.update();
    }
  
    if (this.issueStatusChart) {
      this.issueStatusChart.data.labels = this.issueStatusLabels;
      this.issueStatusChart.data.datasets[0].data = this.issueStatusCounts;
      this.issueStatusChart.update();
    }
  
    if (this.announceChart) {
      this.announceChart.data.labels = this.announceLabels;
      this.announceChart.data.datasets[0].data = this.announceCounts;
      this.announceChart.update();
    }
  
    if (this.announceSeenChart) {
      this.announceSeenChart.data.datasets[0].data = [
        this.announceCounts[1] || 0,
        this.announceCounts[2] || 0
      ];
  
      const seenPercent = this.announceCounts[0] > 0
        ? ((this.announceCounts[1] / this.announceCounts[0]) * 100).toFixed(1)
        : '0.0';
  
      this.announceSeenChart.options.plugins!.title!.text = `การเห็นประกาศจากผู้เช่า (${seenPercent}%)`;
      this.announceSeenChart.update();
    }
  
    if (this.billTypeChart) {
      this.billTypeChart.data.labels = this.billTypeLabels;
      this.billTypeChart.data.datasets[0].data = this.billTypeCounts;
      this.billTypeChart.update();
    }
  
    if (this.billStatusChart) {
      this.billStatusChart.data.labels = this.billStatusLabels;
      this.billStatusChart.data.datasets[0].data = this.billStatusCounts;
      this.billStatusChart.update();
    }
  }
  





  initCharts() {
    // Bar Chart รายรับ
    if (this.barCanvas?.nativeElement) {
      this.barChart = new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: this.labels,
          datasets: [{
            label: 'รายรับจากค่าเช่า (บาท)',
            data: this.monthlyIncome,
            backgroundColor: '#4CAF50',
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'รายรับจากค่าเช่ารายเดือน',
              font: { size: 18 }
            },
            legend: {
              labels: { font: { size: 14, weight: 'bold' } }
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Pie Chart เพศผู้เช่า
    if (this.pieCanvas?.nativeElement) {
      this.pieChart = new Chart(this.pieCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: ['ชาย', 'หญิง'],
          datasets: [{
            data: [this.genderMale, this.genderFemale],
            backgroundColor: ['#42A5F5', '#EC407A']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'สัดส่วนผู้เช่าตามเพศ',
              font: { size: 18 }
            },
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Pie Chart ประเภทงานซ่อม
    if (this.typeCanvas?.nativeElement) {
      this.typeChart = new Chart(this.typeCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: this.repairTypes,
          datasets: [{
            data: this.typeCounts,
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFCA28', '#EF5350']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'ประเภทงานซ่อม',
              font: { size: 18 }
            },
            legend: { position: 'bottom' },
            datalabels: {
              color: '#333',
              font: { weight: 'bold', size: 14 },
              formatter: (value: number, context: any) => {
                const total = context.chart.data.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0);
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return `${percent}%`;
              }
            }
          }
        }
      });
    }

    // Doughnut Chart สถานะงานซ่อม
    if (this.statusCanvas?.nativeElement) {
      this.statusChart = new Chart(this.statusCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: this.statusLabels,
          datasets: [{
            data: this.statusCounts,
            backgroundColor: ['#FFA726', '#AB47BC', '#26A69A', '#29B6F6', '#FF7043', '#66BB6A', '#78909C', '#EF5350']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'สถานะรายการแจ้งซ่อม',
              font: { size: 18 }
            },
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Bar Chart การแจ้งเรื่อง
    if (this.issueCanvas?.nativeElement) {
      this.issueChart = new Chart(this.issueCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: this.issueLabels,
          datasets: [{
            label: 'จำนวนการแจ้งเรื่อง',
            data: this.issueCounts,
            backgroundColor: ['#4CAF50', '#FF7043', '#42A5F5']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'สถิติการแจ้งเรื่องของผู้เช่า',
              font: { size: 18 }
            },
            legend: { display: false }
          },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Pie Chart สถานะของเรื่องที่แจ้ง
    if (this.issueStatusCanvas?.nativeElement) {
      this.issueStatusChart = new Chart(this.issueStatusCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: this.issueStatusLabels,
          datasets: [{
            data: this.issueStatusCounts,
            backgroundColor: ['#FFCA28', '#42A5F5', '#29B6F6', '#66BB6A', '#EF5350', '#AB47BC', '#BDBDBD']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'สถานะของเรื่องที่แจ้ง',
              font: { size: 18 }
            },
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Bar Chart ประกาศ
    if (this.announceCanvas?.nativeElement) {
      this.announceChart = new Chart(this.announceCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: this.announceLabels,
          datasets: [{
            label: 'จำนวนประกาศ',
            data: this.announceCounts,
            backgroundColor: ['#4CAF50', '#FF7043', '#42A5F5']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'สถิติการประกาศจากแอดมิน',
              font: { size: 18 }
            },
            legend: { display: false }
          },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Pie Chart การเห็นประกาศ
    if (this.announceSeenCanvas?.nativeElement) {
      const seenPercent = this.announceCounts[0] > 0
        ? ((this.announceCounts[1] / this.announceCounts[0]) * 100).toFixed(1)
        : '0.0';

      this.announceSeenChart = new Chart(this.announceSeenCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: ['มีผู้เช่าเห็นแล้ว', 'ยังไม่มีใครเห็น'],
          datasets: [{
            data: [this.announceCounts[1], this.announceCounts[2]],
            backgroundColor: ['#66BB6A', '#EF5350']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `การเห็นประกาศจากผู้เช่า (${seenPercent}%)`,
              font: { size: 18 }
            },
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Bar Chart ประเภทของบิล
    if (this.billTypeCanvas?.nativeElement) {
      this.billTypeChart = new Chart(this.billTypeCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: this.billTypeLabels,
          datasets: [{
            label: 'จำนวนบิล',
            data: this.billTypeCounts,
            backgroundColor: ['#4CAF50', '#FF7043', '#42A5F5', '#AB47BC', '#FFCA28']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'ประเภทของบิล',
              font: { size: 18 }
            },
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Doughnut Chart สถานะการจ่ายเงิน
    this.billStatusChart = new Chart(this.billStatusCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.billStatusLabels,
        datasets: [{
          data: this.billStatusCounts,
          backgroundColor: ['#66BB6A', '#EF5350', '#FFCA28', '#9E9E9E']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'สถานะการจ่ายเงิน',
            font: { size: 18 }
          },
          legend: { position: 'bottom' },
          tooltip: { enabled: true },
          datalabels: {
            display: true,
            color: '#fff',
            font: { weight: 'bold' }
          },
          
        }
      }
    });
    
  }
 



}

