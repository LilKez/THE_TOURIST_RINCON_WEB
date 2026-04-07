import 'package:flutter/material.dart';
import '../modelos/modelo_reserva.dart';
import '../servicios/servicio_api.dart';
import '../servicios/servicio_notificaciones.dart';

class ReservationProvider extends ChangeNotifier {
  List<ReservationModel> _allReservations = [];
  List<ReservationModel> _userReservations = [];
  bool _loading = false;
  String? _error;
  String _statusFilter = 'todas';

  List<ReservationModel> get allReservations => _allReservations;
  List<ReservationModel> get userReservations {
    if (_statusFilter == 'todas') return _userReservations;
    return _userReservations.where((r) => r.estado == _statusFilter).toList();
  }

  bool get loading => _loading;
  String? get error => _error;
  String get statusFilter => _statusFilter;

  // Stats
  int get totalReservations => _userReservations.length;
  int get pendingCount =>
      _userReservations.where((r) => r.estado == 'pendiente').length;
  int get completedCount =>
      _userReservations.where((r) => r.estado == 'completada').length;
  int get confirmedCount =>
      _userReservations.where((r) => r.estado == 'confirmada').length;

  void setStatusFilter(String filter) {
    _statusFilter = filter;
    notifyListeners();
  }

  Future<void> loadAllReservations() async {
    _loading = true;
    _error = null;
    notifyListeners();

    final result = await ApiService.getReservations();

    if (result.success && result.data != null) {
      _allReservations = result.data!
          .map((json) =>
              ReservationModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } else {
      _error = result.error;
    }

    _loading = false;
    notifyListeners();
  }

  Future<void> loadUserReservations(String? userId, String? email) async {
    _loading = true;
    _error = null;
    notifyListeners();

    final result = await ApiService.getReservations();

    if (result.success && result.data != null) {
      final all = result.data!
          .map((json) =>
              ReservationModel.fromJson(json as Map<String, dynamic>))
          .toList();

      _allReservations = all;

      // Filtrar por usuario (misma lógica que el frontend web)
      _userReservations = all.where((r) {
        return r.usuarioId == userId ||
            r.email == email;
      }).toList();

      // Ordenar por fecha más reciente
      _userReservations.sort((a, b) {
        final fa = a.fechaInicio ?? '';
        final fb = b.fechaInicio ?? '';
        return fb.compareTo(fa);
      });
    } else {
      _error = result.error;
    }

    _loading = false;
    notifyListeners();
  }

  Future<bool> createReservation(dynamic reservationData) async {
    final Map<String, dynamic> data;
    if (reservationData is ReservationModel) {
      data = reservationData.toJson();
    } else {
      data = reservationData as Map<String, dynamic>;
    }
    final result = await ApiService.createReservation(data);
    if (result.success) {
      final destino = data['destino'] ?? data['nombre'] ?? 'Destino';
      await NotificationService.showReservationConfirmed(destino.toString());
    }
    return result.success;
  }

  Future<bool> updateReservation(int id, Map<String, dynamic> data) async {
    final result = await ApiService.updateReservation(id.toString(), data);
    return result.success;
  }

  Future<void> loadReservations() async {
    await loadAllReservations();
  }

  Future<bool> updateReservationStatus(String id, String newStatus) async {
    final reservation = _allReservations.firstWhere(
      (r) => r.id == id,
      orElse: () => _userReservations.firstWhere((r) => r.id == id),
    );
    final updated = reservation.copyWith(estado: newStatus);
    final result = await ApiService.updateReservation(id, updated.toJson());
    return result.success;
  }

  Future<bool> cancelReservation(String id, String destino) async {
    final success = await updateReservationStatus(id, 'cancelada');
    if (success) {
      await NotificationService.showReservationCancelled(destino);
    }
    return success;
  }

  Future<bool> deleteReservation(String id) async {
    final result = await ApiService.deleteReservation(id);
    if (result.success) {
      _allReservations.removeWhere((r) => r.id == id);
      _userReservations.removeWhere((r) => r.id == id);
      notifyListeners();
    }
    return result.success;
  }
}
