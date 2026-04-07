import 'dart:convert';
import 'package:http/http.dart' as http;
import '../configuracion/api_configuracion.dart';

class ApiResult<T> {
  final T? data;
  final String? error;
  final bool success;

  ApiResult.ok(this.data)
      : error = null,
        success = true;

  ApiResult.fail(this.error)
      : data = null,
        success = false;
}

class ApiService {
  static final Map<String, String> _jsonHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  /// Verifica si el servidor está disponible en el puerto 3001
  static Future<bool> checkServerHealth() async {
    try {
      final response = await http
          .get(Uri.parse('${ApiConfig.serverUrl}/destinos'))
          .timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ========================
  // AUTH
  // ========================

  static Future<ApiResult<Map<String, dynamic>>> login(
      String email, String password) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.loginUrl),
            headers: _jsonHeaders,
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['token'] != null) {
        return ApiResult.ok(data as Map<String, dynamic>);
      }
      return ApiResult.fail(data['error'] ?? 'Credenciales inválidas');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<String>> register({
    required String nombre,
    required String apellido,
    required String email,
    required String password,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.registerUrl),
            headers: _jsonHeaders,
            body: jsonEncode({
              'nombre': nombre,
              'apellido': apellido,
              'email': email,
              'password': password,
            }),
          )
          .timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return ApiResult.ok(data['message'] ?? 'Registrado correctamente');
      }
      return ApiResult.fail(data['error'] ?? 'Error en el registro');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  // ========================
  // DESTINOS
  // ========================

  static Future<ApiResult<List<dynamic>>> getDestinations() async {
    try {
      final response = await http
          .get(Uri.parse(ApiConfig.destinationsUrl))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List;
        return ApiResult.ok(data);
      }
      return ApiResult.fail('Error al cargar destinos');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<dynamic>> createDestination(
      Map<String, dynamic> dest) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.destinationsUrl),
            headers: _jsonHeaders,
            body: jsonEncode(dest),
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok(jsonDecode(response.body));
      }
      return ApiResult.fail('Error al crear destino');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<dynamic>> updateDestination(
      String id, Map<String, dynamic> dest) async {
    try {
      final response = await http
          .put(
            Uri.parse('${ApiConfig.destinationsUrl}/$id'),
            headers: _jsonHeaders,
            body: jsonEncode(dest),
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok(jsonDecode(response.body));
      }
      return ApiResult.fail('Error al actualizar destino');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<void>> deleteDestination(String id) async {
    try {
      final response = await http
          .delete(Uri.parse('${ApiConfig.destinationsUrl}/$id'))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok(null);
      }
      return ApiResult.fail('Error al eliminar destino');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  // ========================
  // RESERVAS
  // ========================

  static Future<ApiResult<List<dynamic>>> getReservations() async {
    try {
      final response = await http
          .get(Uri.parse(ApiConfig.reservationsUrl))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List;
        return ApiResult.ok(data);
      }
      return ApiResult.fail('Error al cargar reservas');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<dynamic>> createReservation(
      Map<String, dynamic> res) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.reservationsUrl),
            headers: _jsonHeaders,
            body: jsonEncode(res),
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok(jsonDecode(response.body));
      }
      return ApiResult.fail('Error al crear reserva');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<dynamic>> updateReservation(
      String id, Map<String, dynamic> res) async {
    try {
      final response = await http
          .put(
            Uri.parse('${ApiConfig.reservationsUrl}/$id'),
            headers: _jsonHeaders,
            body: jsonEncode(res),
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok(jsonDecode(response.body));
      }
      return ApiResult.fail('Error al actualizar reserva');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<void>> deleteReservation(String id) async {
    try {
      final response = await http
          .delete(Uri.parse('${ApiConfig.reservationsUrl}/$id'))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok(null);
      }
      return ApiResult.fail('Error al eliminar reserva');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  // ========================
  // PERFILES
  // ========================

  static Future<ApiResult<List<dynamic>>> getProfiles() async {
    try {
      final response = await http
          .get(Uri.parse(ApiConfig.profilesUrl))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List;
        return ApiResult.ok(data);
      }
      return ApiResult.fail('Error al cargar perfiles');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<String>> updateProfile(
      String id, String nombre, String apellido) async {
    try {
      final response = await http
          .put(
            Uri.parse('${ApiConfig.profilesUrl}/$id'),
            headers: _jsonHeaders,
            body: jsonEncode({'nombre': nombre, 'apellido': apellido}),
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok('Perfil actualizado');
      }
      return ApiResult.fail('Error al actualizar perfil');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<String>> changePassword(
      String id, String password) async {
    try {
      final response = await http
          .put(
            Uri.parse('${ApiConfig.profilesUrl}/$id/password'),
            headers: _jsonHeaders,
            body: jsonEncode({'password': password}),
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok('Contraseña actualizada');
      }
      final data = jsonDecode(response.body);
      return ApiResult.fail(data['error'] ?? 'Error al cambiar contraseña');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  static Future<ApiResult<void>> deleteProfile(String id) async {
    try {
      final response = await http
          .delete(
            Uri.parse('${ApiConfig.profilesUrl}/$id'),
            headers: _jsonHeaders,
          )
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        return ApiResult.ok(null);
      }
      final data = jsonDecode(response.body);
      return ApiResult.fail(data['error'] ?? 'Error al eliminar usuario');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }

  // ========================
  // CHAT IA
  // ========================

  static Future<ApiResult<String>> sendChatMessage(String mensaje) async {
    try {
      final response = await http
          .post(
            Uri.parse(ApiConfig.chatUrl),
            headers: _jsonHeaders,
            body: jsonEncode({'mensaje': mensaje}),
          )
          .timeout(const Duration(seconds: 30));

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return ApiResult.ok(data['respuesta'] ?? 'Sin respuesta');
      }
      return ApiResult.fail(data['respuesta'] ?? 'Error de IA');
    } catch (e) {
      return ApiResult.fail('Error de conexión: $e');
    }
  }
}
