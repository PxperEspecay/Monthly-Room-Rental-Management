import 'dart:developer';

import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:e2h_app/screens/page/request_repair_detail.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';
import 'create_request_repair_screen.dart';

class RequestRepairScreen extends StatefulWidget {
  const RequestRepairScreen({super.key});

  @override
  State<RequestRepairScreen> createState() => _RequestRepairScreenState();
}

class _RequestRepairScreenState extends State<RequestRepairScreen> {
  int _selectedIndex = 0;
  int renter_id = 0;
  List<dynamic> requset_repair_list = [];
  List<dynamic> requset_repair_history_list = [];
  Future<String?> _fetchToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? "";
  }

  Future<void> GetRepairRequestsListForRenter() async {
    EasyLoading.show(dismissOnTap: false);
    var body = {"renter_id": renter_id};
    try {
      log("Sending request with body: $body");
      var response =
          await Services().Dio_post('GetRepairRequestsListForRenter', body);
      if (response["status_code"] == 8000) {
        setState(() {
          requset_repair_list = response['data'];
          log('requset_repair_list = ${response['data']}');
        });

        EasyLoading.dismiss();
      } else {
        log('error = $response');
        EasyLoading.dismiss();
      }
    } catch (e) {
      log('ee$e');
      EasyLoading.dismiss();
    }
  }

  Future<void> GetHistoryRepairRequestsListForRenter() async {
    EasyLoading.show(dismissOnTap: false);
    var body = {"renter_id": renter_id};
    try {
      log("Sending request with body: $body");
      var response = await Services()
          .Dio_post('GetHistoryRepairRequestsListForRenter', body);
      if (response["status_code"] == 8000) {
        setState(() {
          requset_repair_history_list = response['data'];
          log('requset_repair_history_list = ${response['data']}');
        });

        EasyLoading.dismiss();
      } else {
        log('error = $response');
        EasyLoading.dismiss();
      }
    } catch (e) {
      log('ee$e');
      EasyLoading.dismiss();
    }
  }

  Future<void> CallApi() async {
    EasyLoading.show(dismissOnTap: false);
    await _fetchToken().then((token) async {
      setState(() {});
      log('Token: $token');

      Map<String, dynamic> decodedToken = JwtDecoder.decode(token!);
      log(decodedToken.toString());

      renter_id = decodedToken['id'];
    });
    await GetRepairRequestsListForRenter();
    await GetHistoryRepairRequestsListForRenter();
    EasyLoading.dismiss();
  }

  @override
  void initState() {
    super.initState();
    CallApi();
  }

  void _onTabTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios),
          onPressed: () {
            Get.offAll(Bottombar(currentIndex: 0));
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
          ),
        ),
        title: Text(
          'แจ้งซ่อม',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold, fontSize: 24, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // Tab Bar
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => _onTabTapped(0),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: _selectedIndex == 0
                              ? Colors.teal.shade400
                              : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                    child: Center(
                      child: Text(
                        'ปัจจุบัน',
                        style: GoogleFonts.prompt(
                          fontSize: 18,
                          color:
                              _selectedIndex == 0 ? Colors.black : Colors.grey,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => _onTabTapped(1),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: _selectedIndex == 1
                              ? Colors.teal.shade400
                              : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                    child: Center(
                      child: Text(
                        'ประวัติ',
                        style: GoogleFonts.prompt(
                          fontSize: 18,
                          color:
                              _selectedIndex == 1 ? Colors.black : Colors.grey,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          // ทำให้เนื้อหาปรับขนาดอัตโนมัติ และไม่เกิด overflow
          Expanded(
            child:
                _selectedIndex == 0 ? _buildCurrentTab() : _buildHistoryTab(),
          ),
          // ป้องกันปัญหา Overflow ด้วย SafeArea และใช้ Padding
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF008388),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const CreateRequestRepairScreen(),
                    ),
                  );
                },
                child: Text(
                  'เพิ่มรายการซ่อม',
                  style: GoogleFonts.prompt(
                    fontSize: 18,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentTab() {
    return requset_repair_list.isNotEmpty
        ? Padding(
            padding: const EdgeInsets.all(8.0),
            child: ListView.builder(
              itemCount: requset_repair_list.length,
              itemBuilder: (context, index) {
                return Stack(
                  children: [
                    GestureDetector(
                      onTap: () {
                        Get.to(RequestRepairDetail(
                          id: requset_repair_list[index]['id'],
                          flag_page: 'repair',
                        ));
                      },
                      child: Card(
                        elevation: 4,
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Title + Description
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          requset_repair_list[index]
                                              ['issue_title'],
                                          style: GoogleFonts.prompt(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16,
                                            color: Colors.black87,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          requset_repair_list[index]
                                              ['issue_description'],
                                          maxLines:
                                              2, // จำกัดให้แสดงแค่ 2 บรรทัด
                                          overflow: TextOverflow
                                              .ellipsis, // ถ้ามีเกิน ตัดเป็น ...
                                          style: GoogleFonts.prompt(
                                            fontWeight: FontWeight.w300,
                                            fontSize: 16,
                                            color: Colors.black54,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  // ไอคอนสถานะ (อยู่ใน Card)
                                  _buildStatusIcon(
                                      requset_repair_list[index]['status']),
                                ],
                              ),

                              // Spacer เพื่อให้ status_name ลงไปอยู่ด้านล่าง
                              const SizedBox(height: 8),

                              // Status Name (อยู่มุมขวาล่าง)
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    formatThaiDate(requset_repair_list[index]
                                        ['created_at']),
                                    maxLines: 2, // จำกัดให้แสดงแค่ 2 บรรทัด
                                    overflow: TextOverflow
                                        .ellipsis, // ถ้ามีเกิน ตัดเป็น ...
                                    style: GoogleFonts.prompt(
                                      fontWeight: FontWeight.w300,
                                      fontSize: 14,
                                      color: Colors.black54,
                                    ),
                                  ),
                                  Align(
                                    alignment: Alignment.bottomRight,
                                    child: _buildStatusName(
                                        requset_repair_list[index]['status']),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          )
        : _buildEmptyState('ไม่มีรายการแจ้งซ่อมปัจจุบัน');
  }

  Widget _buildHistoryTab() {
    return requset_repair_history_list.isNotEmpty
        ? Padding(
            padding: const EdgeInsets.all(8.0),
            child: ListView.builder(
              itemCount: requset_repair_history_list.length,
              itemBuilder: (context, index) {
                return Stack(
                  children: [
                    GestureDetector(
                      onTap: () {
                        Get.to(RequestRepairDetail(
                          id: requset_repair_history_list[index]['id'],
                          flag_page: 'repair',
                        ));
                      },
                      child: Card(
                        elevation: 4,
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Title + Description
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          requset_repair_history_list[index]
                                              ['issue_title'],
                                          style: GoogleFonts.prompt(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16,
                                            color: Colors.black87,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          requset_repair_history_list[index]
                                              ['issue_description'],
                                          maxLines:
                                              2, // จำกัดให้แสดงแค่ 2 บรรทัด
                                          overflow: TextOverflow
                                              .ellipsis, // ถ้ามีเกิน ตัดเป็น ...
                                          style: GoogleFonts.prompt(
                                            fontWeight: FontWeight.w300,
                                            fontSize: 16,
                                            color: Colors.black54,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),

                                  // ไอคอนสถานะ (อยู่ใน Card)
                                  _buildStatusIcon(
                                      requset_repair_history_list[index]
                                          ['status']),
                                ],
                              ),

                              // Spacer เพื่อให้ status_name ลงไปอยู่ด้านล่าง
                              const SizedBox(height: 8),

                              // Status Name (อยู่มุมขวาล่าง)
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    formatThaiDate(
                                        requset_repair_history_list[index]
                                            ['updated_at']),
                                    maxLines: 2, // จำกัดให้แสดงแค่ 2 บรรทัด
                                    overflow: TextOverflow
                                        .ellipsis, // ถ้ามีเกิน ตัดเป็น ...
                                    style: GoogleFonts.prompt(
                                      fontWeight: FontWeight.w300,
                                      fontSize: 14,
                                      color: Colors.black54,
                                    ),
                                  ),
                                  Align(
                                    alignment: Alignment.bottomRight,
                                    child: _buildStatusName(
                                        requset_repair_history_list[index]
                                            ['status']),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          )
        : _buildEmptyState('ไม่มีรายการแจ้งซ่อมปัจจุบัน');
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.build,
            size: 60,
            color: Colors.grey,
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: GoogleFonts.prompt(
              fontSize: 18,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  // Widget _buildStatusTag(String status) {
  //   Color bgColor;
  //   String label;

  //   switch (status) {
  //     case "pending":
  //       bgColor = Colors.orange;
  //       label = "รอตรวจสอบ";
  //       break;
  //     case "approved":
  //       bgColor = Colors.green;
  //       label = "ยืนยันการตรวจสอบ";
  //       break;
  //     case "scheduled":
  //       bgColor = Colors.blueAccent;
  //       label = "จองวัน-เวลา";
  //       break;
  //     case "completed":
  //       bgColor = Colors.greenAccent;
  //       label = "สำเร็จ";
  //       break;
  //     case "rejected":
  //       bgColor = Colors.red;
  //       label = "ปฏิเสธ";
  //       break;
  //     default:
  //       bgColor = Colors.grey;
  //       label = "ไม่ระบุ";
  //   }

  //   return Container(
  //     padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
  //     decoration: BoxDecoration(
  //       color: bgColor,
  //       borderRadius: BorderRadius.circular(12),
  //     ),
  //     child: Text(
  //       label,
  //       style: GoogleFonts.prompt(
  //         fontSize: 12,
  //         fontWeight: FontWeight.bold,
  //         color: Colors.white,
  //       ),
  //     ),
  //   );
  // }

  Widget _buildStatusIcon(String status) {
    String imagePath;
    String status_name;

    switch (status) {
      case "waiting_to_check":
        imagePath = "asset/image/icon-waiting.png";
        break;
      case "pending":
        imagePath = "asset/image/status-pending.png";
        break;
      case "acknowledged":
        imagePath = "asset/image/status-acknowledged.png";
        break;
      case "scheduled":
        imagePath = "asset/image/status-scheduled.png";
        break;
      case "in_progress":
        imagePath = "asset/image/icon-in_progress.png";
        break;
      case "completed":
        imagePath = "asset/image/status-completed.png";
        break;
      case "rejected":
        imagePath = "asset/image/icon-rejected.png";
        break;
      default:
        imagePath =
            "asset/image/status-pending.png"; // รูป default ถ้าไม่มีสถานะ
    }

    return Image.asset(
      imagePath,
      width: 18, // ปรับขนาดไอคอน
      height: 18,
      fit: BoxFit.cover,
    );
  }

  Widget _buildStatusName(String status) {
    String statusText;
    Color textColor;

    switch (status) {
      case "waiting_to_check":
        statusText = "รอตรวจสอบ";
        textColor = Color.fromRGBO(21, 71, 121, 1);
        break;
      case "acknowledged":
        statusText = "กรุณาเลือกวันที่";
        textColor = Color.fromRGBO(235, 87, 87, 1);
        break;
      case "scheduled":
        statusText = "รอนัดหมายช่าง";
        textColor = const Color(0xFF448AFF);
        break;
      case "pending":
        statusText = "รอดำเนินการ";
        textColor = Color.fromRGBO(255, 168, 0, 1);
        break;
      case "in_progress":
        statusText = "กำลังดำเนินการ";
        textColor = Color.fromRGBO(68, 194, 184, 1);
        break;
      case "completed":
        statusText = "สำเร็จ";
        textColor = const Color.fromARGB(255, 0, 161, 62);
        break;
      case "rejected":
        statusText = "ปฏิเสธ";
        textColor = Colors.red;
        break;
      default:
        statusText = "ไม่ระบุ";
        textColor = Colors.grey;
    }

    return Padding(
      padding: const EdgeInsets.only(right: 4.0, bottom: 4.0),
      child: Text(
        statusText,
        style: GoogleFonts.prompt(
          fontSize: 14,
          fontWeight: FontWeight.w300,
          color: textColor,
        ),
      ),
    );
  }
}
