import 'package:cloud_firestore/cloud_firestore.dart';

enum OrderStatus {
  pending,
  confirmed,
  preparing,
  outForDelivery,
  delivered,
  cancelled;

  static OrderStatus fromString(String s) {
    switch (s) {
      case 'pending':        return pending;
      case 'confirmed':      return confirmed;
      case 'preparing':      return preparing;
      case 'out_for_delivery': return outForDelivery;
      case 'delivered':      return delivered;
      case 'cancelled':      return cancelled;
      default:               return pending;
    }
  }

  String toFirestoreString() {
    switch (this) {
      case pending:        return 'pending';
      case confirmed:      return 'confirmed';
      case preparing:      return 'preparing';
      case outForDelivery: return 'out_for_delivery';
      case delivered:      return 'delivered';
      case cancelled:      return 'cancelled';
    }
  }

  String get label {
    switch (this) {
      case pending:        return 'Pending';
      case confirmed:      return 'Confirmed';
      case preparing:      return 'Preparing';
      case outForDelivery: return 'Out for Delivery';
      case delivered:      return 'Delivered';
      case cancelled:      return 'Cancelled';
    }
  }

  /// Returns the next logical status in the order lifecycle.
  OrderStatus? get next {
    switch (this) {
      case pending:        return confirmed;
      case confirmed:      return preparing;
      case preparing:      return outForDelivery;
      case outForDelivery: return delivered;
      case delivered:      return null;
      case cancelled:      return null;
    }
  }
}

class OrderItem {
  final String menuItemId;
  final String name;
  final double price;
  final int quantity;

  const OrderItem({
    required this.menuItemId,
    required this.name,
    required this.price,
    required this.quantity,
  });

  factory OrderItem.fromMap(Map<String, dynamic> m) => OrderItem(
        menuItemId: m['menuItemId'] as String? ?? '',
        name:       m['name']       as String? ?? '',
        price:      (m['price']     as num?)?.toDouble() ?? 0.0,
        quantity:   (m['quantity']  as num?)?.toInt()    ?? 1,
      );
}

class Order {
  final String id;
  final String userId;
  final String userName;
  final String userPhone;
  final String restaurantId;
  final String restaurantName;
  final List<OrderItem> items;
  final double subtotal;
  final double deliveryFee;
  final double total;
  final OrderStatus status;
  final String address;
  final String? couponCode;
  final double? discount;
  final DateTime? createdAt;

  const Order({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userPhone,
    required this.restaurantId,
    required this.restaurantName,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.total,
    required this.status,
    required this.address,
    this.couponCode,
    this.discount,
    this.createdAt,
  });

  factory Order.fromDoc(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    final rawItems = d['items'] as List<dynamic>? ?? [];
    return Order(
      id:             doc.id,
      userId:         d['userId']         as String? ?? d['customerId'] as String? ?? '',
      userName:       d['userName']       as String? ?? 'Unknown',
      userPhone:      d['userPhone']      as String? ?? '',
      restaurantId:   d['restaurantId']   as String? ?? '',
      restaurantName: d['restaurantName'] as String? ?? '',
      items:          rawItems.map((i) => OrderItem.fromMap(Map<String, dynamic>.from(i as Map))).toList(),
      subtotal:       (d['subtotal']      as num?)?.toDouble() ?? 0.0,
      deliveryFee:    (d['deliveryFee']   as num?)?.toDouble() ?? 0.0,
      total:          (d['total']         as num?)?.toDouble() ?? 0.0,
      status:         OrderStatus.fromString(d['status'] as String? ?? 'pending'),
      address:        d['address']        as String? ?? '',
      couponCode:     d['couponCode']     as String?,
      discount:       (d['discount']      as num?)?.toDouble(),
      createdAt:      (d['createdAt'] as Timestamp?)?.toDate(),
    );
  }

  double get itemCount => items.fold(0.0, (s, i) => s + i.quantity);
}
