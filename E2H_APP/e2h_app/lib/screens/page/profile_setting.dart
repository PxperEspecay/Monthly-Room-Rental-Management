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

class ProfileSetting extends StatefulWidget {
  const ProfileSetting({super.key});

  @override
  State<ProfileSetting> createState() => _ProfileSettingState();
}

class _ProfileSettingState extends State<ProfileSetting> {
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

  File? _image;
  final _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    getString().then((value) {
      GetRenterDetails(id: int.parse(value)).then((_) {
        setState(() {});
      });
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

  String _formatThaiDate(String date) {
    try {
      final DateTime parsedDate = DateTime.parse(date);
      final int buddhistYear = parsedDate.year + 543;
      const List<String> thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
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
          'ข้อมูลส่วนตัว',
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
                      GestureDetector(
                        onTap: () => _showImageSourceSelection(context),
                        child: CircleAvatar(
                          radius: 50,
                          backgroundImage: img_profile.isNotEmpty
                              ? NetworkImage('http://172.20.10.3:3000/$img_profile')
                              : const AssetImage('assets/icon_avtar_men.png') as ImageProvider,
                        ),
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
                  const SizedBox(height: 20),
                  buildListTile(Icons.person, 'ชื่อ-นามสกุล', '$prefix$first_name $last_name'),
                  buildListTile(Icons.transgender, 'เพศ', gender == 'M' ? 'ชาย' : 'หญิง'),
                  buildListTile(Icons.calendar_today, 'วันเกิด', birth_date),
                  buildListTile(Icons.phone, 'เบอร์โทรศัพท์', phone_number),
                  buildListTile(Icons.email, 'อีเมล', email),
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

  Future<void> _showImageSourceSelection(BuildContext context) async {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Wrap(
          children: <Widget>[
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: Text('เลือกจากแกลลอรี่', style: GoogleFonts.prompt()),
              onTap: () {
                Navigator.pop(context);
                pickAndSendImage(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: Text('ถ่ายรูปใหม่', style: GoogleFonts.prompt()),
              onTap: () {
                Navigator.pop(context);
                pickAndSendImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.cancel),
              title: Text('ยกเลิก', style: GoogleFonts.prompt()),
              onTap: () {
                Navigator.pop(context);
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> pickAndSendImage(ImageSource source) async {
    final XFile? pickedImage = await _picker.pickImage(source: source);
    if (pickedImage != null) {
      var file = File(pickedImage.path);
      try {
        final formData = FormData.fromMap({
          'id': id,
          'img_profile': await MultipartFile.fromFile(file.path, filename: basename(file.path)),
        });

        EasyLoading.show(status: 'กำลังอัปโหลด...');
        final response = await Services().Dio_post('UpdateRenterDetails', formData);

        if (response['status_code'] == 8000) {
          setState(() {
            img_profile = response['data']['img_profile'];
          });
        }
      } finally {
        EasyLoading.dismiss();
      }
    }
  }
}
