import 'package:e2h_app/screens/auth/splash_page.dart';
import 'package:e2h_app/screens/page/announcement_screen.dart';
import 'package:e2h_app/screens/page/setting_screen.dart';
import 'package:e2h_app/screens/page/main_page_menu.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // สำหรับ SystemUiOverlayStyle
import 'package:get/get.dart'; // สำหรับการใช้งาน GetMaterialApp
import 'package:google_fonts/google_fonts.dart'; // สำหรับฟอนต์ Google Fonts
import './global/global.dart'; // ตัวแปร Global
import 'package:sizer/sizer.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'package:flutter_easyloading/flutter_easyloading.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('th', null);
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: PopScope(
        canPop: false, // ปิดปุ่ม Back
        onPopInvoked: (didPop) {
          if (!didPop) {
            SystemNavigator.pop(); // ออกจากแอปเมื่อกดปุ่ม Back
          }
        },
        child: MediaQuery(
          data:
              MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(1)),
          child: LayoutBuilder(
            builder: (BuildContext context, BoxConstraints constraints) {
              Global.largeScreen = constraints.minWidth > 600;

              return Sizer(
                builder: (context, orientation, screenType) {
                  return Center(
                    child: GetMaterialApp(
                      title: 'E2H App',
                      debugShowCheckedModeBanner: false,
                      home: const SplashPage(),
                      theme: ThemeData(
                        useMaterial3: true,
                        appBarTheme: const AppBarTheme(
                            systemOverlayStyle: SystemUiOverlayStyle.light),
                        cupertinoOverrideTheme:
                            const CupertinoThemeData(applyThemeToAll: true),
                      ),
                      builder: EasyLoading.init(),
                      defaultTransition: Transition
                          .noTransition, // ปิด Transition ที่ทำให้ Swipe Back ได้
                      popGesture: false, // ปิด Gesture Swipe Back
                      getPages: [
                        GetPage(
                          name: '/',
                          page: () => const SplashPage(),
                          transition:
                              Transition.noTransition, // ปิด Gesture บน iOS
                          opaque: true,
                          maintainState: true,
                        ),
                        GetPage(
                          name: '/announcement',
                          page: () => const AnnouncementScreen(),
                          transition: Transition.noTransition,
                          opaque: true,
                          maintainState: true,
                        ),
                        GetPage(
                          name: '/settings',
                          page: () => const SettingsScreen(),
                          transition: Transition.noTransition,
                          opaque: true,
                          maintainState: true,
                        ),
                        GetPage(
                          name: '/menu',
                          page: () => const MainPageMenu(),
                          transition: Transition.noTransition,
                          opaque: true,
                          maintainState: true,
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ),
      ),
    );
  }
}
