import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ServiceService } from 'src/app/service/service.service';
import { BreadcrumbService } from 'src/app/service/breadcrumb.service';
import Swal from 'sweetalert2';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-system-contents',
  templateUrl: './system-contents.component.html',
  styleUrls: ['./system-contents.component.css']
})
export class SystemContentsComponent implements OnInit {

  isSidebarOpen = false;
  isLargeScreen = window.innerWidth >= 768; // Check if initial screen is large

  isDropdownOpen = false;
  notifications: any = [];
  notificationInterval: any;

  breadcrumb: any = [];
  version = environment.version;
  menu_id: any
  getPath: any
  isBar = false;
  menu_list: any = [];
  userData: any = {
    userName: 'Wachiraporn Tonapalin',
    photo: null,
    roleName: 'Super Admin'
  }
  admin_name: any;
  admin_data: any = {}
  check_user: any
  fullname: any
  role_admin: any
  profile_img: any
  id: any

  pathToMenuIdMap: { [key: string]: string } = {
    'admin-management': '5',
    'communities-management': '6',
    'renter-management': '1',
    'announcement-management': '4',
    'room-management': '2',
    'receive-reported-management': '8',
    'bills-management': '3',
    'repair-request-management': '9',
    'dashboard': 'Dashboard'
  };
  constructor(
    private service: ServiceService,
    private router: Router,
    private BreadcrumbService: BreadcrumbService,
  ) {
    this.breadcrumb = BreadcrumbService.breadcrumbs$;
  }


  async ngOnInit(): Promise<void> {

    const currentPath = this.router.url.split('?')[0].replace('/', '').split('/')[0];
    const mappedMenuId = this.pathToMenuIdMap[currentPath];
  
    if (mappedMenuId) {
      this.menu_id = mappedMenuId;
      sessionStorage.setItem('menu_id', mappedMenuId);
    }
  
    // this.GetMainMenu(); // ค่อยโหลดเมนูตามปกติ
    this.GetMainMenu()
    this.listenToRouteChanges();
    // this.menu_id = sessionStorage.getItem('menu_id');
    // console.log('AAA', this.menu_id);

    // const t: any = await this.service.GetUser();
    // console.log(t,'TTT');

    this.admin_data = await this.service.GetUser();
    console.log(this.admin_data, 'admin_data');

    this.fullname = this.admin_data.first_name + ' ' + this.admin_data.last_name
    console.log(this.fullname, 'fullname');
    this.role_admin = this.admin_data.role
    console.log(this.role_admin, 'role');
    this.admin_data.profile_img = environment.endpoint_img + this.admin_data.profile_img
    // this.admin_details.profile_photo = environment.endpoint_img + this.admin_details.profile_photo

    this.GetNotification()

    this.notificationInterval = setInterval(() => {
      this.GetNotification();
    }, 1500000); // ดึงข้อมูลทุก 5 วินาที

    // this.admin_name = t.name
    // console.log(this.admin_name,'this.admin_name');

    // this.check_user = t.check_user;
    // console.log(this.check_user,'this.check_user');

  }

  ngOnDestroy() {
    clearInterval(this.notificationInterval); // เคลียร์ interval ตอน component ถูกทำลาย
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isLargeScreen = event.target.innerWidth >= 768;
    if (this.isLargeScreen) {
      this.isSidebarOpen = true; // Automatically open sidebar on large screens
    } else {
      this.isSidebarOpen = false; // Close sidebar on small screens
    }
  }

  

  toPath(getPath: any) {
    console.log('Path =', getPath);

    if (!getPath) {
      return;
    }
    else {
      this.menu_id = getPath;
    }
    console.log('menu_id =', this.menu_id);


    sessionStorage.setItem('menu_id', getPath)
    switch (getPath) {
      case '7':
        this.router.navigate(['./dashboard-management']);
        break;
      case 'Content management':
        // window.location.href = './user-management'
        break;
      case '5':
        // window.location.href = './user-management'
        this.router.navigate(['./admin-management']);
        break;
      case '6':
        // window.location.href = './communities-management'
        this.router.navigate(['./communities-management']);
        break;
      case '1':
        // window.location.href = './user-management'
        this.router.navigate(['./renter-management']);
        break;
      case '4':
        this.router.navigate(['./announcement-management']);
        break;
      case '2':
        this.router.navigate(['./room-management']);
        break;
      case '8':
        this.router.navigate(['./receive-reported-management']);
        break;
      case '3':
        this.router.navigate(['./bills-management']);
        break;
      case '9':
        this.router.navigate(['./repair-request-management']);
        break;


      default:
        console.log('default');

        break;
    }

  }



  changePage(menu: any) {
    // sessionStorage.setItem('SSC-BreadCrum', path_name);
    // window.location.href = `./${menu.path}`;
    this.router.navigate([`./${menu.path}`])
  }

  openProfile(id: any) {
    this.router.navigate(['./admin-management/details'], {
      queryParams: {
        id: id,
      }
    });
  }

