import 'dart:developer';
import 'dart:io';
import 'package:google_fonts/google_fonts.dart';
import 'package:path/path.dart';
import 'package:dio/dio.dart';

import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:e2h_app/screens/page/setting_screen.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:get/get_connect/http/src/multipart/form_data.dart' as get_form;
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:url_launcher/url_launcher.dart';

class PhonebookPage extends StatefulWidget {
  const PhonebookPage({super.key});

  @override
  State<PhonebookPage> createState() => _PhonebookPageState();
}

class _PhonebookPageState extends State<PhonebookPage> {
  bool isFacebookLinked = false;
  bool isAppleLinked = false;
  late String token = "";
  late String community_id = "";
  late String prefix = "";
  late String first_name = "";
  late String last_name = "";
  late String gender = "";
  late String birth_date = "";
  late String email = "";
  late String phone_number = "";
  late String img_profile = "";
  late String start_contract = "";
  late String end_contract = "";
  late String remaining_contract = "";
  late String file_contract = "";
  late String file_name = "";
  late String office_phone_number = '';
  dynamic admin_phones_list = [];

  @override
  void initState() {
    super.initState();
    getString().then((value) {
      GetPhoneList(community_id: int.parse(value));
    });
  }

  Future<dynamic> getString() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token')!;
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    community_id = decodedToken['community_id'].toString();
    return community_id;
  }

  Future<void> _makePhoneCall(String number) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: number,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      throw 'ไม่สามารถโทรออกได้';
    }
  }

  Future<dynamic> GetPhoneList({required int community_id}) async {
    var body = {'community_id': community_id};
    EasyLoading.show(dismissOnTap: false);
    var res = await Services().Dio_post('GetPhoneList', body);
    EasyLoading.dismiss();

    if (res['status_code'] == 8000) {
      setState(() {
        office_phone_number = res['data']['office_phone_number'];
        admin_phones_list = res['data']['admin_phones'];
      });
    }
    return res;
  }

  String _formatThaiDate(String date) {
    try {
      final DateTime parsedDate = DateTime.parse(date);
      final int buddhistYear = parsedDate.year + 543;
      const List<String> thaiMonths = [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.'
      ];
      final String thaiMonth = thaiMonths[parsedDate.month - 1];
      return '${parsedDate.day.toString().padLeft(2, '0')} $thaiMonth $buddhistYear';
    } catch (e) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Color.fromRGBO(0, 102, 102, 0.71),
                Color.fromRGBO(0, 102, 102, 1)
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),
        title: Text(
          'สมุดโทรศัพท์',
          style: GoogleFonts.prompt(
            fontWeight: FontWeight.bold,
            fontSize: 24,
            color: Colors.white,
          ),
        ),
      ),
      body: SingleChildScrollView(child: Padding(
        padding: EdgeInsets.only(left: 6.w, top: 2.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'เบอร์โทรสำนักงาน',
              style: GoogleFonts.prompt(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  office_phone_number,
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                    onPressed: () {
                      _makePhoneCall(office_phone_number);
                    },
                    icon: Icon(
                      Icons.phone,
                      color: Colors.teal,
                    )),
              ],
            ),
            Divider(),
            Text(
              'เบอร์โทรผู้ดูแลห้องเช่า',
              style: GoogleFonts.prompt(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal),
            ),
            ...admin_phones_list.asMap().entries.map((entry) {
              int index = entry.key;
              var admin = entry.value;

              final fullName =
                  '${admin["prefix"]} ${admin["first_name"]} ${admin["last_name"]}';
              final phone = admin["phone_number"];

              return Padding(
                padding: EdgeInsets.symmetric(vertical: 1.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ผู้ดูแล ${index + 1}:',
                      style: GoogleFonts.prompt(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(left: 3.w),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  fullName,
                                  style: GoogleFonts.prompt(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  phone,
                                  style: const TextStyle(color: Colors.grey),
                                ),
                              ],
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () => _makePhoneCall(phone),
                          icon: const Icon(Icons.phone, color: Colors.teal),
                        ),
                      ],
                    ),
                    Divider(),
                    // เส้นคั่นระหว่างผู้ดูแล
                  ],
                ),
              );
            }).toList(),
            Text(
              'เบอร์โทรฉุกเฉิน',
              style: GoogleFonts.prompt(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.redAccent,
              ),
            ),
            SizedBox(height: 1.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '191 (เหตุด่วนเหตุร้าย)',
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.redAccent),
                  onPressed: () => _makePhoneCall('191'),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '199 (เหตุไฟไหม้/ดับเพลิง)',
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.redAccent),
                  onPressed: () => _makePhoneCall('199'),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '1669 (แพทย์ฉุกเฉิน)',
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.redAccent),
                  onPressed: () => _makePhoneCall('1669'),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '1646 (แพทย์ฉุกเฉิน กทม.)',
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.redAccent),
                  onPressed: () => _makePhoneCall('1646'),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '1554 (หน่วยแพทย์กู้ชีวิต)',
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.redAccent),
                  onPressed: () => _makePhoneCall('1554'),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '1667 (สายด่วนกรมสุขภาพจิต)',
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.redAccent),
                  onPressed: () => _makePhoneCall('1667'),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '1192 (ศูนย์ปราบปรามการโจรกรรมรถ)',
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.redAccent),
                  onPressed: () => _makePhoneCall('1192'),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '1196 (พบเจออุบัติเหตุทางน้ำ)',
                  style: const TextStyle(color: Colors.grey),
                ),
                IconButton(
                  icon: const Icon(Icons.phone, color: Colors.redAccent),
                  onPressed: () => _makePhoneCall('1196'),
                ),
              ],
            ),
      SizedBox(height: 5.h),

          ],
          
        ),
        
      ),
      
      )
    );
  }

  ListTile buildListTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon, color: Colors.teal),
      title: Text(
        title,
        style: GoogleFonts.prompt(fontSize: 16, fontWeight: FontWeight.bold),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.prompt(fontSize: 14, color: Colors.grey),
      ),
    );
  }

  String getThaiMonth(int month) {
    const thaiMonths = [
      '',
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พฤศจิกายน',
      'ธันวาคม'
    ];
    return thaiMonths[month];
  }

  String formatThaiDate(String date) {
    if (date.isEmpty) return '-';

    DateTime parsedDate = DateTime.parse(date);
    String day = DateFormat('d').format(parsedDate); // วันที่ (10)
    String month = getThaiMonth(parsedDate.month); // ก.พ.
    String year = (parsedDate.year + 543).toString(); // พ.ศ.

    return '$day $month $year';
  }

  String formatTime(String date) {
    if (date.isEmpty) return '-';

    DateTime parsedDate = DateTime.parse(date);
    String time = DateFormat('HH:mm').format(parsedDate); // วันที่ (10)

    return time;
  }
}
