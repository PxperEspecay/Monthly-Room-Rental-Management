import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';
import moment from 'moment';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-renter-list',
  templateUrl: './renter-list.component.html',
  styleUrls: ['./renter-list.component.css']
})
export class RenterListComponent implements OnInit{

  listTab = 1
  mode :any = 'card'
  page: number = 1;
  itemsPerPage:any = 10;

  admin_data : any = {}
  renter_list : any = {}
  history_renter_list : any = {}
  location_list : any = []
  building_list : any = []
  building_id : any = 0

  renter_data: any = [
    {
      no: 1,
      fullname: 'วชิราพร โทณผลิน',
      room: 'A101',
      floor: '1',
      phone: '0970400658',
      activation : 'U',
      contact_start_date : '01 ม.ค. 2024',
      contact_end_date : '31 ธ.ค. 2024',
      contact_day : 7,
      profile_image_path : 'assets/images/1page.png',
    },
    {
      no: 2,
      fullname: 'ศุภกฤต สอาด',
      room: 'A102',
      floor: '1',
      phone: '0853904721',
      activation : 'C',
      contact_start_date : '01 ม.ค. 2024',
      contact_end_date : '31 ธ.ค. 2024',
      contact_day : 19,
      profile_image_path : 'assets/images/switzerland2.jpg',
    },
    {
      no: 3,
      fullname: 'วุ้นเส้น แมวน่ารัก',
      room: 'A103',
      floor: '1',
      phone: '0853904721',
      activation : 'U',
      contact_start_date : '01 ม.ค. 2024',
      contact_end_date : '31 ธ.ค. 2024',
      contact_day : 22,
      profile_image_path : 'assets/images/pink-house2.jpeg',
    },
    {
      no: 4,
      fullname: 'กีกี้ แมวส้ม',
      room: 'A104',
      floor: '1',
      phone: '0853904721',
      activation : 'U',
      contact_start_date : '01 ม.ค. 2024',
      contact_end_date : '31 ธ.ค. 2024',
      contact_day : 151,
      profile_image_path : 'assets/images/yellow-house2.jpg',
    },
    {
      no: 5,
      fullname: 'ศุภกฤต สอาด',
      room: 'A105',
      floor: '1',
      phone: '0853904721',
      activation : 'U',
      contact_start_date : '01 ม.ค. 2024',
      contact_end_date : '31 ธ.ค. 2024',
      contact_day : 157,
    },
    {
      no: 6,
      fullname: 'ศุภกฤต สอาด',
      room: 'A106',
      floor: '1',
      phone: '0853904721',
      activation : 'U',
      contact_start_date : '01 ม.ค. 2024',
      contact_end_date : '31 ธ.ค. 2024',
      contact_day : 169,
    },
    {
      no: 7,
      fullname: 'ศุภกฤต สอาด',
      room: 'A107',
      floor: '1',
      phone: '0853904721',
      activation : 'U',
      contact_start_date : '01 ม.ค. 2024',
      contact_end_date : '31 ธ.ค. 2024',
      contact_day : 171,
    },
    {
      no: 8,
      fullname: 'ศุภกฤต สอาด',
      room: 'A108',
      floor: '1',
      phone: '0853904721',
      activation : 'U',
      contact_start_date : '01 ม.ค. 2024',
      contact_end_date : '31 ธ.ค. 2024',
      contact_day : 180,
    },
    
  ]

  
  constructor(private router: Router, private service: ServiceService){

  }

  async ngOnInit(): Promise<void> {
    this.admin_data = await this.service.GetUser();

    await this.GetMasterLocation()
    await this.GetMasterBuilding()
    await this.GetRenterList()
    await this.GetHistoryRenterList()
    this.readAnimail()
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

  CreateNewRenter(){
    this.router.navigate(['./renter-management/create-new-renter']);
  }

  DetailsRenter(renter_id:any){
    this.router.navigate(['./renter-management/details'], {
      queryParams: {
        id: renter_id,
      }
    });
  }

  async DeleteRenter(id:any,room_id:any) {
    let body: any = {
      id : id,
      room_id : room_id
    }
    console.log(body,'QQQ');
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
        let res:any = await this.service.Post('DeleteRenter',body);
        if (res.status_code == 8000) {
          Swal.fire({
            title: `<b style="color:#50c878;" class="fs-3">ลบข้อมูลสำเร็จ</b>`,
            text: 'ลบข้อมูลผู้เช่าคนนี้เรียบร้อยแล้ว',
            icon: 'success',
            reverseButtons: true,
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'ยืนยัน',
            customClass: {
              confirmButton: 'alert-btn-confirm',
            }
          }).then((result)=>{
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

  async GetRenterList() {
    let body = {
      community_id: this.admin_data.location,
      building_id : parseInt(this.building_id) 
    };
  
    let res: any = await this.service.Post('GetRenterList', body);
    if (res.status_code == 8000) {
      this.renter_list = res.data;
      for (let i = 0; i < this.renter_list.length; i++) {
        if (this.renter_list[i].start_contract) {
          this.renter_list[i].start_contract = this.formatThaiDate(this.renter_list[i].start_contract);
        }
        if (this.renter_list[i].end_contract) {
          this.renter_list[i].end_contract = this.formatThaiDate(this.renter_list[i].end_contract);
        }
        if (this.renter_list[i].img_profile) {
          this.renter_list[i].img_profile  = environment.endpoint_img + this.renter_list[i].img_profile;
        }
      }
      console.log(this.renter_list, 'renter list');
    }
  }

  async GetHistoryRenterList() {
    let body = {
      community_id: this.admin_data.location,
      building_id : parseInt(this.building_id) 
    };
  
    let res: any = await this.service.Post('GetHistoryRenterList', body);
    if (res.status_code == 8000) {
      this.history_renter_list = res.data;
      for (let i = 0; i < this.history_renter_list.length; i++) {
        if (this.history_renter_list[i].start_contract) {
          this.history_renter_list[i].start_contract = this.formatThaiDate(this.history_renter_list[i].start_contract);
        }
        if (this.history_renter_list[i].end_contract) {
          this.history_renter_list[i].end_contract = this.formatThaiDate(this.history_renter_list[i].end_contract);
        }
        if (this.history_renter_list[i].img_profile) {
          this.history_renter_list[i].img_profile  = environment.endpoint_img + this.history_renter_list[i].img_profile;
        }
      }
      console.log(this.history_renter_list, 'renter list');
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

  animals = ["Rabbit","Dog","Cat","Bird","Monkey"]
  readAnimail(){
    console.log(this.animals.splice(0,2,"Elephen"));
    console.log(this.animals);

  let newGroupAnimals = this.animals.slice()
  console.log('นี่คือ new group animals',newGroupAnimals);

  const originals = [10,20,30]
  
  const copy = [...originals]
  copy.push(40,50)
  console.log('This Copy :',copy);
  console.log('This Originals :',originals);
  
  const user = {
    name : 'Pipe',
    age : 18
  }
  const copyUser = {...user}
  console.log('Copy Object :',copyUser);
  
  

  }
  
 
}
