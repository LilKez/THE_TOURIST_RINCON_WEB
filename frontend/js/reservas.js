// URL de servidor
const API = "http://localhost:3000";

// ======================
// CARGAR RESERVAS DEL CLIENTE
// ======================
async function cargarReservas() {
    const container = document.getElementById('reservasContainer');
    
    if (!container) return;
    
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('email');
    
    if (!token) {
        container.innerHTML = '<div class="empty-state"><i class="fa fa-lock"></i><p>Inicia sesión para ver tus reservas</p><a href="login.html" class="btn-reservar">Iniciar sesión</a></div>';
        return;
    }
    
    container.innerHTML = '<div class="loading"><i class="fa fa-spinner fa-pulse"></i> Cargando tus reservas...</div>';

    try {
        // Obtener todas las reservas
        const res = await fetch(`${API}/reservas`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const todasReservas = await res.json();
        
        // Filtrar solo las reservas del usuario autenticado
        const misReservas = todasReservas.filter(reserva => 
            reserva.usuario_id === userId || 
            reserva.usuario_email === userEmail ||
            reserva.email === userEmail
        );
        
        console.log('📅 Reservas del cliente:', misReservas.length);

        if (misReservas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa fa-calendar"></i>
                    <p>No tienes reservas aún</p>
                    <a href="index.html" class="btn-reservar">Explorar destinos</a>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        misReservas.forEach(reserva => {
            const card = document.createElement('div');
            card.className = 'card-reserva';

            // Imagen de fallback
            const imgSrc = "https://images.unsplash.com/photo-1586611292717-f828b167408c";
            
            // Estado con clase CSS
            const estadoClass = reserva.estado || 'pendiente';
            const estadoTexto = estadoClass.charAt(0).toUpperCase() + estadoClass.slice(1);
            
            // Fechas formateadas
            const fechaInicio = reserva.fecha_inicio ? formatearFecha(reserva.fecha_inicio) : 'No especificada';
            const fechaFin = reserva.fecha_fin ? formatearFecha(reserva.fecha_fin) : 'No especificada';
            
            card.innerHTML = `
                <img src="${imgSrc}" alt="${reserva.destino}" loading="lazy">
                
                <div class="reserva-info">
                    <h3>${reserva.destino || 'Destino no especificado'}</h3>
                    
                    <div class="reserva-details">
                        <p><i class="fa fa-calendar"></i> <strong>Fechas:</strong> ${fechaInicio} - ${fechaFin}</p>
                        <p><i class="fa fa-users"></i> <strong>Personas:</strong> ${reserva.personas || 1}</p>
                        <p><i class="fa fa-money-bill"></i> <strong>Precio:</strong> $${Number(reserva.precio_total || 0).toLocaleString()}</p>
                        <p><span class="estado-badge estado-${estadoClass}">${estadoTexto}</span></p>
                    </div>
                    
                    ${reserva.notas ? `<p class="notas"><i class="fa fa-sticky-note"></i> ${reserva.notas}</p>` : ''}
                    
                    <div class="acciones">
                        <button class="view-btn" onclick="verDetalleReserva('${reserva.id}')">
                            <i class="fa fa-eye"></i> Ver detalles
                        </button>
                        ${estadoClass === 'pendiente' ? `
                            <button class="cancel-btn" onclick="cancelarReserva('${reserva.id}')">
                                <i class="fa fa-times"></i> Cancelar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error cargando reservas:', error);
        container.innerHTML = '<div class="error-state"><i class="fa fa-exclamation-triangle"></i><p>Error al cargar tus reservas</p></div>';
    }
}

// ======================
// VER DETALLE DE RESERVA
// ======================
function verDetalleReserva(id) {
    fetch(`${API}/reservas/${id}`)
        .then(res => res.json())
        .then(reserva => {
            const fechaInicio = reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString('es-CO') : 'N/A';
            const fechaFin = reserva.fecha_fin ? new Date(reserva.fecha_fin).toLocaleDateString('es-CO') : 'N/A';
            
            alert(`━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 DETALLE DE RESERVA\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🏨 Destino: ${reserva.destino}\n📅 Fechas: ${fechaInicio} - ${fechaFin}\n👥 Personas: ${reserva.personas}\n💰 Total: $${Number(reserva.precio_total || 0).toLocaleString()}\n📊 Estado: ${reserva.estado || 'Pendiente'}\n📝 Notas: ${reserva.notas || 'Sin notas'}\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('❌ Error al cargar los detalles de la reserva');
        });
}

// ======================
// CANCELAR RESERVA
// ======================
async function cancelarReserva(id) {
    if (!confirm('⚠️ ¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.')) return;
    
    try {
        // Primero obtener la reserva actual
        const resGet = await fetch(`${API}/reservas/${id}`);
        const reserva = await resGet.json();
        
        // Actualizar estado a cancelada
        const reservaActualizada = { ...reserva, estado: 'cancelada' };
        
        const res = await fetch(`${API}/reservas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaActualizada)
        });
        
        if (res.ok) {
            alert('✅ Reserva cancelada correctamente');
            cargarReservas(); // Recargar la lista
        } else {
            alert('❌ Error al cancelar la reserva');
        }
    } catch (error) {
        console.error('Error cancelando:', error);
        alert('❌ Error al cancelar la reserva');
    }
}

// ======================
// FORMATEAR FECHA
// ======================
function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    try {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return fecha;
    }
}

// ======================
// INICIALIZAR
// ======================
document.addEventListener('DOMContentLoaded', function () {
    // Verificar autenticación para el menú
    if (typeof inicializarMenuUsuario === 'function') {
        inicializarMenuUsuario();
    }
    
    cargarReservas();
});