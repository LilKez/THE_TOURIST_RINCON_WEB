import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../modelos/modelo_destino.dart';
import '../tema/tema_app.dart';

class DestinationCard extends StatelessWidget {
  final DestinationModel destination;
  final VoidCallback onTap;

  const DestinationCard({
    super.key,
    required this.destination,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              flex: 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  destination.primeraImagen.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: destination.primeraImagen,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            color: AppTheme.surface,
                            child: const Center(
                              child: SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: AppTheme.accent),
                              ),
                            ),
                          ),
                          errorWidget: (_, __, ___) => _placeholder(),
                        )
                      : _placeholder(),

                  // Category badge
                  if (destination.categoria != null)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.accent.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          destination.categoria!,
                          style: const TextStyle(
                            color: Colors.black,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),

                  // Rating badge
                  if (destination.rating != null)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star,
                                color: Colors.amber, size: 12),
                            const SizedBox(width: 2),
                            Text(
                              destination.rating!.toStringAsFixed(1),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      destination.nombre,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (destination.pais != null)
                      Row(
                        children: [
                          const Icon(Icons.location_on,
                              color: AppTheme.accent, size: 12),
                          const SizedBox(width: 3),
                          Expanded(
                            child: Text(
                              destination.pais!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                    const Spacer(),
                    if (destination.clima != null)
                      Row(
                        children: [
                           const Icon(Icons.wb_sunny,
                              color: Colors.amber, size: 12),
                          const SizedBox(width: 3),
                          Text(
                            destination.clima!,
                            style: const TextStyle(
                                color: AppTheme.textSecondary, fontSize: 10),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      color: AppTheme.surface,
      child: const Center(
        child: Icon(Icons.landscape, color: AppTheme.textSecondary, size: 36),
      ),
    );
  }
}
