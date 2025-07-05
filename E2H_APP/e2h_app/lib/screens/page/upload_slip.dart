import 'dart:convert';
import 'dart:developer';
import 'package:e2h_app/screens/page/billing_history_page.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:google_fonts/google_fonts.dart';
import 'package:e2h_app/service/service.dart';
import 'package:dio/dio.dart';

class UploadSlipScreen extends StatefulWidget {
  final int id;
  const UploadSlipScreen({super.key, required this.id});

  @override
  State<UploadSlipScreen> createState() => _UploadSlipScreenState();
}

class _UploadSlipScreenState extends State<UploadSlipScreen> {
  File? _selectedImage;
  Map<String, dynamic>? bill;
  bool isLoading = true;
  final TextEditingController _detailController =
      TextEditingController(); // ✅ ช่องกรอกรายละเอียดเพิ่มเติม

  @override
  void initState() {
    super.initState();
    log("📌 รับ id จากหน้าเดิม: ${widget.id}");
    _fetchBillDetails();
  }

  /// ✅ ฟังก์ชันเรียก API `GetBillDetails`
  Future<void> _fetchBillDetails() async {
    var body = {"id": widget.id};

    try {
      var res = await Services().Dio_post('GetBillDetails', body);
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          bill = res['data'];
          isLoading = false;
        });
      } else {
        throw Exception("ดึงข้อมูลบิลไม่สำเร็จ");
      }
    } catch (e) {
      log('❌ Error fetching bill details: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  /// ✅ ฟังก์ชันเลือกภาพ
  Future<void> _pickImage() async {
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }

  /// ✅ ฟังก์ชันอัปโหลดหลักฐานการชำระเงิน
  /// ✅ ฟังก์ชันอัปโหลดหลักฐานการชำระเงิน
  Future<void> _uploadSlip() async {
    if (_selectedImage == null) return;

    try {
      int billId = widget.id;
      String detailText = _detailController.text.trim();

      FormData formData = FormData.fromMap({
        "id": billId,
        "detail_bill_from_renter":
            detailText.isNotEmpty ? detailText : "ไม่มีข้อมูล",
        "img_slip": await MultipartFile.fromFile(_selectedImage!.path,
            filename: "slip.jpg"),
      });

      log("📤 Uploading slip...");
      var response = await Services().Dio_post('UploadSlip', formData);

      if (response != null && response['status_code'] == 8000) {
        log("✅ อัปโหลดหลักฐานสำเร็จ");

        // ScaffoldMessenger.of(context).showSnackBar(
        //   const SnackBar(content: Text("อัปโหลดหลักฐานสำเร็จ")),
        // );

        EasyLoading.dismiss();
        _showAlertDialog(context, 'สำเร็จ', billId.toString());

        // ✅ ไปหน้า BillingHistoryPage พร้อมส่งค่า id
      } else {
        throw Exception(
            "อัปโหลดไม่สำเร็จ: ${response?['message'] ?? 'ไม่ทราบสาเหตุ'}");
      }
    } catch (e) {
      log('❌ Error uploading slip: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("เกิดข้อผิดพลาดในการอัปโหลด")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
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
          'แนบหลักฐานการชำระเงิน',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow(
                    'ชุมชน',
                    bill?['Renter']?['Community']?['community_name_th'] ??
                        'ไม่ระบุ',
                  ),
                  _buildInfoRow(
                    'อาคาร',
                    bill?['Renter']?['Room']?['Building']?['building_name'] ??
                        'ไม่ระบุ',
                  ),
                  _buildInfoRow(
                    'บ้านเลขที่',
                    bill?['Renter']?['Room']?['room_number'] ?? 'ไม่ระบุ',
                  ),
                  _buildInfoRow(
                    'รายการ',
                    bill?['BillType']?['type_name'] ?? 'ไม่ระบุ',
                  ),
                  _buildInfoRow(
                    'ผู้เช่า',
                    '${bill?['Renter']?['prefix'] ?? ''} '
                            '${bill?['Renter']?['first_name'] ?? ''} '
                            '${bill?['Renter']?['last_name'] ?? ''}'
                        .trim(),
                  ),
                  _buildInfoRow(
                    'ยอดชำระ',
                    '${bill?['total_amount'] ?? '0.00'} บาท',
                    isBold: true,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'หลักฐานการโอนเงิน',
                    style: GoogleFonts.prompt(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: _selectedImage == null
                          ? SizedBox(
                              height: 150,
                              child: Center(
                                child: Icon(Icons.image,
                                    size: 50, color: Colors.grey),
                              ),
                            )
                          : ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.file(
                                _selectedImage!,
                                width: double.infinity,
                                fit: BoxFit.contain,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'รายละเอียดเพิ่มเติม',
                    style: GoogleFonts.prompt(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _detailController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'พิมพ์รายละเอียดเพิ่มเติม',
                      hintStyle: GoogleFonts.prompt(),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.grey[200],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: _selectedImage != null
                ? Colors.teal.shade400
                : Colors.grey[500],
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          onPressed:
              _selectedImage != null ? _uploadSlip : null, // ✅ กดแล้วส่ง API
          child: Text(
            'ตกลง',
            style: GoogleFonts.prompt(
              fontSize: 16,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.prompt(fontSize: 14),
          ),
          Text(
            value,
            style: GoogleFonts.prompt(
              fontSize: 14,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  void _showAlertDialog(
    BuildContext context,
    String message,
    String billId,
  ) {
    showCupertinoDialog<void>(
      context: context,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: Text(
          message,
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
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        actions: <CupertinoDialogAction>[
          CupertinoDialogAction(
            isDestructiveAction: true,
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      BillingHistoryPage(billId: billId.toString()),
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
