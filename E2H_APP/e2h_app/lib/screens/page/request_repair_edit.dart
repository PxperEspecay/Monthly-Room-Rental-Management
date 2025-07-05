import 'dart:developer';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:e2h_app/screens/page/request_repair_detail.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';
import 'package:dio/dio.dart' as dio;
import 'package:get/get.dart' hide MultipartFile, FormData;

class RequestRepairEdit extends StatefulWidget {
  final int id;
  const RequestRepairEdit({super.key, required this.id});

  @override
  State<RequestRepairEdit> createState() => _RequestRepairEditState();
}

class _RequestRepairEditState extends State<RequestRepairEdit> {
  int? _selectedRepairType;
  String? _selectedRepairTimePeriod;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _detailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _building_nameController =
      TextEditingController();
  final TextEditingController _room_numberController = TextEditingController();
  final TextEditingController _floorController = TextEditingController();
  late String set_token = "";
  late String id = "";
  final List<XFile> _selectedImages = [];
  bool isFormValid = false; // สถานะของฟอร์ม
  bool isSubmitting = false; // เพิ่มตัวแปรสำหรับสถานะการส่งข้อมูล
  late int room_id;
  late int renter_id;
  Map<String, dynamic>? request_repair_detail;
  List<String> photoUrls = []; // กำหนดไว้ใน class ด้านบน
  final TextEditingController _timecontroller = TextEditingController();
  DateTime? selectedDate;

