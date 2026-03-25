// ======================
// MI CUENTA - PERFIL DE USUARIO
// ======================

let datosUsuario = {};

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Inicializar menú de usuario
    inicializarMenuUsuario();
    
    // Cargar datos del usuario
    cargarDatosUsuario();
    
    // Cargar estadísticas
    cargarEstadisticas();
    
    // Configurar formularios
    configurarFormularios();
});

async function cargarDatosUsuario() {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    
    if (!userId && !email) {
        mostrarAlerta('No se pudo cargar la información del usuario', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/perfiles');
        const perfiles = await response.json();
        
        let usuario = perfiles.find(p => p.id === userId || p.email === email);
        
        if (usuario) {
            datosUsuario = usuario;
            
            document.getElementById('nombre').value = usuario.nombre || '';
            document.getElementById('apellido').value = usuario.apellido || '';
            document.getElementById('email').value = usuario.email || '';
        } else {
            mostrarAlerta('No se encontró la información del usuario', 'error');
        }
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarAlerta('Error al cargar los datos del usuario', 'error');
    }
}

async function cargarEstadisticas() {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('email');
    
    try {
        const response = await fetch('http://localhost:3000/reservas');
        const todasReservas = await response.json();
        
        const misReservas = todasReservas.filter(r => 
            r.usuario_id === userId || 
            r.usuario_email === userEmail ||
            r.email === userEmail
        );
        
        const total = misReservas.length;
        const pendientes = misReservas.filter(r => r.estado === 'pendiente').length;
        const completadas = misReservas.filter(r => r.estado === 'completada').length;
        
        const destinosVisitados = new Set(
            misReservas
                .filter(r => r.estado === 'completada')
                .map(r => r.destino_nombre || r.destino)
        ).size;
        
        document.getElementById('totalReservas').textContent = total;
        document.getElementById('reservasPendientes').textContent = pendientes;
        document.getElementById('reservasCompletadas').textContent = completadas;
        document.getElementById('destinosVisitados').textContent = destinosVisitados;
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function configurarFormularios() {
    const perfilForm = document.getElementById('perfilForm');
    if (perfilForm) {
        perfilForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await actualizarPerfil();
        });
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await cambiarContraseña();
        });
    }
}

async function actualizarPerfil() {
    const userId = localStorage.getItem('userId');
    const nuevoNombre = document.getElementById('nombre').value.trim();
    const nuevoApellido = document.getElementById('apellido').value.trim();
    
    if (!nuevoNombre) {
        mostrarAlerta('El nombre es obligatorio', 'error');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/perfiles/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nuevoNombre,
                apellido: nuevoApellido
            })
        });
        
        if (response.ok) {
            const nombreCompleto = `${nuevoNombre} ${nuevoApellido}`.trim();
            localStorage.setItem('nombre', nombreCompleto);
            
            mostrarAlerta('Perfil actualizado correctamente', 'success');
            
            const btn = document.getElementById("accountBtn");
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${nombreCompleto}`;
            }
        } else {
            mostrarAlerta('Error al actualizar el perfil', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión', 'error');
    }
}

async function cambiarContraseña() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        mostrarAlerta('Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        mostrarAlerta('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        mostrarAlerta('Las contraseñas no coinciden', 'error');
        return;
    }
    
    const email = localStorage.getItem('email');
    
    try {
        const loginResponse = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: currentPassword })
        });
        
        if (!loginResponse.ok) {
            mostrarAlerta('La contraseña actual es incorrecta', 'error');
            return;
        }
        
        const userId = localStorage.getItem('userId');
        const updateResponse = await fetch(`http://localhost:3000/perfiles/${userId}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword })
        });
        
        if (updateResponse.ok) {
            mostrarAlerta('Contraseña actualizada correctamente', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            mostrarAlerta('Error al actualizar la contraseña', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión', 'error');
    }
}

function mostrarAlerta(mensaje, tipo = 'info') {
    const alertaExistente = document.querySelector('.alert');
    if (alertaExistente) {
        alertaExistente.remove();
    }
    
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.innerHTML = `
        <i class="fa ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}