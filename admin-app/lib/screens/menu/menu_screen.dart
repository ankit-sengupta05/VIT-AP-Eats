import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../theme.dart';
import '../../models/menu_item.dart';
import '../../models/restaurant.dart';
import '../../services/menu_service.dart';
import '../../services/restaurants_service.dart';
import 'menu_item_form.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final MenuService _menuService = MenuService();
  final RestaurantsService _restService = RestaurantsService();

  String? _selectedRestaurantId;
  List<Restaurant> _restaurants = [];
  bool _loadingRestaurants = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadRestaurants();
  }

  Future<void> _loadRestaurants() async {
    final list = await _restService.getAllRestaurants();
    if (mounted) {
      setState(() {
        _restaurants = list;
        _selectedRestaurantId = list.isNotEmpty ? list.first.id : null;
        _loadingRestaurants = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('🍽️ Menu Management'),
        backgroundColor: AppTheme.surface,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: AppTheme.primary),
            tooltip: 'Add Menu Item',
            onPressed: _selectedRestaurantId == null
                ? null
                : () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => MenuItemForm(
                          restaurantId: _selectedRestaurantId!,
                        ),
                      ),
                    ),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Restaurant picker ────────────────────────────────────────────
          if (!_loadingRestaurants && _restaurants.isNotEmpty)
            Container(
              color: AppTheme.surface,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: DropdownButtonFormField<String>(
                value: _selectedRestaurantId,
                dropdownColor: AppTheme.cardColor,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                decoration: const InputDecoration(
                  labelText: 'Select Restaurant',
                  contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                ),
                items: _restaurants.map((r) {
                  return DropdownMenuItem(value: r.id, child: Text(r.name));
                }).toList(),
                onChanged: (v) => setState(() => _selectedRestaurantId = v),
              ),
            ),

          // ── Search bar ───────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: TextField(
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14),
              decoration: const InputDecoration(
                hintText: 'Search menu items…',
                prefixIcon: Icon(Icons.search, color: AppTheme.textSecondary, size: 20),
              ),
              onChanged: (v) => setState(() => _search = v.toLowerCase()),
            ),
          ),

          // ── Item list ────────────────────────────────────────────────────
          Expanded(
            child: _selectedRestaurantId == null
                ? const Center(
                    child: Text('No restaurants found',
                        style: TextStyle(color: AppTheme.textSecondary)),
                  )
                : StreamBuilder<List<MenuItem>>(
                    stream: _menuService.watchMenuByRestaurant(_selectedRestaurantId!),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation(AppTheme.primary),
                          ),
                        );
                      }
                      var items = snapshot.data ?? [];
                      if (_search.isNotEmpty) {
                        items = items.where((i) =>
                          i.name.toLowerCase().contains(_search) ||
                          i.category.toLowerCase().contains(_search),
                        ).toList();
                      }

                      // Group by category
                      final Map<String, List<MenuItem>> grouped = {};
                      for (final item in items) {
                        grouped.putIfAbsent(item.category, () => []).add(item);
                      }

                      if (grouped.isEmpty) {
                        return const Center(
                          child: Text('No items found',
                              style: TextStyle(color: AppTheme.textSecondary)),
                        );
                      }

                      return ListView(
                        padding: const EdgeInsets.only(bottom: 24, top: 8),
                        children: grouped.entries.map((entry) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                                child: Text(
                                  entry.key.toUpperCase(),
                                  style: const TextStyle(
                                    color: AppTheme.primary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.5,
                                  ),
                                ),
                              ),
                              ...entry.value.map((item) => _MenuItemCard(
                                    item: item,
                                    onEdit: () => Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => MenuItemForm(
                                          restaurantId: _selectedRestaurantId!,
                                          existingItem: item,
                                        ),
                                      ),
                                    ),
                                    onDelete: () => _confirmDelete(context, item),
                                    onToggle: (v) => _menuService.toggleAvailability(item.id, v),
                                  )),
                            ],
                          );
                        }).toList(),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, MenuItem item) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Item'),
        content: Text('Delete "${item.name}"? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _menuService.deleteMenuItem(item.id);
            },
            child: const Text('Delete',
                style: TextStyle(color: AppTheme.statusCancelled)),
          ),
        ],
      ),
    );
  }
}

// ── Menu Item Card ────────────────────────────────────────────────────────────

class _MenuItemCard extends StatelessWidget {
  final MenuItem item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final ValueChanged<bool> onToggle;

  const _MenuItemCard({
    required this.item,
    required this.onEdit,
    required this.onDelete,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: item.isAvailable ? AppTheme.cardBorder : AppTheme.cardBorder.withOpacity(0.5),
        ),
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: item.imageUrl.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: item.imageUrl,
                    width: 64,
                    height: 64,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(
                      width: 64, height: 64, color: AppTheme.surface,
                    ),
                    errorWidget: (_, __, ___) => _PlaceholderImage(isVeg: item.isVeg),
                  )
                : _PlaceholderImage(isVeg: item.isVeg),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    // Veg/Non-veg indicator
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: item.isVeg ? AppTheme.statusDelivered : AppTheme.statusCancelled,
                        ),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Center(
                        child: Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: item.isVeg ? AppTheme.statusDelivered : AppTheme.statusCancelled,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        item.name,
                        style: TextStyle(
                          color: item.isAvailable
                              ? AppTheme.textPrimary
                              : AppTheme.textMuted,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '₹${item.price.toStringAsFixed(0)}',
                  style: const TextStyle(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.isAvailable ? 'Available' : 'Unavailable',
                  style: TextStyle(
                    color: item.isAvailable
                        ? AppTheme.statusDelivered
                        : AppTheme.statusCancelled,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          // Actions
          Column(
            children: [
              Switch(
                value: item.isAvailable,
                onChanged: onToggle,
                activeColor: AppTheme.primary,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: onEdit,
                    child: const Icon(Icons.edit_outlined,
                        color: AppTheme.textSecondary, size: 18),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: onDelete,
                    child: const Icon(Icons.delete_outline,
                        color: AppTheme.statusCancelled, size: 18),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PlaceholderImage extends StatelessWidget {
  final bool isVeg;
  const _PlaceholderImage({required this.isVeg});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 64,
      height: 64,
      color: AppTheme.surface,
      child: Icon(
        isVeg ? Icons.eco : Icons.fastfood,
        color: isVeg ? AppTheme.statusDelivered : AppTheme.primary,
        size: 28,
      ),
    );
  }
}
