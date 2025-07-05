import 'dart:developer';
import 'package:e2h_app/screens/page/announcement_detail.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:e2h_app/service/service.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';

class AnnouncementScreen extends StatefulWidget {
  const AnnouncementScreen({super.key});

  @override
  _AnnouncementScreenState createState() => _AnnouncementScreenState();
}

class _AnnouncementScreenState extends State<AnnouncementScreen> {
  int _selectedIndex = 0;
  late String token = "";
  late int renter_id;
  List<Map<String, dynamic>> newsList = [];
  List<Map<String, dynamic>> importantAnnouncements = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData(); // โหลดข้อมูลเมื่อเข้าแอป
  }

  // 🔹 ฟังก์ชันโหลดข้อมูล
  Future<void> _fetchData() async {
    try {
      int renterId = await _getRenterId();
      await GetAnnouncements(id: renterId);
    } catch (e) {
      log("Error fetching announcements: $e");
    }
  }

  // 🔹 ดึงค่า renter_id จาก SharedPreferences
  Future<int> _getRenterId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token') ?? "";
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    renter_id = decodedToken['id'];
    return renter_id;
  }

  // 🔹 เรียก API โหลดประกาศ
  Future<void> GetAnnouncements({required int id}) async {
    var body = {'renter_id': id};
    log('Fetching data: $body');

    EasyLoading.show(dismissOnTap: false);
    try {
      var res = await Services().Dio_post('GetAnnouncements', body);

      if (res is Map<String, dynamic> && res.containsKey('status_code')) {
        if (res['status_code'] == 8000) {
          if (res['data'] is List) {
            final List<Map<String, dynamic>> data =
                List<Map<String, dynamic>>.from(res['data']);

            // แบ่งตาม type
            final List<Map<String, dynamic>> importantList =
                data.where((item) => item['announcement_type'] == 'I').toList();
            final List<Map<String, dynamic>> generalList =
                data.where((item) => item['announcement_type'] == 'G').toList();

            setState(() {
              importantAnnouncements = importantList;
              newsList = generalList;
              isLoading = false;
            });

            log('✅ Data loaded successfully');
          } else {
            log('❌ Data is not a List: ${res['data']}');
          }
        } else {
          log('❌ Failed to load data: ${res['status_code']}');
        }
      } else {
        log('❌ Invalid response structure: $res');
      }
    } catch (e) {
      log('❌ Error occurred: $e');
    } finally {
      EasyLoading.dismiss();
    }
  }

  Future<void> markAnnouncementAsRead({
    required int announcementId,
    required int renterId,
  }) async {
    final body = {
      'announcement_id': announcementId,
      'renter_id': renterId,
    };

    log('Marking announcement as read: $body');

    try {
      var res = await Services().Dio_post('ReadAnnouncement', body);
      if (res is Map<String, dynamic> && res['status_code'] == 8000) {
        // Get.offAll(AnnouncementDetailScreen(
        //   announcement: {},
        // ));
      } else {
        log('Failed to mark as read: $res');
      }
    } catch (e) {
      log('Error marking announcement as read: $e');
    }
  }

  // 🔹 เปลี่ยน Tab
  void _onTabTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
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
        automaticallyImplyLeading: false,
        title: Text(
          'ประกาศ',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Row(
                  children: [
                    _buildTabButton(0, 'ประกาศสำคัญ'),
                    _buildTabButton(1, 'ข่าวสารทั่วไป'),
                  ],
                ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _fetchData, // 🔹 ดึงลงเพื่อโหลดข้อมูลใหม่
                    child: _selectedIndex == 0
                        ? buildListView(importantAnnouncements)
                        : buildListView(newsList),
                  ),
                ),
              ],
            ),
    );
  }

  // 🔹 Widget ปุ่ม Tab
  Widget _buildTabButton(int index, String title) {
    return Expanded(
      child: GestureDetector(
        onTap: () => _onTabTapped(index),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: _selectedIndex == index
                    ? Colors.teal.shade400
                    : Colors.transparent,
                width: 2,
              ),
            ),
          ),
          child: Center(
            child: Text(
              title,
              style: GoogleFonts.prompt(
                fontSize: 18,
                color: _selectedIndex == index ? Colors.black : Colors.grey,
              ),
            ),
          ),
        ),
      ),
    );
  }

  // 🔹 Widget รายการประกาศ
  Widget buildListView(List<Map<String, dynamic>> items) {
    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return GestureDetector(
          onTap: () {
            log(item['id'].toString());
            markAnnouncementAsRead(
                announcementId: item['id'], renterId: renter_id);

            Get.to(
              AnnouncementDetail(
                id: item['id'],
                flag_page: 'Announcement',
              ),
            );
          },
          child: Card(
            margin: const EdgeInsets.all(8),
            child: Column(
              children: [
                Stack(
                  children: [
                    item['banner_announcement'] != null &&
                            item['banner_announcement'] != ''
                        ? Image.network(
                            'http://172.20.10.3:3000/${item['banner_announcement']}',
                            height: 22.h,
                            width: double.infinity,
                            fit: BoxFit.fill,
                          )
                        : Image.asset(
                            'asset/image/img_defult.png',
                            height: 200,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                    if (item['is_read'] == false) ...[
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'ใหม่',
                            style: GoogleFonts.prompt(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    item['title_announcement'],
                    style: GoogleFonts.prompt(
                        fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// // 🔹 หน้ารายละเอียดประกาศ
// class AnnouncementDetailScreen extends StatelessWidget {
//   final Map<String, dynamic> announcement;

//   const AnnouncementDetailScreen({super.key, required this.announcement});

//   @override
//   Widget build(BuildContext context) {
//     log('🟢 DATA: $announcement');
//     return Scaffold(
//       appBar: AppBar(
//         iconTheme: const IconThemeData(color: Colors.white),
//         leading: IconButton(
//           icon: const Icon(Icons.arrow_back_ios),
//           onPressed: () {
//             Get.back();
//           },
//         ),
//         flexibleSpace: Container(
//           decoration: const BoxDecoration(
//             gradient: LinearGradient(
//               colors: [
//                 Color.fromRGBO(0, 102, 102, 0.71),
//                 Color.fromRGBO(0, 102, 102, 1)
//               ],
//               begin: Alignment.topCenter,
//               end: Alignment.bottomCenter,
//             ),
//           ),
//         ),
//         title: Text(
//           'รายละเอียดประกาศ',
//           style: GoogleFonts.prompt(
//             fontWeight: FontWeight.bold,
//             fontSize: 24,
//             color: Colors.white,
//           ),
//         ),
//       ),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(16.0),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             if (announcement['banner_announcement'] != null &&
//                 announcement['banner_announcement'].toString().isNotEmpty)
//               Image.network(
//                 'http://192.168.1.100:3000/${announcement['banner_announcement']}',
//                 fit: BoxFit.cover,
//                 width: double.infinity,
//               ),
//             const SizedBox(height: 16),
//             Text(
//               announcement['title_announcement'] ?? '-',
//               style: GoogleFonts.prompt(
//                 fontSize: 22,
//                 fontWeight: FontWeight.bold,
//               ),
//             ),
//             const SizedBox(height: 16),
//             Text(
//               announcement['body_announcement'] ?? '-',
//               style: GoogleFonts.prompt(fontSize: 16),
//             ),
//             const SizedBox(height: 24),

//             // 🔹 แสดงรูปเพิ่มเติม (ถ้ามี)
//             // if (announcement['img_announcement'] != null &&
//             //     announcement['img_announcement'].toString().isNotEmpty)
//             //   Column(
//             //     crossAxisAlignment: CrossAxisAlignment.start,
//             //     children: [
//             //       Text(
//             //         'รูปภาพเพิ่มเติม:',
//             //         style: GoogleFonts.prompt(
//             //           fontSize: 18,
//             //           fontWeight: FontWeight.w600,
//             //         ),
//             //       ),
//             //       const SizedBox(height: 8),
//             //       Image.network(
//             //         'http://192.168.1.100:3000/${announcement['img_announcement']}',
//             //         fit: BoxFit.cover,
//             //         width: double.infinity,
//             //       ),
//             //     ],
//             //   ),

//             // const SizedBox(height: 24),

//             // // 🔹 แสดงไฟล์แนบ (ถ้ามี)
//             // if (announcement['file_announcement'] != null &&
//             //     announcement['file_announcement'].toString().isNotEmpty)
//             //   Column(
//             //     crossAxisAlignment: CrossAxisAlignment.start,
//             //     children: [
//             //       Text(
//             //         'ไฟล์แนบ:',
//             //         style: GoogleFonts.prompt(
//             //           fontSize: 18,
//             //           fontWeight: FontWeight.w600,
//             //         ),
//             //       ),
//             //       const SizedBox(height: 8),
//             //       InkWell(
//             //         onTap: () {
//             //           // ใช้ url_launcher เพื่อเปิดลิงก์
//             //           final url =
//             //               'http://192.168.1.100:3000/${announcement['file_announcement']}';
//             //           // launch(url); ← อย่าลืม import package url_launcher แล้วใช้ตามนี้
//             //         },
//             //         child: Text(
//             //           'เปิดไฟล์เอกสาร',
//             //           style: GoogleFonts.prompt(
//             //             fontSize: 16,
//             //             color: Colors.blue,
//             //             decoration: TextDecoration.underline,
//             //           ),
//             //         ),
//             //       ),
//             //     ],
//             //   ),

//             // const SizedBox(height: 24),
//             // Text(
//             //   'วันที่ประกาศ: ${announcement['createdAt'] != null ? DateTime.parse(announcement['createdAt']).toLocal().toString() : '-'}',
//             //   style: GoogleFonts.prompt(fontSize: 14, color: Colors.grey[700]),
//             // ),
//           ],
//         ),
//       ),
//     );
//   }
// }
