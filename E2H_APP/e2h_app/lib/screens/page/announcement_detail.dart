import 'dart:developer';
import 'dart:io';
import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:e2h_app/screens/page/noti_page.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:path/path.dart';
import 'package:dio/dio.dart';

import 'package:e2h_app/service/service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:intl/intl.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';

class AnnouncementDetail extends StatefulWidget {
  final int id;
  final String flag_page;
  const AnnouncementDetail(
      {super.key, required this.id, required this.flag_page});

  @override
  State<AnnouncementDetail> createState() => _AnnouncementDetailState();
}

class _AnnouncementDetailState extends State<AnnouncementDetail> {
  bool isFacebookLinked = false;
  bool isAppleLinked = false;
  late String token = "";
  late String id = "";
  late String banner_announcement = "";
  late String title_announcement = "";
  late String body_announcement = "";
  late String updatedAt = "";
  // late String title_announcement = "";
  // late String title_announcement = "";

  @override
  void initState() {
    super.initState();
    getString();
    GetAnnouncementDetails();
  }

  Future<dynamic> getString() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token')!;
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    id = decodedToken['id'].toString();
    return id;
  }

  Future<dynamic> GetAnnouncementDetails() async {
    var body = {'id': widget.id};
    EasyLoading.show(dismissOnTap: false);
    var res = await Services().Dio_post('GetAnnouncementDetails', body);
    EasyLoading.dismiss();

    if (res['status_code'] == 8000) {
      setState(() {
        banner_announcement = res['data']['banner_announcement'];
        title_announcement = res['data']['title_announcement'] ?? '-';
        body_announcement = res['data']['body_announcement'] ?? '-';
        updatedAt = res['data']['updatedAt'] ?? '-';
      });
    }
    return res;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios),
          onPressed: () {
            if (widget.flag_page == 'noti') {
              Get.offAll(NotiPage(
                flag_page: 'AnnouncementDetail',
              ));
            } else {
              Get.offAll(Bottombar(currentIndex: 1));
            }
          },
        ),
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
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(0), // ปรับค่าตามต้องการ
              bottomRight: Radius.circular(0),
            ),
          ),
        ),
        title: Text(
          'รายละเอียดประกาศ',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
      ),
      body: SingleChildScrollView(
        // ใช้ SingleChildScrollView เพื่อเลื่อนเนื้อหา
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            banner_announcement != null && banner_announcement != ''
                ? Image.network(
                    'http://172.20.10.3:3000/$banner_announcement',
                    fit: BoxFit.fill,
                    width: 100.w,
                    height: 20.h,
                  )
                : Image.asset(
                    'asset/image/img_defult.png',
                    fit: BoxFit.fill,
                    width: 100.w,
                    height: 20.h,
                  ),
            const SizedBox(height: 16),
            Text(
              title_announcement,
              style:
                  GoogleFonts.prompt(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              body_announcement,
              style: GoogleFonts.prompt(fontSize: 16),
            ),
            SizedBox(
              height: 2.h,
            ),
            Row(
              children: [
                const Spacer(), // ดันไปขวาสุด
                Text(
                  '${formatThaiDate(updatedAt)} ${formatTime(updatedAt)} น.',
                  style: GoogleFonts.prompt(
                    fontSize: 16,
                    color: Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ],
        ),
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
