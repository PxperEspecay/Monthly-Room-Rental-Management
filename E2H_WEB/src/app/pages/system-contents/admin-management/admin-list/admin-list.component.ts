import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ServiceService } from 'src/app/service/service.service';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  page: number = 1;
  itemsPerPage: any = 10;
  admin_data: any = []
  admin_list: any = []


  constructor(private router: Router, private service: ServiceService) {

  }

  ngOnInit(): void {
    this.GetAdminList()
  }

  async GetAdminList() {
    let res: any = await this.service.Get('GetAdminList');
    if (res.status_code == 8000) {
      this.admin_list = res.data
      for (let index = 0; index < this.admin_list.length; index++) {
        this.admin_list[index]['order'] = index + 1;
        this.admin_list[index]['fullname'] = this.admin_list[index]['first_name'] + ' ' + this.admin_list[index]['last_name'];
      }
    }
    console.log('All Admin List', this.admin_list);

  }

  CreateAdmin() {
    this.router.navigate(['./admin-management/create-admin']);
  }

  DetailsAdmin(id: any,) {
    this.router.navigate(['./admin-management/details'], {
      queryParams: {
        id: id,
      }
    });
  }

  async DeleteAdmin() {
    let body: any = null
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
        Swal.fire({
          title: `<b style="color:#50c878;" class="fs-3">ลบข้อมูลสำเร็จ</b>`,
          text: 'ลบข้อมูลผู้ดูแลระบบคนนี้เรียบร้อยแล้ว',
          icon: 'success',
          reverseButtons: true,
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'ยืนยัน',
          customClass: {
            confirmButton: 'alert-btn-confirm',
          }
        })
      } else {
        return;
      }
    });
  }

  // ShowAgreementDetails2(
  //   user_type_name: any,
  //   agreement_type_name: any,
  //   id: any,
  //   agreement_type_id: any,
  //   user_type_id: any
  // ): void {
  //   this.router.navigate(['/agreement-request/details'], {
  //     queryParams: {
  //       user_type_name: user_type_name,
  //       agreement_type_name: agreement_type_name,
  //       id: id,
  //       agreement_type_id: agreement_type_id,
  //       user_type_id: user_type_id
  //     }
  //   });
  // }


}
