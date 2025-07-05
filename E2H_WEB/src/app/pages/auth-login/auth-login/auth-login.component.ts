import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { jwtDecode } from "jwt-decode";
import { ServiceService } from 'src/app/service/service.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.css']
})
export class AuthLoginComponent implements OnInit {

  res: any = {
    id: 112,
    type_id: 1,
    type_name: 'admin'
  }

  body_login: any = {
    username: '',
    password: ''
  }

  constructor(private service: ServiceService,) {

  }

  ngOnInit(): void {

  }

  async Login01() {
    // console.log(this.body_login, 'AAAAA');

    let res: any = await this.service.Post('login', this.body_login);
    if (res.status_code == 8000) {
      // console.log(res.data);

      await this.service.SetToken(res.data.token);
      const decoded: any = jwtDecode(res.data.token);
      console.log(decoded,'decode');
      
      // ตรงนี้ไม่ต้องทำ JSON.parse เพราะ decoded เป็น Object แล้ว
      await this.service.SetUser(decoded); // ส่ง decoded ไปเลย
      // await sessionStorage.setItem('menu_name','User management')
      if (decoded.role == 'admin') {
        window.location.href = './renter-management';
      }
      if (decoded.role == 'super admin') {
        window.location.href = './admin-management';
      }
    } else {
      this.service.AlertSuccessNoHref(
        'Username or password are incorrect',
        '',
        'Alert/icon-red-alert'
      );
    }
  }

  async Login02(){
    console.log(this.body_login,'AAAAA');
    // return
    let res:any = await this.service.Post('login',this.body_login);
    if (res.status_code == 8000) {
      console.log(res.data);
      
      await this.service.SetToken(res.data.token);
      const decoded: any = jwtDecode(res.data.token);
      await this.service.SetUser(JSON.parse(decoded.credential_data));
      // await sessionStorage.setItem('menu_name','User management')
      window.location.href = './building-management';
    } else {
      this.service.AlertSuccessNoHref(
        'Username or password are incorrect',
        '',
        'Alert/icon-red-alert'
      );
    }
  }


  Login(type_name: any) {
    if (type_name == 'super admin') {
      window.location.href = './building-management'
    }
    if (type_name == 'admin') {
      window.location.href = './renter-management'
    }
  }

  LoginSuperAdmin() {
    window.location.href = './building-management'
  }

  LoginAdmin() {
    window.location.href = './renter-management'
  }

}
