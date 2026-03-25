const API_URL = 'http://localhost:3000';

let destinos = [];
let reservas = [];
let perfiles = [];

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    
    console.log('🔍 Token:', token ? 'Presente' : 'No');
    console.log('🔍 Rol:', rol);
    
    if (!token) {
        window.location.href = '../login.html';
        return;
    }
    
    if (rol !== 'administrador') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = '../index.html';
        return;
    }
    
    console.log('✅ Admin autenticado');
    mostrarSeccion('destinos');
    cargarDestinos();
    cargarPerfiles();
    cargarReservas();
});

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    const seccionElement = document.getElementById(seccion);
    if (seccionElement) seccionElement.classList.add('activa');
    
    // Actualizar clase activa en sidebar
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('onclick')?.includes(seccion)) {
            a.classList.add('active');
        }
    });
}

// ======================
// DESTINOS - CORREGIDO
// ======================
async function cargarDestinos() {
    const lista = document.getElementById('listaDestinosAdmin');
    if (!lista) return;
    
    lista.innerHTML = '<div class="loading">✨ Cargando destinos...</div>';

    try {
        const res = await fetch(`${API_URL}/destinos`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        destinos = data;
        
        console.log('📦 Destinos cargados:', destinos.length);
        
        if (destinos.length === 0) {
            lista.innerHTML = '<div class="empty-state">📭 No hay destinos disponibles</div>';
            return;
        }
        
        lista.innerHTML = destinos.map(destino => `
            <div class="destino-card">
                <div class="card-header">
                    <h3>${escapeHtml(destino.nombre || 'Sin nombre')}</h3>
                    <span class="precio-badge">$${Number(destino.precio || 0).toLocaleString()}</span>
                </div>
                <p class="descripcion">${escapeHtml(destino.descripcion || 'Sin descripción')}</p>
                <div class="card-details">
                    <span><i class="fa fa-map-marker-alt"></i> ${escapeHtml(destino.pais || 'N/A')}</span>
                    <span><i class="fa fa-tag"></i> ${escapeHtml(destino.categoria || 'N/A')}</span>
                    <span><i class="fa fa-cloud-sun"></i> ${escapeHtml(destino.clima || 'N/A')}</span>
                    <span><i class="fa fa-star"></i> ${destino.rating || 'N/A'}</span>
                </div>
                <div class="card-buttons">
                    <button class="edit-btn" onclick="editarDestino('${destino.id}')">
                        <i class="fa fa-pen"></i> Editar
                    </button>
                    <button class="delete-btn" onclick="eliminarDestino('${destino.id}')">
                        <i class="fa fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Error cargando destinos:', error);
        lista.innerHTML = '<div class="error-state">❌ Error cargando destinos</div>';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function abrirModalDestino(id = null) {
    const modal = document.getElementById('modalDestino');
    if (!modal) return;

    if (id) {
        const destino = destinos.find(d => d.id === id);
        if (destino) {
            document.getElementById('destinoId').value = destino.id;
            document.getElementById('destinoNombre').value = destino.nombre || '';
            document.getElementById('destinoPais').value = destino.pais || '';
            document.getElementById('destinoCategoria').value = destino.categoria || '';
            document.getElementById('destinoClima').value = destino.clima || '';
            document.getElementById('destinoPrecio').value = destino.precio || '';
            document.getElementById('destinoRating').value = destino.rating || '';
            document.getElementById('destinoDescripcion').value = destino.descripcion || '';
            document.getElementById('modalTitle').textContent = '✏️ Editar Destino';
        }
    } else {
        document.getElementById('formDestino').reset();
        document.getElementById('destinoId').value = '';
        document.getElementById('modalTitle').textContent = '➕ Añadir Destino';
    }

    modal.classList.remove('oculto');
    document.body.style.overflow = 'hidden';
}

function cerrarModalDestino() {
    const modal = document.getElementById('modalDestino');
    if (modal) modal.classList.add('oculto');
    document.body.style.overflow = '';
}

// FORMULARIO DESTINO - CORREGIDO
const formDestino = document.getElementById('formDestino');
if (formDestino) {
    formDestino.addEventListener('submit', async function (e) {
        e.preventDefault();

        const id = document.getElementById('destinoId').value;
        
        // Generar ID si no existe (para nuevos destinos)
        let destinoId = id;
        if (!destinoId) {
            // Generar ID basado en el nombre (sin espacios, en minúsculas)
            const nombre = document.getElementById('destinoNombre').value;
            destinoId = nombre.toLowerCase().replace(/\s+/g, '-');
        }
        
        const destinoData = {
            id: destinoId,
            nombre: document.getElementById('destinoNombre').value,
            pais: document.getElementById('destinoPais').value,
            categoria: document.getElementById('destinoCategoria').value,
            clima: document.getElementById('destinoClima').value,
            precio: parseInt(document.getElementById('destinoPrecio').value),
            rating: parseFloat(document.getElementById('destinoRating').value),
            descripcion: document.getElementById('destinoDescripcion').value
        };

        console.log('📝 Guardando destino:', destinoData);

        try {
            let url = `${API_URL}/destinos`;
            let method = 'POST';
            
            if (id) {
                url = `${API_URL}/destinos/${id}`;
                method = 'PUT';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(destinoData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Respuesta:', result);
            
            alert(id ? '✅ Destino actualizado' : '✅ Destino creado');
            cargarDestinos();
            cerrarModalDestino();

        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al guardar destino: ' + error.message);
        }
    });
}

function editarDestino(id) {
    abrirModalDestino(id);
}

async function eliminarDestino(id) {
    if (confirm('¿Eliminar este destino permanentemente?')) {
        try {
            const res = await fetch(`${API_URL}/destinos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('✅ Destino eliminado');
                cargarDestinos();
            } else {
                alert('❌ Error al eliminar');
            }
        } catch (error) {
            console.error(error);
            alert('❌ Error al eliminar');
        }
    }
}

