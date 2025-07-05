import 'dart:convert';
import 'dart:developer';

import 'package:e2h_app/screens/page/noti_page.dart';
import 'package:e2h_app/screens/page/request_repair_edit.dart';
import 'package:e2h_app/screens/page/request_repair_screen.dart';
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

class RequestRepairDetail extends StatefulWidget {
  final int id;
  final String flag_page;

  const RequestRepairDetail(
      {super.key, required this.id, required this.flag_page});

  @override
  _RequestRepairDetailState createState() => _RequestRepairDetailState();
}

class _RequestRepairDetailState extends State<RequestRepairDetail> {
  Map<String, dynamic>? request_repair_detail;
  final TextEditingController _timecontroller = TextEditingController();
  String? _selectedRepairTimePeriod;
  bool isLoading = true;
  DateTime? selectedDate;
// สร้าง List จาก field ที่ไม่ใช่ null และไม่ว่าง
  List<String> photoUrls = []; // กำหนดไว้ใน class ด้านบน
  @override
  void initState() {
    super.initState();
    // log('billTypeId: $billTypeId');
    _fetchGetRepairRequestsDetails();
  }

  Future<void> _fetchGetRepairRequestsDetails() async {
    var body = {"repair_request_id": widget.id}; // ส่ง id ไปที่ API

    try {
      var res = await Services().Dio_post('GetRepairRequestsDetails', body);
      log('resss == $res');
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          request_repair_detail = res['data'];
          final repairSchedule = request_repair_detail?['RepairSchedule'];
          if (repairSchedule != null &&
              repairSchedule['selected_date'] != null &&
              repairSchedule['selected_time_period'] != null) {
            if (repairSchedule['rescheduled_by_renter'] == true) {
              _timecontroller.text =
                  formatThaiDate(repairSchedule['requested_new_date']);
            } else {
              _timecontroller.text =
                  formatThaiDate(repairSchedule['selected_date']);
            }
            if (repairSchedule['rescheduled_by_renter'] == true) {
              _selectedRepairTimePeriod =
                  repairSchedule['requested_new_time_period'];
              ;
            } else {
              _selectedRepairTimePeriod =
                  repairSchedule['selected_time_period'];
              ;
            }
          }

          photoUrls = [
            request_repair_detail?['photo_url'],
            request_repair_detail?['photo_url2'],
            request_repair_detail?['photo_url3'],
            request_repair_detail?['photo_url4'],
            request_repair_detail?['photo_url5'],
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
      print('Error fetching request_repair_detail details: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _selectDate() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(), // ✅ เริ่มที่วันนี้
      firstDate: DateTime(2000), // ✅ ปรับช่วงให้เลือกย้อนหลังได้เยอะขึ้น
      lastDate: DateTime(2100),

      builder: (BuildContext context, Widget? child) {
        return Theme(
          data: ThemeData.light().copyWith(
            dialogBackgroundColor: Colors.white, // ✅ สีพื้นหลังกล่อง

            colorScheme: ColorScheme.light(
              primary: Colors.teal.shade400, // ✅ สีหลัก (ไฮไลต์วันที่)
              onPrimary: Colors.white, // ✅ สีตัวหนังสือในวันถูกเลือก
              onSurface: Color(0xFF1F2937), // ✅ สีข้อความวันที่
            ),

            textTheme: const TextTheme(
              titleLarge: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black,
                fontFamily: 'Kanit', // ✅ ใช้ฟอนต์ไทยถ้ามี
              ),
            ),

            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: Colors.teal.shade400,
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Kanit',
                ),
              ),
            ),

            // ✅ กำหนดรูปร่างปุ่ม
            elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
                backgroundColor: Colors.teal.shade400, // ปุ่มสีน้ำเงิน
                foregroundColor: Colors.white,
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Kanit',
                ),
              ),
            ),
          ),
          child: child!,
        );
      },
    );

    setState(() {
      selectedDate = pickedDate;

      _timecontroller.text = formatThaiDate(selectedDate.toString());
      log('_timecontroller.text == $selectedDate');
    });
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
              Get.offAll(NotiPage(flag_page: 'detail'));
            } else {
              Get.offAll(RequestRepairScreen());
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
          'รายละเอียดแจ้งซ่อม',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
        actions: [
          if (request_repair_detail?['status'] == 'acknowledged' ||
              request_repair_detail?['status'] == 'scheduled' ||
              request_repair_detail?['status'] == 'waiting_to_check') ...[
            IconButton(
              onPressed: () {
                Get.to(RequestRepairEdit(
                  id: widget.id,
                ));
              },
              icon: Icon(Icons.border_color_outlined),
            ),
          ]
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : request_repair_detail == null
              ? const Center(child: Text("ไม่พบข้อมูลบิล"))
              : Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildBillDetailsCard(),
                            SizedBox(height: 4.h),
                            if (request_repair_detail?['status'] ==
                                    'acknowledged' ||
                                request_repair_detail?['status'] ==
                                    'scheduled') ...[
                              Text(
                                'เลือกเวลานัดหมาย :',
                                style: GoogleFonts.prompt(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 20,
                                  color: Colors.teal.shade600,
                                ),
                              ),
                              SizedBox(height: 1.h),
                              TextFormField(
                                controller: _timecontroller,
                                readOnly: true,
                                onTap: () => _selectDate(),
                                style: TextStyle(fontSize: 16),
                                decoration: InputDecoration(
                                  filled: true,
                                  fillColor: Color.fromRGBO(236, 238, 240, 1),
                                  hintText: 'วัน/เดือน/ปี',
                                  hintStyle: GoogleFonts.kanit(
                                      color: Color.fromRGBO(153, 152, 152, 1),
                                      fontSize: 16.sp,
                                      fontWeight: FontWeight.w500),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(30.0),
                                  ),
                                  errorStyle: GoogleFonts.kanit(
                                      color: Colors.red,
                                      fontSize: 16.sp,
                                      fontWeight: FontWeight.w400),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(20),
                                    borderSide:
                                        BorderSide(color: Colors.grey.shade300),
                                  ),
                                  suffixIcon: Icon(Icons.calendar_today,
                                      color: Colors.grey),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'กรุณาเลือกวันที่';
                                  }
                                  return null;
                                },
                              ),
                              SizedBox(height: 2.h),
                              _buildRepairTypeSelection(),
                            ]
                          ],
                        ),
                      ),
                    ),
                    if (request_repair_detail?['status'] == 'acknowledged' ||
                        request_repair_detail?['status'] == 'scheduled') ...[
                      SafeArea(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          child: SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                final repairSchedule =
                                    request_repair_detail?['RepairSchedule'];
                                if (repairSchedule != null) {
                                  log('111');
                                  _EditDateTimeForRepair(
                                      id: request_repair_detail?[
                                          'RepairSchedule']['id'],
                                      // repair_request_id: widget.id,
                                      selected_date: selectedDate,
                                      selected_time_period:
                                          _selectedRepairTimePeriod.toString());
                                } else {
                                  log('222');
                                  _SelectDateTimeForRepair(
                                    repair_request_id: widget.id,
                                    selected_date: selectedDate,
                                    selected_time_period:
                                        _selectedRepairTimePeriod.toString(),
                                    renter_id:
                                        request_repair_detail?['renter_id'],
                                  );
                                }
                              },
                              icon: const Icon(Icons.access_time),
                              label: const Text('ยืนยันเวลานัดหมาย'),
                              style: ElevatedButton.styleFrom(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 16),
                                backgroundColor: Colors.teal.shade400,
                                foregroundColor: Colors.white,
                                textStyle: GoogleFonts.prompt(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                        ),
                      )
                    ]
                  ],
                ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.prompt(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Colors.black87,
      ),
    );
  }

  Widget _buildBillDetailsCard() {
    return SizedBox(
      width: 95.w,
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 5,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
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
                        request_repair_detail?['issue_title'],
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 18,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  if (request_repair_detail?['status'] ==
                      'waiting_to_check') ...[
                    statusTag(
                      text: 'รอตรวจสอบ',
                      borderColor: Color.fromRGBO(21, 71, 121, 1),
                      textColor: Color.fromRGBO(21, 71, 121, 1),
                      backgroundColor: Color.fromRGBO(247, 250, 254, 1),
                    ),
                  ] else if (request_repair_detail?['status'] == 'pending') ...[
                    statusTag(
                      text: 'รอดำเนินการ',
                      borderColor: Color.fromRGBO(255, 168, 0, 1),
                      textColor: Color.fromRGBO(255, 168, 0, 1),
                      backgroundColor: Color.fromRGBO(255, 246, 230, 1),
                    ),
                  ] else if (request_repair_detail?['status'] ==
                      'in_progress') ...[
                    statusTag(
                      text: 'กำลังดำเนินการ',
                      borderColor: Color(0xFF44C2B8),
                      textColor: Color(0xFF44C2B8),
                      backgroundColor: Color.fromRGBO(247, 250, 254, 1),
                    ),
                  ] else if (request_repair_detail?['status'] ==
                      'completed') ...[
                    statusTag(
                      text: 'สำเร็จ',
                      borderColor: Color.fromRGBO(65, 201, 128, 1),
                      textColor: Color.fromRGBO(65, 201, 128, 1),
                      backgroundColor: Color.fromRGBO(236, 250, 242, 1),
                    ),
                  ] else if (request_repair_detail?['status'] ==
                      'rejected') ...[
                    statusTag(
                      text: 'ปฏิเสธคำร้อง',
                      borderColor: Color.fromRGBO(235, 87, 87, 1),
                      textColor: Color.fromRGBO(235, 87, 87, 1),
                      backgroundColor: Color.fromRGBO(255, 245, 245, 1),
                    ),
                  ] else if (request_repair_detail?['status'] ==
                      'acknowledged') ...[
                    statusTag(
                      text: 'กรุณาเลือกวันที่',
                      borderColor: Color.fromRGBO(235, 87, 87, 1),
                      textColor: Color.fromRGBO(235, 87, 87, 1),
                      backgroundColor: Color.fromRGBO(245, 245, 245, 1),
                    ),
                  ] else if (request_repair_detail?['status'] ==
                      'scheduled') ...[
                    statusTag(
                      text: 'รอนัดหมายช่าง',
                      borderColor: const Color(0xFF448AFF),
                      textColor: const Color(0xFF448AFF),
                      backgroundColor: Color.fromRGBO(247, 250, 254, 1),
                    ),
                  ],
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
                      request_repair_detail?['issue_description'],
                      style: GoogleFonts.prompt(
                        fontWeight: FontWeight.w400,
                        fontSize: 18,
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
                    request_repair_detail?['Renter']['building_name'] ?? '-',
                    style: GoogleFonts.prompt(
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
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
                    'ชั้น :',
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
                    request_repair_detail?['Renter']['floor'].toString() ?? '-',
                    style: GoogleFonts.prompt(
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
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
                    request_repair_detail?['Renter']['room_number'] ?? '-',
                    style: GoogleFonts.prompt(
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
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
                    '${request_repair_detail?['Renter']['prefix'] ?? ''}${request_repair_detail?['Renter']['first_name'] ?? ''} ${request_repair_detail?['Renter']['last_name'] ?? ''}',
                    style: GoogleFonts.prompt(
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
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
                    '${formatThaiDate(request_repair_detail?['created_at'] ?? '')}/${formatTime(request_repair_detail?['created_at'] ?? '')}',
                    style: GoogleFonts.prompt(
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
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
                    request_repair_detail?['callback_phone'] ?? '-',
                    style: GoogleFonts.prompt(
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),
              if (request_repair_detail?['status'] != 'acknowledged' &&
                  request_repair_detail?['status'] != 'scheduled') ...[
                SizedBox(
                  height: 2.h,
                ),
                Row(
                  children: [
                    Text(
                      'วันที่นัดหมาย :',
                      style: GoogleFonts.prompt(
                        fontWeight: FontWeight.w600,
                        fontSize: 20,
                        color: Colors.teal.shade600,
                      ),
                    ),
                    SizedBox(
                      width: 2.w,
                    ),
                    if (request_repair_detail?['RepairSchedule']
                            ?['rescheduled_by_renter'] ==
                        true) ...[
                      Text(
                        request_repair_detail?['RepairSchedule']
                                    ?['requested_new_date'] !=
                                null
                            ? formatThaiDate(
                                request_repair_detail!['RepairSchedule']
                                    ['requested_new_date'])
                            : '-',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 18,
                          color: Colors.black,
                        ),
                      ),
                    ] else ...[
                      Text(
                        request_repair_detail?['RepairSchedule']
                                    ?['selected_date'] !=
                                null
                            ? formatThaiDate(
                                request_repair_detail!['RepairSchedule']
                                    ['selected_date'])
                            : '-',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 18,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ],
                ),
                SizedBox(
                  height: 2.h,
                ),
                Row(
                  children: [
                    Text(
                      'ช่วงเวลานัดหมาย :',
                      style: GoogleFonts.prompt(
                        fontWeight: FontWeight.w600,
                        fontSize: 20,
                        color: Colors.teal.shade600,
                      ),
                    ),
                    SizedBox(
                      width: 2.w,
                    ),
                    if (request_repair_detail?['RepairSchedule']
                            ?['rescheduled_by_renter'] ==
                        true) ...[
                      Text(
                        request_repair_detail?['RepairSchedule']
                                ?['requested_new_time_period'] ??
                            '-',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 18,
                          color: Colors.black,
                        ),
                      ),
                    ] else ...[
                      Text(
                        request_repair_detail?['RepairSchedule']
                                ?['selected_time_period'] ??
                            '-',
                        style: GoogleFonts.prompt(
                          fontWeight: FontWeight.w400,
                          fontSize: 18,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
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
              )
            ],
          ),
        ),
      ),
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

  Future<void> _SelectDateTimeForRepair({
    required int repair_request_id,
    required selected_date,
    required String selected_time_period,
    required int renter_id,
  }) async {
    String formattedDate = DateFormat('yyyy-MM-dd').format(selected_date);
    var body = {
      "repair_request_id": repair_request_id,
      "selected_date": formattedDate,
      "selected_time_period": selected_time_period,
      "renter_id": renter_id
    };
    log('body === $body');
    try {
      var res = await Services().Dio_post('SelectDateTimeForRepair', body);
      log('resss == $res');
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          _showAlertDialog(context, 'ยืนยันเวลานัดหมายสำเร็จ', 'สำเร็จ');
        });
      } else {
        _showAlertDialog(
            context, 'ยืนยันเวลานัดหมายล้มเหลว', 'เกิดข้้้อผิดพลาด');
      }
    } catch (e) {
      print('Error fetching request_repair_detail details: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _EditDateTimeForRepair({
    required int id,
    required selected_date,
    required String selected_time_period,
  }) async {
    String formattedDate = DateFormat('yyyy-MM-dd').format(selected_date);
    var body = {
      "id": id,
      "rescheduled_by_renter": true,
      "requested_new_date": formattedDate,
      "requested_new_time_period": selected_time_period,
    };
    log('body22222 === $body');
    try {
      var res = await Services().Dio_post('RenterSelectNewDate', body);
      log('resss == $res');
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          _showAlertDialog(context, 'ยืนยันเวลานัดหมายสำเร็จ', 'สำเร็จ');
        });
      } else {
        _showAlertDialog(
            context, 'ยืนยันเวลานัดหมายล้มเหลว', 'เกิดข้้้อผิดพลาด');
      }
    } catch (e) {
      print('Error fetching request_repair_detail details: $e');
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
              Get.offAll(RequestRepairScreen());
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
