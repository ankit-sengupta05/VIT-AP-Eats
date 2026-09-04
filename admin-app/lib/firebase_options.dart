// GENERATED FILE — do not edit manually.
// After registering your Android app in the Firebase Console and
// downloading google-services.json, run:
//   flutterfire configure
// to regenerate this file with your actual values.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for iOS. '
          'You can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  /// Web options (same project, already deployed on Vercel).
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBFo-n_c8mja7xxwy9ruKsUoYKTbEJWkyg',
    appId: '1:651682895108:web:1389afe80e5fe05fe06c51',
    messagingSenderId: '651682895108',
    projectId: 'vitap-eats',
    authDomain: 'vitap-eats.firebaseapp.com',
    storageBucket: 'vitap-eats.firebasestorage.app',
  );

  /// Android options — REPLACE the appId below with the one from
  /// Firebase Console → Project Settings → Your Apps → Android app.
  /// Then place google-services.json in android/app/
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBbxNOZJs0xC_XmPRj7Gbrn1qH1U_QTq1o',
    appId: '1:651682895108:android:b4bd66324d89f576e06c51',
    messagingSenderId: '651682895108',
    projectId: 'vitap-eats',
    storageBucket: 'vitap-eats.firebasestorage.app',
  );
}
