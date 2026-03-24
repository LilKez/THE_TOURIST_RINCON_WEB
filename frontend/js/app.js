// ==============================
// 1. CONFIGURACIÓN SUPABASE
// ==============================
const SUPABASE_URL = "https://zznylyznxkfvwockczck.supabase.co";
const SUPABASE_KEY = "sb_publishable_TY-D-APBQDoCs98DN35Ljw_594qqAxF";

let _supabase;

if (typeof supabase !== 'undefined') {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Supabase cargado correctamente");
} else {
    console.error("❌ Supabase no cargó. Revisa el script en HTML");
}

// ==============================
// USUARIO
// ==============================
let usuarioActual = {
    autenticado: false,
    rol: "visitante"
};

let destinoActual = null;

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
    document.getElementById("loginModal").classList.remove("oculto");
}

function cerrarLogin() {
    document.getElementById("loginModal").classList.add("oculto");
}

// ==============================
// DESTINOS
// ==============================
const destinos = [
    {
        id: "cartagena",
        nombre: "Cartagena",
        descripcion: "Ciudad amurallada con playas caribeñas.",
        precio: 1500000,
        rating: 4.8,
        imagenes: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/f6/92/cd/cartagena-colombia.jpg?w=400"]
    }
];

// ==============================
// MOSTRAR DESTINOS
// ==============================
function mostrarDestinos(lista) {
    const contenedor = document.getElementById("listaDestinos");
    contenedor.innerHTML = "";

    lista.forEach(destino => {
        contenedor.innerHTML += `
        <div class="card" onclick="verDetalle('${destino.id}')">
            <img src="${destino.imagenes[0]}">
            <h3>${destino.nombre}</h3>
            <p>$ ${destino.precio.toLocaleString()}</p>
        </div>`;
    });
}

// ==============================
// DETALLE
// ==============================
function verDetalle(id) {
    destinoActual = destinos.find(d => d.id === id);

    document.getElementById("detalleNombre").textContent = destinoActual.nombre;
    document.getElementById("detallePrecio").textContent = destinoActual.precio;
    document.getElementById("detalleDestino").classList.remove("oculto");
}

function cerrarDetalle() {
    document.getElementById("detalleDestino").classList.add("oculto");
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
    document.getElementById("modalReserva").classList.remove("oculto");
}

function cerrarModalReserva() {
    document.getElementById("modalReserva").classList.add("oculto");
}

// ==============================
// CHATBOT
// ==============================
function abrirBot() {
    document.getElementById("chatBot").classList.remove("oculto");
}

function cerrarBot() {
    document.getElementById("chatBot").classList.add("oculto");
}

function agregarMensaje(texto, tipo) {
    const chat = document.getElementById("chatMensajes");
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

        // quitar "Escribiendo..."
        const chat = document.getElementById("chatMensajes");
        chat.removeChild(chat.lastChild);

        const respuesta = data.respuesta || "No entendí tu pregunta 😅";

        agregarMensaje(respuesta, "bot");

    } catch (error) {
        console.error(error);

        const chat = document.getElementById("chatMensajes");
        chat.removeChild(chat.lastChild);

        agregarMensaje("Error con el servidor 😢", "bot");
    }
}

// ==============================
// LOGIN REQUERIDO
// ==============================
function abrirLoginReq() {
    document.getElementById("modalLoginReq").classList.remove("oculto");
}

function cerrarLoginReq() {
    document.getElementById("modalLoginReq").classList.add("oculto");
}

// ==============================
// INICIO
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    mostrarDestinos(destinos);
});