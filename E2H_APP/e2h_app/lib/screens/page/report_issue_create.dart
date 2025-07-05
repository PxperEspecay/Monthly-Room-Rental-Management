import 'dart:developer';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:e2h_app/screens/page/report_issue_screen.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:get/get.dart' hide MultipartFile, FormData;
import 'package:sizer/sizer.dart';

class ReportIssueCreate extends StatefulWidget {
  final int id;
  const ReportIssueCreate({super.key, required this.id});

  @override
  _ReportIssueCreateState createState() => _ReportIssueCreateState();
}

class _ReportIssueCreateState extends State<ReportIssueCreate> {
  bool? _selectedIssueType = false;
  int? _selectedIssueNumber = 2;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _building_nameController =
      TextEditingController();
  final TextEditingController _room_numberController = TextEditingController();
  final TextEditingController _floorController = TextEditingController();
  final List<XFile> _selectedImages = [];
  List<dynamic> detail_list = [];
  List<String> photoUrls = [];
  bool isLoading = true; // สถานะกำลังโหลดข้อมูล
  String? errorMessage; // ข้อความข้อผิดพลาด
  bool isFormValid = false; // สถานะของฟอร์ม
  bool isSubmitting = false; // เพิ่มตัวแปรสำหรับสถานะการส่งข้อมูล

  Color _backgroundColor = Colors.grey.shade200;
  Color _backgroundColor2 = Colors.grey.shade200;

  late String token = "";
  late String id = "";
  late String community_id = "";
  late String room_id = "";

  @override
  void initState() {
    super.initState();
    getString();

    // ตรวจสอบฟอร์มเมื่อมีการเปลี่ยนแปลงข้อความ
    _titleController.addListener(_validateForm);
    _descriptionController.addListener(_validateForm);
    log('widget == ${widget.id}');
  }

  Future<dynamic> getString() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token')!;
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    // log('211111 === $decodedToken');
    id = decodedToken['id'].toString();
    community_id = decodedToken['community_id'].toString();
    _building_nameController.text = decodedToken['building_name'] ?? '';
    _phoneController.text = decodedToken['phone_number'] ?? '';
    _room_numberController.text = decodedToken['room_number'] ?? '';
    _floorController.text =
        decodedToken['floor'] != null ? decodedToken['floor'].toString() : '';

