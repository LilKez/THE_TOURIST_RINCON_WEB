import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../proveedores/proveedor_auth.dart';
import '../tema/tema_app.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombreCtrl = TextEditingController();
  final _apellidoCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  bool _obscurePass = true;

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _apellidoCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final success = await auth.register(
      nombre: _nombreCtrl.text.trim(),
      apellido: _apellidoCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
      password: _passCtrl.text,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Registro exitoso. Inicia sesión.'),
          backgroundColor: AppTheme.success,
        ),
      );
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Error en el registro'),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Crear Cuenta')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  const Icon(Icons.person_add, size: 56, color: AppTheme.accent),
                  const SizedBox(height: 24),

                  TextFormField(
                    controller: _nombreCtrl,
                    textInputAction: TextInputAction.next,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      labelText: 'Nombre',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _apellidoCtrl,
                    textInputAction: TextInputAction.next,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                      labelText: 'Apellido',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Campo requerido' : null,
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Correo electrónico',
                      hintText: 'correo@ejemplo.com',
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
                    controller: _passCtrl,
                    obscureText: _obscurePass,
                    textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      labelText: 'Contraseña',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePass
                            ? Icons.visibility_off
                            : Icons.visibility),
                        onPressed: () =>
                            setState(() => _obscurePass = !_obscurePass),
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Campo requerido';
                      if (v.length < 6) return 'Mínimo 6 caracteres';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _confirmPassCtrl,
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    onFieldSubmitted: (_) => _register(),
                    decoration: const InputDecoration(
                      labelText: 'Confirmar contraseña',
                      prefixIcon: Icon(Icons.lock_outline),
                    ),
                    validator: (v) {
                      if (v != _passCtrl.text) {
                        return 'Las contraseñas no coinciden';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: auth.loading ? null : _register,
                      child: auth.loading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.black,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text('Registrarse'),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('¿Ya tienes cuenta? ',
                          style: TextStyle(color: AppTheme.textSecondary)),
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: const Text(
                          'Inicia sesión',
                          style: TextStyle(
                              color: AppTheme.accent,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
