import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../theme.dart';
import '../../models/app_user.dart';
import '../../services/users_service.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final UsersService _service = UsersService();
  String _search = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('👥 Users'),
        backgroundColor: AppTheme.surface,
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: TextField(
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14),
              decoration: const InputDecoration(
                hintText: 'Search by name or email…',
                prefixIcon: Icon(Icons.search, color: AppTheme.textSecondary, size: 20),
              ),
              onChanged: (v) => setState(() => _search = v.toLowerCase()),
            ),
          ),
          Expanded(
            child: StreamBuilder<List<AppUser>>(
              stream: _service.watchUsers(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation(AppTheme.primary),
                    ),
                  );
                }
                var users = snapshot.data ?? [];
                if (_search.isNotEmpty) {
                  users = users.where((u) =>
                    u.name.toLowerCase().contains(_search) ||
                    u.email.toLowerCase().contains(_search),
                  ).toList();
                }

                if (users.isEmpty) {
                  return const Center(
                    child: Text('No users found',
                        style: TextStyle(color: AppTheme.textSecondary)),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: users.length,
                  itemBuilder: (_, i) => _UserTile(user: users[i]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _UserTile extends StatelessWidget {
  final AppUser user;
  const _UserTile({required this.user});

  Color get _roleColor {
    switch (user.role) {
      case 'admin':   return AppTheme.primary;
      case 'partner': return AppTheme.statusConfirmed;
      default:        return AppTheme.textSecondary;
    }
  }

  IconData get _roleIcon {
    switch (user.role) {
      case 'admin':   return Icons.admin_panel_settings;
      case 'partner': return Icons.delivery_dining;
      default:        return Icons.person;
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM yyyy');
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: _roleColor.withOpacity(0.12),
              shape: BoxShape.circle,
              border: Border.all(color: _roleColor.withOpacity(0.3)),
            ),
            child: Icon(_roleIcon, color: _roleColor, size: 22),
          ),
          const SizedBox(width: 14),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.name,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  user.email,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                  ),
                ),
                if (user.phone.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    user.phone,
                    style: const TextStyle(
                      color: AppTheme.textMuted, fontSize: 12,
                    ),
                  ),
                ],
                if (user.createdAt != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    'Joined ${fmt.format(user.createdAt!)}',
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                  ),
                ],
              ],
            ),
          ),

          // Role badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _roleColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _roleColor.withOpacity(0.3)),
            ),
            child: Text(
              user.role.toUpperCase(),
              style: TextStyle(
                color: _roleColor,
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
