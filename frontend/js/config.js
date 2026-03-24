// Diccionarios de configuración
const TASAS = {
    COP: 1,
    USD: 0.00025,
    EUR: 0.00023,
    JPY: 0.038,
    MXN: 0.0042,
    CLP: 0.24,
    ARS: 0.22
};

const SIMBOLOS = {
    COP: "$",
    USD: "$",
    EUR: "€",
    JPY: "¥",
    MXN: "$",
    CLP: "$",
    ARS: "$"
};

// ==========================================
// 1. FUNCIÓN PARA EL TEXTO DINÁMICO (NOTIS)
// ==========================================
function actualizarTextoNoti() {
    const checkbox = document.getElementById('checkNotis');
    const texto = document.getElementById('estadoNotis');
    
    if (!checkbox || !texto) return;

    if (checkbox.checked) {
        texto.innerText = "Activado";
        texto.style.color = "#2ecc71"; // Verde vibrante
        texto.style.fontWeight = "600";
    } else {
        texto.innerText = "Desactivado";
        texto.style.color = "#e74c3c"; // Rojo para que resalte que está apagado
        texto.style.fontWeight = "600";
    }
}

// ==========================================
// 2. CARGAR CONFIGURACIÓN AL INICIAR
// ==========================================
function cargarConfiguracion() {
    const config = JSON.parse(localStorage.getItem('userConfig')) || {
        moneda: 'COP',
        notificaciones: false
    };

    const select = document.getElementById('selectMoneda');
    const check = document.getElementById('checkNotis');

    if (select) select.value = config.moneda;
    if (check) {
        check.checked = config.notificaciones;
        actualizarTextoNoti(); // Actualiza el texto apenas carga
    }
}

// ==========================================
// 3. GUARDAR CON EFECTOS VISUALES
// ==========================================
window.guardarTodo = function() {
    const select = document.getElementById('selectMoneda');
    const check = document.getElementById('checkNotis');
    const btn = document.querySelector('.btn-save-main'); // Asegúrate de que esta sea la clase de tu botón

    if (!select) return;

    const moneda = select.value;

    // Objeto a guardar
    const config = {
        moneda: moneda,
        notificaciones: check ? check.checked : false,
        simbolo: SIMBOLOS[moneda] || '$',
        tasa: TASAS[moneda] || 1
    };

    localStorage.setItem('userConfig', JSON.stringify(config));
    console.log('✅ Configuración guardada:', config);

    // --- EFECTO VISUAL DEL BOTÓN ---
    if (btn) {
        const textoOriginal = btn.innerHTML;
        const colorOriginal = "#3498db"; // El azul de tu diseño

        // Cambia a VERDE y texto de éxito
        btn.style.backgroundColor = '#2ecc71'; 
        btn.innerHTML = '<i class="fas fa-check"></i> ¡Guardado!';
        btn.style.transform = "scale(0.95)";

        // Vuelve al AZUL y texto original después de 1.6 segundos
        setTimeout(() => {
            btn.style.backgroundColor = colorOriginal;
            btn.innerHTML = textoOriginal;
            btn.style.transform = "scale(1)";
        }, 1600);
    }
};

// Eventos
window.addEventListener('DOMContentLoaded', () => {
    cargarConfiguracion();
    
    // Escuchar cambios en el switch de notificaciones
    const check = document.getElementById('checkNotis');
    if (check) {
        check.addEventListener('change', actualizarTextoNoti);
    }
});