import 'dart:developer';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:e2h_app/screens/page/request_repair_screen.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';

class CreateRequestRepairScreen extends StatefulWidget {
  const CreateRequestRepairScreen({super.key});

  @override
  State<CreateRequestRepairScreen> createState() =>
      _CreateRequestRepairScreenState();
}

class _CreateRequestRepairScreenState extends State<CreateRequestRepairScreen> {
  int? _selectedRepairType;
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

  Future<String?> _fetchToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? "";
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
              _buildType_number_TextField('ระบุเบอร์โทรศัพท์',
                  enabled: true, controller: _phoneController),
              _buildLabel('ประเภทงานซ่อม', required: true),
              _buildRepairTypeSelection(),
              _buildLabel('หัวข้อการแจ้งซ่อม', required: true),
              _buildTextField('พิมพ์หัวข้อการแจ้งซ่อม',
                  controller: _titleController),
              _buildLabel('รายละเอียด '),
              _buildTextField('พิมพ์รายละเอียดการแจ้งซ่อม',
                  controller: _detailController, maxLines: 3),
              photo(),
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

  Widget photo() {
    return Padding(
      padding: EdgeInsets.only(top: 1.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('แนบรูปภาพ (ไม่เกิน 5 รูป)'),
          SizedBox(
            height: 1.h,
          ),
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

  Widget _buildSubmitButton() {
    bool isFormValid =
        _selectedRepairType != null && _titleController.text.isNotEmpty;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isFormValid
            ? () {
                CreateRepair();
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

  Future<void> CreateRepair() async {
    try {
      EasyLoading.show(dismissOnTap: false);
      log('TokenNNAJA: $set_token'); // ตรวจสอบค่า set_token
      if (set_token.isEmpty || renter_id.toString().isEmpty) {
        throw Exception('Missing authentication details.');
      }

      final formData = FormData.fromMap({
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
          await Services().Dio_post('CreateRepairRequest', formData);

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

  Future<Map<String, MultipartFile>> _prepareImageFields() async {
    final Map<String, MultipartFile> imageFields = {};

    // กำหนดชื่อตามฟิลด์ในฐานข้อมูล
    final List<String> fieldNames = [
      'photo_url',
      'photo_url2',
      'photo_url3',
      'photo_url4',
      'photo_url5'
    ];

    for (int i = 0; i < _selectedImages.length; i++) {
      if (i < fieldNames.length) {
        // ตรวจสอบว่า index ไม่เกินจำนวนฟิลด์ที่รองรับ
        final imageFile = await MultipartFile.fromFile(
          _selectedImages[i].path,
          filename: '${fieldNames[i]}.jpg',
        );
        imageFields[fieldNames[i]] = imageFile; // กำหนดคีย์ให้ตรงกับฐานข้อมูล
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

    await CreateRepair();
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
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      const RequestRepairScreen(), // ใช้ const เพราะไม่มีพารามิเตอร์
                ),
              );
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
