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

class ContractRentalScreen extends StatefulWidget {
  const ContractRentalScreen({super.key});

  @override
  State<ContractRentalScreen> createState() => _ContractRentalScreenState();
}

class _ContractRentalScreenState extends State<ContractRentalScreen> {
  bool isFacebookLinked = false;
  bool isAppleLinked = false;
  late String token = "";
  late String id = "";
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

  @override
  void initState() {
    super.initState();
    getString().then((value) {
      GetRenterDetails(id: int.parse(value));
      GetDetailContract(id: int.parse(value));
    });
  }

  

  Future<dynamic> getString() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token')!;
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    id = decodedToken['id'].toString();
    return id;
  }

  Future<dynamic> GetRenterDetails({required int id}) async {
    var body = {'id': id};
    EasyLoading.show(dismissOnTap: false);
    var res = await Services().Dio_post('GetRenterDetails', body);
    EasyLoading.dismiss();

    if (res['status_code'] == 8000) {
      setState(() {
        prefix = res['data']['prefix'];
        first_name = res['data']['first_name'];
        last_name = res['data']['last_name'];
        gender = res['data']['gender'];
        birth_date = _formatThaiDate(res['data']['birth_date']);
        email = res['data']['email'];
        phone_number = res['data']['phone_number'];
        img_profile = res['data']['img_profile'] ?? 'assets/icon_avtar_men.png';
      });
    }
    return res;
  }

  Future<dynamic> GetDetailContract({required int id}) async {
    var body = {'id': id};
    EasyLoading.show(dismissOnTap: false);
    var res = await Services().Dio_post('GetDetailContract', body);
    EasyLoading.dismiss();
    if (res['status_code'] == 8000) {
      setState(() {
        start_contract = res['data']['start_contract'];
        end_contract = res['data']['end_contract'];
        file_contract = res['data']['file_contract'];
        file_name = file_contract.split('/').last;
        remaining_contract = res['data']['remaining_contract'].toString();
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
          'สัญญาเช่า',
          style: GoogleFonts.prompt(
            fontWeight: FontWeight.bold,
            fontSize: 24,
            color: Colors.white,
          ),
        ),
      ),
      body: img_profile.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundImage: img_profile.isNotEmpty
                            ? NetworkImage(
                                'http://172.20.10.3:3000/$img_profile')
                            : const AssetImage('asset/image/logo-main.PNG')
                                as ImageProvider,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "$first_name $last_name",
                    style: GoogleFonts.prompt(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 3.h),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      buildListTile(Icons.today, 'วันที่เริ่มสัญญาเช่า',
                          formatThaiDate(start_contract)),
                      buildListTile(
                          Icons.calendar_today,
                          'วันที่สิ้นสุดสัญญาเช่า',
                          formatThaiDate(end_contract)),
                      buildListTile(Icons.access_alarm, 'ระยะเวลาที่เหลือสัญญา',
                          '$remaining_contract วัน'),
                      Padding(
                        padding: EdgeInsets.only(left: 4.w),
                        child: Row(
                          children: [
                            Icon(Icons.picture_as_pdf, color: Colors.teal),
                            SizedBox(
                              width: 3.w,
                            ),
                            Text(
                              'สัญญาเช่า',
                              style: GoogleFonts.prompt(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.only(left: 3.w),
                        child: TextButton(
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (context) => Dialog(
                                insetPadding: const EdgeInsets.all(16),
                                child: Stack(
                                  children: [
                                    // กล่องหลักของ PDF viewer
                                    SizedBox(
                                      width: MediaQuery.of(context).size.width *
                                          0.9,
                                      height:
                                          MediaQuery.of(context).size.height *
                                              0.8,
                                      child: SfPdfViewer.network(
                                        'http://172.20.10.3:3000/$file_contract',
                                      ),
                                    ),

                                    // ปุ่มกากบาท ปิด Dialog
                                    Positioned(
                                      top: 8,
                                      right: 8,
                                      child: GestureDetector(
                                        onTap: () =>
                                            Navigator.of(context).pop(),
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color:
                                                Colors.black.withOpacity(0.6),
                                            shape: BoxShape.circle,
                                          ),
                                          padding: const EdgeInsets.all(6),
                                          child: const Icon(
                                            Icons.close,
                                            color: Colors.white,
                                            size: 20,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                          child: Text(
                            file_name,
                            style: GoogleFonts.prompt(
                              fontSize: 18,
                              color: Colors.blueAccent,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.only(top: 6.h),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            SizedBox(
                              width: 45.w,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.redAccent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  minimumSize: const Size(double.infinity, 50),
                                ),
                                onPressed: () {},
                                child: Text(
                                  'ยกเลิกสัญญาเช่า',
                                  style: GoogleFonts.prompt(
                                    fontSize: 16,
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(
                              width: 45.w,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor:
                                      int.parse(remaining_contract) < 30
                                          ? const Color(0xFF008388)
                                          : Colors.grey,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  minimumSize: const Size(double.infinity, 50),
                                ),
                                onPressed: int.parse(remaining_contract) < 30
                                    ? () {}
                                    : null,
                                child: Text(
                                  'ต่อสัญญาเช่า',
                                  style: GoogleFonts.prompt(
                                    fontSize: 16,
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
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
