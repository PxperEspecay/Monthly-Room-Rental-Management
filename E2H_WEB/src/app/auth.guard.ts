import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ServiceService } from './service/service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  
  constructor(private service: ServiceService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const userRoleData = await this.service.GetRoleUser(); // ดึงข้อมูลบทบาทผู้ใช้
    // console.log('User Role Data:', userRoleData); // ตรวจสอบว่าได้ข้อมูลบทบาทผู้ใช้ถูกต้อง
  
    if (userRoleData && userRoleData.role) {
      const userRole = userRoleData.role;
      // console.log('User Role:', userRole); // ตรวจสอบบทบาทผู้ใช้ที่ดึงมา
    
      if (route.data['role']) {
        console.log('Route Roles:', route.data['role']); // ตรวจสอบบทบาทที่กำหนดในเส้นทาง
        if (route.data['role'].includes(userRole)) {
          return true; // ให้เข้าถึงเส้นทางนี้
        } else {
          alert('You don’t have permission to access this page.');
          return false;
        }
      }
    }
  
    return true;
  }
  


}
