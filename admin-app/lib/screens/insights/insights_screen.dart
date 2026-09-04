import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../theme.dart';
import '../../services/orders_service.dart';

class InsightsScreen extends StatefulWidget {
  const InsightsScreen({super.key});

  @override
  State<InsightsScreen> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends State<InsightsScreen> {
  final OrdersService _service = OrdersService();
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _loading = true);
    final stats = await _service.getStats();
    if (mounted) setState(() { _stats = stats; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('📊 Insights'),
        backgroundColor: AppTheme.surface,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined, color: AppTheme.textSecondary),
            onPressed: _loadStats,
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(AppTheme.primary),
              ),
            )
          : _stats == null
              ? const Center(child: Text('Failed to load stats'))
              : _InsightsBody(stats: _stats!, onRefresh: _loadStats),
    );
  }
}

class _InsightsBody extends StatelessWidget {
  final Map<String, dynamic> stats;
  final VoidCallback onRefresh;

  const _InsightsBody({required this.stats, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    final totalOrders  = stats['totalOrders']  as int;
    final totalRevenue = stats['totalRevenue'] as double;
    final pending      = stats['pending']      as int;
    final delivered    = stats['delivered']    as int;
    final cancelled    = stats['cancelled']    as int;
    final active       = stats['active']       as int;
    final revenueByDay = stats['revenueByDay'] as Map<String, double>;
    final topDishes    = stats['topDishes']    as List;

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      color: AppTheme.primary,
      backgroundColor: AppTheme.cardColor,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Stat Cards Grid ─────────────────────────────────────────────
          Row(
            children: [
              Expanded(child: _StatCard(
                label: 'Total Revenue',
                value: fmt.format(totalRevenue),
                icon: Icons.currency_rupee,
                color: AppTheme.primary,
                large: true,
              )),
              const SizedBox(width: 10),
              Expanded(child: _StatCard(
                label: 'Total Orders',
                value: '$totalOrders',
                icon: Icons.receipt_long,
                color: AppTheme.accent,
              )),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _StatCard(
                label: 'Delivered',
                value: '$delivered',
                icon: Icons.check_circle_outline,
                color: AppTheme.statusDelivered,
              )),
              const SizedBox(width: 10),
              Expanded(child: _StatCard(
                label: 'Active',
                value: '$active',
                icon: Icons.local_fire_department_outlined,
                color: AppTheme.statusPreparing,
              )),
              const SizedBox(width: 10),
              Expanded(child: _StatCard(
                label: 'Pending',
                value: '$pending',
                icon: Icons.hourglass_empty,
                color: AppTheme.statusPending,
              )),
              const SizedBox(width: 10),
              Expanded(child: _StatCard(
                label: 'Cancelled',
                value: '$cancelled',
                icon: Icons.cancel_outlined,
                color: AppTheme.statusCancelled,
              )),
            ],
          ),
          const SizedBox(height: 20),

          // ── Order Status Distribution (Pie) ──────────────────────────────
          if (totalOrders > 0) ...[
            _SectionHeader('Order Distribution'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: SizedBox(
                height: 200,
                child: PieChart(
                  PieChartData(
                    sectionsSpace: 3,
                    centerSpaceRadius: 50,
                    sections: [
                      if (delivered > 0)
                        _pieSection('Delivered', delivered, totalOrders,
                            AppTheme.statusDelivered),
                      if (active > 0)
                        _pieSection('Active', active, totalOrders,
                            AppTheme.statusPreparing),
                      if (pending > 0)
                        _pieSection('Pending', pending, totalOrders,
                            AppTheme.statusPending),
                      if (cancelled > 0)
                        _pieSection('Cancelled', cancelled, totalOrders,
                            AppTheme.statusCancelled),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],

          // ── Revenue by Day (Bar chart) ───────────────────────────────────
          if (revenueByDay.isNotEmpty) ...[
            _SectionHeader('Revenue by Day'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.fromLTRB(8, 16, 16, 8),
              decoration: BoxDecoration(
                color: AppTheme.cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: SizedBox(
                height: 200,
                child: BarChart(
                  BarChartData(
                    barTouchData: BarTouchData(enabled: true),
                    titlesData: FlTitlesData(
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 48,
                          getTitlesWidget: (v, _) => Text(
                            '₹${(v / 1000).toStringAsFixed(0)}k',
                            style: const TextStyle(
                              color: AppTheme.textMuted, fontSize: 10,
                            ),
                          ),
                        ),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (v, _) {
                            final keys = revenueByDay.keys.toList();
                            final idx = v.toInt();
                            if (idx >= 0 && idx < keys.length) {
                              return Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  keys[idx],
                                  style: const TextStyle(
                                    color: AppTheme.textMuted, fontSize: 10,
                                  ),
                                ),
                              );
                            }
                            return const SizedBox();
                          },
                        ),
                      ),
                      topTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false)),
                    ),
                    gridData: FlGridData(
                      show: true,
                      drawVerticalLine: false,
                      getDrawingHorizontalLine: (_) => const FlLine(
                        color: AppTheme.cardBorder, strokeWidth: 1,
                      ),
                    ),
                    borderData: FlBorderData(show: false),
                    barGroups: revenueByDay.entries.toList().asMap().entries.map((e) {
                      return BarChartGroupData(
                        x: e.key,
                        barRods: [
                          BarChartRodData(
                            toY: e.value.value,
                            color: AppTheme.primary,
                            width: 16,
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(6),
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],

          // ── Top Dishes ───────────────────────────────────────────────────
          if (topDishes.isNotEmpty) ...[
            _SectionHeader('🏆 Top Dishes'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                children: topDishes.asMap().entries.map((e) {
                  final rank  = e.key + 1;
                  final entry = e.value as MapEntry<String, int>;
                  final maxCount = (topDishes.first as MapEntry<String, int>).value;
                  final pct = entry.value / maxCount;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      children: [
                        Text(
                          '#$rank',
                          style: TextStyle(
                            color: rank == 1 ? const Color(0xFFFFD700) : AppTheme.textMuted,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                entry.key,
                                style: const TextStyle(
                                  color: AppTheme.textPrimary,
                                  fontWeight: FontWeight.w500,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 4),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: pct,
                                  backgroundColor: AppTheme.surface,
                                  valueColor: AlwaysStoppedAnimation(
                                    rank == 1 ? AppTheme.primary : AppTheme.accent,
                                  ),
                                  minHeight: 6,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          '${entry.value}x',
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  PieChartSectionData _pieSection(
      String label, int count, int total, Color color) {
    final pct = (count / total * 100).toStringAsFixed(0);
    return PieChartSectionData(
      value: count.toDouble(),
      color: color,
      title: '$pct%',
      radius: 60,
      titleStyle: const TextStyle(
        color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700,
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);

  @override
  Widget build(BuildContext context) => Text(
    title,
    style: const TextStyle(
      color: AppTheme.textPrimary,
      fontWeight: FontWeight.w700,
      fontSize: 16,
    ),
  );
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final bool large;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.large = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: large ? 22 : 18),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w800,
                fontSize: large ? 22 : 18,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
