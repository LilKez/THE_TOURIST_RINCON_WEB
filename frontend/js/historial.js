// ======================
// HISTORIAL DE RESERVAS
// ======================

let todasReservas = [];
let filtroActual = 'todas';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Inicializar menú de usuario
    inicializarMenuUsuario();
    
    // Cargar reservas
    cargarReservasUsuario();
    
    // Inicializar filtros
    inicializarFiltros();
});

async function cargarReservasUsuario() {
    const container = document.getElementById('reservasContainer');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('email');
    
    if (!container) return;
    
    container.innerHTML = '<div class="loading">📅 Cargando tus reservas...</div>';
    
    try {
        const response = await fetch('http://localhost:3000/reservas');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const todas = await response.json();
        
        // Filtrar reservas del usuario actual
        todasReservas = todas.filter(r => 
            r.usuario_id === userId || 
            r.usuario_email === userEmail ||
            r.email === userEmail
        );
        
        // Ordenar por fecha (más recientes primero)
        todasReservas.sort((a, b) => {
            const fechaA = a.fecha || a.fecha_inicio || '';
            const fechaB = b.fecha || b.fecha_inicio || '';
            return new Date(fechaB) - new Date(fechaA);
        });
        
        console.log('📅 Reservas del usuario:', todasReservas.length);
        mostrarReservas();
        
    } catch (error) {
        console.error('Error cargando reservas:', error);
        container.innerHTML = '<div class="error-state">❌ Error al cargar tus reservas</div>';
    }
}

function mostrarReservas() {
    const container = document.getElementById('reservasContainer');
    let reservasFiltradas = todasReservas;
    
    if (filtroActual !== 'todas') {
        reservasFiltradas = todasReservas.filter(r => r.estado === filtroActual);
    }
    
    if (reservasFiltradas.length === 0) {
        const mensaje = filtroActual === 'todas' 
            ? '📭 No tienes reservas registradas' 
            : `📭 No tienes reservas ${filtroActual === 'pendiente' ? 'pendientes' : filtroActual}`;
        container.innerHTML = `<div class="empty-state">${mensaje}</div>`;
        return;
    }
    
    container.innerHTML = reservasFiltradas.map(reserva => {
        const fecha = formatearFecha(reserva.fecha || reserva.fecha_inicio);
        const estado = reserva.estado || 'pendiente';
        const estadoTexto = estado.charAt(0).toUpperCase() + estado.slice(1);
        const destino = reserva.destino_nombre || reserva.destino || 'Destino no especificado';
        const personas = reserva.personas || 1;
        const precioTotal = Number(reserva.precio_total || 0);
        
        return `
            <div class="reserva-card">
                <div class="reserva-destino">
                    <i class="fa fa-map-marker-alt"></i> ${escapeHtml(destino)}
                </div>
                <div class="reserva-info">
                    <span><i class="fa fa-calendar"></i> ${fecha}</span>
                    <span><i class="fa fa-users"></i> ${personas} ${personas > 1 ? 'personas' : 'persona'}</span>
                    <span><i class="fa fa-money-bill-wave"></i> $${precioTotal.toLocaleString()}</span>
                    <span><span class="estado-badge estado-${estado}">${estadoTexto}</span></span>
                    ${reserva.notas ? `<span><i class="fa fa-sticky-note"></i> ${escapeHtml(reserva.notas.substring(0, 60))}${reserva.notas.length > 60 ? '...' : ''}</span>` : ''}
                </div>
                <div class="reserva-actions">
                    <button class="btn-ver" onclick="verDetalleReserva('${reserva.id}')">
                        <i class="fa fa-eye"></i> Ver detalles
                    </button>
                    ${estado === 'pendiente' ? `
                        <button class="btn-cancelar" onclick="cancelarReserva('${reserva.id}')">
                            <i class="fa fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return 'Fecha no disponible';
    try {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return fechaStr;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function inicializarFiltros() {
    const filtros = document.querySelectorAll('.filtro-btn');
    filtros.forEach(btn => {
        btn.addEventListener('click', function() {
            filtros.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroActual = this.dataset.filtro;
            mostrarReservas();
        });
    });
}

function verDetalleReserva(id) {
    const reserva = todasReservas.find(r => r.id == id);
    if (!reserva) return;
    
    const fecha = formatearFecha(reserva.fecha || reserva.fecha_inicio);
    const destino = reserva.destino_nombre || reserva.destino || 'Destino no especificado';
    const personas = reserva.personas || 1;
    const precioTotal = Number(reserva.precio_total || 0).toLocaleString();
    const notas = reserva.notas || 'Sin notas adicionales';
    const estado = (reserva.estado || 'pendiente').charAt(0).toUpperCase() + (reserva.estado || 'pendiente').slice(1);
    
    alert(`━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 DETALLE DE RESERVA\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🏨 Destino: ${destino}\n📅 Fecha: ${fecha}\n👥 Personas: ${personas}\n💰 Total: $${precioTotal}\n📊 Estado: ${estado}\n📝 Notas: ${notas}\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

async function cancelarReserva(id) {
    if (!confirm('⚠️ ¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.')) return;
    
    try {
        const reserva = todasReservas.find(r => r.id == id);
        if (!reserva) {
            alert('❌ Reserva no encontrada');
            return;
        }
        
        const reservaActualizada = { ...reserva, estado: 'cancelada' };
        
        const response = await fetch(`http://localhost:3000/reservas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservaActualizada)
        });
        
        if (response.ok) {
            alert('✅ Reserva cancelada correctamente');
            // Recargar reservas
            await cargarReservasUsuario();
        } else {
            const error = await response.text();
            console.error('Error:', error);
            alert('❌ Error al cancelar la reserva');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión al cancelar la reserva');
    }
}