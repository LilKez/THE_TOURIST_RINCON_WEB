document.addEventListener('DOMContentLoaded', function () {
    cargarReservas();
});

// URL de tu servidor
const API = "http://localhost:3000/reservas";

// ======================
// CARGAR RESERVAS
// ======================
async function cargarReservas() {
    const container = document.getElementById('reservasContainer');

    try {
        const res = await fetch(API);
        const reservas = await res.json();

        if (!reservas || reservas.length === 0) {
            container.innerHTML = '<p>No hay reservas aún.</p>';
            return;
        }

        container.innerHTML = '';

        reservas.forEach(reserva => {
            const card = document.createElement('div');
            card.className = 'card-reserva';

            card.innerHTML = `
                <img src="https://images.unsplash.com/photo-1586611292717-f828b167408c" alt="${reserva.destino}">
                
                <div class="reserva-info">
                    <h3>${reserva.destino}</h3>

                    <p><strong>Cliente:</strong> ${reserva.nombre_cliente}</p>
                    <p><strong>Email:</strong> ${reserva.email}</p>

                    <p><strong>Fechas:</strong> 
                        ${formatearFecha(reserva.fecha_inicio)} - 
                        ${formatearFecha(reserva.fecha_fin)}
                    </p>

                    <p><strong>Personas:</strong> ${reserva.personas}</p>
                    <p><strong>Precio:</strong> $${reserva.precio_total}</p>

                    <p><strong>Estado:</strong> ${reserva.estado}</p>

                    <div class="acciones">
                        <button class="edit-btn" title="Editar" onclick="editarReserva('${reserva.id}')">
                            <i class="fa fa-pen"></i>
                        </button>

                        <button class="delete-btn" title="Eliminar" onclick="eliminarReserva('${reserva.id}')">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error cargando reservas:', error);
    }
}

// ======================
// ELIMINAR RESERVA
// ======================
async function eliminarReserva(id) {
    if (!confirm('¿Eliminar esta reserva?')) return;

    try {
        await fetch(`${API}/${id}`, {
            method: 'DELETE'
        });

        cargarReservas();

    } catch (error) {
        console.error('Error eliminando:', error);
    }
}

// ======================
// EDITAR RESERVA (BÁSICO)
// ======================
async function editarReserva(id) {
    const nuevoEstado = prompt("Nuevo estado: (pendiente, confirmada, cancelada)");

    if (!nuevoEstado) return;

    try {
        await fetch(`${API}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: nuevoEstado
            })
        });

        cargarReservas();

    } catch (error) {
        console.error('Error editando:', error);
    }
}

// ======================
// FORMATEAR FECHA
// ======================
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString();
}