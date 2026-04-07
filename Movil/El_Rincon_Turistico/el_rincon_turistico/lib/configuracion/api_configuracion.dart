import 'package:flutter/foundation.dart';

class ApiConfig {
  // Puerto 3000 para coincidir con el servidor Node.js
  static const int port = 3000;

  // Detecta automáticamente la IP del servidor según la plataforma
  static String get baseUrl {
    // IMPORTANTE: Primero verificar si es web
    if (kIsWeb) {
      // En web, usar localhost directamente
      return 'http://localhost:$port';
    }

    // Si NO es web, usar defaultTargetPlatform para móvil
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        // En Android emulator, 10.0.2.2 apunta al localhost del host
        return 'http://10.0.2.2:$port';
      case TargetPlatform.iOS:
        // iOS simulator y dispositivos
        return 'http://localhost:$port';
      default:
        // Otros (macOS, Windows, Linux)
        return 'http://localhost:$port';
    }
  }

  // Permite configurar IP manualmente (para dispositivos físicos)
  static String? _customIp;

  static void setCustomIp(String ip) {
    _customIp = ip;
  }

  static String get serverUrl {
    if (_customIp != null) {
      return 'http://$_customIp:$port';
    }
    return baseUrl;
  }

  // Endpoints
  static String get loginUrl => '$serverUrl/login';
  static String get registerUrl => '$serverUrl/registrar';
  static String get destinationsUrl => '$serverUrl/destinos';
  static String get reservationsUrl => '$serverUrl/reservas';
  static String get profilesUrl => '$serverUrl/perfiles';
  static String get chatUrl => '$serverUrl/chat';

  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
}
