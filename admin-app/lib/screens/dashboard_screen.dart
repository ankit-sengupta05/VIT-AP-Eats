import 'package:badges/badges.dart' as badges;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../theme.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';
import '../models/order.dart';
import 'orders/orders_screen.dart';
import 'menu/menu_screen.dart';
import 'restaurants/restaurants_screen.dart';
import 'users/users_screen.dart';
import 'insights/insights_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    OrdersScreen(),
    MenuScreen(),
    RestaurantsScreen(),
    UsersScreen(),
    InsightsScreen(),
  ];

  @override
  void initState() {
    super.initState();
    // Initialize notifications now that user is authenticated
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final authService  = context.read<AuthService>();
      final notifService = context.read<NotificationService>();
      await notifService.initialize(authService);
    });
  }

  /// Count of pending orders for the badge
  Stream<int> get _pendingCount => FirebaseFirestore.instance
      .collection('orders')
      .where('status', isEqualTo: 'pending')
      .snapshots()
      .map((s) => s.docs.length);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: _pendingCount,
      builder: (context, snapshot) {
        final pendingCount = snapshot.data ?? 0;

        return Scaffold(
          body: IndexedStack(
            index: _currentIndex,
            children: _screens,
          ),
          bottomNavigationBar: Container(
            decoration: const BoxDecoration(
              color: AppTheme.surface,
              border: Border(top: BorderSide(color: AppTheme.cardBorder)),
            ),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (i) => setState(() => _currentIndex = i),
              selectedItemColor: AppTheme.primary,
              unselectedItemColor: AppTheme.textSecondary,
              backgroundColor: AppTheme.surface,
              type: BottomNavigationBarType.fixed,
              selectedFontSize: 11,
              unselectedFontSize: 11,
              items: [
                BottomNavigationBarItem(
                  icon: pendingCount > 0
                      ? badges.Badge(
                          badgeContent: Text(
                            pendingCount > 99 ? '99+' : '$pendingCount',
                            style: const TextStyle(color: Colors.white, fontSize: 9),
                          ),
                          badgeStyle: const badges.BadgeStyle(
                            badgeColor: AppTheme.statusPending,
                            padding: EdgeInsets.all(4),
                          ),
                          child: const Icon(Icons.receipt_long_outlined),
                        )
                      : const Icon(Icons.receipt_long_outlined),
                  activeIcon: const Icon(Icons.receipt_long),
                  label: 'Orders',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.restaurant_menu_outlined),
                  activeIcon: Icon(Icons.restaurant_menu),
                  label: 'Menu',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.store_outlined),
                  activeIcon: Icon(Icons.store),
                  label: 'Restaurants',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.people_outline),
                  activeIcon: Icon(Icons.people),
                  label: 'Users',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.bar_chart_outlined),
                  activeIcon: Icon(Icons.bar_chart),
                  label: 'Insights',
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
