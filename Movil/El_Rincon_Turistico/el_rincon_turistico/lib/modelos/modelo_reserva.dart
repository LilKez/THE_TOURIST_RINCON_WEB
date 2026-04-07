class ReservationModel {
  final String? id;
  final String? usuarioId;
  final String? destinoId;
  final String? nombreCliente;
  final String? email;
  final String? destino;
  final String? fechaInicio;
  final String? fechaFin;
  final int personas;
  final double precioTotal;
  final String estado;
  final String? notas;
  final String? createdAt;

  ReservationModel({
    this.id,
    this.usuarioId,
    this.destinoId,
    this.nombreCliente,
    this.email,
    this.destino,
    this.fechaInicio,
    this.fechaFin,
    this.personas = 1,
    this.precioTotal = 0,
    this.estado = 'pendiente',
    this.notas,
    this.createdAt,
  });

  factory ReservationModel.fromJson(Map<String, dynamic> json) {
    return ReservationModel(
      id: json['id']?.toString(),
      usuarioId: json['usuario_id']?.toString(),
      destinoId: json['destino_id']?.toString(),
      nombreCliente:
          json['nombre_cliente'] ?? json['usuario_nombre'] ?? json['cliente_nombre'],
      email: json['email'] ?? json['usuario_email'] ?? json['cliente_email'],
      destino: json['destino'] ?? json['destino_nombre'],
      fechaInicio: json['fecha_inicio'] ?? json['fecha'],
      fechaFin: json['fecha_fin'],
      personas: json['personas'] ?? json['numero_personas'] ?? 1,
      precioTotal:
          (json['precio_total'] ?? json['total'] ?? 0).toDouble(),
      estado: json['estado'] ?? 'pendiente',
      notas: json['notas'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'usuario_id': usuarioId,
      'destino_id': destinoId,
      'nombre_cliente': nombreCliente,
      'email': email,
      'destino': destino,
      'fecha_inicio': fechaInicio,
      'fecha_fin': fechaFin,
      'personas': personas,
      'precio_total': precioTotal,
      'estado': estado,
      if (notas != null) 'notas': notas,
      'created_at': createdAt ?? DateTime.now().toIso8601String(),
    };
  }

  ReservationModel copyWith({String? estado, String? notas}) {
    return ReservationModel(
      id: id,
      usuarioId: usuarioId,
      destinoId: destinoId,
      nombreCliente: nombreCliente,
      email: email,
      destino: destino,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      personas: personas,
      precioTotal: precioTotal,
      estado: estado ?? this.estado,
      notas: notas ?? this.notas,
      createdAt: createdAt,
    );
  }
}
