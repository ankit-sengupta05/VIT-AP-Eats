import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../theme.dart';
import '../../models/order.dart';
import '../../services/orders_service.dart';
import '../../widgets/status_badge.dart';

class OrderDetailScreen extends StatefulWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final OrdersService _service = OrdersService();
  bool _updating = false;
  final _noteCtrl = TextEditingController();

  @override
  void dispose() {
    _noteCtrl.dispose();
    super.dispose();
  }

  Future<void> _updateStatus(String orderId, OrderStatus newStatus) async {
    setState(() => _updating = true);
    try {
      await _service.updateStatus(orderId, newStatus);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Status updated to ${newStatus.label}'),
            backgroundColor: AppTheme.statusDelivered,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppTheme.statusCancelled,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _updating = false);
    }
  }

  Future<void> _saveNote(String orderId) async {
    final note = _noteCtrl.text.trim();
    if (note.isEmpty) return;
    await _service.addAdminNote(orderId, note);
    if (mounted) {
      FocusScope.of(context).unfocus();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Note saved')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(
          'Order #${widget.orderId.substring(0, 8).toUpperCase()}',
          style: const TextStyle(fontSize: 16),
        ),
        backgroundColor: AppTheme.surface,
      ),
      body: StreamBuilder<Order?>(
        stream: _service.watchOrder(widget.orderId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(AppTheme.primary),
              ),
            );
          }
          final order = snapshot.data;
          if (order == null) {
            return const Center(
              child: Text('Order not found', style: TextStyle(color: AppTheme.textSecondary)),
            );
          }
          return _OrderDetailBody(
            order: order,
            updating: _updating,
            noteCtrl: _noteCtrl,
            onUpdateStatus: (s) => _updateStatus(order.id, s),
            onSaveNote: () => _saveNote(order.id),
          );
        },
      ),
    );
  }
}

class _OrderDetailBody extends StatelessWidget {
  final Order order;
  final bool updating;
  final TextEditingController noteCtrl;
  final Function(OrderStatus) onUpdateStatus;
  final VoidCallback onSaveNote;

