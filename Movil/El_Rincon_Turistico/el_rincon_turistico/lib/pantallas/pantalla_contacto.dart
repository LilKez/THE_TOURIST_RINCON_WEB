import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../tema/tema_app.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _sending = true);
    // Simulación como en la web
    await Future.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;
    setState(() => _sending = false);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ Mensaje enviado correctamente'),
        backgroundColor: AppTheme.success,
      ),
    );
    _formKey.currentState!.reset();
    _nameCtrl.clear();
    _emailCtrl.clear();
    _messageCtrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contacto')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '¿Tienes preguntas?',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Escríbenos y te responderemos pronto',
              style: TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),

            // Acciones rápidas (elementos móviles)
            Row(
              children: [
                _quickAction(Icons.phone, 'Llamar', () async {
                  final uri = Uri.parse('tel:+573001234567');
                  if (await canLaunchUrl(uri)) await launchUrl(uri);
                }),
                const SizedBox(width: 12),
                _quickAction(Icons.email, 'Email', () async {
                  final uri = Uri.parse('mailto:info@touristrincon.com');
                  if (await canLaunchUrl(uri)) await launchUrl(uri);
                }),
                const SizedBox(width: 12),
                _quickAction(Icons.location_on, 'Mapa', () async {
                  final uri = Uri.parse(
                      'https://maps.google.com/?q=Colombia+Tourist+Rincon');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                }),
              ],
            ),
            const SizedBox(height: 28),

            // Formulario
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _nameCtrl,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      labelText: 'Nombre completo',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Campo requerido' : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Correo electrónico',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Campo requerido';
                      if (!v.contains('@') || !v.contains('.')) {
                        return 'Correo inválido';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _messageCtrl,
                    maxLines: 5,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(
                      labelText: 'Mensaje',
                      hintText: 'Cuéntanos en qué podemos ayudarte...',
                      prefixIcon: Icon(Icons.message_outlined),
                      alignLabelWithHint: true,
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Campo requerido';
                      if (v.trim().length < 10) return 'Mínimo 10 caracteres';
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _sending ? null : _send,
                      icon: _sending
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.black),
                            )
                          : const Icon(Icons.send),
                      label: Text(_sending ? 'Enviando...' : 'Enviar mensaje'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _quickAction(IconData icon, String label, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.primaryLight),
          ),
          child: Column(
            children: [
              Icon(icon, color: AppTheme.accent, size: 28),
              const SizedBox(height: 6),
              Text(label,
                  style: const TextStyle(
                      color: AppTheme.textSecondary, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}
