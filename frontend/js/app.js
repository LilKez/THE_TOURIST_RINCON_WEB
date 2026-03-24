// ============================== 
// USUARIO
// ==============================
let usuarioActual = {
    autenticado: false,
    rol: "visitante"
};

let destinoActual = null;
let destinosGlobal = [];

// Mantener sesión
const token = localStorage.getItem('token');
if (token) {
    usuarioActual.autenticado = true;
    usuarioActual.rol = localStorage.getItem('rol') || 'usuario';
}

// ==============================
// LOGIN MODAL
// ==============================
function abrirLogin() {
    document.getElementById("loginModal")?.classList.remove("oculto");
}

function cerrarLogin() {
    document.getElementById("loginModal")?.classList.add("oculto");
}

// ==============================
// 🚀 CARGAR DESTINOS DESDE BACKEND
// ==============================
async function cargarDestinos() {
    const contenedor = document.getElementById("listaDestinos");

    if (contenedor) {
        contenedor.innerHTML = "<p>Cargando destinos...</p>";
    }

    try {
        const res = await fetch("http://localhost:3000/destinos");

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();

        console.log("📦 Destinos desde backend:", data);

        if (!Array.isArray(data)) {
            throw new Error("La respuesta no es un array");
        }

        destinosGlobal = data;

        mostrarDestinos(destinosGlobal);

    } catch (error) {
        console.error("❌ Error cargando destinos:", error);

        if (contenedor) {
            contenedor.innerHTML = "<p>Error cargando destinos 😢</p>";
        }
    }
}

// ==============================
// 🖼️ OBTENER IMAGEN 
// ==============================
function obtenerImagen(destino) {
    if (!destino || !destino.imagenes) {
        return "https://via.placeholder.com/300";
    }

    try {
        let imagen = null;

        if (typeof destino.imagenes === "string") {
            const parsed = JSON.parse(destino.imagenes);
            imagen = Array.isArray(parsed) ? parsed[0] : destino.imagenes;
        } else if (Array.isArray(destino.imagenes)) {
            imagen = destino.imagenes[0];
        }

        if (imagen && !imagen.startsWith("http")) {
            return `http://localhost:3000${imagen}`;
        }

        return imagen;

    } catch (error) {
        console.warn("⚠️ Error imagen:", destino.imagenes);
    }

    return "https://via.placeholder.com/300";
}
// ==============================
// MOSTRAR DESTINOS
// ==============================
function mostrarDestinos(lista) {
    const contenedor = document.getElementById("listaDestinos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = "<p>No hay destinos disponibles</p>";
        return;
    }

    // --- NUEVO: Leer configuración de moneda ---
    const config = JSON.parse(localStorage.getItem('userConfig')) || { tasa: 1, simbolo: '$', moneda: 'COP' };
    const tasa = config.tasa || 1;
    const simbolo = config.simbolo || "$";

    lista.forEach(destino => {
        const imagen = obtenerImagen(destino);
        
        // Calcular precio convertido
        const precioOriginal = Number(destino.precio || 0);
        const precioConvertido = (precioOriginal * tasa).toLocaleString(undefined, {
            minimumFractionDigits: config.moneda === 'JPY' ? 0 : 0,
            maximumFractionDigits: config.moneda === 'JPY' ? 0 : 0
        });

        contenedor.innerHTML += `
        <div class="card" onclick="verDetalle('${destino.id}')">
            <img src="${imagen}" alt="${destino.nombre}">
            <h3>${destino.nombre || "Sin nombre"}</h3>
            <p>${simbolo} ${precioConvertido} <small>${config.moneda || 'COP'}</small></p>
        </div>`;
    });
}