// ======================
// PERFILES (USUARIOS) - CON BOTÓN ELIMINAR YIAAA
// ======================
async function cargarPerfiles() {
    const lista = document.getElementById('listaUsuarios');
    if (!lista) return;
    
    lista.innerHTML = '<div class="loading">👥 Cargando usuarios...</div>';

    try {
        const res = await fetch(`${API_URL}/perfiles`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const perfilesData = await res.json();
        perfiles = perfilesData;
        
        // Obtener el ID del admin actual desde localStorage (necesitas guardarlo en login)
        const adminId = localStorage.getItem('userId');
        
        console.log('👥 Perfiles cargados:', perfilesData.length);
        
        if (perfilesData.length === 0) {
            lista.innerHTML = '<div class="empty-state">📭 No hay usuarios registrados</div>';
            return;
        }

        // Estadísticas
        const totalUsuarios = perfilesData.length;
        const admins = perfilesData.filter(u => u.rol === 'administrador').length;
        const clientes = perfilesData.filter(u => u.rol === 'cliente').length;
        
        lista.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 1.5rem;">
                <div class="stat-card total">
                    <i class="fa fa-users"></i>
                    <div>
                        <h3>${totalUsuarios}</h3>
                        <p>Total Usuarios</p>
                    </div>
                </div>
                <div class="stat-card confirmada">
                    <i class="fa fa-user-shield"></i>
                    <div>
                        <h3>${admins}</h3>
                        <p>Administradores</p>
                    </div>
                </div>
                <div class="stat-card pendiente">
                    <i class="fa fa-user"></i>
                    <div>
                        <h3>${clientes}</h3>
                        <p>Clientes</p>
                    </div>
                </div>
            </div>
            <div class="section-header" style="margin-top: 1rem;">
                <h2>Usuarios Registrados</h2>
                <button onclick="abrirModalUsuario()" class="btn-add">
                    <i class="fa fa-plus"></i> Añadir Usuario
                </button>
            </div>
            <div class="usuarios-grid">
                ${perfilesData.map(u => {
                    const esAdminActual = u.id === adminId;
                    const esAdmin = u.rol === 'administrador';
                    
                    return `
                    <div class="usuario-card">
                        <div class="usuario-avatar">
                            <i class="fa ${esAdmin ? 'fa-user-shield' : 'fa-user-circle'}"></i>
                        </div>
                        <div class="usuario-info">
                            <h3>${escapeHtml(u.nombre || 'Sin nombre')} ${escapeHtml(u.apellido || '')}</h3>
                            <p><i class="fa fa-envelope"></i> ${escapeHtml(u.email)}</p>
                            <span class="rol ${esAdmin ? 'admin' : 'cliente'}">${esAdmin ? 'Administrador' : 'Cliente'}</span>
                            ${esAdminActual ? '<small class="you-badge">(Tú)</small>' : ''}
                        </div>
                        <div class="usuario-actions">
                            ${!esAdminActual ? `
                                <button class="delete-btn" onclick="eliminarUsuario('${u.id}', '${escapeHtml(u.nombre)}', ${esAdmin})" title="Eliminar usuario">
                                    <i class="fa fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;

    } catch (error) {
        console.error('❌ Error cargando perfiles:', error);
        lista.innerHTML = '<div class="error-state">❌ Error cargando usuarios</div>';
    }
}

// ======================
// CREAR USUARIO (MODAL)
// ======================
function abrirModalUsuario() {
    // Verificar si ya existe el modal
    let modal = document.getElementById('modalUsuario');
    
    if (!modal) {
        // Crear modal dinámicamente
        const modalHTML = `
            <div id="modalUsuario" class="modal oculto">
                <div class="modal-content">
                    <h3 id="modalUsuarioTitle">➕ Crear Nuevo Usuario</h3>
                    <form id="formUsuario">
                        <input type="hidden" id="usuarioId">
                        <div class="form-grid">
                            <div>
                                <label>Nombre</label>
                                <input type="text" id="usuarioNombre" placeholder="Nombre" required>
                            </div>
                            <div>
                                <label>Apellido</label>
                                <input type="text" id="usuarioApellido" placeholder="Apellido" required>
                            </div>
                            <div>
                                <label>Email</label>
                                <input type="email" id="usuarioEmail" placeholder="correo@ejemplo.com" required>
                            </div>
                            <div>
                                <label>Contraseña</label>
                                <input type="password" id="usuarioPassword" placeholder="Contraseña" required>
                            </div>
                            <div>
                                <label>Rol</label>
                                <select id="usuarioRol" required>
                                    <option value="cliente">Cliente</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-buttons">
                            <button type="submit">Crear Usuario</button>
                            <button type="button" onclick="cerrarModalUsuario()">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Agregar event listener al formulario
        document.getElementById('formUsuario').addEventListener('submit', crearUsuario);
        modal = document.getElementById('modalUsuario');
    }
    
    // Limpiar formulario
    document.getElementById('formUsuario').reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('modalUsuarioTitle').textContent = '➕ Crear Nuevo Usuario';
    
    modal.classList.remove('oculto');
    document.body.style.overflow = 'hidden';
}

function cerrarModalUsuario() {
    const modal = document.getElementById('modalUsuario');
    if (modal) modal.classList.add('oculto');
    document.body.style.overflow = '';
}

async function crearUsuario(e) {
    e.preventDefault();
    
    const usuarioData = {
        nombre: document.getElementById('usuarioNombre').value,
        apellido: document.getElementById('usuarioApellido').value,
        email: document.getElementById('usuarioEmail').value,
        password: document.getElementById('usuarioPassword').value,
        rol: document.getElementById('usuarioRol').value
    };
    
    console.log('📝 Creando usuario:', usuarioData);
    
    try {
        const response = await fetch(`${API_URL}/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ Usuario "${usuarioData.nombre}" creado exitosamente`);
            cerrarModalUsuario();
            cargarPerfiles(); // Recargar lista
        } else {
            alert(`❌ Error: ${result.error || 'No se pudo crear el usuario'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al conectar con el servidor');
    }
}

// ======================
// ELIMINAR USUARIO
// ======================
async function eliminarUsuario(id, nombre, esAdmin) {
    // Confirmación con detalles
    const mensaje = esAdmin 
        ? `⚠️ ATENCIÓN: "${nombre}" es ADMINISTRADOR.\n\n¿Estás seguro de eliminarlo?`
        : `⚠️ ¿Estás seguro de eliminar al usuario "${nombre}"?\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(mensaje)) return;
    
    try {
        const response = await fetch(`${API_URL}/perfiles/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            alert(`✅ Usuario "${nombre}" eliminado correctamente`);
            cargarPerfiles(); // Recargar lista
        } else {
            const error = await response.json();
            alert(`❌ Error: ${error.error || 'No se pudo eliminar el usuario'}`);
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('❌ Error al conectar con el servidor');
    }
}

// ======================
// RESERVAS - VERSIÓN SIMPLE Y CORREGIDA
// ======================
async function cargarReservas() {
    const tbody = document.getElementById('listaReservas');
    if (!tbody) {
        console.error('❌ Elemento listaReservas no encontrado');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="8"><div class="loading">📅 Cargando reservas...</div></td></tr>';
    console.log('📡 Fetching reservas desde:', `${API_URL}/reservas`);

    try {
        const res = await fetch(`${API_URL}/reservas`);
        console.log('📡 Respuesta reservas - Status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        reservas = data;
        
        console.log('📅 Reservas cargadas:', reservas.length);
        console.log('📅 Datos completos:', reservas);

        tbody.innerHTML = '';

        if (!reservas || reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state">📭 No hay reservas registradas</div></td></tr>';
            return;
        }

        // Recorrer cada reserva y crear fila
        for (const reserva of reservas) {
            const row = document.createElement('tr');
            
            // Obtener nombre del cliente - intentar diferentes campos
            let nombreCliente = 'N/A';
            if (reserva.nombre_cliente) {
                nombreCliente = reserva.nombre_cliente;
            } else if (reserva.usuario_nombre) {
                nombreCliente = reserva.usuario_nombre;
            } else if (reserva.cliente_nombre) {
                nombreCliente = reserva.cliente_nombre;
            }
            
            // Obtener email
            let emailCliente = 'N/A';
            if (reserva.email) {
                emailCliente = reserva.email;
            } else if (reserva.usuario_email) {
                emailCliente = reserva.usuario_email;
            } else if (reserva.cliente_email) {
                emailCliente = reserva.cliente_email;
            }
            
            // Obtener destino
            let destinoNombre = 'N/A';
            if (reserva.destino) {
                destinoNombre = reserva.destino;
            } else if (reserva.destino_nombre) {
                destinoNombre = reserva.destino_nombre;
            } else if (reserva.destino_id) {
                destinoNombre = reserva.destino_id;
            }
            
            // Obtener fecha
            let fecha = 'N/A';
            if (reserva.fecha) {
                try {
                    fecha = new Date(reserva.fecha).toLocaleDateString('es-CO');
                } catch(e) { fecha = reserva.fecha; }
            } else if (reserva.fecha_inicio) {
                try {
                    fecha = new Date(reserva.fecha_inicio).toLocaleDateString('es-CO');
                } catch(e) { fecha = reserva.fecha_inicio; }
            }
            
            // Obtener personas
            const personas = reserva.personas || reserva.numero_personas || 1;
            
            // Obtener precio
            const precioTotal = reserva.precio_total || reserva.total || 0;
            
            // Obtener estado
            const estado = reserva.estado || 'pendiente';
            
            // Escapar HTML para seguridad
            const safeNombre = String(nombreCliente).replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
            const safeEmail = String(emailCliente).replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
            const safeDestino = String(destinoNombre).replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
            
            row.innerHTML = `
                <td><strong>${safeNombre}</strong></td>
                <td>${safeEmail}</td>
                <td><i class="fa fa-map-marker-alt"></i> ${safeDestino}</td>
                <td>${fecha}</td>
                <td>${personas} ${personas > 1 ? 'personas' : 'persona'}</td>
                <td class="precio-total">$${Number(precioTotal).toLocaleString()}</td>
                <td>
                    <select class="estado-select ${estado}" onchange="cambiarEstadoReserva('${reserva.id}', this.value)">
                        <option value="pendiente" ${estado === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                        <option value="confirmada" ${estado === 'confirmada' ? 'selected' : ''}>✅ Confirmada</option>
                        <option value="cancelada" ${estado === 'cancelada' ? 'selected' : ''}>❌ Cancelada</option>
                        <option value="completada" ${estado === 'completada' ? 'selected' : ''}>🎉 Completada</option>
                    </select>
                </td>
                <td class="acciones">
                    <button class="view-btn" onclick="verDetalleReserva('${reserva.id}')" title="Ver detalles">
                        <i class="fa fa-eye"></i>
                    </button>
                    <button class="delete-btn" onclick="eliminarReserva('${reserva.id}')" title="Eliminar reserva">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        }
        
        // Actualizar estadísticas
        actualizarEstadisticas(reservas);
        console.log('✅ Reservas renderizadas correctamente');

    } catch (error) {
        console.error('❌ Error cargando reservas:', error);
        tbody.innerHTML = `<tr><td colspan="8"><div class="error-state">❌ Error cargando reservas: ${error.message}</div></td></tr>`;
    }
}

function actualizarEstadisticas(reservas) {
    const total = reservas.length;
    const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
    const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
    const completadas = reservas.filter(r => r.estado === 'completada').length;
    
    let statsContainer = document.getElementById('estadisticasReservas');
    const reservasSection = document.getElementById('reservas');
    
    if (!statsContainer && reservasSection) {
        statsContainer = document.createElement('div');
        statsContainer.id = 'estadisticasReservas';
        const sectionHeader = reservasSection.querySelector('.section-header');
        if (sectionHeader) {
            reservasSection.insertBefore(statsContainer, sectionHeader.nextSibling);
        } else {
            reservasSection.insertBefore(statsContainer, reservasSection.firstChild);
        }
    }
    
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card total">
                    <i class="fa fa-calendar"></i>
                    <div>
                        <h3>${total}</h3>
                        <p>Total Reservas</p>
                    </div>
                </div>
                <div class="stat-card pendiente">
                    <i class="fa fa-clock"></i>
                    <div>
                        <h3>${pendientes}</h3>
                        <p>Pendientes</p>
                    </div>
                </div>
                <div class="stat-card confirmada">
                    <i class="fa fa-check-circle"></i>
                    <div>
                        <h3>${confirmadas}</h3>
                        <p>Confirmadas</p>
                    </div>
                </div>
                <div class="stat-card completada">
                    <i class="fa fa-trophy"></i>
                    <div>
                        <h3>${completadas}</h3>
                        <p>Completadas</p>
                    </div>
                </div>
            </div>
        `;
    }
}

async function cambiarEstadoReserva(id, nuevoEstado) {
    try {
        const reserva = reservas.find(r => r.id == id);
        if (!reserva) {
            alert('❌ Reserva no encontrada');
            return;
        }
        
        const reservaActualizada = { ...reserva, estado: nuevoEstado };
        
        const res = await fetch(`${API_URL}/reservas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservaActualizada)
        });
        
        if (res.ok) {
            alert(`✅ Estado cambiado a ${nuevoEstado}`);
            cargarReservas();
        } else {
            const error = await res.text();
            console.error('Error:', error);
            alert('❌ Error al actualizar estado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al actualizar estado');
    }
}

function verDetalleReserva(id) {
    const reserva = reservas.find(r => r.id == id);
    if (!reserva) return;
    
    // Obtener datos con valores por defecto
    const nombre = reserva.nombre_cliente || reserva.usuario_nombre || 'N/A';
    const email = reserva.email || reserva.usuario_email || 'N/A';
    const destino = reserva.destino || reserva.destino_nombre || 'N/A';
    let fecha = reserva.fecha || reserva.fecha_inicio || 'N/A';
    if (fecha !== 'N/A') {
        try {
            fecha = new Date(fecha).toLocaleDateString('es-CO');
        } catch(e) {}
    }
    const personas = reserva.personas || reserva.numero_personas || 1;
    const precio = Number(reserva.precio_total || reserva.total || 0).toLocaleString();
    const notas = reserva.notas || 'Sin notas adicionales';
    const estado = reserva.estado || 'Pendiente';
    
    alert(`━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 DETALLE DE RESERVA\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 Cliente: ${nombre}\n📧 Email: ${email}\n🏨 Destino: ${destino}\n📅 Fecha: ${fecha}\n👥 Personas: ${personas}\n💰 Total: $${precio}\n📊 Estado: ${estado}\n📝 Notas: ${notas}\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

async function eliminarReserva(id) {
    if (confirm('⚠️ ¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.')) {
        try {
            const res = await fetch(`${API_URL}/reservas/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('✅ Reserva eliminada correctamente');
                cargarReservas();
            } else {
                alert('❌ Error eliminando la reserva');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error eliminando la reserva');
        }
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    localStorage.removeItem('email');
    window.location.href = '../index.html';
}