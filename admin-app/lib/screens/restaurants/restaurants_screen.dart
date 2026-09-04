import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../theme.dart';
import '../../models/restaurant.dart';
import '../../services/restaurants_service.dart';
import 'restaurant_form.dart';

class RestaurantsScreen extends StatefulWidget {
  const RestaurantsScreen({super.key});

  @override
  State<RestaurantsScreen> createState() => _RestaurantsScreenState();
}

class _RestaurantsScreenState extends State<RestaurantsScreen> {
  final RestaurantsService _service = RestaurantsService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('🏪 Restaurants'),
        backgroundColor: AppTheme.surface,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: AppTheme.primary),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const RestaurantForm()),
            ),
          ),
        ],
      ),
      body: StreamBuilder<List<Restaurant>>(
        stream: _service.watchRestaurants(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(AppTheme.primary),
              ),
            );
          }
          final restaurants = snapshot.data ?? [];
          if (restaurants.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.store_mall_directory_outlined,
                      color: AppTheme.textMuted, size: 56),
                  SizedBox(height: 16),
                  Text('No restaurants yet',
                      style: TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 12),
            itemCount: restaurants.length,
            itemBuilder: (ctx, i) => _RestaurantCard(
              restaurant: restaurants[i],
              onEdit: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      RestaurantForm(existingRestaurant: restaurants[i]),
                ),
              ),
              onToggleOpen: (v) =>
                  _service.toggleOpen(restaurants[i].id, v),
              onDelete: () => _confirmDelete(context, restaurants[i]),
            ),
          );
        },
      ),
    );
  }

  void _confirmDelete(BuildContext context, Restaurant r) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Restaurant'),
        content: Text('Delete "${r.name}"? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _service.deleteRestaurant(r.id);
            },
            child: const Text('Delete',
                style: TextStyle(color: AppTheme.statusCancelled)),
          ),
        ],
      ),
    );
  }
}

class _RestaurantCard extends StatelessWidget {
  final Restaurant restaurant;
  final VoidCallback onEdit;
  final ValueChanged<bool> onToggleOpen;
  final VoidCallback onDelete;

  const _RestaurantCard({
    required this.restaurant,
    required this.onEdit,
    required this.onToggleOpen,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Column(
        children: [
          // Header with image
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Stack(
              children: [
                restaurant.imageUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: restaurant.imageUrl,
                        width: double.infinity,
                        height: 130,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          height: 130,
                          color: AppTheme.surface,
                          child: const Icon(Icons.restaurant,
                              color: AppTheme.textMuted, size: 48),
                        ),
                      )
                    : Container(
                        height: 130,
                        color: AppTheme.surface,
                        child: const Icon(Icons.restaurant,
                            color: AppTheme.textMuted, size: 48),
                      ),
                // Open/Closed badge overlay
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: restaurant.isOpen
                          ? AppTheme.statusDelivered.withOpacity(0.9)
                          : AppTheme.statusCancelled.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      restaurant.isOpen ? '● OPEN' : '● CLOSED',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Info
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            restaurant.name,
                            style: const TextStyle(
                              color: AppTheme.textPrimary,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${restaurant.cuisine}  •  ⭐ ${restaurant.rating.toStringAsFixed(1)}  •  ${restaurant.deliveryTime} min',
                            style: const TextStyle(
                              color: AppTheme.textSecondary, fontSize: 12,
                            ),
                          ),
                          Text(
                            'Delivery: ₹${restaurant.deliveryFee.toStringAsFixed(0)}',
                            style: const TextStyle(
                              color: AppTheme.textMuted, fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: restaurant.isOpen,
                      onChanged: onToggleOpen,
                      activeColor: AppTheme.statusDelivered,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onEdit,
                        icon: const Icon(Icons.edit_outlined, size: 16),
                        label: const Text('Edit'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton.icon(
                      onPressed: onDelete,
                      icon: const Icon(Icons.delete_outline, size: 16),
                      label: const Text('Delete'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.statusCancelled,
                        side: const BorderSide(color: AppTheme.statusCancelled),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
