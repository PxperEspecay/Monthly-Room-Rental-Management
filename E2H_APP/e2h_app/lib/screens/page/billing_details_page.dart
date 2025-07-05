import 'dart:convert';
import 'dart:io';

import 'package:e2h_app/screens/page/billing_page.dart';
import 'package:e2h_app/screens/page/noti_page.dart';
import 'package:e2h_app/screens/page/upload_slip.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/services.dart';
import 'package:gallery_saver/gallery_saver.dart';
import 'dart:ui' as ui;

import 'package:flutter/rendering.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';

class BillDetailsPage extends StatefulWidget {
  final int id;
  final String flag_page;

  const BillDetailsPage({super.key, required this.id, required this.flag_page});

  @override
  _BillDetailsPageState createState() => _BillDetailsPageState();
}

class _BillDetailsPageState extends State<BillDetailsPage> {
  Map<String, dynamic>? bill;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    // log('billTypeId: $billTypeId');
    _fetchBillDetails();
  }

  Future<void> _fetchBillDetails() async {
    var body = {"id": widget.id}; // ส่ง id ไปที่ API

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
      print('Error fetching bill details: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

Future<void> _saveQrCode(GlobalKey qrKey) async {
  try {
    final boundary = qrKey.currentContext?.findRenderObject() as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 3.0);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    final Uint8List pngBytes = byteData!.buffer.asUint8List();

    final directory = await getTemporaryDirectory(); // ✅ ใช้ชั่วคราว
    final filePath = '${directory.path}/qr_code_${DateTime.now().millisecondsSinceEpoch}.png';
    final file = File(filePath);
    await file.writeAsBytes(pngBytes);

    final success = await GallerySaver.saveImage(file.path, albumName: "E2H_QR");

    if (success == true) {
      ScaffoldMessenger.of(qrKey.currentContext!).showSnackBar(
        const SnackBar(content: Text('บันทึก QR Code ลงแกลเลอรี (iOS) สำเร็จ')),
      );
    } else {
      throw Exception('GallerySaver failed');
    }
  } catch (e) {
    debugPrint('❌ เกิดข้อผิดพลาดบน iOS: $e');
    ScaffoldMessenger.of(qrKey.currentContext!).showSnackBar(
      const SnackBar(content: Text('เกิดข้อผิดพลาดในการบันทึก QR Code')),
    );
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
                flag_page: 'BillDetailsPage',
              ));
            } else {
              Get.offAll(BillingPage());
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
          'รายละเอียดบิล',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : bill == null
              ? const Center(child: Text("ไม่พบข้อมูลบิล"))
              : Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionTitle('รายละเอียดบิล'),
                            _buildBillDetailsCard(),
                            const SizedBox(height: 20),
                            _buildSectionTitle('ข้อมูลการโอนเงิน'),
                            _buildTransferDetailsCard(qrKey),
                          ],
                        ),
                      ),
                    ),
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => UploadSlipScreen(
                                      id: bill?['id']), // ✅ ส่ง id ไป
                                ),
                              );
                            },
                            icon: const Icon(Icons.upload_file),
                            label: const Text('แนบหลักฐาน'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
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
                    ),
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
    List<Map<String, dynamic>>? detailBill;

    try {
      if (bill?['detail_bill'] != null &&
          bill!['detail_bill'].toString().isNotEmpty) {
        detailBill = (bill?['detail_bill'] is String)
            ? List<Map<String, dynamic>>.from(jsonDecode(bill?['detail_bill']))
            : List<Map<String, dynamic>>.from(bill?['detail_bill']);
      }
    } catch (e) {
      print("🚨 Error parsing detail_bill: $e");
    }

    // 🔹 ดึงค่าเดือน/ปีให้เหมาะสม
    String monthYearText;
    if (bill?['bill_type_id'] == 1) {
      monthYearText =
          '${bill?['month'] != null ? getThaiMonth(bill?['month']) : "-"} ${bill?['year'] != null ? (bill?['year'] + 543).toString() : "-"}';
    } else {
      DateTime createdAt =
          DateTime.parse(bill?['created_at'] ?? DateTime.now().toString());
      monthYearText =
          '${getThaiMonth(createdAt.month)} ${createdAt.year + 543}';
    }

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 5,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🔹 แสดงเดือน + ปี
            _buildInfoRow('เดือน', monthYearText),

            // 🔹 กรณี bill_type_id == 1 → ค่าเช่ารายเดือน + ค่าขยะ
            if (bill?['bill_type_id'] == 1) ...[
              _buildInfoRow('ค่าเช่ารายเดือน',
                  '${formatNumber(bill?['monthly_rental_price'] ?? 0)} บาท'),
              _buildInfoRow(
                  'ค่าขยะ', '${formatNumber(bill?['garbage_price'] ?? 0)} บาท'),

              // 🔹 กรณี bill_type_id == 7 → แสดงเฉพาะค่าล้างแอร์
            ] else if (bill?['bill_type_id'] == 7) ...[
              _buildInfoRow(
                'ค่าล้างแอร์',
                '${formatNumber(bill?['wash_airconditioner_price'] ?? 0)} บาท',
              ),

              // 🔹 กรณี bill_type_id อื่น ๆ → ใช้ detail_bill
            ] else if (detailBill != null) ...[
              for (var item in detailBill)
                _buildInfoRow(
                  item['description'] ?? "-",
                  '${formatNumber(item['amount'] ?? 0)} บาท',
                ),
            ],

            // 🔹 แสดง "รวม" และ "วันที่ครบกำหนด" เสมอ
            _buildInfoRow(
              'รวม',
              '${formatNumber(bill?['total_amount'] ?? 0)} บาท',
              isHighlight: true,
            ),
            _buildInfoRow(
              'วันที่ครบกำหนด',
              '${formatThaiDate(bill?['due_date'])}',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransferDetailsCard(GlobalKey qrKey) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 5,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoRow('ชื่อบัญชี', 'นายศุภกฤต สอาด'),
            _buildInfoRow('ธนาคาร', 'กสิกรไทย'),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'เลขบัญชี 070-861-2316',
                  style: GoogleFonts.prompt(fontSize: 16),
                ),
                IconButton(
                  icon: const Icon(Icons.copy),
                  onPressed: () {
                    Clipboard.setData(
                      const ClipboardData(text: '070-861-2316'),
                    );
                    ScaffoldMessenger.of(qrKey.currentContext!).showSnackBar(
                      const SnackBar(content: Text('คัดลอกเลขบัญชีแล้ว')),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 20),
            Center(
              child: Column(
                children: [
                  RepaintBoundary(
                    key: qrKey,
                    child: Image.asset(
                      'asset/image/QR_pipe.jpg',
                      width: 300,
                      height: 300,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    onPressed: () => _saveQrCode(qrKey),
                    icon: const Icon(Icons.save_alt),
                    label: const Text('บันทึกรูป QR'),
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Colors.blueAccent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.prompt(fontSize: 16, color: Colors.black54),
          ),
          Text(
            value,
            style: GoogleFonts.prompt(
              fontSize: 16,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal,
              color: isHighlight ? Colors.red.shade300 : Colors.black87,
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

String formatNumber(dynamic value) {
  if (value == null) return "0"; // กรณีค่าเป็น null
  num? number = num.tryParse(value.toString()); // แปลง String เป็น num
  if (number == null) return "0"; // ถ้าแปลงไม่ได้ให้คืนค่า 0
  final formatter = NumberFormat("#,###", "en_US");
  return formatter.format(number);
}