// ==============================
// DETALLE
// ==============================
function verDetalle(id) {
    destinoActual = destinosGlobal.find(d => String(d.id) === String(id));

    if (!destinoActual) {
        console.error("❌ Destino no encontrado:", id);
        return;
    }

    // --- NUEVO: Aplicar conversión en el detalle ---
    const config = JSON.parse(localStorage.getItem('userConfig')) || { tasa: 1, simbolo: '$', moneda: 'COP' };
    const precioConvertido = (Number(destinoActual.precio || 0) * config.tasa).toLocaleString(undefined, {
        minimumFractionDigits: config.moneda === 'JPY' ? 0 : 0
    });

    document.getElementById("detalleNombre").textContent = destinoActual.nombre;
    document.getElementById("detallePrecio").textContent = `${config.simbolo} ${precioConvertido} ${config.moneda}`;
    // ==============================
    //  MANEJO DE IMÁGENES
    // ==============================
    let imagenes = [];

    try {
        if (typeof destinoActual.imagenes === "string") {
            imagenes = JSON.parse(destinoActual.imagenes);
        } else if (Array.isArray(destinoActual.imagenes)) {
            imagenes = destinoActual.imagenes;
        }
    } catch (e) {
        console.warn("Error parseando imágenes");
    }

    // Ajustar rutas si son locales
    imagenes = imagenes.map(img => {
        if (!img) return "https://via.placeholder.com/300";
        return img.startsWith("http") ? img : `http://localhost:3000${img}`;
    });

    // Imagen principal
    document.getElementById("detalleImagen").src =
        imagenes[0] || "https://via.placeholder.com/500";

    // Miniaturas
    document.getElementById("mini1").src =
        imagenes[0] || "https://via.placeholder.com/100";

    document.getElementById("mini2").src =
        imagenes[1] || imagenes[0] || "https://via.placeholder.com/100";

    document.getElementById("mini3").src =
        imagenes[2] || imagenes[0] || "https://via.placeholder.com/100";

    document.getElementById("detalleDestino")?.classList.remove("oculto");
}
function cambiarImagen(img) {
    document.getElementById("detalleImagen").src = img.src;
}
function cerrarDetalle() {
    const detalle = document.getElementById("detalleDestino");
    if (detalle) {
        detalle.classList.add("oculto");
    }

    // LIMPIEZA (esto evita bugs)
    destinoActual = null;
}

// ==============================
// RESERVA
// ==============================
function configurarFechaMinima() {
    const fechaInput = document.getElementById('reservaFecha');
    if (!fechaInput) return;

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    let mm = hoy.getMonth() + 1;
    let dd = hoy.getDate();

    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;

    fechaInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}

function reservarDestino() {
    if (!usuarioActual.autenticado) {
        abrirLoginReq();
        return;
    }

    if (!destinoActual) {
        alert("Selecciona un destino");
        return;
    }

    configurarFechaMinima();

    document.getElementById("reservaDestinoNombre").textContent = destinoActual.nombre;
    document.getElementById("modalReserva")?.classList.remove("oculto");
}

function cerrarModalReserva() {
    document.getElementById("modalReserva")?.classList.add("oculto");
}

// ==============================
// CHATBOT
// ==============================
function abrirBot() {
    document.getElementById("chatBot")?.classList.remove("oculto");
}

function cerrarBot() {
    document.getElementById("chatBot")?.classList.add("oculto");
}

function agregarMensaje(texto, tipo) {
    const chat = document.getElementById("chatMensajes");
    if (!chat) return;

    const div = document.createElement("div");

    div.className = tipo === "bot" ? "mensaje-bot" : "mensaje-user";
    div.textContent = texto;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

async function preguntarBot() {
    const input = document.getElementById("preguntaBot");
    const pregunta = input.value.trim();

    if (!pregunta) return;

    agregarMensaje(pregunta, "user");
    input.value = "";

    agregarMensaje("Escribiendo...", "bot");

    try {
        const res = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mensaje: pregunta })
        });

        const data = await res.json();

        const chat = document.getElementById("chatMensajes");
        chat?.removeChild(chat.lastChild);

        agregarMensaje(data.respuesta || "No entendí 😅", "bot");

    } catch (error) {
        console.error(error);

        const chat = document.getElementById("chatMensajes");
        chat?.removeChild(chat.lastChild);

        agregarMensaje("Error con el servidor 😢", "bot");
    }
}

// ==============================
// LOGIN REQUERIDO
// ==============================
function abrirLoginReq() {
    document.getElementById("modalLoginReq")?.classList.remove("oculto");
}

function cerrarLoginReq() {
    document.getElementById("modalLoginReq")?.classList.add("oculto");
}

// ==============================
// 🍔 MENU USUARIO (FIX)
// ==============================
function inicializarMenuUsuario() {
    const btn = document.getElementById("accountBtn");
    const menu = document.getElementById("accountMenu");

    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("oculto");
    });

    document.addEventListener("click", () => {
        menu.classList.add("oculto");
    });

    menu.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}

// ==============================
// INICIO
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 App iniciada");

    cargarDestinos();
    inicializarMenuUsuario(); 

    
});


