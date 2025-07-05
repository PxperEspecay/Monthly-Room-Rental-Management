import 'dart:developer';
import 'dart:io';
import 'package:flutter/services.dart';
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

class MyroomPage extends StatefulWidget {
  const MyroomPage({super.key});

  @override
  State<MyroomPage> createState() => _MyroomPageState();
}

class _MyroomPageState extends State<MyroomPage> {
  bool isFacebookLinked = false;
  bool isAppleLinked = false;
  late String token = "";
  late String id = "";
  late String location = "";
  late String community_id = "";
  late String room_number = "";
  late String floor = "";
  late String building_name = "";
  dynamic address_list = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    getString();
  }

  Future<dynamic> getString() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token')!;
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    id = decodedToken['id'].toString();
    location = decodedToken['location'].toString();
    community_id = decodedToken['community_id'].toString();
    GetLocationDetail(
        community_id: int.parse(community_id), renter_id: int.parse(id));
    return id;
  }

  Future<dynamic> GetLocationDetail(
      {required int community_id, required int renter_id}) async {
    var body = {"community_id": community_id, "renter_id": renter_id};
    EasyLoading.show(dismissOnTap: false);
    var res = await Services().Dio_post('GetLocationDetail', body);
    EasyLoading.dismiss();

    if (res['status_code'] == 8000) {
      setState(() {
        room_number = res['data']['room_number'];
        floor = res['data']['floor'].toString();
        building_name = res['data']['building_name'];
        address_list = res['data']['address'];
        // isLoading = false;
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
          'ห้องของฉัน',
          style: GoogleFonts.prompt(
            fontWeight: FontWeight.bold,
            fontSize: 24,
            color: Colors.white,
          ),
        ),
      ),
      body: address_list == null || address_list.isEmpty
    ? const SizedBox() // หรือ Container(), หรือ Loading UI แบบอื่น
    : SingleChildScrollView(
        child: Column(
          children: [
            Image.asset(
              'asset/image/icon-home-myroom_details.png',
              width: 25.w,
              height: 25.h,
            ),
            Text(
              location,
              style: GoogleFonts.prompt(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            SizedBox(height: 1.h),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildTransferDetailsCard(),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransferDetailsCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 5,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'ข้อมูลที่อยู่',
              style: GoogleFonts.prompt(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal),
            ),
            Builder(
              builder: (context) {
                final String fullAddress =
                    '$location $room_number ชั้น $floor $building_name '
                    'ถนน ${address_list['street']} หมู่ ${address_list['address_moo']} '
                    'ต. ${address_list['sub_district']} อ. ${address_list['district']} '
                    'จ. ${address_list['province']} ${address_list['zip_code']}';

                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SizedBox(
                      width: 70.w,
                      child: Text(
                        fullAddress,
                        style: GoogleFonts.prompt(fontSize: 16),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: fullAddress));
                        showCopiedToast(context);
                      },
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void showCopiedToast(BuildContext context) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.7),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Text(
            'คัดลอกสำเร็จ',
            style: TextStyle(color: Colors.white, fontSize: 16),
          ),
        ),
      ),
    );

    overlay.insert(overlayEntry);

    Future.delayed(const Duration(milliseconds: 1000), () {
      overlayEntry.remove();
    });
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