  OpenLogout() {
    Swal.fire({
      title: `<b style="color:#FC5A5A;" class="fs-3">ยืนยันการออกจากระบบ</b>`,
      text: 'ยืนยันการออกจากระบบ',
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
        this.service.Logout()
      } else {
        return;
      }
    });
  }

  // async GetMainMenu() {
  //   let res: any = await this.service.Get('GetMainMenu');
  //   // console.log('Res Menu =', res);

  //   if (res.status_code == 8000) {
  //     this.menu_list = res.data;
  //     for (let i = 0; i < this.menu_list.length; i++) {
  //       if (this.getPath == this.menu_list[i]['menu_name']) {
  //         console.log(this.menu_list[i]['menu_name']);

  //       }
  //       // console.log('top_name_menu =',this.top_name_menu);

  //       //  console.log(i,this.main_menu[i]['menu_name']);

  //     }
  //   } else {
  //     this.router.navigate(['/login'])
  //   }

  // }
  listenToRouteChanges() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEndEvent = event as NavigationEnd;
        const currentPath = navEndEvent.urlAfterRedirects.split('?')[0].replace('/', '').split('/')[0];
        const mappedMenuId = this.pathToMenuIdMap[currentPath];
  
        console.log('[Router Change] path:', currentPath, '→ menu_id:', mappedMenuId);
  
        if (mappedMenuId) {
          this.menu_id = mappedMenuId;
          sessionStorage.setItem('menu_id', mappedMenuId);
        }
      });
  }
  

  async GetMainMenu() {
    let res: any = await this.service.Get('GetMainMenu');
  
    if (res.status_code == 8000) {
      this.menu_list = res.data;
  
      const fullUrl = this.router.url;
      const currentPath = fullUrl.split('?')[0].replace('/', '').split('/')[0];
      const mappedMenuId = this.pathToMenuIdMap[currentPath];
  
      console.log('FULL URL =', fullUrl);
      console.log('PATH =', currentPath);
      console.log('MAPPED MENU ID =', mappedMenuId);
  
      if (mappedMenuId) {
        this.menu_id = mappedMenuId;
        sessionStorage.setItem('menu_id', mappedMenuId);
      }
  
      console.log('FINAL MENU ID =', this.menu_id);
      console.log('MENU LIST =', this.menu_list);
  
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.GetNotification(); // รีโหลดข้อมูลเมื่อเปิดดรอปดาวน์
    }
  }


  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    const notificationSystem = document.querySelector('.notification-system');

    // เพิ่มการตรวจสอบว่า target มีการคลิกที่ตัว notification item หรือไม่
    const isNotificationItem = target.closest('.notification-item'); // สมมติว่าแต่ละแจ้งเตือนมี class นี้

    if (notificationSystem && !notificationSystem.contains(target)) {
      this.isDropdownOpen = false;
    } else if (isNotificationItem) {
      // ถ้าคลิกที่ notification item ให้เก็บ state ไว้ชั่วคราวก่อนที่จะทำการนำทาง
      // อาจใช้ setTimeout เพื่อให้การนำทางเกิดขึ้นหลังจากการจัดการ state
      setTimeout(() => {
        this.isDropdownOpen = false;
      }, 100);
    }
  }

  // ngOnDestroy() {
  //   // ยกเลิก listener หรือทำความสะอาด state ต่างๆ
  // }

  async GetNotification() {
    if (!this.admin_data?.id) return;
  
    const body = {
      admin_id: this.admin_data.id,
    };
  
    try {
      const res: any = await this.service.Post('GetNotification', body);
      if (res.status_code === 8000) {
        this.notifications = res.data;
      }
    } catch (error) {
      console.error('GetNotification error:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      let body = {
        admin_id: this.admin_data.id
      }
      let res: any = await this.service.Post('MarkAllNotificationsAsRead', body);

      if (res.status_code == 8000) {
        // อัปเดตข้อมูลในโค้ด
        if (this.notifications) {
          this.notifications.unread_total = 0;
          this.notifications.notifications.forEach((item: any) => {
            item.is_read = true;
          });
        }
      } else {
        console.error('Error marking all as read:', res);
      }
    } catch (error) {
      console.error('Exception marking all as read:', error);
    }
  }

  async ReadNotification(notification: any): Promise<void> {
    try {
      // ทำเครื่องหมายว่าอ่านแล้ว
      const body = {
        notification_map_id: notification.notification_map_id,
      };
      console.log(body);
  
      // ส่ง request ไป mark ว่าอ่านแล้ว
      const res: any = await this.service.Post('ReadNotification', body);
  
      if (res.status_code === 8000) {
        // เช็กก่อนว่า notification นี้ยังไม่ได้อ่าน
        if (!notification.is_read) {
          notification.is_read = true;
  
          if (this.notifications) {
            this.notifications.unread_total = Math.max(0, this.notifications.unread_total - 1);
          }
        }
      } else {
        console.error('Error marking notification as read:', res);
      }
    } catch (error) {
      console.error('Exception marking notification as read:', error);
    } finally {
      // ไปยัง path ปลายทาง (force reload ด้วย query param t)
      this.router.navigateByUrl(`${notification.path}&t=${new Date().getTime()}`);
      this.isDropdownOpen = false;
    }
  }
  

  viewAllNotifications(): void {
    this.router.navigateByUrl('/notifications');
    this.isDropdownOpen = false;
  }

  getNotificationIcon(message: string): string {
    if (this.isRepairNotification(message)) {
      return 'build'; // ไอคอนสำหรับการแจ้งซ่อม
    } else if (message.includes('บิล') || message.includes('ค่าเช่า')) {
      return 'receipt'; // ไอคอนสำหรับบิล
    } else if (message.includes('แจ้งเรื่อง')){
      return 'announcement'; // ไอคอนสำหรับแจ้งเรื่อง
    } else if (message.includes('นัดหมาย')){
      return 'calendar_month'; // ไอคอนสำหรับแจ้งเรื่อง
    } else {
      return 'notifications'; // ไอคอนดีฟอลต์
    }
  }

  isRepairNotification(message: string): boolean {
    return message.includes('ซ่อม');
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'เมื่อสักครู่';
    } else if (diffMin < 60) {
      return `${diffMin} นาทีที่แล้ว`;
    } else if (diffHour < 24) {
      return `${diffHour} ชั่วโมงที่แล้ว`;
    } else if (diffDay < 7) {
      return `${diffDay} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

}
