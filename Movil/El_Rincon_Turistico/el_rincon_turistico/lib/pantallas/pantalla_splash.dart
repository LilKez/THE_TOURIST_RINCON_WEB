import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../proveedores/proveedor_auth.dart';
import '../tema/tema_app.dart';
import '../configuracion/api_configuracion.dart';
import 'pantalla_inicio.dart';
import 'pantalla_login.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  late Animation<double> _scaleAnim;
  String _statusMessage = 'Conectando al servidor...';
  bool _serverError = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _fadeAnim = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeIn));
    _scaleAnim = Tween<double>(
      begin: 0.5,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.elasticOut));
    _controller.forward();
    _initApp();
  }

  Future<void> _initApp() async {
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;

    final auth = context.read<AuthProvider>();

    // Validar conexión al servidor en puerto 3000
    setState(
      () =>
          _statusMessage = 'Verificando servidor (puerto ${ApiConfig.port})...',
    );
    final online = await auth.checkServer();

    if (!online) {
      setState(() {
        _serverError = true;
        _statusMessage =
            'No se pudo conectar al servidor\n${ApiConfig.serverUrl}';
      });
      return;
    }

    setState(() => _statusMessage = 'Restaurando sesión...');
    await auth.restoreSession();

    if (!mounted) return;
    await Future.delayed(const Duration(milliseconds: 600));

    if (auth.isAuthenticated) {
      _navigateTo(const HomeScreen());
    } else {
      _navigateTo(const LoginScreen());
    }
  }

  void _navigateTo(Widget screen) {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => screen,
        transitionsBuilder: (context, anim, secondaryAnimation, child) =>
            FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }

  void _retry() {
    setState(() {
      _serverError = false;
      _statusMessage = 'Reconectando...';
    });
    _initApp();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppTheme.primary, AppTheme.primaryLight, AppTheme.surface],
          ),
        ),
        child: Center(
          child: FadeTransition(
            opacity: _fadeAnim,
            child: ScaleTransition(
              scale: _scaleAnim,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo / Ícono
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: AppTheme.accent.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.accent, width: 3),
                    ),
                    child: const Icon(
                      Icons.travel_explore,
                      size: 64,
                      color: AppTheme.accent,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'The Tourist Rincón',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: AppTheme.accent,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Descubre Colombia',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 40),
                  if (!_serverError)
                    const SizedBox(
                      width: 32,
                      height: 32,
                      child: CircularProgressIndicator(
                        color: AppTheme.accent,
                        strokeWidth: 3,
                      ),
                    ),
                  if (_serverError)
                    Column(
                      children: [
                        const Icon(
                          Icons.cloud_off,
                          color: AppTheme.danger,
                          size: 48,
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: _retry,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Reintentar'),
                        ),
                        const SizedBox(height: 8),
                        // Opción móvil: configurar IP manualmente
                        TextButton(
                          onPressed: _showIpDialog,
                          child: const Text('Configurar IP del servidor'),
                        ),
                      ],
                    ),
                  const SizedBox(height: 16),
                  Text(
                    _statusMessage,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: _serverError
                          ? AppTheme.danger
                          : AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showIpDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('IP del Servidor'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: '192.168.1.100',
            labelText: 'Dirección IP',
            prefixIcon: Icon(Icons.dns),
          ),
          keyboardType: TextInputType.number,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                ApiConfig.setCustomIp(controller.text.trim());
                Navigator.pop(ctx);
                _retry();
              }
            },
            child: const Text('Conectar'),
          ),
        ],
      ),
    );
  }
}
