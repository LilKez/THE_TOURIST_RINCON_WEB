import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../proveedores/proveedor_auth.dart';
import '../proveedores/proveedor_reservas.dart';
import '../servicios/servicio_api.dart';
import '../tema/tema_app.dart';
import 'pantalla_login.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nombreCtrl = TextEditingController();
  final _apellidoCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _currentPassCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  bool _loadingProfile = true;
  String? _avatarPath;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) return;

    final result = await ApiService.getProfiles();
    if (result.success && result.data != null) {
      final profile = (result.data as List).firstWhere(
        (p) =>
            p['id']?.toString() == auth.user!.id ||
            p['email'] == auth.user!.email,
        orElse: () => null,
      );

      if (profile != null) {
        _nombreCtrl.text = profile['nombre'] ?? '';
        _apellidoCtrl.text = profile['apellido'] ?? '';
        _emailCtrl.text = profile['email'] ?? '';
      }
    }

    // Cargar estadísticas
    if (auth.isAuthenticated) {
      context
          .read<ReservationProvider>()
          .loadUserReservations(auth.user!.id, auth.user!.email);
    }

    setState(() => _loadingProfile = false);
  }

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _apellidoCtrl.dispose();
    _emailCtrl.dispose();
    _currentPassCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final reservations = context.watch<ReservationProvider>();

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Mi Cuenta')),
        body: const Center(
          child: Text('Inicia sesión',
              style: TextStyle(color: AppTheme.textSecondary)),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Cuenta'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppTheme.danger),
            tooltip: 'Cerrar sesión',
            onPressed: () => _logout(auth),
          ),
        ],
      ),
      body: _loadingProfile
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.accent))
          : RefreshIndicator(
              color: AppTheme.accent,
              onRefresh: _loadProfile,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Avatar con opción de cámara (elemento móvil)
                  Center(
                    child: GestureDetector(
                      onTap: _pickAvatar,
                      child: Stack(
                        children: [
                          CircleAvatar(
                            radius: 50,
                            backgroundColor: AppTheme.accent.withValues(alpha: 0.15),
                            backgroundImage: _avatarPath != null
                                ? AssetImage(_avatarPath!)
                                : null,
                            child: _avatarPath == null
                                ? Text(
                                    auth.user!.nombre.isNotEmpty
                                        ? auth.user!.nombre[0].toUpperCase()
                                        : '?',
                                    style: const TextStyle(
                                        fontSize: 36, color: AppTheme.accent),
                                  )
                                : null,
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: const BoxDecoration(
                                color: AppTheme.accent,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.camera_alt,
                                  size: 16, color: Colors.black),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: Text(
                      auth.user!.nombreCompleto,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  Center(
                    child: Text(auth.user!.email,
                        style:
                            const TextStyle(color: AppTheme.textSecondary)),
                  ),
                  if (auth.isAdmin)
                    Center(
                      child: Container(
                        margin: const EdgeInsets.only(top: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.accent.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text('Administrador',
                            style: TextStyle(color: AppTheme.accent)),
                      ),
                    ),
                  const SizedBox(height: 24),

                  // Estadísticas
                  Row(
                    children: [
                      _stat('Reservas', reservations.totalReservations,
                          AppTheme.accent),
                      const SizedBox(width: 12),
                      _stat('Pendientes', reservations.pendingCount,
                          AppTheme.warning),
                      const SizedBox(width: 12),
                      _stat('Completadas', reservations.completedCount,
                          AppTheme.success),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // Editar perfil
                  _sectionTitle('Información Personal'),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _nombreCtrl,
                    decoration: const InputDecoration(
                        labelText: 'Nombre',
                        prefixIcon: Icon(Icons.person_outline)),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _apellidoCtrl,
                    decoration: const InputDecoration(
                        labelText: 'Apellido',
                        prefixIcon: Icon(Icons.person_outline)),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _emailCtrl,
                    enabled: false,
                    decoration: const InputDecoration(
                        labelText: 'Correo',
                        prefixIcon: Icon(Icons.email_outlined)),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _updateProfile,
                      child: const Text('Guardar cambios'),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Cambiar contraseña
                  _sectionTitle('Cambiar Contraseña'),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _currentPassCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                        labelText: 'Contraseña actual',
                        prefixIcon: Icon(Icons.lock_outline)),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _newPassCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                        labelText: 'Nueva contraseña',
                        prefixIcon: Icon(Icons.lock)),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _confirmPassCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                        labelText: 'Confirmar nueva contraseña',
                        prefixIcon: Icon(Icons.lock)),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: _changePassword,
                      child: const Text('Cambiar contraseña'),
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Info del dispositivo (elemento móvil)
                  _sectionTitle('Información de la App'),
                  const SizedBox(height: 8),
                  Card(
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.info_outline,
                              color: AppTheme.accent),
                          title: const Text('Versión',
                              style: TextStyle(color: AppTheme.textPrimary)),
                          trailing: const Text('1.0.0',
                              style:
                                  TextStyle(color: AppTheme.textSecondary)),
                        ),
                        ListTile(
                          leading: const Icon(Icons.dns_outlined,
                              color: AppTheme.accent),
                          title: const Text('Servidor',
                              style: TextStyle(color: AppTheme.textPrimary)),
                          trailing: Text(
                              'Puerto 3001',
                              style: TextStyle(
                                  color: auth.serverOnline
                                      ? AppTheme.success
                                      : AppTheme.danger)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _stat(String label, int value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Text('$value',
                style: TextStyle(
                    color: color, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(label,
                style: const TextStyle(
                    color: AppTheme.textSecondary, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(title,
        style: const TextStyle(
            color: AppTheme.accent,
            fontSize: 18,
            fontWeight: FontWeight.w600));
  }

  Future<void> _pickAvatar() async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt, color: AppTheme.accent),
              title: const Text('Cámara'),
              onTap: () => Navigator.pop(context, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: AppTheme.accent),
              title: const Text('Galería'),
              onTap: () => Navigator.pop(context, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );

    if (source != null) {
      final file = await picker.pickImage(source: source, maxWidth: 400);
      if (file != null) {
        setState(() => _avatarPath = file.path);
      }
    }
  }

  Future<void> _updateProfile() async {
    final auth = context.read<AuthProvider>();
    if (auth.user?.id == null) return;

    final result = await ApiService.updateProfile(
      auth.user!.id!,
      _nombreCtrl.text.trim(),
      _apellidoCtrl.text.trim(),
    );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(result.success
            ? '✅ Perfil actualizado'
            : result.error ?? 'Error'),
        backgroundColor: result.success ? AppTheme.success : AppTheme.danger,
      ),
    );
  }

  Future<void> _changePassword() async {
    if (_newPassCtrl.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Mínimo 6 caracteres'),
            backgroundColor: AppTheme.warning),
      );
      return;
    }
    if (_newPassCtrl.text != _confirmPassCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Las contraseñas no coinciden'),
            backgroundColor: AppTheme.danger),
      );
      return;
    }

    // Verificar contraseña actual
    final auth = context.read<AuthProvider>();
    final loginCheck = await ApiService.login(
      auth.user!.email,
      _currentPassCtrl.text,
    );

    if (!loginCheck.success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Contraseña actual incorrecta'),
            backgroundColor: AppTheme.danger),
      );
      return;
    }

    final result = await ApiService.changePassword(
        auth.user!.id!, _newPassCtrl.text);

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(result.success
            ? '✅ Contraseña actualizada'
            : result.error ?? 'Error'),
        backgroundColor: result.success ? AppTheme.success : AppTheme.danger,
      ),
    );
    if (result.success) {
      _currentPassCtrl.clear();
      _newPassCtrl.clear();
      _confirmPassCtrl.clear();
    }
  }

  Future<void> _logout(AuthProvider auth) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Cerrar sesión'),
        content: const Text('¿Seguro que deseas cerrar sesión?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('No')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sí'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await auth.logout();
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
    }
  }
}
