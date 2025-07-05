import 'package:e2h_app/screens/page/billing_history_page.dart';
import 'package:e2h_app/screens/page/bottombar.dart';
import 'package:e2h_app/service/service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'billing_details_page.dart';
import 'package:intl/intl.dart';

class BillingPage extends StatefulWidget {
  const BillingPage({super.key});

  @override
  State<BillingPage> createState() => _BillingPageState();
}

class _BillingPageState extends State<BillingPage> {
  int _selectedIndex = 0;

  void _onTabTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios),
          onPressed: () {
            Get.offAll(Bottombar(currentIndex: 0));
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
          'รายการค่าใช้จ่าย',
          style: GoogleFonts.prompt(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color.fromRGBO(255, 255, 255, 1)),
        ),
      ),
      body: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => _onTabTapped(0),
                  child: Container(
                    padding: const EdgeInsets.all(16),
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
                        'รอชำระ',
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
                        'ประวัติการชำระ',
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
                ? const PendingPaymentTab()
                : const PaymentHistoryTab(),
          ),
        ],
      ),
    );
  }
}

// -------------------------- API "รอชำระ" --------------------------
class PendingPaymentTab extends StatefulWidget {
  const PendingPaymentTab({Key? key}) : super(key: key);

  @override
  State<PendingPaymentTab> createState() => _PendingPaymentTabState();
}

class _PendingPaymentTabState extends State<PendingPaymentTab> {
  List<Map<String, dynamic>> _billingData = [];
  bool _isLoading = true;

  Future<void> _fetchBillingData() async {
    String renterId = await _getRenterId();
    var body = {"renter_id": renterId};

    try {
      var res = await Services().Dio_post('GetBillRentalByRenterID', body);
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          _billingData = List<Map<String, dynamic>>.from(res['data']);
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching billing data: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<String> _getRenterId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    String token = prefs.getString('token')!;
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    return decodedToken['id'].toString();
  }

  @override
  void initState() {
    super.initState();
    _fetchBillingData();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _fetchBillingData, // รีเฟรชข้อมูล
      child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _billingData.isEmpty
              ? const Center(child: Text("ไม่มีบิลที่ต้องชำระ"))
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _billingData.length,
                  itemBuilder: (context, index) {
                    final bill = _billingData[index];

                    // ดึงค่า month และ year อย่างปลอดภัย
                    int? month = bill['month'] as int?;
                    int? year = bill['year'] as int?;

                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => BillDetailsPage(
                              // bill: bill,
                              id: bill['id'],
                              flag_page: 'BillDetailsPage', // ✅ ส่ง id ไป
                              // billTypeId:
                              //     bill['bill_type_id'], // ✅ ส่ง bill_type_id ไป
                            ),
                          ),
                        );
                      },
                      child: Card(
                        margin: const EdgeInsets.symmetric(vertical: 10),
                        elevation: 4,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      '${bill['BillType']?['type_name'] ?? 'ไม่ระบุ'}'
                                      '${month != null ? ' ${getThaiMonth(month)}' : ''}'
                                      '${year != null ? ' ${(year + 543).toString()}' : ''}',
                                      style: GoogleFonts.prompt(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 4, horizontal: 12),
                                    decoration: BoxDecoration(
                                      color: Colors.red.shade300,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      "ค้างชำระ",
                                      style: GoogleFonts.prompt(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(
                                'กรุณาชำระภายใน: ${formatThaiDate(bill['due_date'])}',
                                style: GoogleFonts.prompt(fontSize: 16),
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
}

class PaymentHistoryTab extends StatefulWidget {
  const PaymentHistoryTab({Key? key}) : super(key: key);

  @override
  State<PaymentHistoryTab> createState() => _PaymentHistoryTabState();
}

class _PaymentHistoryTabState extends State<PaymentHistoryTab> {
  List<Map<String, dynamic>> _paymentHistory = [];
  bool _isLoading = true;

  Future<void> _fetchPaymentHistory() async {
    String renterId = await _getRenterId();
    var body = {"renter_id": renterId};

    try {
      var res = await Services().Dio_post('GetHistoryBillByRenterID', body);
      if (res != null && res['status_code'] == 8000) {
        setState(() {
          _paymentHistory = List<Map<String, dynamic>>.from(res['data']);
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching payment history: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<String> _getRenterId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    String token = prefs.getString('token')!;
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    return decodedToken['id'].toString();
  }

  @override
  void initState() {
    super.initState();
    _fetchPaymentHistory();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _fetchPaymentHistory, // เรียก API ใหม่
      child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _paymentHistory.isEmpty
              ? const Center(child: Text("ไม่มีประวัติการชำระ"))
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _paymentHistory.length,
                  itemBuilder: (context, index) {
                    final history = _paymentHistory[index];

                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => BillingHistoryPage(
                              billId: history['id'].toString(),
                            ),
                          ),
                        );
                      },
                      child: Card(
                        margin: const EdgeInsets.symmetric(vertical: 10),
                        elevation: 4,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      '${history['BillType']?['type_name'] ?? 'ไม่ระบุ'} '
                                      '${history['month'] != null ? getThaiMonth(history['month']) : " "} '
                                      '${history['year'] != null ? (history['year'] + 543).toString() : " "}',
                                      style: GoogleFonts.prompt(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 4, horizontal: 12),
                                    decoration: BoxDecoration(
                                      color: history['payment_status'] == "paid"
                                          ? Colors.green.shade300
                                          : history['payment_status'] == "late"
                                              ? Colors.orange.shade300
                                              : Colors.grey.shade400,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      history['payment_status'] == "paid"
                                          ? "ชำระแล้ว"
                                          : history['payment_status'] == "late"
                                              ? "ชำระล่าช้า"
                                              : "ไม่ระบุ",
                                      style: GoogleFonts.prompt(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(
                                'วันที่ชำระ: ${history['paid_at'] != null ? formatThaiDate(history['paid_at']) : "-"}',
                                style: GoogleFonts.prompt(fontSize: 16),
                              ),
                              Text(
                                'จำนวนเงิน: ${formatNumber(history['total_amount'] ?? 0)} บาท',
                                style: GoogleFonts.prompt(fontSize: 16),
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
}

// แปลงตัวเลขเดือนเป็นชื่อเดือนภาษาไทย
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
