import 'dart:developer';

import 'package:e2h_app/screens/auth/login_page.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/material.dart';

class SetPassword extends StatefulWidget {
  final dynamic id;
  final dynamic username;
  const SetPassword({super.key,required this.id,required this.username});

  @override
  _SetPasswordState createState() => _SetPasswordState();
}


class _SetPasswordState extends State<SetPassword> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  
  // ใช้ตัวแปรเพื่อควบคุมการแสดง/ซ่อนรหัสผ่าน
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  // ฟังก์ชันสำหรับ validate ข้อมูล
  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'กรุณากรอกรหัสผ่าน';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'กรุณากรอกยืนยันรหัสผ่าน';
    }
    if (value != _passwordController.text) {
      return 'รหัสผ่านไม่ตรงกัน';
    }
    return null;
  }

  void initState(){
  super.initState();
  log(widget.id.toString()+'11111');
  log(widget.username+'22222');
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ตั้งค่ารหัสผ่าน'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 50),

              // ฟอร์มการตั้งรหัสผ่าน
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    // ช่องกรอกรหัสผ่าน
                    TextFormField(
                      controller: _passwordController,
                      obscureText: !_isPasswordVisible, // ใช้สถานะในการแสดง/ซ่อน
                      decoration: InputDecoration(
                        labelText: 'รหัสผ่าน',
                        prefixIcon: const Icon(Icons.lock),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _isPasswordVisible
                                ? Icons.visibility
                                : Icons.visibility_off,
                          ),
                          onPressed: () {
                            setState(() {
                              _isPasswordVisible = !_isPasswordVisible;
                            });
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        filled: true,
                        fillColor: Colors.grey[200],
                      ),
                      validator: _validatePassword,
                    ),
                    const SizedBox(height: 20),

                    // ช่องกรอกยืนยันรหัสผ่าน
                    TextFormField(
                      controller: _confirmPasswordController,
                      obscureText: !_isConfirmPasswordVisible, // ใช้สถานะในการแสดง/ซ่อน
                      decoration: InputDecoration(
                        labelText: 'ยืนยันรหัสผ่าน',
                        prefixIcon: const Icon(Icons.lock),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _isConfirmPasswordVisible
                                ? Icons.visibility
                                : Icons.visibility_off,
                          ),
                          onPressed: () {
                            setState(() {
                              _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                            });
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        filled: true,
                        fillColor: Colors.grey[200],
                      ),
                      validator: _validateConfirmPassword,
                    ),
                    const SizedBox(height: 30),

                    // ปุ่มยืนยันการตั้งรหัสผ่าน
                    ElevatedButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          // ฟังก์ชันที่ใช้เมื่อข้อมูลถูกต้อง
                          _SetPassword();
                          log('xxxxxxx');
                          
                        }
                        
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        minimumSize: const Size(double.infinity, 50),
                      ),
                      child: const Text(
                        'ยืนยันการตั้งรหัสผ่าน',
                        style: TextStyle(fontSize: 16, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  Future<dynamic> _SetPassword() async {
    var body = {
      "id": widget.id,
      "username" : widget.username,
      "password" : _confirmPasswordController.text
      };
    try {
      
      log("Sending request with body: $body");
      var response = await Services().Dio_post('set_password_mobile', body);
      log("Response: $response");
      if (response["status_code"] == 8000) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>  LoginPage(),
          ),
        );
      } else if (response["status_code"] == 6000) {
        _showErrorDialog("ไม่พบผู้ใช้งานนี้ในระบบ");
      } else {
        _showErrorDialog("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์1111");
      }
    } catch (e) {
      log('ee'+e.toString());
      _showErrorDialog("เกิดข้อผิดพลาด: $e");
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("ข้อผิดพลาด"),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("ตกลง"),
          ),
        ],
      ),
    );
  }
  
}


