import 'dart:async';
import 'dart:developer';

import 'package:e2h_app/global/global.dart';
import 'package:e2h_app/screens/page/announcement_screen.dart';
import 'package:e2h_app/screens/page/main_page_menu.dart';
import 'package:e2h_app/screens/page/report_issue_screen.dart';
import 'package:e2h_app/screens/page/setting_screen.dart';
import 'package:e2h_app/service/service.dart';
import 'package:e2h_app/widget/widget_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Bottombar extends StatefulWidget {
  final int currentIndex;
  const Bottombar({super.key, required this.currentIndex});

  @override
  State<Bottombar> createState() => _BottombarState();
}

class _BottombarState extends State<Bottombar> {
  late int renter_id;
  int currentIndex = 0;
  dynamic noti_list = [];
  List widgetOptions = [
    MainPageMenu(),
    AnnouncementScreen(),
    ReportIssueScreen(),
    SettingsScreen(),
  ];

  @override
  void initState() {
    setState(() {
      if (widget.currentIndex == 0) {
        currentIndex = 0;
      }
      if (widget.currentIndex == 1) {
        currentIndex = 1;
      }
      if (widget.currentIndex == 2) {
        currentIndex = 2;
      }
      if (widget.currentIndex == 3) {
        currentIndex = 3;
      }
    });

    super.initState();
  }

  Future<String?> _fetchToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? "";
  }

  Future<void> CallApi() async {
    // EasyLoading.show(dismissOnTap: false);
    await _fetchToken().then((token) async {
      setState(() {});
      // log('Token: $token');

      Map<String, dynamic> decodedToken = JwtDecoder.decode(token!);
      // log(decodedToken.toString());

      renter_id = decodedToken['id'];
    });
    await GetNotification();
    // EasyLoading.dismiss();
  }

  Future<void> GetNotification() async {
    // EasyLoading.show(dismissOnTap: false);
    var body = {"renter_id": renter_id};
    try {
      // log("Sending request with body: $body");
      var response = await Services().Dio_post('GetNotification', body);
      if (response["status_code"] == 8000) {
        setState(() {
          noti_list = response['data'];
          // log('noti_list = ${response['data']}');
          if (response['data']['unread_total'] > 0) {
            log('เข้าาาาาาาา1');
            Global.flag_noti = true;
          } else {
            log('เข้าาาาาาาา2');
            Global.flag_noti = false;
          }
        });

        // EasyLoading.dismiss();
      } else {
        log('error = $response');
        // EasyLoading.dismiss();
      }
    } catch (e) {
      // log('ee$e');
      EasyLoading.dismiss();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Timer(Duration(seconds: 5), () async {
    //   CallApi().then((value) {
    //     setState(() {
    //       // count = value['data']['count'];
    //       // log('count====' + count.toString());
    //     });
    //   });
    // });
    return Scaffold(
      body: Center(
        child: widgetOptions[currentIndex],
      ),
      bottomNavigationBar: SizedBox(
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed, // ใช้แบบ fixed
          backgroundColor: Colors.white,
          selectedItemColor:
              Color(0xFF006666), // สีของไอคอนและ label เมื่อถูกเลือก
          unselectedItemColor:
              Colors.grey, // สีของไอคอนและ label เมื่อไม่ได้ถูกเลือก
          items: [
            BottomNavigationBarItem(
              icon: Container(
                width: 70,
                height: 50,
                decoration: BoxDecoration(
                  color: currentIndex == 0
                      ? Colors.teal[50]
                      : Colors.transparent, // สีพื้นหลังเมื่อถูกเลือก
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.home),
                    WidgetText(
                        data: 'หน้าหลัก',
                        size: 16,
                        color: Color(0xFF006666),
                        weight: FontWeight.w400)
                  ],
                ),
              ),
              label: '',
            ),
            BottomNavigationBarItem(
              icon: Container(
                width: 70,
                height: 50,
                decoration: BoxDecoration(
                  color: currentIndex == 1
                      ? Colors.teal[50]
                      : Colors.transparent, // สีพื้นหลังเมื่อถูกเลือก
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.announcement),
                    WidgetText(
                        data: 'ประกาศ',
                        size: 16,
                        color: Color(0xFF006666),
                        weight: FontWeight.w400)
                  ],
                ),
              ),
              label: '',
            ),
            BottomNavigationBarItem(
              icon: Container(
                width: 70,
                height: 50,
                decoration: BoxDecoration(
                  color: currentIndex == 2
                      ? Colors.teal[50]
                      : Colors.transparent, // สีพื้นหลังเมื่อถูกเลือก
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.format_list_bulleted_rounded),
                    WidgetText(
                        data: 'แจ้งเรื่อง',
                        size: 16,
                        color: Color(0xFF006666),
                        weight: FontWeight.w400)
                  ],
                ),
              ),
              label: '',
            ),
            BottomNavigationBarItem(
              icon: Container(
                width: 70,
                height: 50,
                decoration: BoxDecoration(
                  color: currentIndex == 3
                      ? Colors.teal[50]
                      : Colors.transparent, // สีพื้นหลังเมื่อถูกเลือก
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.settings),
                    WidgetText(
                        data: 'ตั้งค่า',
                        size: 16,
                        color: Color(0xFF006666),
                        weight: FontWeight.w400)
                  ],
                ),
              ),
              label: '',
            ),
          ],
          currentIndex: currentIndex,
          onTap: (index) => setState(() => currentIndex = index),
        ),
      ),
    );
  }
}
