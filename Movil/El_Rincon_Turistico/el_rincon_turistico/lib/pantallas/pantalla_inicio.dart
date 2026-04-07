import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../proveedores/proveedor_auth.dart';
import '../proveedores/proveedor_destinos.dart';
import '../tema/tema_app.dart';
import '../componentes/tarjeta_destino.dart';
import '../componentes/drawer_personalizado.dart';
import 'pantalla_detalle_destino.dart';
import 'pantalla_reservas.dart';
import 'pantalla_historial.dart';
import 'pantalla_perfil.dart';
import 'pantalla_chat.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Cargar destinos al entrar
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DestinationProvider>().loadDestinations();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final pages = [
      _buildHomePage(),
      const ReservationsScreen(),
      const HistoryScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      drawer: const CustomDrawer(),
      appBar: _currentIndex == 0
          ? AppBar(
              title: const Text('The Tourist Rincón'),
              actions: [
                // Indicador de conexión (elemento móvil)
                Container(
                  margin: const EdgeInsets.only(right: 8),
                  child: Icon(
                    auth.serverOnline ? Icons.cloud_done : Icons.cloud_off,
                    color:
                        auth.serverOnline ? AppTheme.success : AppTheme.danger,
                    size: 20,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.smart_toy_outlined),
                  tooltip: 'Chat IA',
                  onPressed: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const ChatScreen())),
                ),
              ],
            )
          : null,
      body: IndexedStack(index: _currentIndex, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        backgroundColor: AppTheme.primaryLight,
        indicatorColor: AppTheme.accent.withValues(alpha: 0.2),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore, color: AppTheme.accent),
            label: 'Explorar',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_today_outlined),
            selectedIcon: Icon(Icons.calendar_today, color: AppTheme.accent),
            label: 'Reservas',
          ),
          NavigationDestination(
            icon: Icon(Icons.history_outlined),
            selectedIcon: Icon(Icons.history, color: AppTheme.accent),
            label: 'Historial',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: AppTheme.accent),
            label: 'Perfil',
          ),
        ],
      ),
      // FAB para chat rápido (elemento móvil)
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton(
              heroTag: 'chatFab',
              mini: true,
              onPressed: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const ChatScreen())),
              child: const Icon(Icons.chat_bubble_outline),
            )
          : null,
    );
  }

  Widget _buildHomePage() {
    final destProvider = context.watch<DestinationProvider>();

    return RefreshIndicator(
      color: AppTheme.accent,
      onRefresh: () => destProvider.loadDestinations(),
      child: CustomScrollView(
        slivers: [
          // Hero Banner
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primaryLight, AppTheme.primary],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '¡Hola, ${context.read<AuthProvider>().user?.nombre ?? 'Viajero'}! 👋',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Descubre los mejores destinos de Colombia',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 16),
                  // Buscador
                  TextField(
                    controller: _searchCtrl,
                    onChanged: (q) => destProvider.search(q),
                    decoration: InputDecoration(
                      hintText: 'Buscar destino, categoría...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchCtrl.clear();
                                destProvider.search('');
                              },
                            )
                          : null,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Chips de categorías
          if (destProvider.categorias.isNotEmpty)
            SliverToBoxAdapter(
              child: SizedBox(
                height: 50,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: const Text('Todos'),
                        selected: destProvider.searchQuery.isEmpty,
                        onSelected: (_) {
                          _searchCtrl.clear();
                          destProvider.filterByCategory(null);
                        },
                      ),
                    ),
                    ...destProvider.categorias.map(
                      (cat) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(cat),
                          selected: destProvider.searchQuery == cat.toLowerCase(),
                          onSelected: (_) {
                            _searchCtrl.text = cat;
                            destProvider.filterByCategory(cat);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Estado de carga
          if (destProvider.loading)
            const SliverFillRemaining(
              child: Center(
                child: CircularProgressIndicator(color: AppTheme.accent),
              ),
            ),

          // Error
          if (destProvider.error != null && !destProvider.loading)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline,
                        size: 48, color: AppTheme.danger),
                    const SizedBox(height: 12),
                    Text(destProvider.error!,
                        style: const TextStyle(color: AppTheme.textSecondary)),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () => destProvider.loadDestinations(),
                      icon: const Icon(Icons.refresh),
                      label: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
            ),

          // Grid de destinos
          if (!destProvider.loading && destProvider.error == null)
            SliverPadding(
              padding: const EdgeInsets.all(12),
              sliver: destProvider.destinations.isEmpty
                  ? const SliverFillRemaining(
                      child: Center(
                        child: Text('No se encontraron destinos',
                            style: TextStyle(color: AppTheme.textSecondary)),
                      ),
                    )
                  : SliverGrid(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.72,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) {
                          final dest = destProvider.destinations[i];
                          return DestinationCard(
                            destination: dest,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    DestinationDetailScreen(destination: dest),
                              ),
                            ),
                          );
                        },
                        childCount: destProvider.destinations.length,
                      ),
                    ),
            ),
        ],
      ),
    );
  }
}
