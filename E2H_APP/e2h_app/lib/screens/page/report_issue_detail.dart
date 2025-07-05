import 'dart:developer';

import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:e2h_app/screens/page/noti_page.dart';
import 'package:e2h_app/screens/page/report_issue_edit.dart';
import 'package:e2h_app/screens/page/report_issue_screen.dart';

import 'package:e2h_app/service/service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import 'package:flutter/rendering.dart';
import 'package:intl/intl.dart';
import 'package:sizer/sizer.dart';
import 'package:get/get.dart';

class ReportIssueDetail extends StatefulWidget {
  final int id;
  final String flag_page;

  const ReportIssueDetail(
      {super.key, required this.id, required this.flag_page});

  @override
  _ReportIssueDetailState createState() => _ReportIssueDetailState();
}

class _ReportIssueDetailState extends State<ReportIssueDetail> {
  Map<String, dynamic>? issue_detail;
  final TextEditingController _timecontroller = TextEditingController();
  String? _selectedRepairTimePeriod;
  bool isLoading = true;
  DateTime? selectedDate;
  late final int renter_id;
// สร้าง List จาก field ที่ไม่ใช่ null และไม่ว่าง
  List<String> photoUrls = []; // กำหนดไว้ใน class ด้านบน
  @override
  void initState() {
    super.initState();
    // log('billTypeId: $billTypeId');
    _fetchGetRepairRequestsDetails();
  }

