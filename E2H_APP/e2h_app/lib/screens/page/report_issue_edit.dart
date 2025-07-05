import 'dart:developer';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:e2h_app/screens/page/report_issue_detail.dart';
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

class ReportIssueEdit extends StatefulWidget {
  final int id;
  final String flag_page;

  const ReportIssueEdit({super.key, required this.id, required this.flag_page});

  @override
  State<ReportIssueEdit> createState() => _ReportIssueEditState();
}

class _ReportIssueEditState extends State<ReportIssueEdit> {
  int? _selectedRepairType;
  String? _selectedRepairTimePeriod;
  bool? _isUrgent; // ค่า true = ด่วน, false = ทั่วไป

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
  Map<String, dynamic>? report_issue_detail;
  List<String> photoUrls = []; // กำหนดไว้ใน class ด้านบน
  final TextEditingController _timecontroller = TextEditingController();
  DateTime? selectedDate;

  Future<String?> _fetchToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? "";
  }

  Future<void> _fetchGetReportIssueDetails() async {
    var body = {"id": widget.id}; // ส่ง id ไปที่ API

    try {
      var res = await Services().Dio_post('GetIssueDetails', body);
      log('resss == $res');
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          report_issue_detail = res['data'];
          _titleController.text = report_issue_detail?['title'];
          _detailController.text = report_issue_detail?['description'];
          _isUrgent = report_issue_detail?['urgent_issue'];
          log('report_issue_detail == $report_issue_detail');

          photoUrls = [
            report_issue_detail?['image_1'],
            report_issue_detail?['image_2'],
            report_issue_detail?['image_3'],
            report_issue_detail?['image_4'],
            report_issue_detail?['image_5'],
          ]
              .where((url) => url != null && url.toString().isNotEmpty)
              .cast<String>()
              .toList();
        });
      } else {
        throw Exception("ดึงข้อมูลบิลไม่สำเร็จ");
      }
    } catch (e) {
      print('Error fetching issue_detail details: $e');
      setState(() {
        // isLoading = false;
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
    _fetchGetReportIssueDetails();
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
            Get.offAll(ReportIssueDetail(
              id: widget.id,
              flag_page: 'issue',
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
                  bgColor: const Color.fromRGBO(224, 242, 241, 1),

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
              _buildLabel('ประเภทเรื่องที่แจ้ง', required: true),
              SizedBox(
                height: 2.h,
              ),
              _buildReportIssueTypeSelection(),
              _buildLabel('หัวข้อเรื่อง', required: true),
              _buildTextField('พิมพ์หัวข้อเรื่อง',
                  controller: _titleController),
              _buildLabel('รายละเอียด '),
              _buildTextField('พิมพ์รายละเอียด',
                  controller: _detailController, maxLines: 3),
              // if (report_issue_detail?['status'] == 'acknowledged' ||
              //     report_issue_detail?['status'] == 'scheduled') ...[
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
      padding: EdgeInsets.only(top: 1.h, bottom: 1.h),
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
                      'http://192.168.1.100:3000/${photoUrls[index]}',
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

  Widget _buildReportIssueTypeSelection() {
    List<Map<String, dynamic>> options = [
      {'id': 1, 'name': 'ด่วน', 'value': true},
      {'id': 2, 'name': 'ทั่วไป', 'value': false},
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
        final option = options[index];
        final bool optionValue = option['value'];
        final String optionName = option['name'];

        return GestureDetector(
          onTap: () {
            setState(() {
              _isUrgent = optionValue;
              log('_isUrgent = $_isUrgent');
            });
          },
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: _isUrgent == optionValue ? Colors.teal : Colors.grey,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _isUrgent == optionValue
                      ? Icons.radio_button_checked
                      : Icons.radio_button_off,
                  color: _isUrgent == optionValue ? Colors.teal : Colors.grey,
                ),
                const SizedBox(width: 8),
                Text(
                  optionName,
                  style: GoogleFonts.prompt(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color:
                        _isUrgent == optionValue ? Colors.teal : Colors.black,
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
    bool isFormValid = _titleController.text.isNotEmpty;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isFormValid
            ? () {
                EditReportIssueDetails(); // ✅ ใช้แค่ฟังก์ชันเดียว
                log('ส่งอัปเดตรายการแจ้งเรื่อง');
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

  Future<void> EditReportIssueDetails() async {
    try {
      EasyLoading.show(dismissOnTap: false);
      log('TokenNNAJA: $set_token'); // ตรวจสอบค่า set_token
      if (set_token.isEmpty || renter_id.toString().isEmpty) {
        throw Exception('Missing authentication details.');
      }

      final formData = FormData.fromMap({
        'id': widget.id,
        'title': _titleController.text,
        'description': _detailController.text,
        'callback_phone': _phoneController.text,
        'urgent_issue': _isUrgent,
        ...await _prepareImageFields(),
      });

      // log('FormData: ${formData.fields}');
      // log('FormData Files: ${formData.files}');

      final response = await Services().Dio_post('EditIssue', formData);

      if (response['status_code'] == 8000) {
        log('Issue created successfully: ${response['data']}');
        EasyLoading.dismiss();
        _showAlertDialog(context, 'แก้ไขข้อมูลสำเร็จ', 'สำเร็จ');
        _clearForm(); // รีเซ็ตฟอร์มเมื่อส่งข้อมูลสำเร็จ
      } else {
        log('Failed to create issue: ${response['message']}');
        EasyLoading.dismiss();
        _showAlertDialog(context, 'เกิดข้้้อผิดพลาด', 'แก้ไขข้อมูลล้มเหลว');
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
      'image_1',
      'image_2',
      'image_3',
      'image_4',
      'image_5'
    ];

    // สร้าง list รวมภาพทั้งหมด (ที่เหลืออยู่) ตามลำดับ
    final List<dynamic> totalImages = [];

    // ใส่รูปเก่าที่เหลืออยู่ก่อน
    totalImages.addAll(photoUrls);

    // ใส่รูปใหม่ตามหลัง
    totalImages.addAll(_selectedImages);

    for (int i = 0; i < fieldNames.length; i++) {
      if (i < totalImages.length) {
        final img = totalImages[i];

        if (img is String) {
          // เป็นรูปเดิมจาก server ที่ยังไม่ได้ลบ
          imageFields[fieldNames[i]] = img;
        } else if (img is XFile) {
          // เป็นรูปใหม่ที่เพิ่งเลือก
          final file = await MultipartFile.fromFile(img.path,
              filename: '${fieldNames[i]}.jpg');
          imageFields[fieldNames[i]] = file;
        }
      } else {
        // ถ้าเกินจำนวนภาพที่ส่ง → ส่งค่าว่างเพื่อลบภาพเดิมออก
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

    if (report_issue_detail?['status'] == 'acknowledged' ||
        report_issue_detail?['status'] == 'scheduled') {
      await EditRepairRequestDetails_update_time();
    } else {
      await EditReportIssueDetails();
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
              Get.offAll(ReportIssueDetail(
                id: widget.id,
                flag_page: 'detail',
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
