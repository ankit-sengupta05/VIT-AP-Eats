import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/menu_item.dart';

class MenuService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  /// All menu items for a restaurant (real-time).
  Stream<List<MenuItem>> watchMenuByRestaurant(String restaurantId) {
    return _db
        .collection('menu_items')
        .where('restaurantId', isEqualTo: restaurantId)
        .snapshots()
        .map((snap) => snap.docs.map(MenuItem.fromDoc).toList());
  }

  /// All menu items (admin view).
  Future<List<MenuItem>> getAllMenuItems() async {
    final snap = await _db.collection('menu_items').get();
    return snap.docs.map(MenuItem.fromDoc).toList();
  }

  /// Real-time stream of all menu items.
  Stream<List<MenuItem>> watchAllMenuItems() {
    return _db
        .collection('menu_items')
        .snapshots()
        .map((snap) => snap.docs.map(MenuItem.fromDoc).toList());
  }

  /// Add a new menu item.
  Future<String> addMenuItem(Map<String, dynamic> data) async {
    final ref = await _db.collection('menu_items').add({
      ...data,
      'createdAt': FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  /// Update a menu item.
  Future<void> updateMenuItem(String id, Map<String, dynamic> data) async {
    await _db.collection('menu_items').doc(id).update({
      ...data,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Toggle availability.
  Future<void> toggleAvailability(String id, bool isAvailable) async {
    await _db.collection('menu_items').doc(id).update({
      'isAvailable': isAvailable,
    });
  }

  /// Delete a menu item.
  Future<void> deleteMenuItem(String id) async {
    await _db.collection('menu_items').doc(id).delete();
  }
}
