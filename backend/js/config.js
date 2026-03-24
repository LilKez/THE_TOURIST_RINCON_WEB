// Asegurémonos de que la función sea global
window.guardarTodo = function() {
    console.log("¡Botón presionado!");

    const TASAS = {
        "COP": 1, "USD": 0.00025, "EUR": 0.00023, 
        "JPY": 0.038, "MXN": 0.0042, "CLP": 0.24, "ARS": 0.22
    };

    const SIMBOLOS = {
        "COP": "$", "USD": "$", "EUR": "€", 
        "JPY": "¥", "MXN": "$", "CLP": "$", "ARS": "$"
    };

    try {
        const select = document.getElementById('selectMoneda');
        const check = document.getElementById('checkNotis');

        if (!select) {
            console.error("No se encontró el elemento selectMoneda");
            return;
        }

        const moneda = select.value;
        const config = {
            moneda: moneda,
            notificaciones: check ? check.checked : false,
            simbolo: SIMBOLOS[moneda] || "$",
            tasa: TASAS[moneda] || 1
        };

        localStorage.setItem('userConfig', JSON.stringify(config));
        console.log("Guardado:", config);

        // Feedback en el botón
        const btn = document.querySelector('.btn-guardar');
        btn.innerText = "¡Cambios Guardados!";
        btn.style.backgroundColor = "#28a745";

        setTimeout(() => {
            window.location.href = 'cuenta.html';
        }, 1000);

    } catch (e) {
        console.error("Error crítico:", e);
    }
};