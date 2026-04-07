import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../proveedores/proveedor_auth.dart';
import '../../proveedores/proveedor_destinos.dart';
import '../../proveedores/proveedor_reservas.dart';
import '../../modelos/modelo_destino.dart';
import '../../modelos/modelo_reserva.dart';
import '../../tema/tema_app.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _loadData();
  }

  void _loadData() {
    context.read<DestinationProvider>().loadDestinations();
    context.read<ReservationProvider>().loadReservations();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel Admin'),
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: AppTheme.accent,
          labelColor: AppTheme.accent,
          unselectedLabelColor: AppTheme.textSecondary,
          tabs: const [
            Tab(icon: Icon(Icons.place), text: 'Destinos'),
            Tab(icon: Icon(Icons.book), text: 'Reservas'),
            Tab(icon: Icon(Icons.people), text: 'Usuarios'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _DestinosTab(onRefresh: _loadData),
          _ReservasTab(onRefresh: _loadData),
          const _UsuariosTab(),
        ],
      ),
    );
  }
}

// =================== DESTINOS TAB ===================

class _DestinosTab extends StatelessWidget {
  final VoidCallback onRefresh;
  const _DestinosTab({required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return Consumer<DestinationProvider>(
      builder: (_, prov, __) {
        if (prov.loading) {
          return const Center(child: CircularProgressIndicator());
        }
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Text('${prov.destinations.length} destinos',
                      style: const TextStyle(color: AppTheme.textSecondary)),
                  const Spacer(),
                  ElevatedButton.icon(
                    onPressed: () => _showDestinoForm(context),
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Agregar'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async => onRefresh(),
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: prov.destinations.length,
                  itemBuilder: (_, i) {
                    final d = prov.destinations[i];
                    return _destinoCard(context, d);
                  },
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _destinoCard(BuildContext context, DestinationModel d) {
    return Card(
      color: AppTheme.card,
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: d.primeraImagen.isNotEmpty
              ? Image.network(d.primeraImagen, width: 50, height: 50,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _placeholderImg())
              : _placeholderImg(),
        ),
        title: Text(d.nombre,
            style: const TextStyle(
                color: AppTheme.textPrimary, fontWeight: FontWeight.w600)),
        subtitle: Text(d.pais ?? d.categoria ?? '',
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.edit, color: AppTheme.accent, size: 20),
              onPressed: () => _showDestinoForm(context, destino: d),
            ),
            IconButton(
              icon: const Icon(Icons.delete, color: Colors.redAccent, size: 20),
              onPressed: () => _confirmDelete(context, d),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholderImg() {
    return Container(
      width: 50, height: 50,
      color: AppTheme.surface,
      child: const Icon(Icons.image, color: AppTheme.textSecondary),
    );
  }

  void _confirmDelete(BuildContext context, DestinationModel d) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.card,
        title: const Text('Eliminar destino',
            style: TextStyle(color: AppTheme.textPrimary)),
        content: Text('¿Eliminar "${d.nombre}"?',
            style: const TextStyle(color: AppTheme.textSecondary)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await context.read<DestinationProvider>().deleteDestination(d.id);
              onRefresh();
            },
            child: const Text('Eliminar',
                style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }

  void _showDestinoForm(BuildContext ctx, {DestinationModel? destino}) {
    final nombreCtrl = TextEditingController(text: destino?.nombre ?? '');
    final descCtrl = TextEditingController(text: destino?.descripcion ?? '');
    final ubiCtrl = TextEditingController(text: destino?.pais ?? '');
    final catCtrl = TextEditingController(text: destino?.categoria ?? '');
    final climaCtrl = TextEditingController(text: destino?.clima ?? '');
    final imgCtrl = TextEditingController(text: destino?.primeraImagen ?? '');
    final calCtrl = TextEditingController(
        text: destino?.rating?.toString() ?? '');

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: AppTheme.card,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: EdgeInsets.fromLTRB(
            20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.textSecondary,
                    borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              Text(destino == null ? 'Nuevo Destino' : 'Editar Destino',
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary)),
              const SizedBox(height: 16),
              _formField(nombreCtrl, 'Nombre', Icons.place),
              _formField(descCtrl, 'Descripción', Icons.description, maxLines: 3),
              _formField(ubiCtrl, 'Ubicación', Icons.location_on),
              _formField(catCtrl, 'Categoría', Icons.category),
              _formField(climaCtrl, 'Clima', Icons.wb_sunny),
              _formField(imgCtrl, 'URL de imagen', Icons.image),
              _formField(calCtrl, 'Calificación (1-5)', Icons.star,
                  keyboard: TextInputType.number),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final data = {
                      'nombre': nombreCtrl.text,
                      'descripcion': descCtrl.text,
                      'pais': ubiCtrl.text,
                      'categoria': catCtrl.text,
                      'clima': climaCtrl.text,
                      'imagen_url': imgCtrl.text,
                      'rating': double.tryParse(calCtrl.text),
                    };
                    final prov = ctx.read<DestinationProvider>();
                    if (destino == null) {
                      await prov.createDestination(data);
                    } else {
                      await prov.updateDestination(destino.id, data);
                    }
                    if (ctx.mounted) Navigator.pop(ctx);
                    onRefresh();
                  },
                  child: Text(destino == null ? 'Crear' : 'Guardar'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _formField(TextEditingController ctrl, String label, IconData icon,
      {int maxLines = 1, TextInputType keyboard = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: ctrl,
        maxLines: maxLines,
        keyboardType: keyboard,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
        ),
      ),
    );
  }
}

// =================== RESERVAS TAB ===================

class _ReservasTab extends StatelessWidget {
  final VoidCallback onRefresh;
  const _ReservasTab({required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return Consumer<ReservationProvider>(
      builder: (_, prov, __) {
        if (prov.loading) {
          return const Center(child: CircularProgressIndicator());
        }
        final all = prov.allReservations;
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Text('${all.length} reservas',
                      style: const TextStyle(color: AppTheme.textSecondary)),
                  const Spacer(),
                  IconButton(
                    onPressed: onRefresh,
                    icon: const Icon(Icons.refresh, color: AppTheme.accent),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: all.length,
                itemBuilder: (_, i) => _reservaCard(context, all[i]),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _reservaCard(BuildContext context, ReservationModel r) {
    final estado = (r.estado).toLowerCase();
    final color = switch (estado) {
      'confirmada' => Colors.greenAccent,
      'completada' => Colors.blueAccent,
      'cancelada' => Colors.redAccent,
      _ => Colors.orangeAccent,
    };

    return Card(
      color: AppTheme.card,
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.2),
          child: Icon(_estadoIcon(estado), color: color, size: 20),
        ),
        title: Text(r.nombreCliente ?? 'N/A',
            style: const TextStyle(
                color: AppTheme.textPrimary, fontWeight: FontWeight.w600)),
        subtitle: Text(
          'Destino #${r.destinoId} · ${r.fechaInicio ?? ''}',
          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
        ),
        trailing: PopupMenuButton<String>(
          color: AppTheme.card,
          onSelected: (val) => _updateEstado(context, r.id, val),
          itemBuilder: (_) => [
            const PopupMenuItem(value: 'pendiente', child: Text('Pendiente')),
            const PopupMenuItem(value: 'confirmada', child: Text('Confirmada')),
            const PopupMenuItem(value: 'completada', child: Text('Completada')),
            const PopupMenuItem(value: 'cancelada', child: Text('Cancelada')),
          ],
          child: Chip(
            label: Text(estado, style: TextStyle(color: color, fontSize: 11)),
            backgroundColor: color.withValues(alpha: 0.15),
            side: BorderSide.none,
          ),
        ),
      ),
    );
  }

  IconData _estadoIcon(String e) => switch (e) {
        'confirmada' => Icons.check_circle,
        'completada' => Icons.done_all,
        'cancelada' => Icons.cancel,
        _ => Icons.schedule,
      };

  void _updateEstado(BuildContext ctx, String? id, String estado) async {
    if (id == null) return;
    await ctx.read<ReservationProvider>().updateReservationStatus(id, estado);
    onRefresh();
  }
}

// =================== USUARIOS TAB ===================

class _UsuariosTab extends StatefulWidget {
  const _UsuariosTab();

  @override
  State<_UsuariosTab> createState() => _UsuariosTabState();
}

class _UsuariosTabState extends State<_UsuariosTab> {
  List<dynamic> _users = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _loading = true);
    final result = await Provider.of<AuthProvider>(context, listen: false)
        .loadAllUsers();
    setState(() {
      _users = result;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Text('${_users.length} usuarios',
                  style: const TextStyle(color: AppTheme.textSecondary)),
              const Spacer(),
              IconButton(
                  onPressed: _loadUsers,
                  icon: const Icon(Icons.refresh, color: AppTheme.accent)),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: _users.length,
            itemBuilder: (_, i) {
              final u = _users[i];
              final rol = (u['rol'] ?? 'cliente').toString();
              return Card(
                color: AppTheme.card,
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: rol == 'admin'
                        ? AppTheme.accent.withValues(alpha: 0.2)
                        : AppTheme.surface,
                    child: Icon(
                      rol == 'admin' ? Icons.admin_panel_settings : Icons.person,
                      color: rol == 'admin'
                          ? AppTheme.accent
                          : AppTheme.textSecondary,
                      size: 20,
                    ),
                  ),
                  title: Text(
                    '${u['nombre'] ?? ''} ${u['apellido'] ?? ''}'.trim(),
                    style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(u['email'] ?? '',
                      style: const TextStyle(
                          color: AppTheme.textSecondary, fontSize: 12)),
                  trailing: Chip(
                    label: Text(rol,
                        style: TextStyle(
                            color: rol == 'admin'
                                ? AppTheme.accent
                                : AppTheme.textSecondary,
                            fontSize: 11)),
                    backgroundColor: rol == 'admin'
                        ? AppTheme.accent.withValues(alpha: 0.15)
                        : AppTheme.surface,
                    side: BorderSide.none,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
