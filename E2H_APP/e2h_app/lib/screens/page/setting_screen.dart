import 'package:e2h_app/screens/auth/login_page.dart';
import 'package:e2h_app/screens/page/noti_page.dart';
import 'package:e2h_app/screens/page/profile_setting.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart'; // เพิ่ม package image_picker
import 'dart:io';

import 'package:shared_preferences/shared_preferences.dart'; // สำหรับจัดการไฟล์

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: SettingsScreen(),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

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
          'การตั้งค่า',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold, // ตัวหนากว่า
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
        // bottom: PreferredSize(
        //   preferredSize: const Size.fromHeight(1.0),
        //   child: Container(
        //     color: Colors.grey[300],
        //     height: 1.0,
        //   ),
        // ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              color: Colors.white, // สีพื้นหลังของ Container
              margin: const EdgeInsets.symmetric(
                  horizontal: 0), // Margin ด้านซ้ายและขวา
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(
                        left: 16.0,
                        top: 16.0,
                        bottom: 8.0), // Padding ด้านซ้าย, บน, และล่างของหัวข้อ
                    child: Text(
                      'การตั้งค่า',
                      style: GoogleFonts.prompt(
                        fontSize: 18.0,
                        fontWeight: FontWeight.w600, // ตัวปกติ
                      ),
                    ),
                  ),
                  ListView.builder(
                    shrinkWrap:
                        true, // ปรับขนาดของ ListView ให้ตรงกับเนื้อหาภายใน
                    physics:
                        const NeverScrollableScrollPhysics(), // ปิดการเลื่อนของ ListView
                    itemCount: 2, // จำนวนไอเทมใน ListView
                    itemBuilder: (context, index) {
                      return Column(
                        children: [
                          SettingsMenuItem(
                            icon:
                                index == 0 ? Icons.person : Icons.notifications,
                            title:
                                index == 0 ? 'ข้อมูลส่วนตัว' : 'การแจ้งเตือน',
                            onTap: () {
                              // Handle tap and navigate to the appropriate screen
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (context) => index == 0
                                        ? ProfileSetting()
                                        : NotiPage(flag_page: 'setting')),
                              );
                            },
                          ),
                          if (index < 2)
                            const Divider(), // เส้นขีดใต้ยกเว้นรายการสุดท้าย
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
            // const SizedBox(
            //     height: 20.0), // Margin ระหว่าง Container กับหัวข้อเมนู
            Container(
              color: Colors.white, // สีพื้นหลังของ Container
              margin: const EdgeInsets.symmetric(
                  horizontal: 0), // Margin ด้านซ้ายและขวา
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(
                        left: 16.0,
                        top: 16.0,
                        bottom: 8.0), // Padding ด้านซ้าย, บน, และล่างของหัวข้อ
                    child: Text(
                      'การใช้งาน',
                      style: GoogleFonts.prompt(
                        fontSize: 18.0,
                        fontWeight: FontWeight.w600, // ตัวปกติ
                      ),
                    ),
                  ),
                  SettingsMenuItem(
                    icon: Icons.info,
                    title: 'แอปฯ เวอร์ชั่น',
                    onTap: () {
                      // Handle tap for app version
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => AppVersionScreen(),
                        ),
                      );
                    },
                  ),
                  const Divider(), // เส้นขีดใต้
                  SettingsMenuItem(
                    icon: Icons.language,
                    title: 'เปลี่ยนภาษา',
                    onTap: () {
                      // Handle tap for change language
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ChangeLanguageScreen(),
                        ),
                      );
                    },
                  ),
                  const Divider(), // เส้นขีดใต้
                  SettingsMenuItem(
                    icon: Icons.logout,
                    title: 'ออกจากระบบ',
                    onTap: () {
                      _showLogoutDialog(context);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(
                height: 20.0), // ความสูงระหว่างเนื้อหาและข้อความด้านล่าง
            Center(
              child: Container(
                color: Colors.transparent,
                padding: const EdgeInsets.fromLTRB(
                    0, 0, 0, 20), // Padding ด้านซ้ายและขวาของข้อความ
                child: Column(
                  mainAxisSize:
                      MainAxisSize.min, // ใช้ขนาดของ Column ตามเนื้อหาภายใน
                  children: [
                    Text(
                      'Version Beta 1.0.1',
                      style: GoogleFonts.prompt(
                        fontSize: 10.0,
                        color: Colors.black54, // สีของข้อความ
                      ),
                    ),
                    const SizedBox(height: 4.0), // ความสูงระหว่างบรรทัด
                    Text(
                      '© 2024 EzHomeHandling.app All rights reserved',
                      style: GoogleFonts.prompt(
                        fontSize: 10.0,
                        color: Colors.black54, // สีของข้อความ
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible:
          false, // Prevents closing the dialog by tapping outside
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            'ออกจากระบบ',
            style: GoogleFonts.prompt(), // ใช้ Google Font
          ),
          content: Text(
            'คุณแน่ใจใช่ไหมที่จะออกจากระบบ?',
            style: GoogleFonts.prompt(), // ใช้ Google Font
          ),
          actions: [
            TextButton(
              onPressed: () {
                // Handle cancel
                Navigator.of(context).pop();
              },
              child: Text(
                'ยกเลิก',
                style: GoogleFonts.prompt(
                  color: const Color(0xFF006666), // สีของปุ่มยกเลิก
                ),
              ),
            ),
            TextButton(
              onPressed: () async {
                final SharedPreferences prefs =
                    await SharedPreferences.getInstance();
                prefs.clear();

                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LoginPage(),
                  ),
                );
              },
              child: Text(
                'ตกลง',
                style: GoogleFonts.prompt(), // ใช้ Google Font
              ),
            ),
          ],
        );
      },
    );
  }
}

class SettingsMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const SettingsMenuItem({
    super.key,
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(
          vertical: 8.0, horizontal: 16.0), // ลดความสูงของ ListTile
      leading: Container(
        padding: const EdgeInsets.all(4.0), // ลดขนาด padding ภายในของไอคอน
        decoration: BoxDecoration(
          color: Colors.teal[50], // สีพื้นหลังของไอคอน
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: const Color(0xFF006666), // สีไอคอน
          size: 20.0, // ลดขนาดของไอคอน
        ),
      ),
      title: Text(
        title,
        style: GoogleFonts.prompt(),
      ),
      onTap: onTap,
    );
  }
}

// Example screens for navigation
class PersonalInfoScreen extends StatelessWidget {
  const PersonalInfoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ข้อมูลส่วนตัว')),
      body: PersonalInfoWidget(),
    );
  }
}

class PersonalInfoWidget extends StatefulWidget {
  const PersonalInfoWidget({super.key});

  @override
  _PersonalInfoWidgetState createState() => _PersonalInfoWidgetState();
}

class _PersonalInfoWidgetState extends State<PersonalInfoWidget> {
  File? _image; // ตัวแปรเก็บไฟล์ภาพที่เลือก
  final picker = ImagePicker(); // สร้าง instance ของ ImagePicker

  Future<void> _pickImage(ImageSource source) async {
    final pickedFile = await picker.pickImage(source: source);

    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
      });
    }
  }

  void _showImageSourceSelection(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Wrap(
          children: <Widget>[
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('เลือกจากแกลลอรี่'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('ถ่ายรูปใหม่'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.cancel),
              title: const Text('ยกเลิก'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        GestureDetector(
          onTap: () => _showImageSourceSelection(context),
          child: CircleAvatar(
            radius: 50,
            backgroundImage: _image != null
                ? FileImage(_image!) // แสดงภาพที่ผู้ใช้เลือก
                : const AssetImage('asset/image/default-personal.png')
                    as ImageProvider, // แสดงภาพเริ่มต้น
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('การแจ้งเตือน')),
      body: const Center(child: Text('Notification Settings')),
    );
  }
}

class AppVersionScreen extends StatelessWidget {
  const AppVersionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('แอปฯ เวอร์ชั่น')),
      body: const Center(child: Text('App Version Settings')),
    );
  }
}

class ChangeLanguageScreen extends StatelessWidget {
  const ChangeLanguageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('เปลี่ยนภาษา')),
      body: const Center(child: Text('Change Language Settings')),
    );
  }
}
