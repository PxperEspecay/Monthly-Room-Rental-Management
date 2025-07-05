import 'dart:convert';
import 'package:e2h_app/screens/page/billing_page.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';

class BillingHistoryPage extends StatefulWidget {
  final String billId;

  const BillingHistoryPage({Key? key, required this.billId}) : super(key: key);

  @override
  State<BillingHistoryPage> createState() => _BillingHistoryPageState();
}

class _BillingHistoryPageState extends State<BillingHistoryPage> {
  Map<String, dynamic>? bill;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    initializeDateFormatting('th', null);
    _fetchBillDetails();
  }

  /// 🔹 เรียก API /GetBillDetails
  Future<void> _fetchBillDetails() async {
    try {
      var body = {"id": int.tryParse(widget.billId) ?? widget.billId};
      print("[log] Sending request: $body");

      var response = await Services().Dio_post('GetBillDetails', body);
      print("[log] API Response: $response");

      if (response != null && response['status_code'] == 8000) {
        setState(() {
          bill = response['data'];
          _isLoading = false;
        });
      } else {
        print("[log] API error: ${response?['status_code']}");
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print('🚨 Error fetching bill details: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios),
          onPressed: () {
            Get.offAll(BillingPage());
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
          'รายละเอียดการชำระเงิน',
          style: GoogleFonts.prompt(
            fontWeight: FontWeight.bold,
            fontSize: 24,
            color: Color.fromRGBO(255, 255, 255, 1)
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : bill == null
              ? const Center(child: Text("ไม่พบข้อมูลบิล"))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionTitle('รายละเอียดบิล'),
                      _buildBillDetailsCard(),
                      const SizedBox(height: 20),
                      _buildSectionTitle('หลักฐานการชำระเงิน'),
                      _buildPaymentProofCard(),
                    ],
                  ),
                ),
    );
  }

  /// 🔹 ฟังก์ชันสร้างหัวข้อ Section Title
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        title,
        style: GoogleFonts.prompt(fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }

  /// 🔹 ฟังก์ชันสร้าง Card รายละเอียดบิล
  Widget _buildBillDetailsCard() {
    if (bill == null) return const SizedBox();

    List<Map<String, dynamic>>? detailBill;
    try {
      if (bill?['detail_bill'] != null &&
          bill!['detail_bill'].toString().isNotEmpty) {
        detailBill = (bill?['detail_bill'] is String)
            ? List<Map<String, dynamic>>.from(jsonDecode(bill!['detail_bill']))
            : List<Map<String, dynamic>>.from(bill?['detail_bill']);
      }
    } catch (e) {
      print("🚨 Error parsing detail_bill: $e");
    }

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 5,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildInfoRow('ประเภท', bill?['BillType']?['type_name'] ?? "-"),
            _buildInfoRow('เดือน', formatMonthYear(bill)),
            if (bill?['bill_type_id'] == 1) ...[
              _buildInfoRow('ค่าเช่ารายเดือน',
                  formatNumber(bill?['monthly_rental_price'] ?? 0)),
              _buildInfoRow(
                  'ค่าขยะ', formatNumber(bill?['garbage_price'] ?? 0)),
            ] else if (bill?['bill_type_id'] == 7) ...[
              _buildInfoRow('ค่าล้างแอร์',
                  formatNumber(bill?['wash_airconditioner_price'] ?? 0)),
            ] else if (detailBill != null && detailBill.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text('รายการ',
                  style: GoogleFonts.prompt(
                      fontSize: 16, fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              for (var item in detailBill)
                _buildInfoRow(item['description'] ?? "-",
                    formatNumber(item['amount'] ?? 0)),
            ],
            _buildInfoRow(
              'รวม',
              formatNumber(bill?['total_amount'] ?? 0),
              isHighlight: true, // ✅ ทำให้เป็นตัวหนาและสีเขียว
            ),
            const SizedBox(height: 20),
            _buildInfoRow('วันที่ครบกำหนด', bill?['due_date'] ?? "-"),
          ],
        ),
      ),
    );
  }

  /// 🔹 ฟังก์ชันสร้าง Card หลักฐานการชำระเงิน
  Widget _buildPaymentProofCard() {
    if (bill == null) return const SizedBox();

    String imgSlip = bill?['img_slip']?.toString() ?? "";
    String fullImageUrl =
        imgSlip.isNotEmpty ? "http://172.20.10.3:3000/$imgSlip" : "";
    String paidAtText = formatThaiDateTimeShort(bill?['paid_at']);
    String paymentStatus = bill?['payment_status']?.toString() ?? "";

    // กำหนดสีและข้อความของ Badge ตาม payment_status
    Color badgeColor = Colors.grey;
    String badgeText = "ไม่ระบุ";

    if (paymentStatus == "paid") {
      badgeColor = Colors.green.shade300;
      badgeText = "ชำระแล้ว";
    } else if (paymentStatus == "late") {
      badgeColor = Colors.orange.shade300;
      badgeText = "ชำระล่าช้า";
    }

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 5,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                _buildInfoRow('วันที่ชำระ', paidAtText),
                _buildInfoRow('สถานะ', badgeText, badgeColor: badgeColor),
              ],
            ),
          ),
          if (imgSlip.isNotEmpty)
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(bottom: Radius.circular(16)),
              child: Image.network(fullImageUrl,
                  width: double.infinity, fit: BoxFit.cover),
            )
          else
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(12),
                    child: Text("ไม่มีหลักฐานการชำระเงิน"))),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String title, String value,
      {Color? badgeColor, bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: GoogleFonts.prompt(fontSize: 16)),
          badgeColor != null
              ? Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
                  decoration: BoxDecoration(
                      color: badgeColor,
                      borderRadius: BorderRadius.circular(12)),
                  child: Text(value,
                      style: GoogleFonts.prompt(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white)),
                )
              : Text(
                  value,
                  style: GoogleFonts.prompt(
                    fontSize: 16,
                    fontWeight:
                        isHighlight ? FontWeight.bold : FontWeight.normal,
                    color: isHighlight ? Colors.green : Colors.black,
                  ),
                ),
        ],
      ),
    );
  }

  /// 🔹 ฟังก์ชันแปลงเดือนและปีให้อยู่ในรูปแบบ "ก.พ. 67"
  String formatMonthYear(Map<String, dynamic>? bill) {
    if (bill == null) return "-";

    int? month = bill['month'];
    int? year = bill['year'];

    // ถ้า bill_type_id ไม่ใช่ 1 และ month/year เป็น null → ใช้ created_at
    if (bill['bill_type_id'] != 1 || month == null || year == null) {
      String? createdAtStr = bill['created_at']?.toString();
      if (createdAtStr != null && createdAtStr.isNotEmpty) {
        try {
          DateTime createdAt = DateTime.parse(createdAtStr);
          return "${getThaiMonth(createdAt.month)} ${(createdAt.year + 543) % 100}";
        } catch (e) {
          print("🚨 Error parsing created_at: $e");
        }
      }
      return "-";
    }

    return "${getThaiMonth(month)} ${(year + 543) % 100}";
  }

  /// 🔹 ฟังก์ชันแปลงเลขเดือนเป็นชื่อไทยแบบย่อ
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
      'พ.ย.',
      'ธ.ค.'
    ];
    return (month >= 1 && month <= 12) ? thaiMonths[month] : "-";
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

  String formatThaiDateTimeShort(String dateTimeStr) {
    try {
      DateTime dateTime = DateTime.parse(dateTimeStr);
      return DateFormat('d MMM yy HH:mm น.', 'th').format(dateTime);
    } catch (e) {
      return "-";
    }
  }
}
