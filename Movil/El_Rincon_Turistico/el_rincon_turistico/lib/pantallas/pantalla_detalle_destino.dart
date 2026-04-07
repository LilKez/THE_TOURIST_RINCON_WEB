import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import '../modelos/modelo_destino.dart';
import '../modelos/modelo_reserva.dart';
import '../proveedores/proveedor_auth.dart';
import '../proveedores/proveedor_reservas.dart';
import '../tema/tema_app.dart';
import 'pantalla_pago.dart';

class DestinationDetailScreen extends StatefulWidget {
  final DestinationModel destination;

  const DestinationDetailScreen({super.key, required this.destination});

  @override
  State<DestinationDetailScreen> createState() =>
      _DestinationDetailScreenState();
}

class _DestinationDetailScreenState extends State<DestinationDetailScreen> {
  int _currentImageIndex = 0;

  @override
  Widget build(BuildContext context) {
    final dest = widget.destination;
    final images = dest.imagenes.where((i) => i.isNotEmpty).toList();

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Galería de imágenes con parallax
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            actions: [
              // Compartir (elemento móvil)
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () => SharePlus.instance.share(
                  ShareParams(
                    text: '¡Mira este destino! ${dest.nombre} - \$${NumberFormat("#,###", "es_CO").format(dest.precio)} COP en The Tourist Rincón',
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: images.isNotEmpty
                  ? PageView.builder(
                      itemCount: images.length,
                      onPageChanged: (i) =>
                          setState(() => _currentImageIndex = i),
                      itemBuilder: (_, i) => CachedNetworkImage(
                        imageUrl: images[i],
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(
                          color: AppTheme.surface,
                          child: const Center(
                            child: CircularProgressIndicator(
                                color: AppTheme.accent),
                          ),
                        ),
                        errorWidget: (_, __, ___) => Container(
                          color: AppTheme.surface,
                          child: const Icon(Icons.image_not_supported,
                              size: 64, color: AppTheme.textSecondary),
                        ),
                      ),
                    )
                  : Container(
                      color: AppTheme.surface,
                      child: const Icon(Icons.landscape,
                          size: 80, color: AppTheme.textSecondary),
                    ),
            ),
          ),

          // Indicadores de página
          if (images.length > 1)
            SliverToBoxAdapter(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  images.length,
                  (i) => Container(
                    width: i == _currentImageIndex ? 24 : 8,
                    height: 8,
                    margin:
                        const EdgeInsets.symmetric(horizontal: 3, vertical: 12),
                    decoration: BoxDecoration(
                      color: i == _currentImageIndex
                          ? AppTheme.accent
                          : AppTheme.textSecondary,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
            ),

          // Contenido
          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Nombre y precio
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        dest.nombre,
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.accent,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '\$${NumberFormat("#,###", "es_CO").format(dest.precio)}',
                        style: const TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Info chips
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (dest.pais != null)
                      _infoChip(Icons.location_on, dest.pais!),
                    if (dest.categoria != null)
                      _infoChip(Icons.category, dest.categoria!),
                    if (dest.clima != null)
                      _infoChip(Icons.cloud, dest.clima!),
                    if (dest.rating != null)
                      _infoChip(Icons.star, '${dest.rating}'),
                  ],
                ),
                const SizedBox(height: 20),

                // Descripción
                if (dest.descripcion != null && dest.descripcion!.isNotEmpty)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Descripción',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: AppTheme.accent,
                                  fontWeight: FontWeight.w600,
                                ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dest.descripcion!,
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          height: 1.6,
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),

      // Botón fijo de reservar
      bottomSheet: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: AppTheme.primaryLight,
          border: Border(top: BorderSide(color: AppTheme.surface)),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: () => _showReservationSheet(context),
              icon: const Icon(Icons.calendar_month),
              label: const Text('Reservar Ahora'),
            ),
          ),
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primaryLight),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppTheme.accent),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
        ],
      ),
    );
  }

  void _showReservationSheet(BuildContext context) {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Inicia sesión para reservar'),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    DateTime? selectedDate;
    int personas = 1;
    final notasCtrl = TextEditingController();
    final today = DateTime.now();
    final maxDate = DateTime.now().add(const Duration(days: 180));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
              20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.textSecondary,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text('Reservar: ${widget.destination.nombre}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppTheme.accent,
                        fontWeight: FontWeight.bold,
                      )),
              const SizedBox(height: 20),

              // Selector de fecha (elemento móvil nativo)
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading:
                    const Icon(Icons.calendar_today, color: AppTheme.accent),
                title: Text(
                  selectedDate != null
                      ? DateFormat('dd MMMM yyyy', 'es_CO')
                          .format(selectedDate!)
                      : 'Seleccionar fecha',
                  style: const TextStyle(color: AppTheme.textPrimary),
                ),
                trailing: const Icon(Icons.arrow_forward_ios,
                    size: 16, color: AppTheme.textSecondary),
                onTap: () async {
                  final date = await showDatePicker(
                    context: ctx,
                    initialDate: today.add(const Duration(days: 1)),
                    firstDate: today,
                    lastDate: maxDate,
                    builder: (_, child) => Theme(
                      data: Theme.of(context).copyWith(
                        colorScheme: const ColorScheme.dark(
                          primary: AppTheme.accent,
                          surface: AppTheme.card,
                        ),
                      ),
                      child: child!,
                    ),
                  );
                  if (date != null) {
                    setSheetState(() => selectedDate = date);
                  }
                },
              ),
              const Divider(color: AppTheme.surface),

              // Personas
              Row(
                children: [
                  const Icon(Icons.people, color: AppTheme.accent),
                  const SizedBox(width: 16),
                  const Text('Personas:',
                      style: TextStyle(color: AppTheme.textPrimary)),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline,
                        color: AppTheme.accent),
                    onPressed: personas > 1
                        ? () => setSheetState(() => personas--)
                        : null,
                  ),
                  Text('$personas',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline,
                        color: AppTheme.accent),
                    onPressed: personas < 20
                        ? () => setSheetState(() => personas++)
                        : null,
                  ),
                ],
              ),
              const Divider(color: AppTheme.surface),

              // Notas
              TextField(
                controller: notasCtrl,
                maxLines: 2,
                decoration: const InputDecoration(
                  hintText: 'Notas adicionales (opcional)',
                  prefixIcon: Icon(Icons.note_add),
                ),
              ),
              const SizedBox(height: 16),

              // Total
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total:',
                      style: TextStyle(
                          color: AppTheme.textSecondary, fontSize: 16)),
                  Text(
                    '\$${NumberFormat("#,###", "es_CO").format(widget.destination.precio * personas)}',
                    style: const TextStyle(
                        color: AppTheme.accent,
                        fontSize: 22,
                        fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Botón confirmar
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: selectedDate == null
                      ? null
                      : () {
                          final fechaFin = selectedDate!
                              .add(const Duration(days: 3));
                          final reservation = ReservationModel(
                            usuarioId: auth.user!.id,
                            destinoId: widget.destination.id,
                            nombreCliente: auth.user!.nombreCompleto,
                            email: auth.user!.email,
                            destino: widget.destination.nombre,
                            fechaInicio: selectedDate!
                                .toIso8601String()
                                .split('T')[0],
                            fechaFin: fechaFin
                                .toIso8601String()
                                .split('T')[0],
                            personas: personas,
                            precioTotal:
                                (widget.destination.precio * personas)
                                    .toDouble(),
                            notas: notasCtrl.text.isNotEmpty
                                ? notasCtrl.text
                                : null,
                          );
                          Navigator.pop(ctx);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PaymentScreen(
                                  reservation: reservation),
                            ),
                          );
                        },
                  child: const Text('Continuar al pago'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
