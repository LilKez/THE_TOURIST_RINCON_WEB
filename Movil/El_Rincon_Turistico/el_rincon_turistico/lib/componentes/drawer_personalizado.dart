import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../proveedores/proveedor_auth.dart';
import '../pantallas/pantalla_inicio.dart';
import '../pantallas/pantalla_reservas.dart';
import '../pantallas/pantalla_historial.dart';
import '../pantallas/pantalla_perfil.dart';
import '../pantallas/pantalla_contacto.dart';
import '../pantallas/pantalla_chat.dart';
import '../pantallas/admin/pantalla_panel_admin.dart';
import '../pantallas/pantalla_login.dart';
import '../tema/tema_app.dart';

class CustomDrawer extends StatelessWidget {
  const CustomDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Drawer(
      backgroundColor: AppTheme.primary,
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primary, AppTheme.primaryLight],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppTheme.accent,
                    child: Text(
                      (user?.nombre ?? 'U')[0].toUpperCase(),
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${user?.nombre ?? ''} ${user?.apellido ?? ''}'.trim(),
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    user?.email ?? '',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                  if (user?.esAdmin == true) ...[
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.accent.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Admin',
                        style: TextStyle(color: AppTheme.accent, fontSize: 11),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Menu items
            _DrawerItem(
              icon: Icons.explore,
              label: 'Explorar',
              onTap: () => _navigate(context, const HomeScreen()),
            ),
            _DrawerItem(
              icon: Icons.book_online,
              label: 'Mis Reservas',
              onTap: () => _navigate(context, const ReservationsScreen()),
            ),
            _DrawerItem(
              icon: Icons.history,
              label: 'Historial',
              onTap: () => _navigate(context, const HistoryScreen()),
            ),
            _DrawerItem(
              icon: Icons.smart_toy,
              label: 'Asistente IA',
              onTap: () => _navigate(context, const ChatScreen()),
            ),
            _DrawerItem(
              icon: Icons.contact_mail,
              label: 'Contacto',
              onTap: () => _navigate(context, const ContactScreen()),
            ),
            _DrawerItem(
              icon: Icons.person,
              label: 'Mi Perfil',
              onTap: () => _navigate(context, const ProfileScreen()),
            ),

            // Admin only
            if (user?.esAdmin == true) ...[
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Divider(color: AppTheme.surface),
              ),
              _DrawerItem(
                icon: Icons.admin_panel_settings,
                label: 'Panel Admin',
                color: AppTheme.accent,
                onTap: () => _navigate(context, const AdminPanelScreen()),
              ),
            ],

            const Spacer(),

            // Server status
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Icon(
                    Icons.circle,
                    size: 8,
                    color: auth.serverOnline
                        ? Colors.greenAccent
                        : Colors.redAccent,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    auth.serverOnline
                        ? 'Servidor conectado (3000)'
                        : 'Sin conexión',
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),

            const Divider(color: AppTheme.surface, indent: 20, endIndent: 20),

            _DrawerItem(
              icon: Icons.logout,
              label: 'Cerrar Sesión',
              color: Colors.redAccent,
              onTap: () {
                Navigator.of(context).pop();
                auth.logout();
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (_) => false,
                );
              },
            ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _navigate(BuildContext context, Widget screen) {
    Navigator.of(context).pop(); // close drawer
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color color;

  const _DrawerItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color = AppTheme.textPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      leading: Icon(icon, color: color, size: 22),
      title: Text(label, style: TextStyle(color: color, fontSize: 14)),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      hoverColor: AppTheme.surface,
    );
  }
}
