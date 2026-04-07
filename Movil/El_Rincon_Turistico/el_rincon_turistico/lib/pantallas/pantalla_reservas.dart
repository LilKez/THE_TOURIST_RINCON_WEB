import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../modelos/modelo_reserva.dart';
import '../proveedores/proveedor_auth.dart';
import '../proveedores/proveedor_reservas.dart';
import '../tema/tema_app.dart';

class ReservationsScreen extends StatefulWidget {
  const ReservationsScreen({super.key});

  @override
  State<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends State<ReservationsScreen> {
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
      return _notLoggedIn();
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Mis Reservas')),
      body: RefreshIndicator(
        color: AppTheme.accent,
        onRefresh: () async {
          await reservations.loadUserReservations(
              auth.user!.id, auth.user!.email);
        },
        child: reservations.loading
            ? const Center(
                child: CircularProgressIndicator(color: AppTheme.accent))
            : reservations.userReservations.isEmpty
                ? _emptyState()
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: reservations.userReservations.length,
                    itemBuilder: (_, i) => _reservationCard(
                        reservations.userReservations[i], reservations),
                  ),
      ),
    );
  }

  Widget _notLoggedIn() {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis Reservas')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lock_outline, size: 64, color: AppTheme.textSecondary),
            const SizedBox(height: 16),
            const Text('Inicia sesión para ver tus reservas',
                style: TextStyle(color: AppTheme.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _emptyState() {
    return ListView(
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.6,
          child: const Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.calendar_today, size: 64, color: AppTheme.textSecondary),
                SizedBox(height: 16),
                Text('No tienes reservas aún',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                SizedBox(height: 8),
                Text('Explora destinos y haz tu primera reserva',
                    style: TextStyle(color: AppTheme.textSecondary)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _reservationCard(
      ReservationModel r, ReservationProvider provider) {
    final formatter = NumberFormat("#,###", "es_CO");
    final estadoColor = _getStatusColor(r.estado);

    String fechaTexto = 'Sin fecha';
    if (r.fechaInicio != null) {
      try {
        fechaTexto = DateFormat('dd MMM yyyy', 'es_CO')
            .format(DateTime.parse(r.fechaInicio!));
      } catch (_) {
        fechaTexto = r.fechaInicio!;
      }
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _showDetail(r),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      r.destino ?? 'Destino',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: estadoColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      r.estado[0].toUpperCase() + r.estado.substring(1),
                      style: TextStyle(
                          color: estadoColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _infoItem(Icons.calendar_today, fechaTexto),
                  const SizedBox(width: 16),
                  _infoItem(Icons.people, '${r.personas} pers.'),
                  const SizedBox(width: 16),
                  _infoItem(Icons.attach_money,
                      '\$${formatter.format(r.precioTotal)}'),
                ],
              ),
              if (r.estado == 'pendiente') ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _cancelReservation(r, provider),
                    icon: const Icon(Icons.cancel_outlined, size: 18),
                    label: const Text('Cancelar reserva'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.danger,
                      side: const BorderSide(color: AppTheme.danger),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoItem(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppTheme.accent),
        const SizedBox(width: 4),
        Text(text,
            style: const TextStyle(
                color: AppTheme.textSecondary, fontSize: 12)),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
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

  void _showDetail(ReservationModel r) {
    final fmt = NumberFormat("#,###", "es_CO");
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.info_outline, color: AppTheme.accent),
            const SizedBox(width: 8),
            const Text('Detalle de Reserva'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _detailRow('Destino', r.destino ?? 'N/A'),
            _detailRow('Fecha', r.fechaInicio ?? 'N/A'),
            _detailRow('Personas', '${r.personas}'),
            _detailRow('Total', '\$${fmt.format(r.precioTotal)}'),
            _detailRow('Estado', r.estado),
            if (r.notas != null) _detailRow('Notas', r.notas!),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text('$label:',
                style: const TextStyle(
                    color: AppTheme.accent, fontWeight: FontWeight.w600)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(color: AppTheme.textPrimary)),
          ),
        ],
      ),
    );
  }

  Future<void> _cancelReservation(
      ReservationModel r, ReservationProvider provider) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Cancelar reserva'),
        content:
            Text('¿Cancelar la reserva para ${r.destino}?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('No')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            child: const Text('Sí, cancelar'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final ok =
          await provider.cancelReservation(r.id!, r.destino ?? 'Destino');
      if (ok && mounted) {
        _loadData();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Reserva cancelada'),
              backgroundColor: AppTheme.success),
        );
      }
    }
  }
}
