import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Signs in and validates that the user has the 'admin' role.
  Future<void> signInAsAdmin(String email, String password) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );

    // Force-refresh to get latest custom claims
    final idTokenResult = await credential.user!.getIdTokenResult(true);
    final role = idTokenResult.claims?['role'];

    if (role != 'admin') {
      await _auth.signOut();
      throw Exception('Access denied. This account does not have admin privileges.');
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Verifies the current token still has admin claim. Call on app resume.
  Future<bool> isAdmin() async {
    if (_auth.currentUser == null) return false;
    final result = await _auth.currentUser!.getIdTokenResult(true);
    return result.claims?['role'] == 'admin';
  }

  /// Saves the FCM device token to Firestore under the admin's uid.
  Future<void> saveFcmToken(String token) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;
    await _db.collection('admin_fcm_tokens').doc(uid).set({
      'token': token,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }
}
