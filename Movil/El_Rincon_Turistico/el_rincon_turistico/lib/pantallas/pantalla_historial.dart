import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../proveedores/proveedor_auth.dart';
import '../proveedores/proveedor_reservas.dart';
import '../tema/tema_app.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) {
      context
          .read<ReservationProvider>()
          .loadUserReservations(auth.user!.id, auth.user!.email);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final reservations = context.watch<ReservationProvider>();

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Historial')),
        body: const Center(
          child: Text('Inicia sesión para ver tu historial',
              style: TextStyle(color: AppTheme.textSecondary)),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Historial de Reservas')),
      body: Column(
        children: [
          // Filtros de estado
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: [
                _filterChip('todas', 'Todas', reservations),
                _filterChip('pendiente', 'Pendientes', reservations),
                _filterChip('confirmada', 'Confirmadas', reservations),
                _filterChip('completada', 'Completadas', reservations),
                _filterChip('cancelada', 'Canceladas', reservations),
              ],
            ),
          ),
          // Stats rápidas
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _statBadge('Total', reservations.totalReservations, AppTheme.accent),
                const SizedBox(width: 8),
                _statBadge('Pendientes', reservations.pendingCount, AppTheme.warning),
                const SizedBox(width: 8),
                _statBadge('Completadas', reservations.completedCount, AppTheme.success),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Lista
          Expanded(
            child: RefreshIndicator(
              color: AppTheme.accent,
              onRefresh: () async => _loadData(),
              child: reservations.loading
                  ? const Center(
                      child:
                          CircularProgressIndicator(color: AppTheme.accent))
                  : reservations.userReservations.isEmpty
                      ? ListView(children: [
                          SizedBox(
                            height: MediaQuery.of(context).size.height * 0.4,
                            child: const Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.history,
                                      size: 56,
                                      color: AppTheme.textSecondary),
                                  SizedBox(height: 12),
                                  Text('Sin reservas en esta categoría',
                                      style: TextStyle(
                                          color: AppTheme.textSecondary)),
                                ],
                              ),
                            ),
                          ),
                        ])
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: reservations.userReservations.length,
                          itemBuilder: (_, i) {
                            final r = reservations.userReservations[i];
                            final fmt = NumberFormat("#,###", "es_CO");
                            final statusColor = _statusColor(r.estado);

                            String fecha = 'Sin fecha';
                            if (r.fechaInicio != null) {
                              try {
                                fecha = DateFormat('dd MMM yyyy', 'es_CO')
                                    .format(DateTime.parse(r.fechaInicio!));
                              } catch (_) {
                                fecha = r.fechaInicio!;
                              }
                            }

                            return Card(
                              margin: const EdgeInsets.only(bottom: 10),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(12),
                                leading: CircleAvatar(
                                  backgroundColor:
                                      statusColor.withValues(alpha: 0.2),
                                  child: Icon(
                                    _statusIcon(r.estado),
                                    color: statusColor,
                                    size: 20,
                                  ),
                                ),
                                title: Text(r.destino ?? 'Destino',
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600)),
                                subtitle: Text(
                                    '$fecha  •  ${r.personas} pers.  •  \$${fmt.format(r.precioTotal)}',
                                    style: const TextStyle(
                                        color: AppTheme.textSecondary,
                                        fontSize: 12)),
                                trailing: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: statusColor.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    r.estado[0].toUpperCase() +
                                        r.estado.substring(1),
                                    style: TextStyle(
                                        color: statusColor, fontSize: 11),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(
      String value, String label, ReservationProvider provider) {
    final selected = provider.statusFilter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => provider.setStatusFilter(value),
        selectedColor: AppTheme.accent,
        labelStyle:
            TextStyle(color: selected ? Colors.black : AppTheme.textSecondary),
      ),
    );
  }

  Widget _statBadge(String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text('$count',
                style: TextStyle(
                    color: color, fontSize: 18, fontWeight: FontWeight.bold)),
            Text(label,
                style: const TextStyle(
                    color: AppTheme.textSecondary, fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'confirmada':
        return AppTheme.success;
      case 'cancelada':
        return AppTheme.danger;
      case 'completada':
        return AppTheme.accent;
      default:
        return AppTheme.warning;
    }
  }

  IconData _statusIcon(String s) {
    switch (s) {
      case 'confirmada':
        return Icons.check_circle;
      case 'cancelada':
        return Icons.cancel;
      case 'completada':
        return Icons.emoji_events;
      default:
        return Icons.schedule;
    }
  }
}
