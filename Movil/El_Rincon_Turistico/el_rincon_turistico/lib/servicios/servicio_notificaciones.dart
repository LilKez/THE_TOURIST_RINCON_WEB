import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    await _plugin.initialize(settings);
  }

  static Future<void> showNotification({
    required String title,
    required String body,
    int id = 0,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'tourist_rincon_channel',
      'The Tourist Rincón',
      channelDescription: 'Notificaciones de reservas y destinos',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    const iosDetails = DarwinNotificationDetails();
    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    await _plugin.show(id, title, body, details);
  }

  static Future<void> showReservationConfirmed(String destino) async {
    await showNotification(
      id: 1,
      title: '✅ Reserva Confirmada',
      body: 'Tu reserva para $destino ha sido registrada exitosamente.',
    );
  }

  static Future<void> showReservationCancelled(String destino) async {
    await showNotification(
      id: 2,
      title: '❌ Reserva Cancelada',
      body: 'Tu reserva para $destino ha sido cancelada.',
    );
  }

  static Future<void> showWelcome(String nombre) async {
    await showNotification(
      id: 3,
      title: '👋 ¡Bienvenido, $nombre!',
      body: 'Explora los mejores destinos turísticos de Colombia.',
    );
  }
}
