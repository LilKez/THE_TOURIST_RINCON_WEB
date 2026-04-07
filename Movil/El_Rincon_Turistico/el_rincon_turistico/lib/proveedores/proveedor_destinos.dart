import 'package:flutter/material.dart';
import '../modelos/modelo_destino.dart';
import '../servicios/servicio_api.dart';

class DestinationProvider extends ChangeNotifier {
  List<DestinationModel> _destinations = [];
  List<DestinationModel> _filtered = [];
  bool _loading = false;
  String? _error;
  String _searchQuery = '';

  List<DestinationModel> get destinations =>
      _searchQuery.isEmpty ? _destinations : _filtered;
  bool get loading => _loading;
  String? get error => _error;
  String get searchQuery => _searchQuery;

  Future<void> loadDestinations() async {
    _loading = true;
    _error = null;
    notifyListeners();

    final result = await ApiService.getDestinations();

    if (result.success && result.data != null) {
      _destinations = result.data!
          .map((json) =>
              DestinationModel.fromJson(json as Map<String, dynamic>))
          .toList();
      _applyFilter();
    } else {
      _error = result.error;
    }

    _loading = false;
    notifyListeners();
  }

  void search(String query) {
    _searchQuery = query.toLowerCase();
    _applyFilter();
    notifyListeners();
  }

  void _applyFilter() {
    if (_searchQuery.isEmpty) {
      _filtered = _destinations;
    } else {
      _filtered = _destinations.where((d) {
        return (d.nombre.toLowerCase().contains(_searchQuery)) ||
            (d.categoria?.toLowerCase().contains(_searchQuery) ?? false) ||
            (d.pais?.toLowerCase().contains(_searchQuery) ?? false);
      }).toList();
    }
  }

  List<String> get categorias {
    final cats = _destinations
        .map((d) => d.categoria)
        .where((c) => c != null && c.isNotEmpty)
        .cast<String>()
        .toSet()
        .toList();
    cats.sort();
    return cats;
  }

  void filterByCategory(String? category) {
    if (category == null || category.isEmpty) {
      _searchQuery = '';
    } else {
      _searchQuery = category.toLowerCase();
    }
    _applyFilter();
    notifyListeners();
  }

  DestinationModel? getById(String id) {
    try {
      return _destinations.firstWhere((d) => d.id == id);
    } catch (_) {
      return null;
    }
  }

  // Admin CRUD
  Future<bool> createDestination(Map<String, dynamic> data) async {
    final result = await ApiService.createDestination(data);
    if (result.success) await loadDestinations();
    return result.success;
  }

  Future<bool> updateDestination(String id, Map<String, dynamic> data) async {
    final result = await ApiService.updateDestination(id, data);
    if (result.success) await loadDestinations();
    return result.success;
  }

  Future<bool> deleteDestination(String id) async {
    final result = await ApiService.deleteDestination(id);
    if (result.success) await loadDestinations();
    return result.success;
  }
}
