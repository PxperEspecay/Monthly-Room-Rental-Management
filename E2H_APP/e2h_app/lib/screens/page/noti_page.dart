import 'dart:developer';

import 'package:e2h_app/screens/page/announcement_detail.dart';
import 'package:e2h_app/screens/page/billing_details_page.dart';
import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:e2h_app/screens/page/report_issue_detail.dart';
import 'package:e2h_app/screens/page/request_repair_detail.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';

class NotiPage extends StatefulWidget {
  final String flag_page;

  NotiPage({super.key, required this.flag_page});

  @override
  State<NotiPage> createState() => _NotiPageState();
}

class _NotiPageState extends State<NotiPage> {
  late int renter_id;
  dynamic noti_list = [];
  Future<String?> _fetchToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? "";
  }

  @override
  void initState() {
    super.initState();
    CallApi();
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
    await GetNotification();
    EasyLoading.dismiss();
  }

  Future<void> GetNotification() async {
    EasyLoading.show(dismissOnTap: false);
    var body = {"renter_id": renter_id};
    try {
      log("Sending request with body: $body");
      var response = await Services().Dio_post('GetNotification', body);
      if (response["status_code"] == 8000) {
        setState(() {
          noti_list = response['data'];
          log('noti_list = ${response['data']}');
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

  Future<void> ReadNotification({required int notification_map_id}) async {
    EasyLoading.show(dismissOnTap: false);
    var body = {"notification_map_id": notification_map_id};
    try {
      log("Sending request with body: $body");
      var response = await Services().Dio_post('ReadNotification', body);
      if (response["status_code"] == 8000) {
        setState(() {
          noti_list = response['data'];
          log('noti_list = ${response['data']}');
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios),
          onPressed: () {
            if (widget.flag_page == 'setting') {
              Get.offAll(Bottombar(currentIndex: 3));
            } else {
              Get.offAll(Bottombar(currentIndex: 0));
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
          ),
        ),
        title: Text(
          'แจ้งเตือน',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold, fontSize: 24, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildCurrentTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentTab() {
    final rawNotiData = noti_list['notifications'];

    // ตรวจสอบว่าเป็น List หรือ Map แล้วแปลงให้กลายเป็น List ที่ปลอดภัย
    List<dynamic> notifications = [];

    if (rawNotiData is List) {
      notifications = rawNotiData;
    } else if (rawNotiData is Map) {
      notifications = rawNotiData.values.toList();
    }

    // กรณีว่าง
    if (notifications.isEmpty) {
      return _buildEmptyState('ไม่มีรายการแจ้งเตือน');
    }

    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: SizedBox(
        width: 95.w,
        height: 85.h,
        child: ListView.builder(
          itemCount: notifications.length,
          itemBuilder: (context, index) {
            final noti = notifications[index];

            return Stack(
              children: [
                GestureDetector(
                  onTap: () {
                    final type = noti['notification_type'];
                    final mapId = noti['notification_map_id'];
                    final notiNo = noti['notification_no'];

                    ReadNotification(notification_map_id: mapId);

                    if (type == 'แจ้งซ่อม' || type == 'นัดหมาย') {
                      Get.to(RequestRepairDetail(
                        id: notiNo,
                        flag_page: 'noti',
                      ));
                    } else if (type == 'แจ้งเรื่อง') {
                      Get.to(ReportIssueDetail(
                        id: notiNo,
                        flag_page: 'noti',
                      ));
                    } else if (type == 'บิล') {
                      Get.to(BillDetailsPage(
                        id: notiNo,
                        flag_page: 'noti',
                      ));
                    } else if (type == 'โปรไฟล์') {
                    } else if (type == 'ประกาศ') {
                      Get.to(AnnouncementDetail(
                        id: notiNo,
                        flag_page: 'noti',
                      ));
                    }
                  },
                  child: Card(
                    elevation: 4,
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    color: noti['is_read'] == true
                        ? Colors.white
                        : const Color.fromRGBO(209, 233, 252, 1),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Row icon + content
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Image.asset(
                                _getNotificationIcon(noti['notification_type']),
                                width: 7.w,
                                height: 7.h,
                              ),
                              SizedBox(width: 2.w),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      noti['message'] ?? '-',
                                      style: GoogleFonts.prompt(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16,
                                        color: Colors.black87,
                                      ),
                                    ),
                                    SizedBox(height: 1.h),
                                    Text(
                                      getTimeAgo(noti['create_date']),
                                      style: GoogleFonts.prompt(
                                        fontWeight: FontWeight.w400,
                                        fontSize: 14,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  String _getNotificationIcon(String? type) {
    switch (type) {
      case 'แจ้งซ่อม':
        return 'asset/image/icon-noti-repair_0.png';
      case 'นัดหมาย':
        return 'asset/image/icon-noti-calendar.png';
      case 'แจ้งเรื่อง':
        return 'asset/image/icon-noti-report-issue_0.png';
      case 'บิล':
        return 'asset/image/icon-noti-bill_0.png';
      case 'โปรไฟล์':
        return 'asset/image/icon_avatar_men.png';
      case 'ประกาศ':
        return 'asset/image/icon-noti-annoncement_0.png';
      default:
        return 'asset/image/icon-myhome.png'; // fallback
    }
  }

  String getTimeAgo(String dateString) {
    final date = DateTime.parse(dateString).toLocal(); // แปลงเป็นเวลาท้องถิ่น
    final now = DateTime.now();
    final diffMs = now.difference(date);
    final diffSec = diffMs.inSeconds;
    final diffMin = diffMs.inMinutes;
    final diffHour = diffMs.inHours;
    final diffDay = diffMs.inDays;

    if (diffSec < 60) {
      return 'เมื่อสักครู่';
    } else if (diffMin < 60) {
      return '$diffMin นาทีที่แล้ว';
    } else if (diffHour < 24) {
      return '$diffHour ชั่วโมงที่แล้ว';
    } else if (diffDay < 7) {
      return '$diffDay วันที่แล้ว';
    } else {
      return DateFormat('d MMM y HH:mm', 'th').format(date);
    }
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
}
