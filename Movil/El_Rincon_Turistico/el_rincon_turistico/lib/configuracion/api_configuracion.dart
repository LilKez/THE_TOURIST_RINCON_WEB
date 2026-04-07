import 'dart:io';

class ApiConfig {
  // Puerto 3001 para la app móvil
  static const int port = 3001;

  // Detecta automáticamente la IP del servidor según la plataforma
  static String get baseUrl {
    // En Android emulator, 10.0.2.2 apunta al localhost del host
    // En iOS simulator y dispositivos reales, usar la IP de la máquina
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:$port';
    }
    return 'http://localhost:$port';
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
