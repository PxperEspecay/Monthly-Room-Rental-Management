import 'dart:async';
import 'dart:developer';
import 'package:e2h_app/global/global.dart';
import 'package:e2h_app/screens/page/billing_page.dart';
import 'package:e2h_app/screens/page/contract_rental_screen.dart';
import 'package:e2h_app/screens/page/myroom_page.dart';
import 'package:e2h_app/screens/page/noti_page.dart';
import 'package:e2h_app/screens/page/phonebook_page.dart';
import 'package:e2h_app/screens/page/request_repair_screen.dart';
import 'package:e2h_app/screens/page/rules_page.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:badges/badges.dart' as badges;

class MainPageMenu extends StatefulWidget {
  const MainPageMenu({super.key});

  @override
  State<MainPageMenu> createState() => _MainPageMenuState();
}

class _MainPageMenuState extends State<MainPageMenu> {
  late String location = '';
  late String imgBanner = '';
  late String roomNumber = '';

  late int renter_id;
  dynamic noti_list = [];
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetchToken().then((token) async {
      // log('Token: $token');
      Map<String, dynamic> decodedToken = JwtDecoder.decode(token!);
      log(decodedToken.toString());

      setState(() {
        imgBanner = decodedToken['img_commu1'];
        log('imgBanner = $imgBanner');
        location = decodedToken['location'];
        roomNumber = decodedToken['room_number'];
      });
    });

    _timer = Timer.periodic(Duration(seconds: 5), (timer) async {
      final value = await CallApi();
      setState(() {
        // อัปเดตข้อมูลที่ได้จาก API
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel(); // ยกเลิก Timer เมื่อ Widget ถูก dispose
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(180.0),
        child: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: Colors.transparent,
          elevation: 0,
          flexibleSpace: Stack(
            children: [
              // 🔹 รูปภาพพื้นหลัง
              if (imgBanner != null && imgBanner.isNotEmpty)
                SizedBox.expand(
                  child: Image.network(
                    'http://172.20.10.3:3000/$imgBanner',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: Colors.grey[300],
                      child: Center(child: Text('โหลดภาพไม่สำเร็จ')),
                    ),
                  ),
                )
              else
                Container(
                  color: Colors.grey[300],
                  child: Center(child: Text('ไม่มีรูปแบนเนอร์')),
                ),

              // 🔹 Text (roomNumber + location) มุมล่างซ้าย
              Align(
                alignment: Alignment.bottomLeft,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            roomNumber,
                            style: GoogleFonts.prompt(
                              fontSize: 24,
                              fontWeight: FontWeight.w400,
                              color: Colors.white,
                              shadows: [
                                Shadow(
                                  blurRadius: 5,
                                  color: Colors.black.withOpacity(0.5),
                                  offset: const Offset(2, 2),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            location,
                            style: GoogleFonts.prompt(
                              fontSize: 18,
                              fontWeight: FontWeight.w400,
                              color: Colors.white,
                              shadows: [
                                Shadow(
                                  blurRadius: 5,
                                  color: Colors.black.withOpacity(0.5),
                                  offset: const Offset(2, 2),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      badges.Badge(
                        badgeStyle: badges.BadgeStyle(
                          shape: badges.BadgeShape.square,
                          borderRadius: BorderRadius.circular(5),
                          padding: const EdgeInsets.all(2),
                          badgeGradient: badges.BadgeGradient.linear(
                            colors: [
                              Color.fromRGBO(255, 55, 66, 1),
                              Color.fromARGB(255, 218, 66, 78),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        position: badges.BadgePosition.topEnd(top: 8, end: 8),
                        showBadge: Global.flag_noti,
                        badgeContent:
                            const SizedBox(width: 6, height: 6), // จุดแดงเล็ก
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.grey
                                .withOpacity(0.9), // ✅ พื้นหลังโปร่งแสง
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: IconButton(
                            icon: Icon(
                              Icons.notifications,
                              color: Colors.white,
                              size: 28,
                              shadows: [
                                Shadow(
                                  blurRadius: 5,
                                  color: Colors.black.withOpacity(0.5),
                                  offset: const Offset(2, 2),
                                ),
                              ],
                            ),
                            onPressed: () {
                              Get.to(NotiPage(flag_page: 'main'));
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      backgroundColor: const Color.fromARGB(255, 237, 239, 239),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
        child: GridView(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisExtent: 80,
          ),
          children: [
            myBox(
              'asset/image/icon-billing.png',
              'แจ้งเตือนค่าใช้จ่าย',
              context,
              () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        const BillingPage(), // ใช้ const เพราะไม่มีพารามิเตอร์
                  ),
                );
              },
            ),
            myBox('asset/image/icon-myhome.png', 'ห้องของฉัน', context, () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => MyroomPage()),
              );
            }),
            myBox('asset/image/icon-phone-book.png', 'สมุดโทรศัพท์', context,
                () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const PhonebookPage()),
              );
            }),
            // myBox('asset/image/rules.png', 'กฎระเบียบ', context, () {
            //   Navigator.push(
            //     context,
            //     MaterialPageRoute(builder: (context) => const RulesPage()),
            //   );
            // }),
            myBox('asset/image/icon-agreement.png', 'สัญญาเช่า', context, () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => const ContractRentalScreen()),
              );
            }),
            myBox('asset/image/icon-maintenance.png', 'แจ้งซ่อม', context, () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => const RequestRepairScreen()),
              );
            }),
          ],
        ),
      ),
    );
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
      log('ee$e');
      // EasyLoading.dismiss();
    }
  }
}

// Future<String?> _fetchToken() async {
//   SharedPreferences prefs = await SharedPreferences.getInstance();
//   return prefs.getString('token') ?? "";
// }

Widget myBox(
    String imagePath, String label, BuildContext context, VoidCallback onTap) {
  return GestureDetector(
    onTap: onTap,
    child: Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 255, 255, 255),
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(left: 16),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.teal[50],
              shape: BoxShape.circle,
            ),
            child: Image.asset(imagePath, width: 25, height: 25),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 0),
              child: Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                softWrap: true,
                style: GoogleFonts.prompt(
                  fontWeight: FontWeight.bold,
                  color: const Color.fromARGB(255, 73, 73, 73),
                ),
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
