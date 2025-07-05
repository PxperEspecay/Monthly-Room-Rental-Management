import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js'

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  Swal(arg0: string, arg1: string, arg2: string) {
    throw new Error('Method not implemented.');
  }
  secretKey = 'jwtsecret';
  sessionKey = 'e2h_cms';
  constructor(private http: HttpClient, private router: Router) { }

  async SetUser(data: any) {
    // console.log("Setting user data:", data); // เพิ่ม log
    sessionStorage.setItem(
      `userData-${this.sessionKey}`,
      this.encrypt(JSON.stringify(data))
    );
  }





  async SetToken(token: string) {
    sessionStorage.setItem(`accessData-${this.sessionKey}`, token);
  }

  async GetUser() {
    const item = sessionStorage.getItem(`userData-${this.sessionKey}`);
    if (item) {
      let d = this.decrypt(item);
      if (d) {
        return JSON.parse(d);
      }
    }
    return null; // หรือ return ''; ขึ้นอยู่กับความต้องการของคุณ
  }
  async GetRoleUser() {
    const user = await this.GetUser(); // ฟังก์ชันที่ดึงข้อมูลผู้ใช้จาก session หรือ local storage
    if (user && user.role) {
      return { role: user.role }; // ส่งคืนบทบาทของผู้ใช้ เช่น 'admin' หรือ 'super admin'
    }
    return null;
  }

  async GetToken() {
    const token = sessionStorage.getItem(`accessData-${this.sessionKey}`);
    // console.log("Current sessionKey:", this.sessionKey);
    // console.log("Retrieved token:", token);
    return token

  }

  encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();
  }

  decrypt(textToDecrypt: string) {
    let dep;
    try {
      dep = CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(
        CryptoJS.enc.Utf8
      );
      return dep;
    } catch (e) {
      // this.Swal(e, 'error', '');
      // sessionStorage.clear();
    }
    return dep;
  }

  async SetPermission(data: any) {
    sessionStorage.setItem(
      `Permission-${this.sessionKey}`,
      JSON.stringify(data)
    );
  }

  async GetPermission() {
    let d = sessionStorage.getItem(`Permission-${this.sessionKey}`);
    if (d) {
      return JSON.parse(d);
    }
    return '';
  }

  clearToken(code: any) {
    sessionStorage.removeItem(code);
  }

  Logout() {
    sessionStorage.clear();
    window.location.href = '/login';
  }

  async Post(path: any, body: any, paramHeader = null) {
    return new Promise(async (resolve, reject) => {
      let header = new HttpHeaders();
      if (paramHeader) {
        header = new HttpHeaders().append(
          'Authorization',
          'Bearer ' + paramHeader
        );
      } else {
        header = new HttpHeaders().append(
          'Authorization',
          'Bearer ' + await this.GetToken()
        );
      }
      this.http
        .post<any>(`${environment.endpoint}${path}`, body, { headers: header })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (error) => {
            resolve(false);
          }
        );
    });
  }

  //   async Get(path: string, tokenParam: string | null = null): Promise<any> {
  //     const token = tokenParam || await this.GetToken();
  //     console.log("Sending token:", token); // เพิ่มบรรทัดนี้เพื่อตรวจสอบ
  //     const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
  //     try {
  //         const response = await this.http.get<any>(`${environment.endpoint}${path}`, { headers }).toPromise();
  //         return response;
  //     } catch (error) {
  //         console.error("Error:", error); // เพิ่มบรรทัดนี้เพื่อดู error
  //         throw error;  
  //     }
  // }




  async Get(path: any, tokenParam = null) {
    return new Promise(async (resolve, reject) => {
      let header = new HttpHeaders();
      if (tokenParam) {
        header = new HttpHeaders().append(
          'Authorization',
          'Bearer ' + tokenParam
        );
      } else {
        header = new HttpHeaders().append(
          'Authorization',
          'Bearer ' + await this.GetToken()
        );
      }
      this.http
        .get<any>(`${environment.endpoint}${path}`, { headers: header })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }

  async AlertSuccessNoHref(getTitle: any, getText: any, getIcon: any) {
    await Swal.fire({
      customClass: {
        icon: 'swal-send-ic',
        confirmButton: 'btn-swal-success-blue2',
      },
      title: getTitle,
      text: getText,
      iconHtml:
        "<img src='assets/alert-icons/" + getIcon + ".png'class='swal-icon-size'",

      showCloseButton: true,
      confirmButtonText: 'Done',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.close();
      } else return;
    });
  }

  Href(path: any) {
    window.location.href = path;
  }

  async AlertSuccess(getTitle: any, getText: any, getIcon: any, Fx: any) {
    await Swal.fire({
      customClass: {
        icon: 'swal-send-ic',
        confirmButton: 'btn-swal-success-blue2',
      },
      title: getTitle,
      text: getText,
      iconHtml:
        "<img src='assets/icons/" + getIcon + ".png'class='swal-icon-size'",
      showCloseButton: true,
      confirmButtonText: 'Done',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (Fx !== null) {
          this.Href(Fx);
        } else return;
      } else return;
    });
  }

  async isLoggedIn(): Promise<boolean> {
    const token = sessionStorage.getItem(`accessData-${this.sessionKey}`)
    return !!token;  // ถ้ามี token แสดงว่าล็อกอิน
  }

  async change_year(format: any) {
    let christianYear: any = moment(format).format('YYYY');
    var buddhishYear: any = (parseInt(christianYear) + 543).toString();
    return moment(
      moment()
        .format(
          format
            .replace('YYYY', buddhishYear)
            .replace('YY', buddhishYear.substring(2, 4))
        )
        .replace(christianYear, buddhishYear)
    )
      .locale('th')
      .format('DD MMM YYYY');
  }


}
