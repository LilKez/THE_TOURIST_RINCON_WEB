import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../modelos/modelo_usuario.dart';
import '../servicios/servicio_api.dart';
import '../servicios/servicio_notificaciones.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _loading = false;
  String? _error;
  bool _serverOnline = false;

  UserModel? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get isAdmin => _user?.esAdmin ?? false;
  bool get serverOnline => _serverOnline;

  /// Restaura sesión desde SharedPreferences
  Future<void> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final nombre = prefs.getString('nombre');
    final email = prefs.getString('email');
    final rol = prefs.getString('rol');
    final userId = prefs.getString('userId');

    if (token != null && nombre != null && email != null) {
      _user = UserModel(
        id: userId,
        nombre: nombre,
        email: email,
        rol: rol ?? 'cliente',
        token: token,
      );
    }
    notifyListeners();
  }

  /// Valida conexión al servidor en puerto 3001
  Future<bool> checkServer() async {
    _serverOnline = await ApiService.checkServerHealth();
    notifyListeners();
    return _serverOnline;
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    final result = await ApiService.login(email, password);

    if (result.success && result.data != null) {
      final data = result.data!;
      _user = UserModel(
        id: data['id']?.toString(),
        nombre: data['nombre'] ?? '',
        email: email,
        rol: data['rol'] ?? 'cliente',
        token: data['token'],
      );

      // Guardar en SharedPreferences (equivalente a localStorage web)
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('nombre', data['nombre'] ?? '');
      await prefs.setString('email', email);
      await prefs.setString('rol', data['rol'] ?? 'cliente');
      if (data['id'] != null) {
        await prefs.setString('userId', data['id'].toString());
      }

      _loading = false;
      _error = null;
      notifyListeners();

      // Notificación móvil de bienvenida
      await NotificationService.showWelcome(_user!.nombre);
      return true;
    }

    _loading = false;
    _error = result.error;
    notifyListeners();
    return false;
  }

  Future<bool> register({
    required String nombre,
    required String apellido,
    required String email,
    required String password,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    final result = await ApiService.register(
      nombre: nombre,
      apellido: apellido,
      email: email,
      password: password,
    );

    _loading = false;
    if (!result.success) {
      _error = result.error;
    }
    notifyListeners();
    return result.success;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('nombre');
    await prefs.remove('email');
    await prefs.remove('rol');
    await prefs.remove('userId');

    _user = null;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<List<dynamic>> loadAllUsers() async {
    final result = await ApiService.getProfiles();
    if (result.success && result.data != null) {
      return result.data!;
    }
    return [];
  }
}
