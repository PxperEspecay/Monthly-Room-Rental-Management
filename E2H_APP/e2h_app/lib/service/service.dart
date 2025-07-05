import 'dart:developer';
import 'package:dio/dio.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'dart:convert';

class Services {
  // String endpoint = 'http://localhost:3000/api/'; //uat
  // String endpoint = 'http://192.168.1.101:3000/api/';
  String endpoint = 'http://172.20.10.3:3000/api/';
  // String endpoint = 'http://localhost:3000/api/';

  // String endpoint = 'http://192.168.1.101:3000/api/'; //uat บ้านบางใหญ่
  // String endpoint = 'http://192.168.1.210:3000/api/'; //uat บ้านฉาง
  // String endpoint = 'https://localhost:7153/'; //test
  // Future<dynamic> getString() async {
  //   final SharedPreferences prefs = await SharedPreferences.getInstance();
  //   var token = prefs.getString('token')!;

  //   return token;
  // }

  Future<dynamic> Dio_post(
    path,
    body,
  ) async {
    DateTime now = DateTime.now();
    // log(endpoint + path);
    //   log(body.toString());

    try {
      log("📡 Dio endpoint: $endpoint$path");
      log('[🟡 DIO] endpoint: $endpoint$path');
      log('[🟡 DIO] body: $body');
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      var token =
          prefs.getString('token') == "" ? "" : prefs.getString('token');
      // log('tokenpost====' + token.toString());
      final Response response;
      if (token != null) {
        // log('null11');
        response = await Dio().post(
          endpoint + path,
          data: body,
          options: Options(
            headers: {
              "authorization": "Bearer $token",
            },
          ),
        );
      } else {
        log('null22');

        response = await Dio().post(
          endpoint + path,
          data: body,
        );
      }

      // if (response.data["statusCode"] != 1000) {
      //   log(response.data["statusCode"].toString());
      // }
      return response.data;
    } catch (e) {
  log('🚨 Dio error: $e');
  return {
    'status_code': 9999,
    'message': 'Connection error',
    'error': e.toString(),
  };
    }
  }

  Future<dynamic> Dio_patch(path, body) async {
    DateTime now = DateTime.now();
    log(endpoint + path);

    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      var token =
          prefs.getString('token') == "" ? "" : prefs.getString('token');
      log('token====$token');

      final Response response;
      if (token != null) {
        response = await Dio().patch(
          endpoint + path,
          data: {
            "FormData": {
              "Data": body,
              "Date": now.toString(),
              "SessionId": null
            }
          },
          options: Options(
            headers: {
              "authorization": "Bearer $token",
            },
          ),
        );
      } else {
        response = await Dio().patch(
          endpoint + path,
          data: {
            "FormData": {
              "Data": body,
              "Date": now.toString(),
              "SessionId": null
            }
          },
        );
      }
      log(endpoint + path);
      // if (response.data["statusCode"] != 1000) {
      //   log(response.data["statusCode"].toString());
      // }
      return response.data;
    } catch (e) {
      EasyLoading.dismiss();
      log('eror$e');
      return e;
    }
  }

  Future<dynamic> Dio_get(path) async {
    log('pathh====$endpoint$path');

    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      var token =
          prefs.getString('token') == "" ? "" : prefs.getString('token');
      log('token====$token');
      final Response response;
      // ignore: unnecessary_null_comparison
      response = await Dio().get(
        endpoint + path,
        options: Options(
          headers: {
            "authorization": "Bearer ${token!}",
          },
        ),
      );

      if (response.data["statusCode"] != 1000) {
        // err(response.data, null);
        // log(response.data["statusCode"].toString());
      }
      return response.data;
    } catch (e) {
      log(e.toString());
      return e;
    }
  }
}
