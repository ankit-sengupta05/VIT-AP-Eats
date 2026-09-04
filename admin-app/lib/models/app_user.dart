import 'package:cloud_firestore/cloud_firestore.dart';

class AppUser {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role; // 'customer' | 'partner' | 'admin'
  final DateTime? createdAt;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.createdAt,
  });

  factory AppUser.fromDoc(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return AppUser(
      id:        doc.id,
      name:      d['name']     as String? ?? d['displayName'] as String? ?? 'Unknown',
      email:     d['email']    as String? ?? '',
      phone:     d['phone']    as String? ?? d['phoneNumber'] as String? ?? '',
      role:      d['role']     as String? ?? 'customer',
      createdAt: (d['createdAt'] as Timestamp?)?.toDate(),
    );
  }
}