  const _OrderDetailBody({
    required this.order,
    required this.updating,
    required this.noteCtrl,
    required this.onUpdateStatus,
    required this.onSaveNote,
  });

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM yyyy, hh:mm a');

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ── Status card ──────────────────────────────────────────────────
        _SectionCard(
          title: 'Order Status',
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  StatusBadge(status: order.status, large: true),
                  if (order.createdAt != null)
                    Text(
                      fmt.format(order.createdAt!),
                      style: const TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              // Status stepper
              _StatusStepper(current: order.status),
              const SizedBox(height: 20),
              // Action buttons
              if (order.status != OrderStatus.delivered &&
                  order.status != OrderStatus.cancelled) ...[
                Row(
                  children: [
                    if (order.status.next != null)
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: updating
                              ? null
                              : () => onUpdateStatus(order.status.next!),
                          icon: updating
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation(Colors.white),
                                  ),
                                )
                              : const Icon(Icons.arrow_forward, size: 18),
                          label: Text(
                            'Move to ${order.status.next?.label ?? ''}',
                            style: const TextStyle(fontSize: 13),
                          ),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                    if (order.status != OrderStatus.cancelled) ...[
                      if (order.status.next != null) const SizedBox(width: 8),
                      OutlinedButton.icon(
                        onPressed: updating
                            ? null
                            : () => _confirmCancel(context),
                        icon: const Icon(Icons.cancel_outlined, size: 18),
                        label: const Text('Cancel', style: TextStyle(fontSize: 13)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.statusCancelled,
                          side: const BorderSide(color: AppTheme.statusCancelled),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 14),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ── Customer info ─────────────────────────────────────────────────
        _SectionCard(
          title: 'Customer Details',
          child: Column(
            children: [
              _InfoRow(icon: Icons.person_outline, label: 'Name', value: order.userName),
              _InfoRow(icon: Icons.phone_outlined,  label: 'Phone', value: order.userPhone),
              _InfoRow(icon: Icons.location_on_outlined, label: 'Address', value: order.address),
              if (order.userPhone.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: GestureDetector(
                    onTap: () async {
                      final phone = order.userPhone.replaceAll(RegExp(r'\D'), '');
                      final uri = Uri.parse('https://wa.me/91$phone');
                      if (await canLaunchUrl(uri)) launchUrl(uri);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF25D366).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF25D366).withOpacity(0.3)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.chat, color: Color(0xFF25D366), size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Message on WhatsApp',
                            style: TextStyle(
                              color: Color(0xFF25D366),
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ── Order items ───────────────────────────────────────────────────
        _SectionCard(
          title: '🛒 Order Items — ${order.restaurantName}',
          child: Column(
            children: [
              ...order.items.map((item) => _OrderItemRow(item: item)),
              const Divider(height: 24),
              _PriceRow(label: 'Subtotal',  value: order.subtotal),
              _PriceRow(label: 'Delivery',  value: order.deliveryFee),
              if ((order.discount ?? 0) > 0)
                _PriceRow(
                  label: 'Discount (${order.couponCode ?? ''})',
                  value: -(order.discount!),
                  color: AppTheme.statusDelivered,
                ),
              const SizedBox(height: 6),
              _PriceRow(label: 'Total',  value: order.total, bold: true),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ── Admin Note ────────────────────────────────────────────────────
        _SectionCard(
          title: '📝 Admin Note',
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: noteCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                  decoration: const InputDecoration(
                    hintText: 'Add a note for this order…',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                  maxLines: 3,
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: onSaveNote,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
                child: const Text('Save'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  void _confirmCancel(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Cancel Order'),
        content: const Text('Are you sure you want to cancel this order?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Keep Order'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              onUpdateStatus(OrderStatus.cancelled);
            },
            child: const Text(
              'Cancel Order',
              style: TextStyle(color: AppTheme.statusCancelled),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Supporting Widgets ───────────────────────────────────────────────────────

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _SectionCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppTheme.textPrimary,
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppTheme.textMuted, size: 18),
          const SizedBox(width: 10),
          SizedBox(
            width: 70,
            child: Text(label,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          ),
          Expanded(
            child: Text(value.isEmpty ? '—' : value,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}

class _OrderItemRow extends StatelessWidget {
  final OrderItem item;
  const _OrderItemRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            width: 26,
            height: 26,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppTheme.primary.withOpacity(0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              '${item.quantity}x',
              style: const TextStyle(
                color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(item.name,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13)),
          ),
          Text(
            '₹${(item.price * item.quantity).toStringAsFixed(0)}',
            style: const TextStyle(
              color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final double value;
  final bool bold;
  final Color? color;

  const _PriceRow({
    required this.label,
    required this.value,
    this.bold = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: bold ? AppTheme.textPrimary : AppTheme.textSecondary,
              fontSize: bold ? 15 : 13,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
            ),
          ),
          Text(
            '₹${value.abs().toStringAsFixed(0)}',
            style: TextStyle(
              color: color ?? (bold ? AppTheme.primary : AppTheme.textPrimary),
              fontSize: bold ? 16 : 13,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusStepper extends StatelessWidget {
  final OrderStatus current;

  const _StatusStepper({required this.current});

  static const List<OrderStatus> _flow = [
    OrderStatus.pending,
    OrderStatus.confirmed,
    OrderStatus.preparing,
    OrderStatus.outForDelivery,
    OrderStatus.delivered,
  ];

  @override
  Widget build(BuildContext context) {
    if (current == OrderStatus.cancelled) {
      return Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppTheme.statusCancelled.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.statusCancelled.withOpacity(0.3)),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.cancel, color: AppTheme.statusCancelled, size: 16),
            SizedBox(width: 6),
            Text('Order Cancelled',
                style: TextStyle(color: AppTheme.statusCancelled, fontSize: 13)),
          ],
        ),
      );
    }

    final currentIdx = _flow.indexOf(current);

    return Row(
      children: List.generate(_flow.length * 2 - 1, (i) {
        if (i.isOdd) {
          // Connector line
          final stepIdx = (i - 1) ~/ 2;
          final active = stepIdx < currentIdx;
          return Expanded(
            child: Container(
              height: 2,
              color: active ? AppTheme.primary : AppTheme.cardBorder,
            ),
          );
        }
        final stepIdx = i ~/ 2;
        final isDone = stepIdx < currentIdx;
        final isCurrent = stepIdx == currentIdx;
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: isDone
                    ? AppTheme.statusDelivered
                    : isCurrent
                        ? AppTheme.primary
                        : AppTheme.surface,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDone
                      ? AppTheme.statusDelivered
                      : isCurrent
                          ? AppTheme.primary
                          : AppTheme.cardBorder,
                  width: 2,
                ),
              ),
              child: Icon(
                isDone ? Icons.check : Icons.circle,
                color: isDone || isCurrent ? Colors.white : AppTheme.textMuted,
                size: isDone ? 14 : 8,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _flow[stepIdx].label.replaceAll(' ', '\n'),
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isDone || isCurrent
                    ? AppTheme.textPrimary
                    : AppTheme.textMuted,
                fontSize: 9,
                fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
          ],
        );
      }),
    );
  }
}
