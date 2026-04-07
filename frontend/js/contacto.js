// ======================
// PÁGINA DE CONTACTO
// ======================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar menú de usuario
    if (typeof inicializarMenuUsuario === 'function') {
        inicializarMenuUsuario();
    }
    
    // Configurar formulario de contacto
    const form = document.getElementById('contactoForm');
    if (form) {
        form.addEventListener('submit', enviarContacto);
    }
});

async function enviarContacto(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const asunto = document.getElementById('asunto').value;
    const mensaje = document.getElementById('mensaje').value.trim();
    
    // Validaciones
    if (!nombre) {
        mostrarMensaje('Por favor ingresa tu nombre', 'error');
        return;
    }
    
    if (!email) {
        mostrarMensaje('Por favor ingresa tu correo electrónico', 'error');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        mostrarMensaje('Por favor ingresa un correo electrónico válido', 'error');
        return;
    }
    
    if (!asunto) {
        mostrarMensaje('Por favor selecciona un asunto', 'error');
        return;
    }
    
    if (!mensaje) {
        mostrarMensaje('Por favor escribe tu mensaje', 'error');
        return;
    }
    
    if (mensaje.length < 10) {
        mostrarMensaje('El mensaje debe tener al menos 10 caracteres', 'error');
        return;
    }
    
    // Mostrar loading
    const btn = document.querySelector('.btn-enviar');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fa fa-spinner fa-pulse"></i> Enviando...';
    btn.disabled = true;
    
    try {
        // Aquí se enviaría al backend
        // Por ahora simulamos el envío
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('📝 Mensaje de contacto:', { nombre, email, telefono, asunto, mensaje });
        
        // Mostrar éxito
        mostrarMensaje('✅ ¡Mensaje enviado! Nos pondremos en contacto contigo pronto.', 'success');
        
        // Limpiar formulario
        document.getElementById('contactoForm').reset();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('❌ Error al enviar el mensaje. Por favor intenta nuevamente.', 'error');
    } finally {
        // Restaurar botón
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

function mostrarMensaje(mensaje, tipo) {
    const mensajeDiv = document.getElementById('formMensaje');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `form-mensaje ${tipo}`;
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
        mensajeDiv.className = 'form-mensaje';
    }, 5000);
}