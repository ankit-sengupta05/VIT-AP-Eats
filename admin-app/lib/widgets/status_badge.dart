import 'package:flutter/material.dart';
import '../models/order.dart';
import '../theme.dart';

class StatusBadge extends StatelessWidget {
  final OrderStatus status;
  final bool large;

  const StatusBadge({super.key, required this.status, this.large = false});

  Color get _bg {
    switch (status) {
      case OrderStatus.pending:        return AppTheme.statusPending.withOpacity(0.15);
      case OrderStatus.confirmed:      return AppTheme.statusConfirmed.withOpacity(0.15);
      case OrderStatus.preparing:      return AppTheme.statusPreparing.withOpacity(0.15);
      case OrderStatus.outForDelivery: return AppTheme.statusOutDelivery.withOpacity(0.15);
      case OrderStatus.delivered:      return AppTheme.statusDelivered.withOpacity(0.15);
      case OrderStatus.cancelled:      return AppTheme.statusCancelled.withOpacity(0.15);
    }
  }

  Color get _fg {
    switch (status) {
      case OrderStatus.pending:        return AppTheme.statusPending;
      case OrderStatus.confirmed:      return AppTheme.statusConfirmed;
      case OrderStatus.preparing:      return AppTheme.statusPreparing;
      case OrderStatus.outForDelivery: return AppTheme.statusOutDelivery;
      case OrderStatus.delivered:      return AppTheme.statusDelivered;
      case OrderStatus.cancelled:      return AppTheme.statusCancelled;
    }
  }

  IconData get _icon {
    switch (status) {
      case OrderStatus.pending:        return Icons.hourglass_empty;
      case OrderStatus.confirmed:      return Icons.check_circle_outline;
      case OrderStatus.preparing:      return Icons.restaurant;
      case OrderStatus.outForDelivery: return Icons.delivery_dining;
      case OrderStatus.delivered:      return Icons.done_all;
      case OrderStatus.cancelled:      return Icons.cancel_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final fontSize = large ? 13.0 : 11.0;
    final iconSize = large ? 15.0 : 12.0;
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: large ? 12 : 8,
        vertical: large ? 6 : 4,
      ),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _fg.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_icon, color: _fg, size: iconSize),
          const SizedBox(width: 5),
          Text(
            status.label,
            style: TextStyle(
              color: _fg,
              fontSize: fontSize,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