  Future<String?> _fetchToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? "";
  }

  Future<void> _fetchGetRepairRequestsDetails() async {
    var body = {"repair_request_id": widget.id}; // ส่ง id ไปที่ API

    try {
      var res = await Services().Dio_post('GetRepairRequestsDetails', body);
      log('resss == $res');
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          request_repair_detail = res['data'];
          _selectedRepairType = request_repair_detail?['type_repair_id'];
          _titleController.text = request_repair_detail?['issue_title'];
          _detailController.text = request_repair_detail?['issue_description'];
          final repairSchedule = request_repair_detail?['RepairSchedule'];
          if (repairSchedule != null &&
              repairSchedule['selected_date'] != null &&
              repairSchedule['selected_time_period'] != null) {
            _timecontroller.text =
                formatThaiDate(repairSchedule['selected_date']);
            _selectedRepairTimePeriod = repairSchedule['selected_time_period'];
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
        });
      } else {
        throw Exception("ดึงข้อมูลบิลไม่สำเร็จ");
      }
    } catch (e) {
      print('Error fetching request_repair_detail details: $e');
      setState(() {});
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

  Future<void> CallApi() async {
    EasyLoading.show(dismissOnTap: false);
    await _fetchToken().then((token) async {
      if (token != null) {
        setState(() {
          set_token = token;
        });
        log('Token: $token');

        Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
        log(decodedToken.toString());

        renter_id = decodedToken['id'] ?? 0;
        room_id = decodedToken['room_id'] ?? 0;

        _building_nameController.text = decodedToken['building_name'] ?? '';
        _phoneController.text = decodedToken['phone_number'] ?? '';
        _room_numberController.text = decodedToken['room_number'] ?? '';
        _floorController.text = decodedToken['floor'] != null
            ? decodedToken['floor'].toString()
            : '';
      }
    });
    _fetchGetRepairRequestsDetails();
    EasyLoading.dismiss();
  }

  @override
  void initState() {
    super.initState();
    CallApi();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios),
          onPressed: () {
            Get.offAll(RequestRepairDetail(
              id: widget.id,
              flag_page: 'repair',
            ));
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
              bottomLeft: Radius.circular(0),
              bottomRight: Radius.circular(0),
            ),
          ),
        ),
        title: Text(
          'รายละเอียด',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildLabel('บ้านเลขที่', required: true),
              _buildTextField('xx/xxx',
                  enabled: false,
                  bgColor: Colors.teal.shade50,
                  controller: _room_numberController),
              _buildLabel('อาคาร'),
              _buildTextField('ระบุอาคาร',
                  enabled: false,
                  bgColor: Colors.teal.shade50,
                  controller: _building_nameController),
              _buildLabel('ชั้น'),
              _buildTextField('ระบุชั้น',
                  enabled: false,
                  bgColor: Colors.teal.shade50,
                  controller: _floorController),
              _buildLabel('เบอร์โทรศัพท์สำหรับติดต่อกลับ'),
              _buildType_number_TextField('ระบุเบอโทรศัพท์',
                  enabled: true, controller: _phoneController),
              _buildLabel('ประเภทงานซ่อม', required: true),
              _buildRepairTypeSelection(),
              _buildLabel('หัวข้อการแจ้งซ่อม', required: true),
              _buildTextField('พิมพ์หัวข้อการแจ้งซ่อม',
                  controller: _titleController),
              _buildLabel('รายละเอียด '),
              _buildTextField('พิมพ์รายละเอียดการแจ้งซ่อม',
                  controller: _detailController, maxLines: 3),
              // if (request_repair_detail?['status'] == 'acknowledged' ||
              //     request_repair_detail?['status'] == 'scheduled') ...[
              //   SizedBox(height: 1.h),
              //   Text(
              //     'เลือกเวลานัดหมาย :',
              //     style: GoogleFonts.prompt(
              //       fontWeight: FontWeight.w600,
              //       fontSize: 20,
              //       color: Colors.teal.shade600,
              //     ),
              //   ),
              //   SizedBox(height: 1.h),
              //   TextFormField(
              //     controller: _timecontroller,
              //     readOnly: true,
              //     onTap: () => _selectDate(),
              //     style: TextStyle(fontSize: 16),
              //     decoration: InputDecoration(
              //       filled: true,
              //       fillColor: Color.fromRGBO(236, 238, 240, 1),
              //       hintText: 'วัน/เดือน/ปี',
              //       hintStyle: GoogleFonts.kanit(
              //           color: Color.fromRGBO(153, 152, 152, 1),
              //           fontSize: 16.sp,
              //           fontWeight: FontWeight.w500),
              //       border: OutlineInputBorder(
              //         borderRadius: BorderRadius.circular(30.0),
              //       ),
              //       errorStyle: GoogleFonts.kanit(
              //           color: Colors.red,
              //           fontSize: 16.sp,
              //           fontWeight: FontWeight.w400),
              //       enabledBorder: OutlineInputBorder(
              //         borderRadius: BorderRadius.circular(20),
              //         borderSide: BorderSide(color: Colors.grey.shade300),
              //       ),
              //       suffixIcon: Icon(Icons.calendar_today, color: Colors.grey),
              //     ),
              //     validator: (value) {
              //       if (value == null || value.isEmpty) {
              //         return 'กรุณาเลือกวันที่';
              //       }
              //       return null;
              //     },
              //   ),
              //   SizedBox(height: 2.h),
              //   _buildRepairTimePeriod(),
              // ],

              photoEditor(),
              // SizedBox(
              //   width: 95.w,
              //   height: 20.h,
              //   child: ListView.builder(
              //     itemCount: photoUrls.length,
              //     scrollDirection: Axis.horizontal,
              //     itemBuilder: (context, index) {
              //       return Padding(
              //         padding: const EdgeInsets.all(8.0),
              //         child: Image.network(
              //           'http://172.20.10.3:3000/${photoUrls[index]}',
              //           fit: BoxFit.cover,
              //         ),
              //       );
              //     },
              //   ),
              // ),
              const SizedBox(height: 20),
              _buildSubmitButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, {bool required = false}) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 4),
      child: Row(
        children: [
          Text(
            text,
            style:
                GoogleFonts.prompt(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          if (required)
            const Text(
              ' *',
              style: TextStyle(color: Colors.red, fontSize: 16),
            ),
        ],
      ),
    );
  }

  Widget photoEditor() {
    return Padding(
      padding: EdgeInsets.only(top: 1.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('แนบรูปภาพ (ไม่เกิน 5 รูป)'),
          SizedBox(height: 1.h),
          GridView.builder(
            itemCount: photoUrls.length +
                _selectedImages.length +
                (photoUrls.length + _selectedImages.length < 5 ? 1 : 0),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemBuilder: (context, index) {
              // แสดงปุ่มเพิ่มรูปภาพ
              if (index == photoUrls.length + _selectedImages.length &&
                  (photoUrls.length + _selectedImages.length) < 5) {
                return GestureDetector(
                  onTap: () {
                    _showImagePickerOptions();
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.add_a_photo,
                        size: 40, color: Colors.grey),
                  ),
                );
              }

              // แสดงรูปจาก photoUrls (จาก API)
              if (index < photoUrls.length) {
                return Stack(
                  children: [
                    Image.network(
                      'http://172.20.10.3:3000/${photoUrls[index]}',
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () {
                          if (index >= 0 && index < photoUrls.length) {
                            setState(() {
                              photoUrls.removeAt(index);
                            });
                          }
                        },
                        child: const CircleAvatar(
                          backgroundColor: Colors.red,
                          radius: 12,
                          child:
                              Icon(Icons.close, size: 16, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                );
              }

              // แสดงรูปจากที่เลือกใหม่ (_selectedImages)
              final localIndex = index - photoUrls.length;
              return Stack(
                children: [
                  Image.file(
                    File(_selectedImages[localIndex].path),
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: () =>
                          setState(() => _selectedImages.removeAt(localIndex)),
                      child: const CircleAvatar(
                        backgroundColor: Colors.red,
                        radius: 12,
                        child: Icon(Icons.close, size: 16, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        title,
        style: GoogleFonts.prompt(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildTextField(String hintText,
      {bool enabled = true,
      Color? bgColor,
      TextEditingController? controller,
      int maxLines = 1}) {
    return TextField(
      controller: controller,
      enabled: enabled,
      maxLines: maxLines,
      decoration: InputDecoration(
        filled: true,
        fillColor: bgColor ?? Colors.grey.shade100,
        hintText: hintText,
        hintStyle: GoogleFonts.prompt(
          color: Colors.grey,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildType_number_TextField(String hintText,
      {bool enabled = true,
      Color? bgColor,
      TextEditingController? controller,
      int maxLines = 1}) {
    return TextField(
      controller: controller,
      enabled: enabled,
      maxLines: maxLines,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        filled: true,
        fillColor: bgColor ?? Colors.grey.shade100,
        hintText: hintText,
        hintStyle: GoogleFonts.prompt(color: Colors.grey),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildRepairTypeSelection() {
    List<Map<String, dynamic>> options = [
      {'id': 1, 'name': 'ไฟฟ้า'},
      {'id': 2, 'name': 'ประปา'},
      {'id': 3, 'name': 'แอร์'},
      {'id': 4, 'name': 'อื่นๆ'},
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
              _selectedRepairType = optionId; // บันทึกค่า ID ที่เลือก
              log('id = $_selectedRepairType');
            });
          },
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(
                color:
                    _selectedRepairType == optionId ? Colors.teal : Colors.grey,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _selectedRepairType == optionId
                      ? Icons.radio_button_checked
                      : Icons.radio_button_off,
                  color: _selectedRepairType == optionId
                      ? Colors.teal
                      : Colors.grey,
                ),
                const SizedBox(width: 8),
                Text(
                  optionName,
                  style: GoogleFonts.prompt(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: _selectedRepairType == optionId
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

  Widget _buildRepairTimePeriod() {
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

  Widget _buildSubmitButton() {
    bool isFormValid =
        _selectedRepairType != null && _titleController.text.isNotEmpty;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isFormValid
            ? () {
                if (request_repair_detail?['status'] == 'acknowledged' ||
                    request_repair_detail?['status'] == 'scheduled') {
                  EditRepairRequestDetails_update_time();
                  log('1111');
                } else {
                  EditRepairRequestDetails();
                  log('2222');
                }
              }
            : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: isFormValid ? Colors.teal : Colors.grey.shade400,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          padding: const EdgeInsets.symmetric(vertical: 14),
        ),
        child: Text(
          'ยืนยัน',
          style: GoogleFonts.prompt(
              fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }

  Future<void> EditRepairRequestDetails() async {
    try {
      EasyLoading.show(dismissOnTap: false);
      log('TokenNNAJA: $set_token'); // ตรวจสอบค่า set_token
      if (set_token.isEmpty || renter_id.toString().isEmpty) {
        throw Exception('Missing authentication details.');
      }

      final formData = FormData.fromMap({
        'id': widget.id,
        'renter_id': renter_id,
        'room_id': room_id,
        'issue_title': _titleController.text,
        'issue_description': _detailController.text,
        'callback_phone': _phoneController.text,
        'type_repair_id': _selectedRepairType,
        ...await _prepareImageFields(),
      });

      // log('FormData: ${formData.fields}');
      // log('FormData Files: ${formData.files}');

      final response =
          await Services().Dio_post('EditRepairRequestDetails', formData);

      if (response['status_code'] == 8000) {
        log('Issue created successfully: ${response['data']}');
        EasyLoading.dismiss();
        _showAlertDialog(context, 'ส่งคำร้องซ่อมแซมสำเร็จ', 'สำเร็จ');
        _clearForm(); // รีเซ็ตฟอร์มเมื่อส่งข้อมูลสำเร็จ
      } else {
        log('Failed to create issue: ${response['message']}');
        EasyLoading.dismiss();
        _showAlertDialog(
            context, 'เกิดข้้้อผิดพลาด', 'ส่งคำร้องซ่อมแซมล้มเหลว');
      }
    } catch (e) {
      log('Error creating issue: $e');
      EasyLoading.dismiss();
      _showSnackBar('เกิดข้อผิดพลาด: $e');
    } finally {
      setState(() {
        isSubmitting = false; // ยกเลิกสถานะการส่งข้อมูล
      });
    }
  }

  Future<void> EditRepairRequestDetails_update_time() async {
    try {
      EasyLoading.show(dismissOnTap: false);
      log('TokenNNAJA: $set_token'); // ตรวจสอบค่า set_token
      if (set_token.isEmpty || renter_id.toString().isEmpty) {
        throw Exception('Missing authentication details.');
      }

      final formData = FormData.fromMap({
        'id': widget.id,
        'renter_id': renter_id,
        'room_id': room_id,
        'issue_title': _titleController.text,
        'issue_description': _detailController.text,
        'callback_phone': _phoneController.text,
        'type_repair_id': _selectedRepairType,
        'rescheduled_by_renter': true,
        'requested_new_date': _timecontroller,
        'requested_new_time_period': _selectedRepairTimePeriod,
        ...await _prepareImageFields(),
      });

      // log('FormData: ${formData.fields}');
      // log('FormData Files: ${formData.files}');

      final response =
          await Services().Dio_post('EditRepairRequestDetails', formData);

      if (response['status_code'] == 8000) {
        log('Issue created successfully: ${response['data']}');
        EasyLoading.dismiss();
        _showAlertDialog(context, 'ส่งคำร้องซ่อมแซมสำเร็จ', 'สำเร็จ');
        _clearForm(); // รีเซ็ตฟอร์มเมื่อส่งข้อมูลสำเร็จ
      } else {
        log('Failed to create issue: ${response['message']}');
        EasyLoading.dismiss();
        _showAlertDialog(
            context, 'เกิดข้้้อผิดพลาด', 'ส่งคำร้องซ่อมแซมล้มเหลว');
      }
    } catch (e) {
      log('Error creating issue: $e');
      EasyLoading.dismiss();
      _showSnackBar('เกิดข้อผิดพลาด: $e');
    } finally {
      setState(() {
        isSubmitting = false; // ยกเลิกสถานะการส่งข้อมูล
      });
    }
  }

// ถ้าเลือกไม่ครบ 5 รูป ยิง api ไม่ผ่าน
  Future<Map<String, dynamic>> _prepareImageFields() async {
  final Map<String, dynamic> imageFields = {};

  final List<String> fieldNames = [
    'photo_url',
    'photo_url2',
    'photo_url3',
    'photo_url4',
    'photo_url5',
  ];

  // รวมภาพทั้งหมดไว้ในลำดับ: [ภาพเก่าที่ยังอยู่, ภาพใหม่]
  final List<dynamic> totalImages = [];
  totalImages.addAll(photoUrls); // รูปจาก backend ที่ยังเหลืออยู่
  totalImages.addAll(_selectedImages); // รูปใหม่ที่เพิ่มเข้ามา

  for (int i = 0; i < fieldNames.length; i++) {
    if (i < totalImages.length) {
      final img = totalImages[i];

      // ✅ กรณีภาพเก่าที่อยู่บน server (String)
      if (img is String) {
        imageFields[fieldNames[i]] = img; // หรือเว้นไว้ถ้า backend ไม่ต้องการ
      }

      // ✅ กรณีภาพใหม่ที่เพิ่มจาก device (XFile)
      else if (img is XFile) {
        final file = await MultipartFile.fromFile(
          img.path,
          filename: '${fieldNames[i]}.jpg',
        );
        imageFields[fieldNames[i]] = file;
      }
    } else {
      // ✅ ถ้าเกิน index ให้ส่งค่าว่าง (เพื่อลบภาพเดิม)
      imageFields[fieldNames[i]] = '';
    }
  }

  return imageFields;
}


  Future<void> _showImagePickerOptions() async {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('กล้องถ่ายรูป'),
                onTap: () async {
                  Navigator.pop(context); // ปิด BottomSheet
                  await _pickImageFromCamera();
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('เลือกรูปจากอัลบัม'),
                onTap: () async {
                  Navigator.pop(context); // ปิด BottomSheet
                  await _pickImagesFromGallery();
                },
              ),
              ListTile(
                leading: const Icon(Icons.cancel, color: Colors.red),
                title: const Text(
                  'ยกเลิก',
                  style: TextStyle(color: Colors.red),
                ),
                onTap: () {
                  Navigator.pop(context); // ปิด BottomSheet
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pickImageFromCamera() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      setState(() {
        if (_selectedImages.length < 5) {
          _selectedImages.add(image);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('แนบรูปได้ไม่เกิน 5 รูป')),
          );
        }
      });
    }
  }

  Future<void> _pickImagesFromGallery() async {
    final ImagePicker picker = ImagePicker();
    final List<XFile>? images = await picker.pickMultiImage();
    if (images != null) {
      setState(() {
        final int availableSlots = 5 - _selectedImages.length;
        if (availableSlots <= 0) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('แนบรูปได้ไม่เกิน 5 รูป')),
          );
          return;
        }
        _selectedImages.addAll(images.take(availableSlots));
        if (images.length > availableSlots) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('เลือกได้เพียงอีก ${availableSlots} รูป')),
          );
        }
      });
    }
  }

  void _showSnackBar(String message, {bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isSuccess ? Colors.green : Colors.red,
      ),
    );
  }

  void _handleSubmit() async {
    if (!isFormValid) {
      _showSnackBar('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setState(() {
      isSubmitting = true; // เริ่มสถานะการส่งข้อมูล
    });

    if (request_repair_detail?['status'] == 'acknowledged' ||
        request_repair_detail?['status'] == 'scheduled') {
      await EditRepairRequestDetails_update_time();
    } else {
      await EditRepairRequestDetails();
    }
  }

  void _clearForm() {
    // ฟังก์ชันสำหรับเคลียร์ฟอร์ม
    _titleController.clear();
    _detailController.clear();
    setState(() {
      _selectedImages.clear();
      // _backgroundColor = Colors.grey.shade200;
      // _backgroundColor2 = Colors.grey.shade200;
      isFormValid = false;
    });
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
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
              Get.offAll(RequestRepairDetail(
                id: widget.id,
                flag_page: 'repair',
              ));
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