    return {'id': id, 'community_id': community_id};
  }

  // ฟังก์ชันช่วยเตรียมฟิลด์รูปภาพ
  Future<Map<String, MultipartFile>> _prepareImageFields() async {
    final Map<String, MultipartFile> imageFields = {};
    for (int i = 0; i < _selectedImages.length; i++) {
      final imageFile = await MultipartFile.fromFile(
        _selectedImages[i].path,
        filename: 'image_${i + 1}.jpg',
      );
      imageFields['image_${i + 1}'] = imageFile;
    }
    return imageFields;
  }

  void _validateForm() {
    if (mounted) {
      setState(() {
        isFormValid = _titleController.text.isNotEmpty &&
            _descriptionController.text.isNotEmpty;
      });
    }
  }

  void _clearForm() {
    // ฟังก์ชันสำหรับเคลียร์ฟอร์ม
    _titleController.clear();
    _descriptionController.clear();
    setState(() {
      _selectedImages.clear();
      _backgroundColor = Colors.grey.shade200;
      _backgroundColor2 = Colors.grey.shade200;
      isFormValid = false;
    });
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

    await CreateIssue();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
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

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Widget _buildReportIssueUI() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
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
          _buildSectionTitle('หัวข้อเรื่อง'),
          Container(
            decoration: BoxDecoration(
              color: _backgroundColor, // สีพื้นหลัง
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: TextField(
              controller: _titleController,
              onChanged: (value) {
                setState(() {
                  _backgroundColor = value.isNotEmpty
                      ? Colors.teal.shade50 // สีเมื่อกรอกข้อความ
                      : Colors.grey.shade200; // สีเริ่มต้น
                });
              },
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: 'กรุณากรอกหัวข้อ',
                hintStyle: GoogleFonts.prompt(
                  fontSize: 15,
                  fontWeight: FontWeight.w300,
                  color: Colors.grey.shade600,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          _buildSectionTitle('รายละเอียด'),
          Container(
            decoration: BoxDecoration(
              color: _backgroundColor2, // สีพื้นหลัง
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: TextField(
              controller: _descriptionController,
              maxLines: 5,
              onChanged: (value) {
                setState(() {
                  _backgroundColor2 = value.isNotEmpty
                      ? Colors.teal.shade50 // สีเมื่อกรอกข้อความ
                      : Colors.grey.shade200; // สีเริ่มต้น
                });
              },
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: 'กรุณากรอกรายละเอียด',
                hintStyle: GoogleFonts.prompt(
                  fontSize: 15,
                  fontWeight: FontWeight.w300,
                  color: Colors.grey.shade600,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          _buildRepairTypeSelection(),
          const SizedBox(height: 16),
          _buildSectionTitle('แนบรูปภาพ (ไม่เกิน 5 รูป)'),
          GridView.builder(
            itemCount: _selectedImages.length + 1,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemBuilder: (context, index) {
              if (index == _selectedImages.length &&
                  _selectedImages.length < 5) {
                return GestureDetector(
                  onTap: () {
                    _showImagePickerOptions(); // เรียกฟังก์ชัน Future ภายใน closure
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
              } else if (index == _selectedImages.length &&
                  _selectedImages.length >= 5) {
                return const SizedBox(); // ซ่อนปุ่มเพิ่มรูป
              } else {
                return Stack(
                  children: [
                    Image.file(
                      File(_selectedImages[index].path),
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => _removeImage(index),
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
            },
          ),
          const SizedBox(height: 24),
          Center(
            child: SizedBox(
              width: double.infinity, // ทำให้ปุ่มกว้างเต็มจอ
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      isFormValid ? Colors.teal.shade500 : Colors.grey.shade200,
                  foregroundColor: isFormValid
                      ? Colors.white
                      : Colors.teal.shade500, // สีข้อความในปุ่ม
                  padding: const EdgeInsets.symmetric(
                      vertical: 16), // ความสูงของปุ่ม
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8), // มุมปุ่มโค้งมน
                  ),
                ),
                onPressed: isFormValid
                    ? () {
                        _handleSubmit(); // เรียกฟังก์ชันเมื่อฟอร์ม valid
                      }
                    : null, // ปิดการกดปุ่มเมื่อฟอร์มไม่ valid
                child: Text(
                  'ยืนยัน',
                  style: GoogleFonts.prompt(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        ],
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios),
          onPressed: () {
            Get.offAll(Bottombar(currentIndex: 2));
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
        automaticallyImplyLeading: false,
        title: Text(
          'แจ้งเรื่อง',
          style: GoogleFonts.prompt(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
        backgroundColor: const Color.fromARGB(255, 255, 255, 255),
        elevation: 1,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [_buildReportIssueUI()],
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
        hintStyle: GoogleFonts.prompt(
          fontSize: 15,
          fontWeight: FontWeight.w300,
          color: Colors.grey.shade600,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildRepairTypeSelection() {
    List<Map<String, dynamic>> options = [
      {'id': 1, 'name': 'ด่วน'},
      {'id': 2, 'name': 'ทั่วไป'},
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
              _selectedIssueNumber = optionId;
              if (optionId == 1) {
                _selectedIssueType = true;
              } else {
                _selectedIssueType = false;
              }
              log('id = $_selectedIssueType');
            });
          },
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: _selectedIssueNumber == optionId
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
                  _selectedIssueNumber == optionId
                      ? Icons.radio_button_checked
                      : Icons.radio_button_off,
                  color: _selectedIssueNumber == optionId
                      ? Colors.teal
                      : Colors.grey,
                ),
                const SizedBox(width: 8),
                Text(
                  optionName,
                  style: GoogleFonts.prompt(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: _selectedIssueNumber == optionId
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

  Future<void> CreateIssue() async {
    try {
      EasyLoading.show(dismissOnTap: false);
      log('TokenNNAJA: $token'); // ตรวจสอบ token

      if (token.isEmpty ||
          id.toString().isEmpty ||
          community_id.toString().isEmpty) {
        throw Exception('Missing authentication details.');
      }

      final formData = FormData.fromMap({
        'title': _titleController.text,
        'description': _descriptionController.text,
        'renter_id': id.toString(),
        'community_id': community_id.toString(),
        'urgent_issue': (_selectedIssueType ?? false).toString(),
        'callback_phone': _phoneController.text,
        ...await _prepareImageFields(),
      });

      log('=== FormData fields ===');
      formData.fields.forEach((e) => log('${e.key}: ${e.value}'));
      log('=== FormData files ===');
      formData.files.forEach((e) => log('${e.key}: ${e.value.filename}'));

      final response = await Services().Dio_post('CreateIssue', formData);

      if (response['status_code'] == 8000) {
        log('Issue created successfully: ${response['data']}');
        EasyLoading.dismiss();
        _showAlertDialog(context, 'ส่งคำร้องสำเร็จ', 'สำเร็จ');
        _clearForm();
      } else {
        log('Failed to create issue: ${response['message']}');
        EasyLoading.dismiss();
        _showAlertDialog(context, 'เกิดข้อผิดพลาด', 'ส่งคำร้องล้มเหลว');
      }
    } catch (e) {
      log('Error creating issue: $e');
      EasyLoading.dismiss();
      _showSnackBar('เกิดข้อผิดพลาด: $e');
    } finally {
      setState(() {
        isSubmitting = false;
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
              Get.offAll(Bottombar(
                currentIndex: 2,
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
                          setState(() {
                            photoUrls.removeAt(index);
                            log('del == $photoUrls');
                            // ลบรูปไม่ออก
                          });
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
}

String formatThaiDate(String? isoDate, {bool includeThaiMonth = false}) {
  if (isoDate == null) return 'ไม่ระบุวันที่';

  try {
    final DateTime dateTime = DateTime.parse(isoDate);
    final int buddhistYear = dateTime.year + 543; // เปลี่ยนปีเป็นพุทธศักราช
    final String day = DateFormat('dd').format(dateTime);

    if (includeThaiMonth) {
      // รูปแบบ: 07 ธ.ค. 2567
      final Map<int, String> thaiMonths = {
        1: 'ม.ค.',
        2: 'ก.พ.',
        3: 'มี.ค.',
        4: 'เม.ย.',
        5: 'พ.ค.',
        6: 'มิ.ย.',
        7: 'ก.ค.',
        8: 'ส.ค.',
        9: 'ก.ย.',
        10: 'ต.ค.',
        11: 'พ.ย.',
        12: 'ธ.ค.',
      };
      final String thaiMonth = thaiMonths[dateTime.month] ?? '';
      return '$day $thaiMonth $buddhistYear';
    } else {
      // รูปแบบ: 07/12/2567
      final String month = DateFormat('MM').format(dateTime);
      return '$day/$month/$buddhistYear';
    }
  } catch (e) {
    return 'ไม่สามารถแปลงวันที่ได้';
  }
}
