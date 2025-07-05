// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
// import 'package:siriraj/views/widgets/widget_text.dart';

import '../global/global.dart'; // trainee add

class WidgetText extends StatelessWidget {
  const WidgetText({
    Key? key,
    required this.data,
    required this.size,
    required this.color,
    required this.weight,
    this.spacing,
    this.maxLines,
    this.textAlign,
  }) : super(key: key);

  final String data;
  final double size;
  final Color color;
  final FontWeight weight;
  final double? spacing;

  final int? maxLines;
  final TextAlign? textAlign;

  @override
  Widget build(BuildContext context) {
    return Text(
      data,
      style: TextStyle(
        fontFamily: 'Kanit',
        color: color,
        // fontWeight: FontWeight.w00,
        fontWeight: weight,
        letterSpacing: spacing,
        fontSize:
            Global.largeScreen != true ? (size / 1.2).sp : (size / 1.7).sp,
      ),
      overflow: TextOverflow.ellipsis,
      maxLines: maxLines,
      textAlign: textAlign,
    );
  }
}
