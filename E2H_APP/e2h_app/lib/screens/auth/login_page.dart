import 'dart:developer';
import 'package:e2h_app/global/global.dart';
import 'package:e2h_app/screens/auth/check_username.dart';
import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../service/service.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vibration/vibration.dart';
import 'dart:developer' as dev;


class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isError = false;
  String _errorMessage = "";

  Future<void> Login() async {
  // 🔹 ตรวจสอบว่าผู้ใช้กรอกครบทั้ง username และ password หรือไม่
  if (_usernameController.text.isEmpty || _passwordController.text.isEmpty) {
    setState(() {
      _isError = true;
      _errorMessage = "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน";
    });

    _triggerShakeEffect(); // ทำให้ TextField สั่น
    return; // ยังไม่ต้องยิง API
  }

  setState(() {
    _isError = false; // รีเซ็ต Error ถ้ามีการกรอกข้อมูล
    _errorMessage = "";
  });

  var body = {
    'username': _usernameController.text,
    'password': _passwordController.text,
  };

  EasyLoading.show(dismissOnTap: false);

  try {
    
    var res = await Services().Dio_post('login_mobile', body);
    log("🔹 API Response: $res");

    if (res is Map<String, dynamic> && res.containsKey('status_code')) {
      int? statusCode = int.tryParse(res['status_code'].toString());

      if (statusCode == 8000) {
        var token_api = res['data']['token'];
        Map<String, dynamic> decodedToken = JwtDecoder.decode(token_api);

        final SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token_api);

        EasyLoading.dismiss();
        Get.to(Bottombar(currentIndex: 0));
      } else {
        _showLoginError();
      }
    } else {
      _showLoginError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  } catch (e) {
    log("🚨 Login Error: $e");
    _showLoginError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  } finally {
    EasyLoading.dismiss();
  }
}


  void _showLoginError([String message = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"]) {
    setState(() {
      _isError = true;
      _errorMessage = message;
    });

    _triggerShakeEffect();
  }

  void _triggerShakeEffect() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(duration: 100);
    } else {
      HapticFeedback.heavyImpact();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Image.asset(
                  'asset/image/logo-main.PNG',
                  height: 200,
                ),
                const SizedBox(height: 20),
                const Text(
                  'ยินดีต้อนรับ',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 30),

                // 🔹 ช่องกรอก Username
                TextFormField(
                  controller: _usernameController,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.email),
                    hintText: 'ชื่อผู้ใช้งาน',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                    filled: true,
                    fillColor: _isError ? Colors.red[50] : Colors.grey[200],
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                      borderSide: BorderSide(
                        color: _isError ? Colors.red : Colors.transparent,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                      borderSide: BorderSide(
                        color: _isError ? Colors.red : Colors.blue,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // 🔹 ช่องกรอก Password
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock),
                    hintText: 'รหัสผ่าน',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                    filled: true,
                    fillColor: _isError ? Colors.red[50] : Colors.grey[200],
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                      borderSide: BorderSide(
                        color: _isError ? Colors.red : Colors.transparent,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                      borderSide: BorderSide(
                        color: _isError ? Colors.red : Colors.blue,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // 🔹 ข้อความ Error
                if (_isError)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Text(
                      _errorMessage,
                      style: const TextStyle(color: Colors.red, fontSize: 14),
                    ),
                  ),

                // 🔹 ข้อความ "ลืมรหัสผ่าน" อยู่ขวา
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    GestureDetector(
                      onTap: () {
                        // TODO: เพิ่มฟังก์ชันสำหรับไปยังหน้าลืมรหัสผ่าน
                      },
                      child: const Text(
                        'ลืมรหัสผ่าน',
                        style: TextStyle(
                          color: Color.fromARGB(255, 39, 176, 142),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // 🔹 ปุ่ม Login
                ElevatedButton(
                  onPressed: () {
                    dev.log('[LOGIN BUTTON PRESSED]');
                    Login();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 39, 176, 142),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                    minimumSize: const Size(double.infinity, 50),
                  ),
                  child: const Text(
                    'ลงชื่อเข้าใช้',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                ),
                const SizedBox(height: 20),

                // 🔹 ข้อความและปุ่มตั้งค่ารหัสผ่าน
                Column(
                  children: [
                    const Text(
                      'เข้าใช้งานครั้งแรก?',
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const CheckUsername(),
                          ),
                        );
                      },
                      child: const Text(
                        'ตั้งค่ารหัสผ่าน',
                        style: TextStyle(
                          color: Colors.purple,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
