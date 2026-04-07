class UserModel {
  final String? id;
  final String nombre;
  final String? apellido;
  final String email;
  final String? rol;
  final String? token;

  UserModel({
    this.id,
    required this.nombre,
    this.apellido,
    required this.email,
    this.rol,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString(),
      nombre: json['nombre'] ?? '',
      apellido: json['apellido'] ?? '',
      email: json['email'] ?? '',
      rol: json['rol'] ?? 'cliente',
      token: json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'nombre': nombre,
      'apellido': apellido,
      'email': email,
      'rol': rol,
    };
  }

  String get nombreCompleto => '$nombre ${apellido ?? ''}'.trim();
  bool get esAdmin => rol == 'administrador';
}
