import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'proveedores/proveedor_auth.dart';
import 'proveedores/proveedor_destinos.dart';
import 'proveedores/proveedor_reservas.dart';
import 'servicios/servicio_notificaciones.dart';
import 'tema/tema_app.dart';
import 'pantallas/pantalla_splash.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.init();
  runApp(const ElRinconTuristicoApp());
}

class ElRinconTuristicoApp extends StatelessWidget {
  const ElRinconTuristicoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DestinationProvider()),
        ChangeNotifierProvider(create: (_) => ReservationProvider()),
      ],
      child: MaterialApp(
        title: 'El Rincón Turístico',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
