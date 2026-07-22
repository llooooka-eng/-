import 'package:flutter/material.dart';

/// النجمة الرباعية — عنصر هوية «تألق» (اللمعان). رسم متجهي خفيف بلا أصول.
class Sparkle extends StatelessWidget {
  const Sparkle({super.key, this.size = 48, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: CustomPaint(painter: _SparklePainter(color)),
    );
  }
}

class _SparklePainter extends CustomPainter {
  const _SparklePainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final c = size.center(Offset.zero);
    final r = size.width / 2;
    const waist = 0.16; // مدى نحافة الخصر بين الأطراف

    final path = Path()
      ..moveTo(c.dx, c.dy - r)
      ..quadraticBezierTo(c.dx + r * waist, c.dy - r * waist, c.dx + r, c.dy)
      ..quadraticBezierTo(c.dx + r * waist, c.dy + r * waist, c.dx, c.dy + r)
      ..quadraticBezierTo(c.dx - r * waist, c.dy + r * waist, c.dx - r, c.dy)
      ..quadraticBezierTo(c.dx - r * waist, c.dy - r * waist, c.dx, c.dy - r)
      ..close();

    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(covariant _SparklePainter oldDelegate) =>
      oldDelegate.color != color;
}
