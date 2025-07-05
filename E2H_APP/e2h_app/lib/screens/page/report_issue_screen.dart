import 'dart:developer';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:e2h_app/screens/page/report_issue_create.dart';
import 'package:e2h_app/screens/page/report_issue_detail.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:get/get.dart' hide MultipartFile, FormData;

class ReportIssueScreen extends StatefulWidget {
  const ReportIssueScreen({super.key});

  @override
  _ReportIssueScreenState createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  int _selectedIndex = 0;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final List<XFile> _selectedImages = [];
  List<dynamic> historyData = [];
  List<dynamic> Issue_list = [];
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
    getString().then((_) {
      GetListIssueForRenter(); // เรียก API เมื่อได้ renter_id
      GetHistoryIssueForRenter(); // เรียก API เมื่อได้ renter_id
    });

    // ตรวจสอบฟอร์มเมื่อมีการเปลี่ยนแปลงข้อความ
    _titleController.addListener(_validateForm);
    _descriptionController.addListener(_validateForm);
  }

  Future<dynamic> getString() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token')!;
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    // log('211111 === '+decodedToken['id'].toString());
    id = decodedToken['id'].toString();
    community_id = decodedToken['community_id'].toString();
    // log('99999 ==' + id);
    // log('77777 ==' + community_id);

    return {'id': id, 'community_id': community_id};
  }

  Future<void> GetListIssueForRenter() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      // ส่งคำขอไปยัง API
      final body = {'renter_id': int.parse(id)};
      final response = await Services().Dio_post('GetListIssueForRenter', body);

      if (response['status_code'] == 8000) {
        setState(() {
          Issue_list = response['data']; // ดึงข้อมูลประวัติ

          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = response['message'];
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'เกิดข้อผิดพลาด: $e';
        isLoading = false;
      });
    }
  }

  Future<void> GetHistoryIssueForRenter() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      // ส่งคำขอไปยัง API
      final body = {'renter_id': int.parse(id)};
      final response =
          await Services().Dio_post('GetHistoryIssueForRenter', body);

      if (response['status_code'] == 8000) {
        setState(() {
          historyData = response['data']; // ดึงข้อมูลประวัติ
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = response['message'];
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'เกิดข้อผิดพลาด: $e';
        isLoading = false;
      });
    }
  }

  Future<void> CreateIssue() async {
    try {
      if (token.isEmpty || id.isEmpty || community_id.isEmpty) {
        throw Exception('Missing authentication details.');
      }

      final formData = FormData();

      formData.fields.addAll([
        MapEntry('title', _titleController.text),
        MapEntry('description', _descriptionController.text),
        MapEntry('renter_id', id), // ถ้า id เป็น int อย่าใช้ int.parse(id)
        MapEntry('community_id', community_id),
      ]);

      final imageFields = await _prepareImageFields();
      formData.files.addAll(
        imageFields.entries.map(
          (e) => MapEntry(e.key, e.value),
        ),
      );

      log('=== FormData fields ===');
      formData.fields.forEach((e) => log('${e.key}: ${e.value}'));
      log('=== FormData files ===');
      formData.files.forEach((e) => log('${e.key}: ${e.value.filename}'));

      final response = await Services().Dio_post('CreateIssue', formData);

      if (response['status_code'] == 8000) {
        log('Issue created successfully: ${response['data']}');
        _showSnackBar('ส่งข้อมูลสำเร็จ!', isSuccess: true);
        _clearForm();
      } else {
        log('Failed to create issue: ${response['message']}');
        _showSnackBar('เกิดข้อผิดพลาด: ${response['message']}');
      }
    } catch (e) {
      log('Error creating issue: $e');
      _showSnackBar('เกิดข้อผิดพลาด: $e');
    } finally {
      setState(() {
        isSubmitting = false;
      });
    }
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

  void _onTabTapped(int index) {
    if (mounted) {
      setState(() {
        _selectedIndex = index;
        if (_selectedIndex == 0) {
          GetListIssueForRenter();
        } else {
          GetHistoryIssueForRenter();
        }
      });
    }
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
      body: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => _onTabTapped(0),
                  child: Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: _selectedIndex == 0
                              ? Colors.teal.shade400
                              : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                    child: Center(
                      child: Text(
                        'แจ้งเรื่อง',
                        style: GoogleFonts.prompt(
                          fontSize: 18,
                          color:
                              _selectedIndex == 0 ? Colors.black : Colors.grey,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => _onTabTapped(1),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: _selectedIndex == 1
                              ? Colors.teal.shade400
                              : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                    child: Center(
                      child: Text(
                        'ประวัติการแจ้ง',
                        style: GoogleFonts.prompt(
                          fontSize: 18,
                          color:
                              _selectedIndex == 1 ? Colors.black : Colors.grey,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          Expanded(
            child: _selectedIndex == 0
                ? _buildIssueListUI()
                : _buildHistoryListUI(),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF008388),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ReportIssueCreate(
                        id: 0,
                      ),
                    ),
                  );
                },
                child: Text(
                  'เพิ่มรายการแจ้งเรื่อง',
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
      ),
    );
  }

  Widget _buildHistoryListUI() {
    if (isLoading) {
      // แสดงสถานะกำลังโหลด
      return Center(
        child: CircularProgressIndicator(),
      );
    }

    if (errorMessage != null) {
      // แสดงข้อความข้อผิดพลาด
      return Center(
        child: Text(errorMessage!),
      );
    }

    if (historyData.isEmpty) {
      // กรณีไม่มีข้อมูล
      return Center(
        child: Text('ไม่มีประวัติการแจ้งเรื่อง'),
      );
    }
    return RefreshIndicator(
      onRefresh: GetListIssueForRenter, // ดึงข้อมูลใหม่เมื่อเลื่อนลง
      child: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: historyData.length,
        itemBuilder: (context, index) {
          final item = historyData[index];
          final bool isRead = item['admin_isread'] ?? false;
          final String date =
              formatThaiDate(item['createdAt'], includeThaiMonth: true);

          return GestureDetector(
            onTap: () {
              Get.to(ReportIssueDetail(
                id: item['id'],
                flag_page: 'issue_list ',
              ));
            },
            child: Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          item['title'],
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        _buildStatusIcon(historyData[index]['status']),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item['description'],
                      style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // วันที่ (ซ้ายล่าง)
                        Text(
                          date,
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                        // สถานะ (ขวาล่าง)
                        _buildStatusName(historyData[index]['status']),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildIssueListUI() {
    if (isLoading) {
      // แสดงสถานะกำลังโหลด
      return Center(
        child: CircularProgressIndicator(),
      );
    }

    if (errorMessage != null) {
      // แสดงข้อความข้อผิดพลาด
      return Center(
        child: Text(errorMessage!),
      );
    }

    if (Issue_list.isEmpty) {
      // กรณีไม่มีข้อมูล
      return Center(
        child: Text('ไม่มีประวัติการแจ้งเรื่อง'),
      );
    }
    return RefreshIndicator(
      onRefresh: GetListIssueForRenter, // ดึงข้อมูลใหม่เมื่อเลื่อนลง
      child: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: Issue_list.length,
        itemBuilder: (context, index) {
          final item = Issue_list[index];
          final bool isRead = item['admin_isread'] ?? false;
          final String date =
              formatThaiDate(item['createdAt'], includeThaiMonth: true);

          return GestureDetector(
            onTap: () {
              Get.to(ReportIssueDetail(
                id: item['id'],
                flag_page: 'issue_list ',
              ));
            },
            child: Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          item['title'],
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        _buildStatusIcon(Issue_list[index]['status']),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item['description'],
                      style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // วันที่ (ซ้ายล่าง)
                        Text(
                          date,
                          style:
                              TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                        // สถานะ (ขวาล่าง)
                        _buildStatusName(Issue_list[index]['status']),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusIcon(String status) {
    String imagePath;
    String status_name;

    switch (status) {
      case "waiting_to_check":
        imagePath = "asset/image/icon-waiting.png";
        break;
      case "pending":
        imagePath = "asset/image/status-pending.png";
        break;
      case "cancel":
        imagePath = "asset/image/icon-cancel.png";
        break;
      case "fail":
        imagePath = "asset/image/icon-fail.png";
        break;
      case "in_progress":
        imagePath = "asset/image/icon-in_progress.png";
        break;
      case "completed":
        imagePath = "asset/image/status-completed.png";
        break;
      case "rejected":
        imagePath = "asset/image/icon-rejected.png";
        break;
      default:
        imagePath =
            "asset/image/status-pending.png"; // รูป default ถ้าไม่มีสถานะ
    }

    return Image.asset(
      imagePath,
      width: 18, // ปรับขนาดไอคอน
      height: 18,
      fit: BoxFit.cover,
    );
  }

  Widget _buildStatusName(String status) {
    String statusText;
    Color textColor;

    switch (status) {
      case "waiting_to_check":
        statusText = "รอตรวจสอบ";
        textColor = Color.fromRGBO(21, 71, 121, 1);
        break;
      case "cancel":
        statusText = "ยกเลิก";
        textColor = Color.fromRGBO(244, 155, 0, 1);
        break;
      case "fail":
        statusText = "ไม่สำเร็จ";
        textColor = Color.fromRGBO(23, 12, 171, 1);
        break;
      case "pending":
        statusText = "รอดำเนินการ";
        textColor = Color.fromRGBO(255, 168, 0, 1);
        break;
      case "in_progress":
        statusText = "กำลังดำเนินการ";
        textColor = Color.fromRGBO(68, 194, 184, 1);
        break;
      case "completed":
        statusText = "สำเร็จ";
        textColor = const Color.fromARGB(255, 0, 161, 62);
        break;
      case "rejected":
        statusText = "ปฏิเสธ";
        textColor = Colors.red;
        break;
      default:
        statusText = "ไม่ระบุ";
        textColor = Colors.grey;
    }

    return Padding(
      padding: const EdgeInsets.only(right: 4.0, bottom: 4.0),
      child: Text(
        statusText,
        style: GoogleFonts.prompt(
          fontSize: 14,
          fontWeight: FontWeight.w300,
          color: textColor,
        ),
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
