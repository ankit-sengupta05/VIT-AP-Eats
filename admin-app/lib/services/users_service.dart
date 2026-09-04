import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/app_user.dart';

class UsersService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  /// All users (admin read).
  Future<List<AppUser>> getAllUsers() async {
    final snap = await _db.collection('users').orderBy('name').get();
    return snap.docs.map(AppUser.fromDoc).toList();
  }

  /// Real-time stream.
  Stream<List<AppUser>> watchUsers() {
    return _db
        .collection('users')
        .snapshots()
        .map((snap) => snap.docs.map(AppUser.fromDoc).toList());
  }
}
