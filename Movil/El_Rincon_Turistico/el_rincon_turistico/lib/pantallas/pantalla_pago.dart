import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../modelos/modelo_reserva.dart';
import '../proveedores/proveedor_reservas.dart';
import '../servicios/servicio_notificaciones.dart';
import '../tema/tema_app.dart';

class PaymentScreen extends StatefulWidget {
  final ReservationModel reservation;

  const PaymentScreen({
    super.key,
    required this.reservation,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _metodo = 'tarjeta';
  bool _processing = false;

  final _cardCtrl = TextEditingController(text: '');
  final _expCtrl = TextEditingController(text: '');
  final _cvvCtrl = TextEditingController(text: '');
  final _nameCtrl = TextEditingController(text: '');

  ReservationModel get _res => widget.reservation;
  double get _subtotal => _res.precioTotal;
  double get _tax => _subtotal * 0.19;
  double get _total => _subtotal + _tax;

  @override
  void dispose() {
    _cardCtrl.dispose();
    _expCtrl.dispose();
    _cvvCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _processPayment() async {
    if (_metodo == 'tarjeta') {
      if (_cardCtrl.text.length < 16 ||
          _expCtrl.text.isEmpty ||
          _cvvCtrl.text.length < 3 ||
          _nameCtrl.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Completa todos los datos de la tarjeta')),
        );
        return;
      }
    }

    setState(() => _processing = true);

    final resProv = context.read<ReservationProvider>();

    final success = await resProv.createReservation(_res);

    if (!mounted) return;
    setState(() => _processing = false);

    if (success) {
      NotificationService.showReservationConfirmed(_res.destino ?? 'Destino');

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          backgroundColor: AppTheme.card,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, color: Colors.greenAccent, size: 64),
              const SizedBox(height: 16),
              const Text('¡Pago Exitoso!',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary)),
              const SizedBox(height: 8),
              Text('Tu reserva para ${_res.destino ?? 'el destino'} ha sido confirmada.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.textSecondary)),
              const SizedBox(height: 8),
              Text(
                'Total: \$${_formatNumber(_total)}',
                style: const TextStyle(
                    color: AppTheme.accent,
                    fontWeight: FontWeight.bold,
                    fontSize: 18),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // close dialog
                Navigator.of(context).pop(); // go back to detail
                Navigator.of(context).pop(); // go back to home
              },
              child: const Text('Volver al inicio'),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(resProv.error ?? 'Error procesando el pago'),
            backgroundColor: Colors.redAccent),
      );
    }
  }

  String _formatNumber(double n) {
    return n.toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]}.');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pago')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Resumen de la Orden',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary)),
                  const Divider(color: AppTheme.surface, height: 20),
                  _summaryRow('Destino', _res.destino ?? 'N/A'),
                  _summaryRow('Fecha', _res.fechaInicio ?? 'N/A'),
                  _summaryRow('Personas', '${_res.personas}'),
                  if (_res.notas != null && _res.notas!.isNotEmpty)
                    _summaryRow('Notas', _res.notas!),
                  const Divider(color: AppTheme.surface, height: 20),
                  _summaryRow('Subtotal', '\$${_formatNumber(_subtotal)}'),
                  _summaryRow('IVA (19%)', '\$${_formatNumber(_tax)}'),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total',
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary)),
                      Text('\$${_formatNumber(_total)}',
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.accent)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Payment method
            const Text('Método de Pago',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary)),
            const SizedBox(height: 12),

            Row(
              children: [
                _methodChip('tarjeta', 'Tarjeta', Icons.credit_card),
                const SizedBox(width: 10),
                _methodChip('pse', 'PSE', Icons.account_balance),
                const SizedBox(width: 10),
                _methodChip('efectivo', 'Efectivo', Icons.money),
              ],
            ),

            const SizedBox(height: 20),

            if (_metodo == 'tarjeta') ...[
              TextField(
                controller: _nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nombre en la tarjeta',
                  prefixIcon: Icon(Icons.person),
                ),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _cardCtrl,
                decoration: const InputDecoration(
                  labelText: 'Número de tarjeta',
                  prefixIcon: Icon(Icons.credit_card),
                  hintText: '1234 5678 9012 3456',
                ),
                keyboardType: TextInputType.number,
                maxLength: 16,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _expCtrl,
                      decoration: const InputDecoration(
                        labelText: 'MM/AA',
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      keyboardType: TextInputType.datetime,
                      maxLength: 5,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _cvvCtrl,
                      decoration: const InputDecoration(
                        labelText: 'CVV',
                        prefixIcon: Icon(Icons.lock),
                      ),
                      keyboardType: TextInputType.number,
                      obscureText: true,
                      maxLength: 4,
                    ),
                  ),
                ],
              ),
            ],

            if (_metodo == 'pse')
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: AppTheme.accent),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Serás redirigido a tu banco para completar el pago.',
                        style: TextStyle(color: AppTheme.textSecondary),
                      ),
                    ),
                  ],
                ),
              ),

            if (_metodo == 'efectivo')
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: AppTheme.accent),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Podrás pagar en efectivo al momento de tu visita.',
                        style: TextStyle(color: AppTheme.textSecondary),
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 32),

            // Pay button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _processing ? null : _processPayment,
                child: _processing
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.black))
                    : Text('Pagar \$${_formatNumber(_total)}',
                        style: const TextStyle(fontSize: 16)),
              ),
            ),

            const SizedBox(height: 16),

            // Security note
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.lock, color: AppTheme.textSecondary, size: 14),
                SizedBox(width: 6),
                Text('Pago seguro · Simulación',
                    style:
                        TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
          const SizedBox(width: 16),
          Flexible(
            child: Text(value,
                textAlign: TextAlign.end,
                style: const TextStyle(
                    color: AppTheme.textPrimary, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _methodChip(String value, String label, IconData icon) {
    final selected = _metodo == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _metodo = value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: selected ? AppTheme.accent.withValues(alpha: 0.15) : AppTheme.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? AppTheme.accent : Colors.transparent,
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Icon(icon,
                  color: selected ? AppTheme.accent : AppTheme.textSecondary),
              const SizedBox(height: 4),
              Text(label,
                  style: TextStyle(
                    color: selected ? AppTheme.accent : AppTheme.textSecondary,
                    fontSize: 12,
                    fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                  )),
            ],
          ),
        ),
      ),
    );
  }
}
