import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:developer';
import 'dart:io';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';
import '../../service/service.dart';
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:get/get.dart';
import 'login_page.dart';

var logger = Logger();

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  late String? token = '';
  late dynamic response;
  @override
  void initState() {
    Timer(const Duration(seconds: 2), () async {
        _fetchToken().then((token) async {
          log('3333'+token!);
          if (token.isNotEmpty) {
            log('token=='+token!);
            Get.to(Bottombar(currentIndex: 0));
          } else {
             Get.to(const LoginPage());
          }
        });
      
      // _fetchToken().then((token) async {
      //   var body = {};
      //   response =
      //       await Services().Dio_post('Authen/RefreshToken', body).then((res) {
      //     // log(res.toString());
      //     if (res['status_code'] == 8000) {
      //       var tokenApi = res['data'];
      //       _saveToken(tokenApi);
      //       // Get.to(Bottombar(init_index: 0));
      //     } else {
      //       Get.to(const LoginPage());
      //     }
      //   }).catchError((onError) {
      //     // log(onError.toString());
      //   });
      // });
      // Get.to(() => Login());
     
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color.fromARGB(255, 2, 148, 141),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 20.h,
            height: 20.h,
            decoration: BoxDecoration(
                // color: Color(0xFFF9D276),
                borderRadius: BorderRadius.circular(99),
                boxShadow: const [
                  BoxShadow(
                      //offset: Offset(0, 4),
                      color: Color.fromRGBO(255, 255, 255, 0.2), //edited
                      spreadRadius: 10,
                      blurRadius: 1000 //edited
                      )
                ]),
            child: Container(child: Image.asset('asset/image/logo-main.PNG')),
          ),
          // Center(
          //   child: Container(
          //       width: 170,
          //       height: 170,
          //       child: Image.asset('assets/image/aog_logo.png')),
          // ),
        ],
      ),
    );
  }

  Future<bool?> _fetchlogin() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    var flaglogin = prefs.getBool('flaglogin');
    return flaglogin;
  }

  Future<void> _saveToken(token) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

Future<String?> _fetchToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = prefs.getString(
              'token',
            ) ==
            null
        ? ""
        : prefs.getString(
            'token',
          );
    // log('token = ' + token.toString());
    return token;
  }
}
