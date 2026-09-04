import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../theme.dart';
import '../../models/order.dart';
import '../../services/orders_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/status_badge.dart';
import 'order_detail_screen.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final OrdersService _service = OrdersService();
  final List<OrderStatus?> _tabs = [
    null,
    OrderStatus.pending,
    OrderStatus.confirmed,
    OrderStatus.preparing,
    OrderStatus.outForDelivery,
    OrderStatus.delivered,
    OrderStatus.cancelled,
  ];

  final List<String> _tabLabels = [
    'All', 'Pending', 'Confirmed', 'Preparing', 'On Way', 'Done', 'Cancelled',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Stream<List<Order>> _streamForTab(OrderStatus? status) {
    return status == null
        ? _service.watchAllOrders()
        : _service.watchOrdersByStatus(status);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('📋 Live Orders'),
        backgroundColor: AppTheme.surface,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppTheme.textSecondary, size: 22),
            tooltip: 'Sign Out',
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Sign Out'),
                  content: const Text('Are you sure you want to sign out?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text(
                        'Sign Out',
                        style: TextStyle(color: AppTheme.statusCancelled),
                      ),
                    ),
                  ],
                ),
              );
              if (confirm == true && context.mounted) {
                await context.read<AuthService>().signOut();
              }
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textSecondary,
          indicatorColor: AppTheme.primary,
          indicatorSize: TabBarIndicatorSize.label,
          dividerColor: AppTheme.cardBorder,
          labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          tabs: _tabLabels.map((l) => Tab(text: l)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _tabs.map((status) {
          return StreamBuilder<List<Order>>(
            stream: _streamForTab(status),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const _LoadingSkeleton();
              }
              if (snapshot.hasError) {
                return _ErrorView(error: snapshot.error.toString());
              }
              final orders = snapshot.data ?? [];
              if (orders.isEmpty) {
                return _EmptyView(
                  label: status == null ? 'No orders yet' : 'No ${status.label.toLowerCase()} orders',
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 12),
                itemCount: orders.length,
                itemBuilder: (ctx, i) => _OrderCard(
                  order: orders[i],
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => OrderDetailScreen(orderId: orders[i].id),
                    ),
                  ),
                ),
              );
            },
          );
        }).toList(),
      ),
    );
  }
}

// ── Order Card ───────────────────────────────────────────────────────────────

class _OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onTap;

  const _OrderCard({required this.order, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM, hh:mm a');
    final timeStr = order.createdAt != null ? fmt.format(order.createdAt!) : '—';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.userName,
                        style: const TextStyle(
                          color: AppTheme.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        order.restaurantName,
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                StatusBadge(status: order.status),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(height: 1),
            const SizedBox(height: 12),

            // Order meta row
            Row(
              children: [
                _MetaChip(
                  icon: Icons.shopping_bag_outlined,
                  label: '${order.items.length} item${order.items.length != 1 ? 's' : ''}',
                ),
                const SizedBox(width: 8),
                _MetaChip(
                  icon: Icons.currency_rupee,
                  label: '₹${order.total.toStringAsFixed(0)}',
                  highlight: true,
                ),
                const Spacer(),
                Text(
                  timeStr,
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                ),
              ],
            ),

            // WhatsApp button if phone exists
            if (order.userPhone.isNotEmpty) ...[
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () async {
                  final phone = order.userPhone.replaceAll(RegExp(r'\D'), '');
                  final uri = Uri.parse('https://wa.me/91$phone');
                  if (await canLaunchUrl(uri)) launchUrl(uri);
                },
                child: Row(
                  children: [
                    const Icon(Icons.phone, color: AppTheme.statusDelivered, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      'WhatsApp ${order.userPhone}',
                      style: const TextStyle(
                        color: AppTheme.statusDelivered,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool highlight;

  const _MetaChip({
    required this.icon,
    required this.label,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: highlight
            ? AppTheme.primary.withOpacity(0.12)
            : AppTheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: highlight
              ? AppTheme.primary.withOpacity(0.3)
              : AppTheme.cardBorder,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13,
              color: highlight ? AppTheme.primary : AppTheme.textSecondary),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: highlight ? AppTheme.primary : AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Loading / Empty / Error views ────────────────────────────────────────────

class _LoadingSkeleton extends StatelessWidget {
  const _LoadingSkeleton();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 12),
      itemCount: 5,
      itemBuilder: (_, i) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        height: 110,
        decoration: BoxDecoration(
          color: AppTheme.cardColor,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final String label;
  const _EmptyView({required this.label});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.inbox_outlined, color: AppTheme.textMuted, size: 56),
          const SizedBox(height: 16),
          Text(label,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 15)),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String error;
  const _ErrorView({required this.error});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          'Error: $error',
          style: const TextStyle(color: AppTheme.statusCancelled),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
