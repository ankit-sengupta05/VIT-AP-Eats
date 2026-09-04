import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/material.dart';
import 'auth_service.dart';

import 'package:firebase_core/firebase_core.dart';
import '../firebase_options.dart';

/// Top-level handler for background/terminated FCM messages.
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint('🔔 Background FCM: ${message.notification?.title}');
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _orderChannel =
      AndroidNotificationChannel(
    'new_orders',
    'New Orders',
    description: 'Instant notifications for new customer orders',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  /// Initialize FCM + local notifications. Call once in main().
  Future<void> initialize(AuthService authService) async {
    // Register background handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Request permission (Android 13+)
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    debugPrint('🔔 FCM permission: ${settings.authorizationStatus}');

    // Set up Android local notification channel
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_orderChannel);

    // Initialize local notifications
    const initSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
    );
    await _localNotifications.initialize(initSettings);

    // Save FCM token to Firestore so Next.js API can target this device
    final token = await _messaging.getToken();
    debugPrint('📱 FCM Token: $token');
    if (token != null) await authService.saveFcmToken(token);

    // Refresh token listener
    _messaging.onTokenRefresh.listen((newToken) async {
      debugPrint('🔄 FCM Token refreshed');
      await authService.saveFcmToken(newToken);
    });

    // Foreground message handler
    FirebaseMessaging.onMessage.listen(_showForegroundNotification);

    // App opened via notification tap (background → foreground)
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      debugPrint('📨 Notification tapped: ${message.data}');
      // Navigation can be handled here if needed
    });
  }

  void _showForegroundNotification(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _orderChannel.id,
          _orderChannel.name,
          channelDescription: _orderChannel.description,
          importance: Importance.max,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFFF6B35),
          playSound: true,
          enableVibration: true,
        ),
      ),
      payload: message.data.toString(),
    );
  }

  Future<String?> getToken() => _messaging.getToken();
}
