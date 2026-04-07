class DestinationModel {
  final String id;
  final String nombre;
  final String? pais;
  final String? categoria;
  final String? clima;
  final int precio;
  final double? rating;
  final String? descripcion;
  final List<String> imagenes;

  DestinationModel({
    required this.id,
    required this.nombre,
    this.pais,
    this.categoria,
    this.clima,
    required this.precio,
    this.rating,
    this.descripcion,
    this.imagenes = const [],
  });

  factory DestinationModel.fromJson(Map<String, dynamic> json) {
    List<String> imgs = [];
    final raw = json['imagenes'];
    if (raw is List) {
      imgs = raw.map((e) => e.toString()).toList();
    } else if (raw is String) {
      try {
        final parsed = Uri.tryParse(raw);
        if (parsed != null && raw.startsWith('[')) {
          // Es un JSON array como string
          imgs = (raw
                  .replaceAll('[', '')
                  .replaceAll(']', '')
                  .replaceAll('"', '')
                  .split(','))
              .map((e) => e.trim())
              .where((e) => e.isNotEmpty)
              .toList();
        } else {
          imgs = [raw];
        }
      } catch (_) {
        imgs = [raw];
      }
    }

    return DestinationModel(
      id: json['id']?.toString() ?? '',
      nombre: json['nombre'] ?? 'Sin nombre',
      pais: json['pais'],
      categoria: json['categoria'],
      clima: json['clima'],
      precio: (json['precio'] is int)
          ? json['precio']
          : int.tryParse(json['precio']?.toString() ?? '0') ?? 0,
      rating: (json['rating'] is double)
          ? json['rating']
          : double.tryParse(json['rating']?.toString() ?? '0'),
      descripcion: json['descripcion'],
      imagenes: imgs,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'pais': pais,
      'categoria': categoria,
      'clima': clima,
      'precio': precio,
      'rating': rating,
      'descripcion': descripcion,
      'imagenes': imagenes,
    };
  }

  String get primeraImagen =>
      imagenes.isNotEmpty ? imagenes.first : '';
}
