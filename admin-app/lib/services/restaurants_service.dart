import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/restaurant.dart';

class RestaurantsService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  /// Fetch all restaurants ordered by name.
  Future<List<Restaurant>> getAllRestaurants() async {
    final snap = await _db.collection('restaurants').orderBy('name').get();
    return snap.docs.map(Restaurant.fromDoc).toList();
  }

  /// Real-time stream of all restaurants.
  Stream<List<Restaurant>> watchRestaurants() {
    return _db
        .collection('restaurants')
        .orderBy('name')
        .snapshots()
        .map((snap) => snap.docs.map(Restaurant.fromDoc).toList());
  }

  /// Add a new restaurant.
  Future<String> addRestaurant(Map<String, dynamic> data) async {
    final ref = await _db.collection('restaurants').add({
      ...data,
      'createdAt': FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  /// Update restaurant fields.
  Future<void> updateRestaurant(String id, Map<String, dynamic> data) async {
    await _db.collection('restaurants').doc(id).update({
      ...data,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Toggle open/closed.
  Future<void> toggleOpen(String id, bool isOpen) async {
    await _db.collection('restaurants').doc(id).update({'isOpen': isOpen});
  }

  /// Delete a restaurant.
  Future<void> deleteRestaurant(String id) async {
    await _db.collection('restaurants').doc(id).delete();
  }
}
