import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/order.dart' as admin_order;

class OrdersService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  /// Real-time stream of ALL orders, sorted newest first.
  Stream<List<admin_order.Order>> watchAllOrders() {
    return _db
        .collection('orders')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map(admin_order.Order.fromDoc).toList());
  }

  /// Real-time stream filtered by status.
  Stream<List<admin_order.Order>> watchOrdersByStatus(admin_order.OrderStatus status) {
    return _db
        .collection('orders')
        .where('status', isEqualTo: status.toFirestoreString())
        .snapshots()
        .map((snap) {
          final orders = snap.docs.map(admin_order.Order.fromDoc).toList();
          orders.sort((a, b) {
            final aTime = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
            final bTime = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
            return bTime.compareTo(aTime);
          });
          return orders;
        });
  }

  /// Real-time stream for a single order.
  Stream<admin_order.Order?> watchOrder(String orderId) {
    return _db
        .collection('orders')
        .doc(orderId)
        .snapshots()
        .map((snap) => snap.exists ? admin_order.Order.fromDoc(snap) : null);
  }

  /// Update order status.
  Future<void> updateStatus(String orderId, admin_order.OrderStatus status) async {
    await _db.collection('orders').doc(orderId).update({
      'status': status.toFirestoreString(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Add admin note to an order.
  Future<void> addAdminNote(String orderId, String note) async {
    await _db.collection('orders').doc(orderId).update({
      'adminNote': note,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Delete an order (admin only).
  Future<void> deleteOrder(String orderId) async {
    await _db.collection('orders').doc(orderId).delete();
  }

  /// Get summary stats (total revenue, order counts per status) for insights.
  Future<Map<String, dynamic>> getStats() async {
    final snap = await _db.collection('orders').get();
    final orders = snap.docs.map(admin_order.Order.fromDoc).toList();

    double totalRevenue = 0;
    int pending = 0, delivered = 0, cancelled = 0, active = 0;
    final Map<String, double> revenueByDay = {};

    for (final o in orders) {
      if (o.status != admin_order.OrderStatus.cancelled) {
        totalRevenue += o.total;
      }
      switch (o.status) {
        case admin_order.OrderStatus.pending:    pending++;    break;
        case admin_order.OrderStatus.delivered:  delivered++;  break;
        case admin_order.OrderStatus.cancelled:  cancelled++;  break;
        default:                                 active++;     break;
      }
      if (o.createdAt != null && o.status != admin_order.OrderStatus.cancelled) {
        final day = '${o.createdAt!.month}/${o.createdAt!.day}';
        revenueByDay[day] = (revenueByDay[day] ?? 0) + o.total;
      }
    }

    // Top dishes
    final Map<String, int> dishCount = {};
    for (final o in orders) {
      for (final item in o.items) {
        dishCount[item.name] = ((dishCount[item.name] ?? 0) + item.quantity).toInt();
      }
    }
    final topDishes = dishCount.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return {
      'totalOrders':   orders.length,
      'totalRevenue':  totalRevenue,
      'pending':       pending,
      'delivered':     delivered,
      'cancelled':     cancelled,
      'active':        active,
      'revenueByDay':  revenueByDay,
      'topDishes':     topDishes.take(5).toList(),
    };
  }
}
