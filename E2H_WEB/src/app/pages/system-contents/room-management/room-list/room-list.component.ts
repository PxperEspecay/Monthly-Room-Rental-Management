import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ServiceService } from 'src/app/service/service.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit {
  @ViewChild('collapseOne') collapseOne!: ElementRef;
  
  data: any = [
    {
      id: 1,
      room_number: 'A101',
      status_room: 'N',
      Renters: [
        {
          id: 39,
          img_profile: null,
          first_name: 'ศุภกร',
          last_name: 'สอาด',
          email: 'papaizeeweed@gmail.com',
          phone_number: '0824526978',
          role_id: 3,
          gender: 'F'
        },
        {
          id: 39,
          img_profile: null,
          first_name: 'ศุภกร',
          last_name: 'สอาด',
          email: 'papaizeeweed@gmail.com',
          phone_number: '0824526978',
          role_id: 4,
          gender: 'M'
        },
      ],
    },
    {
      id: 2,
      room_number: 'A102',
      status_room: 'N',
      Renters: [],
    },
    {
      id: 4,
      room_number: 'A103',
      status_room: 'Y',
      Renters: [],
    },
    {
      id: 5,
      room_number: 'A104',
      status_room: 'Y',
      Renters: [
        {
          id: 26,
          img_profile: 'uploads/img1730710022713-230877460IMG_4161.jpeg',
          first_name: 'วุ้นเส้น',
          last_name: 'อเมริกันติส',
          email: 'meowqqq@gmail.com',
          phone_number: '0853904721',
          role_id: 3,
        },
      ],
    },
    {
      id: 27,
      room_number: 'A108',
      status_room: 'N',
      Renters: [
        {
          id: 40,
          img_profile: null,
          first_name: 'กรรชัย',
          last_name: 'กรรชัย',
          email: 'numkanchai@gmail.com',
          phone_number: '0977777777',
          role_id: 3,
        },
      ],
    },
  ];

  admin_data : any = {}
  total_room : any
  available_room : any
  unavailable_room : any
  total_renter : any
  room_with_renter_list : any = []
  room_with_renter_list_filtered : any 
  location_list : any = []
  building_list : any = []
  building_id : any

  page : any = 1
  search_input: any = '';
  showDropdown: boolean = false;
  ckecked_all: boolean = false;
  room_status_list = [
    { status: 'Y', name: 'ว่าง', checked: false },
    { status: 'N', name: 'ไม่ว่าง', checked: false },
  ];

  constructor(private router: Router, private service: ServiceService) {

  }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();
    await this.GetMasterLocation()
    await this.GetMasterBuilding()
    await this.GetRoomsListWithRenter()
  }

  async GetMasterLocation(){
    let res:any = await this.service.Get('GetMasterLocation');
    if (res.status_code == 8000) {
      this.location_list = res.data
    }
  }
  async GetMasterBuilding(){
    let body = {
      community_id : this.admin_data.location
    }

    let res:any = await this.service.Post('GetMasterBuildings',body);
    if (res.status_code == 8000) {
      this.building_list = res.data
      console.log(this.building_list,'master building');
      
    }
  }


  async GetRoomsListWithRenter() {
    const body: any = {
      community_id: this.admin_data.location,
      building_id: parseInt(this.building_id)
    };
  
    const res: any = await this.service.Post('GetRoomsListWithRenter', body);
  
    if (res.status_code == 8000) {
      const data = res.data;
  
      // ✅ สรุปข้อมูล summary
      this.total_room = data.total_room;
      this.available_room = data.available_room;
      this.unavailable_room = data.unavailable_room;
      this.total_renter = data.total_renter;
  
      // ✅ กำหนดข้อมูล list หลักและ clone สำหรับ filtered
      this.room_with_renter_list = data.room_with_renter;
      this.room_with_renter_list_filtered = JSON.parse(JSON.stringify(data.room_with_renter));
  
      // ✅ แปลง URL รูปภาพใน room_with_renter_list
      this.room_with_renter_list.forEach((room: { Renters: any[] }) => {
        if (room.Renters && room.Renters.length > 0) {
          room.Renters.forEach(renter => {
            if (renter.img_profile) {
              renter.img_profile = environment.endpoint_img + renter.img_profile;
            }
          });
        }
      });
  
      // ✅ แปลง URL รูปภาพใน room_with_renter_list_filtered
      this.room_with_renter_list_filtered.forEach((room: { Renters: any[] }) => {
        if (room.Renters && room.Renters.length > 0) {
          room.Renters.forEach(renter => {
            if (renter.img_profile) {
              renter.img_profile = environment.endpoint_img + renter.img_profile;
            }
          });
        }
      });
  
      // ✅ (Optional) เรียก filter ครั้งแรกเลย
      this.UpdateListType();
    }
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

}
