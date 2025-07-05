import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thaiDate'
})
export class ThaiDatePipe implements PipeTransform {
  transform(value: { year: number, month: number } | number, year?: number): string {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 
      'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 
      'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
  
    if (typeof value === 'object' && value?.year && value?.month) {
      year = value.year;
      value = value.month;
    }
  
    if (typeof value !== 'number' || !year) {
      return '-';
    }
  
    const thaiMonth = thaiMonths[value - 1]; // แปลงเดือน
    const thaiYear = year + 543; // แปลงปี
  
    return `${thaiMonth} ${thaiYear}`;
  }

}