  Future<void> _fetchGetRepairRequestsDetails() async {
    var body = {"id": widget.id}; // ส่ง id ไปที่ API

    try {
      var res = await Services().Dio_post('GetIssueDetails', body);
      log('resss == $res');
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          issue_detail = res['data'];
          log('issue_detail == $issue_detail');

          photoUrls = [
            issue_detail?['image_1'],
            issue_detail?['image_2'],
            issue_detail?['image_3'],
            issue_detail?['image_4'],
            issue_detail?['image_5'],
          ]
              .where((url) => url != null && url.toString().isNotEmpty)
              .cast<String>()
              .toList();
          log('photoUrls == $photoUrls');
          isLoading = false;
        });
      } else {
        throw Exception("ดึงข้อมูลบิลไม่สำเร็จ");
      }
    } catch (e) {
      print('Error fetching issue_detail details: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final GlobalKey qrKey = GlobalKey();

    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios),
          onPressed: () {
            if (widget.flag_page == 'noti') {
              Get.offAll(NotiPage(
                flag_page: 'ReportIssueDetail',
              ));
            } else {
              Get.offAll(Bottombar(
                currentIndex: 2,
              ));
            }
          },
        ),
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
        title: Text(
          'รายละเอียดเรื่องที่แจ้ง',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
        actions: [
          if (issue_detail?['status'] == 'waiting_to_check' ||
              issue_detail?['status'] == 'pending') ...[
            IconButton(
              onPressed: () {
                Get.to(ReportIssueEdit(
                  id: widget.id,
                  flag_page: 'detail',
                ));
              },
              icon: Icon(Icons.border_color_outlined),
            ),
          ]
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : issue_detail == null
              ? const Center(child: Text("ไม่พบข้อมูลบิล"))
              : Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        child: Center(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              _buildBillDetailsCard(),
                              SizedBox(
                                height: 2.h,
                              ),
                              if (issue_detail?['status'] ==
                                      'waiting_to_check' ||
                                  issue_detail?['status'] == 'pending') ...[
                                SafeArea(
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.redAccent,
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        minimumSize:
                                            const Size(double.infinity, 50),
                                      ),
                                      onPressed: () {
                                        _showAlertDialog_cancel(
                                            context,
                                            'ยืนยันการยกเลิกคำร้อง',
                                            'ยืนยันยกเลิกคำร้อง?');
                                      },
                                      child: Text(
                                        'ยกเลิกคำร้อง',
                                        style: GoogleFonts.prompt(
                                          fontSize: 18,
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildBillDetailsCard() {
    return SizedBox(
      width: 95.w,
      child: Column(
        children: [
          Card(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 5,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (issue_detail?['urgent_issue'] == false) ...[
                        statusTag(
                          text: 'ทั่วไป',
                          borderColor: Color.fromRGBO(21, 71, 121, 1),
                          textColor: Color.fromRGBO(21, 71, 121, 1),
                          backgroundColor: Color.fromRGBO(247, 250, 254, 1),
                        ),
                      ] else if (issue_detail?['urgent_issue'] == true) ...[
                        statusTag(
                          text: 'เรื่องด่วน',
                          borderColor: Color.fromRGBO(235, 87, 87, 1),
                          textColor: Color.fromRGBO(235, 87, 87, 1),
                          backgroundColor: Color.fromRGBO(255, 245, 245, 1),
                        ),
                      ],
                      if (issue_detail?['status'] == 'waiting_to_check') ...[
                        statusTag(
                          text: 'รอตรวจสอบ',
                          borderColor: Color.fromRGBO(21, 71, 121, 1),
                          textColor: Color.fromRGBO(21, 71, 121, 1),
                          backgroundColor: Color.fromRGBO(247, 250, 254, 1),
                        ),
                      ] else if (issue_detail?['status'] == 'pending') ...[
                        statusTag(
                          text: 'รอดำเนินการ',
                          borderColor: Color.fromRGBO(255, 168, 0, 1),
                          textColor: Color.fromRGBO(255, 168, 0, 1),
                          backgroundColor: Color.fromRGBO(255, 246, 230, 1),
                        ),
                      ] else if (issue_detail?['status'] == 'in_progress') ...[
                        statusTag(
                          text: 'กำลังดำเนินการ',
                          borderColor: Color(0xFF44C2B8),
                          textColor: Color(0xFF44C2B8),
                          backgroundColor: Color.fromRGBO(247, 250, 254, 1),
                        ),
                      ] else if (issue_detail?['status'] == 'completed') ...[
                        statusTag(
                          text: 'ดำเนินการสำเร็จ',
                          borderColor: Color.fromRGBO(65, 201, 128, 1),
                          textColor: Color.fromRGBO(65, 201, 128, 1),
                          backgroundColor: Color.fromRGBO(236, 250, 242, 1),
                        ),
                      ] else if (issue_detail?['status'] == 'rejected') ...[
                        statusTag(
                          text: 'ปฏิเสธคำร้อง',
                          borderColor: Color.fromRGBO(235, 87, 87, 1),
                          textColor: Color.fromRGBO(235, 87, 87, 1),
                          backgroundColor: Color.fromRGBO(255, 245, 245, 1),
                        ),
                      ] else if (issue_detail?['status'] == 'cancel') ...[
                        statusTag(
                          text: 'ยกเลิก',
                          borderColor: Color.fromRGBO(71, 80, 89, 1),
                          textColor: Color.fromRGBO(143, 142, 142, 1),
                          backgroundColor: Color.fromRGBO(228, 228, 228, 1),
                        ),
                      ] else if (issue_detail?['status'] == 'fail') ...[
                        statusTag(
                          text: 'ดำเนินการไม่สำเร็จ',
                          borderColor: Color.fromRGBO(21, 71, 121, 1),
                          textColor: Color.fromRGBO(180, 180, 180, 1),
                          backgroundColor: Color.fromRGBO(247, 250, 254, 1),
                        ),
                      ],
                    ],
                  ),
                  SizedBox(
                    height: 1.h,
                  ),
                  Row(
                    children: [
                      Text(
                        'หัวขัอ :',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                          color: Colors.teal.shade600,
                        ),
                      ),
                      SizedBox(
                        width: 2.w,
                      ),
                      Text(
                        issue_detail?['title'],
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 2.h,
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'รายละเอียด :',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                          color: Colors.teal.shade600,
                        ),
                      ),
                      SizedBox(
                        width: 2.w,
                      ),
                      Flexible(
                        child: Text(
                          issue_detail?['description'],
                          style: GoogleFonts.prompt(
                            fontWeight: FontWeight.w400,
                            fontSize: 20,
                            color: Colors.black,
                          ),
                          softWrap: true,
                          overflow: TextOverflow.visible,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 2.h,
                  ),
                  Row(
                    children: [
                      Text(
                        'สถาที่ :',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                          color: Colors.teal.shade600,
                        ),
                      ),
                      SizedBox(
                        width: 2.w,
                      ),
                      Text(
                        issue_detail?['Renter']['Room']['room_number'] ?? '-',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 2.h,
                  ),
                  Row(
                    children: [
                      Text(
                        'ห้อง/บ้านเลขที่ :',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                          color: Colors.teal.shade600,
                        ),
                      ),
                      SizedBox(
                        width: 2.w,
                      ),
                      Text(
                        issue_detail?['Renter']['Room']['room_number'] ?? '-',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 2.h,
                  ),
                  Row(
                    children: [
                      Text(
                        'ผู้แจ้ง :',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                          color: Colors.teal.shade600,
                        ),
                      ),
                      SizedBox(
                        width: 2.w,
                      ),
                      Text(
                        '${issue_detail?['Renter']['prefix'] ?? ''}${issue_detail?['Renter']['first_name'] ?? ''} ${issue_detail?['Renter']['last_name'] ?? ''}',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 2.h,
                  ),
                  Row(
                    children: [
                      Text(
                        'วันที่แจ้ง/เวลา :',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                          color: Colors.teal.shade600,
                        ),
                      ),
                      SizedBox(
                        width: 2.w,
                      ),
                      Text(
                        '${formatThaiDate(issue_detail?['createdAt'] ?? '')}/${formatTime(issue_detail?['createdAt'] ?? '')}',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 2.h,
                  ),
                  Row(
                    children: [
                      Text(
                        'เบอร์ที่ติดต่อกลับ :',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w600,
                          fontSize: 20,
                          color: Colors.teal.shade600,
                        ),
                      ),
                      SizedBox(
                        width: 2.w,
                      ),
                      Text(
                        issue_detail?['callback_phone'] ?? '-',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 2.h,
                  ),
                  Text(
                    'รูปภาพ :',
                    style: GoogleFonts.prompt(
                      fontWeight: FontWeight.w600,
                      fontSize: 20,
                      color: Colors.teal.shade600,
                    ),
                  ),
                  SizedBox(
                    width: 95.w,
                    height: 20.h,
                    child: ListView.builder(
                      itemCount: photoUrls.length,
                      scrollDirection: Axis.horizontal,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Image.network(
                            'http://172.20.10.3:3000/${photoUrls[index]}',
                            fit: BoxFit.cover,
                          ),
                        );
                      },
                    ),
                  ),
                  if (issue_detail?['pending_reason_by_admin'] != null &&
                      issue_detail?['status'] != 'rejected') ...[
                    SizedBox(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Divider(),
                          Text(
                            'หมายเหตุ',
                            style: GoogleFonts.prompt(
                              fontWeight: FontWeight.w600,
                              fontSize: 20,
                              color: Colors.teal.shade600,
                            ),
                          ),
                          SizedBox(
                            height: 0.5.h,
                          ),
                          Text(
                            issue_detail?['pending_reason_by_admin'] ?? '-',
                            style: GoogleFonts.prompt(
                              fontWeight: FontWeight.w400,
                              fontSize: 18,
                              color: Color.fromRGBO(128, 122, 122, 1),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ] else if (issue_detail?['status'] == 'rejected' &&
                      issue_detail?['reject_reason_by_admin'] != null) ...[
                    SizedBox(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Divider(),
                          Text(
                            'หมายเหตุ (ปฏิเสธคำร้อง)',
                            style: GoogleFonts.prompt(
                              fontWeight: FontWeight.w600,
                              fontSize: 20,
                              color: Colors.teal.shade600,
                            ),
                          ),
                          SizedBox(
                            height: 0.5.h,
                          ),
                          Text(
                            issue_detail?['reject_reason_by_admin'] ?? '-',
                            style: GoogleFonts.prompt(
                              fontWeight: FontWeight.w400,
                              fontSize: 18,
                              color: Colors.red,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  SizedBox(
                    height: 2.h,
                  ),
                  if (issue_detail?['status'] == 'waiting_to_check') ...[
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        'อัพเดต : ${formatThaiDate(issue_detail?['createdAt'] ?? '')} ${formatTime(issue_detail?['createdAt'] ?? '')} น.',
                        style: GoogleFonts.prompt(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ] else if (issue_detail?['status'] == 'pending') ...[
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        'อัพเดต : ${formatThaiDate(issue_detail?['pending_at'] ?? '')} ${formatTime(issue_detail?['pending_at'] ?? '')} น.',
                        style: GoogleFonts.prompt(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ] else if (issue_detail?['status'] == 'in_progress') ...[
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        'อัพเดต : ${formatThaiDate(issue_detail?['in_progress_at'] ?? '')} ${formatTime(issue_detail?['in_progress_at'] ?? '')} น.',
                        style: GoogleFonts.prompt(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ] else if (issue_detail?['status'] == 'completed') ...[
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        'อัพเดต : ${formatThaiDate(issue_detail?['completed_at'] ?? '')} ${formatTime(issue_detail?['completed_at'] ?? '')} น.',
                        style: GoogleFonts.prompt(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ] else if (issue_detail?['status'] == 'rejected') ...[
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        'อัพเดต : ${formatThaiDate(issue_detail?['rejected_at'] ?? '')} ${formatTime(issue_detail?['rejected_at'] ?? '')} น.',
                        style: GoogleFonts.prompt(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ] else if (issue_detail?['status'] == 'cancel') ...[
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        'อัพเดต : ${formatThaiDate(issue_detail?['cancelled_at'] ?? '')} ${formatTime(issue_detail?['cancelled_at'] ?? '')} น.',
                        style: GoogleFonts.prompt(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ] else if (issue_detail?['status'] == 'fail') ...[
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        'อัพเดต : ${formatThaiDate(issue_detail?['updatedAt'] ?? '')} ${formatTime(issue_detail?['updatedAt'] ?? '')} น.',
                        style: GoogleFonts.prompt(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRepairTypeSelection() {
    List<Map<String, dynamic>> options = [
      {'id': 1, 'name': 'เช้า'},
      {'id': 2, 'name': 'บ่าย'},
    ];
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: options.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 3.5,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemBuilder: (context, index) {
        int optionId = options[index]['id']; // ดึง ID ของตัวเลือก
        String optionName = options[index]['name']; // ดึงชื่อของตัวเลือก

        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedRepairTimePeriod = optionName; // บันทึกค่า ID ที่เลือก
              log('id = $_selectedRepairTimePeriod');
            });
          },
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: _selectedRepairTimePeriod == optionName
                    ? Colors.teal
                    : Colors.grey,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _selectedRepairTimePeriod == optionName
                      ? Icons.radio_button_checked
                      : Icons.radio_button_off,
                  color: _selectedRepairTimePeriod == optionName
                      ? Colors.teal
                      : Colors.grey,
                ),
                const SizedBox(width: 8),
                Text(
                  optionName,
                  style: GoogleFonts.prompt(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: _selectedRepairTimePeriod == optionName
                        ? Colors.teal
                        : Colors.black,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget statusTag({
    required String text,
    required Color borderColor,
    required Color textColor,
    required Color backgroundColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor),
      ),
      child: Text(
        text,
        style: GoogleFonts.prompt(
          fontSize: 12,
          color: textColor,
        ),
      ),
    );
  }

  Future<void> CancelThisIssue({
    required int issue_id,
    required int renter_id,
  }) async {
    var body = {
      "issue_id": issue_id,
      "renter_id": renter_id,
      "status": "cancel",
    };
    log('body22222 === $body');
    try {
      var res = await Services().Dio_post('CancelThisIssue', body);
      log('resss == $res');
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          _showAlertDialog(context, 'ยกเลิกสำเร็จ', 'สำเร็จ');
        });
      } else {
        _showAlertDialog(context, 'ยกเลิกล้มเหลว', 'เกิดข้้้อผิดพลาด');
      }
    } catch (e) {
      print('Error fetching issue_detail details: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  void _showAlertDialog(
    BuildContext context,
    String message,
    String title,
  ) {
    showCupertinoDialog<void>(
      context: context,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: Text(
          title,
          style: GoogleFonts.prompt(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        content: Text(
          message,
          style: GoogleFonts.prompt(
            fontSize: 14,
            fontWeight: FontWeight.w300,
            color: Colors.black,
          ),
        ),
        actions: <CupertinoDialogAction>[
          CupertinoDialogAction(
            isDestructiveAction: true,
            onPressed: () {
              Get.offAll(ReportIssueScreen());
            },
            child: Text(
              "ตกลง",
              style: GoogleFonts.prompt(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.blueAccent,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showAlertDialog_cancel(
    BuildContext context,
    String message,
    String title,
  ) {
    showCupertinoDialog<void>(
      context: context,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: Text(
          title,
          style: GoogleFonts.prompt(
            fontSize: 18,
            fontWeight: FontWeight.w500,
            color: Colors.black,
          ),
        ),
        content: Text(
          message,
          style: GoogleFonts.prompt(
            fontSize: 14,
            fontWeight: FontWeight.w300,
            color: Colors.black,
          ),
        ),
        actions: <CupertinoDialogAction>[
          CupertinoDialogAction(
            onPressed: () {
              Navigator.pop(context);
            },
            child: Text(
              "ยกเลิก",
              style: GoogleFonts.prompt(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.redAccent,
              ),
            ),
          ),
          CupertinoDialogAction(
            onPressed: () {
              CancelThisIssue(
                  issue_id: widget.id, renter_id: issue_detail?['renter_id']);
            },
            child: Text(
              "ตกลง",
              style: GoogleFonts.prompt(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.blueAccent,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String getThaiMonth(int month) {
  const thaiMonths = [
    '',
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พฤศจิกายน',
    'ธันวาคม'
  ];
  return thaiMonths[month];
}

// แปลง YYYY-MM-DD เป็น "10 ก.พ. 2568"
String formatThaiDate(String date) {
  if (date.isEmpty) return '-';

  DateTime parsedDate = DateTime.parse(date);
  String day = DateFormat('d').format(parsedDate); // วันที่ (10)
  String month = getThaiMonth(parsedDate.month); // ก.พ.
  String year = (parsedDate.year + 543).toString(); // พ.ศ.

  return '$day $month $year';
}

String formatTime(String date) {
  if (date.isEmpty) return '-';

  DateTime parsedDate = DateTime.parse(date);
  String time = DateFormat('HH:mm').format(parsedDate); // วันที่ (10)

  return time;
}

String formatNumber(dynamic value) {
  if (value == null) return "0"; // กรณีค่าเป็น null
  num? number = num.tryParse(value.toString()); // แปลง String เป็น num
  if (number == null) return "0"; // ถ้าแปลงไม่ได้ให้คืนค่า 0
  final formatter = NumberFormat("#,###", "en_US");
  return formatter.format(number);
}
