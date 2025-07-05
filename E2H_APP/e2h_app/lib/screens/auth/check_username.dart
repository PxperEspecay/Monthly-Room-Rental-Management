import 'dart:developer';
import 'package:e2h_app/screens/auth/set_password.dart';
import 'package:flutter/material.dart';
import '../../service/service.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';

class CheckUsername extends StatefulWidget {
  const CheckUsername({super.key});

  @override
  State<CheckUsername> createState() => _CheckUsernameState();
}

class _CheckUsernameState extends State<CheckUsername> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  late String username = "";

  Future<void> _checkUsername() async {
    var body = {"username": _usernameController.text};
    try {
      
      log("Sending request with body: $body");
      var response = await Services().Dio_post('check_username', body);
      log("Response: $response");
      if (response["status_code"] == 8000) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>  SetPassword(id: response["data"]["id"], username: _usernameController.text,),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset(
                'asset/image/logo-main.PNG',
                height: 200,
              ),
              const SizedBox(height: 20),
              // const Text(
              //   'ยินดีต้อนรับ',
              //   style: TextStyle(
              //     fontSize: 24,
              //     fontWeight: FontWeight.bold,
              //   ),
              // ),
              const SizedBox(height: 30),
              TextField(
                controller: _usernameController,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.email),
                  hintText: 'ชื่อผู้ใช้งาน',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30.0),
                  ),
                  filled: true,
                  fillColor: Colors.grey[200],
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _checkUsername,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 39, 176, 142),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30.0),
                  ),
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: const Text(
                  'ยืนยันชื่อผู้ใช้งาน',
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}


