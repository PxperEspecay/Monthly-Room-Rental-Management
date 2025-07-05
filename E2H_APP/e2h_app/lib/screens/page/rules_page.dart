import 'package:flutter/material.dart';

class RulesPage extends StatelessWidget {
  const RulesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("กฎระเบียบ")),
      body: const Center(child: Text("นี่คือหน้าสำหรับกฎระเบียบ")),
    );
  }
}