// ============================== 
// USUARIO
// ==============================
let usuarioActual = {
    autenticado: false,
    rol: "visitante",
    nombre: null
};

let destinoActual = null;
let destinosGlobal = [];

// Imagen de fallback local
const IMG_FALLBACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%2326c6da' text-anchor='middle' dominant-baseline='central'%3E📷 Sin imagen%3C/text%3E%3C/svg%3E`;

// ==============================
// VERIFICAR SESIÓN AL INICIAR
// ==============================
function verificarSesion() {
    const token = localStorage.getItem('token');
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    
    console.log("🔍 Verificando sesión - Rol en localStorage:", rol);
    
    if (token && nombre) {
        usuarioActual = {
            autenticado: true,
            rol: rol || 'cliente',
            nombre: nombre
        };
        
        console.log("✅ Usuario autenticado - Rol:", usuarioActual.rol);
        
        const btn = document.getElementById("accountBtn");
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${nombre}`;
        }
        
        return true;
    }
    
    return false;
}

// ==============================
// LOGIN (para página login.html)
// ==============================
async function iniciarSesion(email, password) {
    try {
        console.log("🔐 Intentando login con:", email);
        
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('nombre', data.nombre);
            localStorage.setItem('rol', data.rol || 'cliente');
            localStorage.setItem('email', email);
            localStorage.setItem('userId', data.id); // ← AGREGAR ESTA LÍNEA
            
            window.location.href = "index.html";
            return { success: true };
        } else {
            return { success: false, error: data.error || "Credenciales inválidas" };
        }
    } catch (error) {
        console.error("❌ Error en login:", error);
        return { success: false, error: "Error de conexión con el servidor" };
    }
}

// ==============================
// REGISTRO
// ==============================
async function registrarUsuario(nombre, apellido, email, password) {
    try {
        console.log("📝 Intentando registrar:", { nombre, apellido, email });
        
        const response = await fetch("http://localhost:3000/registrar", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ nombre, apellido, email, password })
        });
        
        console.log("📡 Respuesta HTTP:", response.status);
        
        const data = await response.json();
        console.log("📦 Datos recibidos:", data);
        
        if (response.ok) {
            alert("✅ Registro exitoso. Por favor inicia sesión.");
            window.location.href = "login.html";
            return { success: true };
        } else {
            return { success: false, error: data.error || "Error en el registro" };
        }
    } catch (error) {
        console.error("❌ Error en registro:", error);
        return { success: false, error: "Error de conexión con el servidor" };
    }
}

// ==============================
// FUNCIONES PARA EL MODAL
// ==============================
function irALogin() {
    cerrarModalAuth();
    window.location.href = "login.html";
}

function irARegistro() {
    cerrarModalAuth();
    window.location.href = "registro.html";
}

// ==============================
// MODAL DE AUTENTICACIÓN
// ==============================
function mostrarModalAuth() {
    const modal = document.getElementById("modalLoginReq");
    if (modal) {
        modal.classList.remove("oculto");
        document.body.style.overflow = "hidden";
        
        const contenido = modal.querySelector(".modal-reservar-contenido");
        if (contenido) {
            contenido.style.animation = "none";
            contenido.offsetHeight;
            contenido.style.animation = "slideInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            document.body.classList.add("modal-open");
        }
    }
}

function cerrarModalAuth() {
    const modal = document.getElementById("modalLoginReq");
    if (modal) {
        modal.classList.add("oculto");
        document.body.style.overflow = "";
        document.body.classList.remove("modal-open");
    }
}

// ==============================
// CERRAR MODAL AL HACER CLICK FUERA
// ==============================
function inicializarModal() {
    const modal = document.getElementById("modalLoginReq");
    if (!modal) return;
    
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarModalAuth();
        }
    });
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("oculto")) {
            cerrarModalAuth();
        }
    });
}

// ==============================
// CERRAR SESIÓN
// ==============================
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    localStorage.removeItem('email');
    
    usuarioActual = {
        autenticado: false,
        rol: "visitante",
        nombre: null
    };
    
    const btn = document.getElementById("accountBtn");
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-user"></i> Usuario`;
    }
    
    const menu = document.getElementById("accountMenu");
    if (menu) {
        menu.classList.add("oculto");
    }
    
    console.log("✅ Sesión cerrada");
    
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {
        window.location.reload();
    }
}

// ==============================
// 🍔 MENU USUARIO - CON ENLACES COMPLETOS
// ==============================
function inicializarMenuUsuario() {
    const btn = document.getElementById("accountBtn");
    const menu = document.getElementById("accountMenu");
    
    if (!btn) return;
    
    verificarSesion();
    
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        
        if (!usuarioActual.autenticado) {
            mostrarModalAuth();
            return;
        }
        
        if (menu) {
            const rol = localStorage.getItem('rol');
            const nombreUsuario = localStorage.getItem('nombre');
            
            let menuHTML = '';
            
            if (rol === 'administrador') {
                menuHTML = `
                    <div class="menu-user-info">
                        <i class="fa-solid fa-user-shield"></i>
                        <span>${nombreUsuario}</span>
                        <small>Administrador</small>
                    </div>
                    <hr>
                    <a href="admin/admin.html" class="admin-link">
                        <i class="fa-solid fa-tachometer-alt"></i> Panel Admin
                    </a>
                    <a href="mi-cuenta.html">
                        <i class="fa-solid fa-user"></i> Mi cuenta
                    </a>
                    <a href="historial.html">
                        <i class="fa-solid fa-history"></i> Historial
                    </a>
                    <hr>
                    <a href="#" class="logout">
                        <i class="fa-solid fa-sign-out-alt"></i> Cerrar sesión
                    </a>
                `;
            } else {
                menuHTML = `
                    <div class="menu-user-info">
                        <i class="fa-solid fa-user-circle"></i>
                        <span>${nombreUsuario}</span>
                        <small>Cliente</small>
                    </div>
                    <hr>
                    <a href="mi-cuenta.html">
                        <i class="fa-solid fa-user"></i> Mi cuenta
                    </a>
                    <a href="reservas.html">
                        <i class="fa-solid fa-calendar-check"></i> Reservar viaje
                    </a>
                    <a href="historial.html">
                        <i class="fa-solid fa-history"></i> Historial
                    </a>
                    <hr>
                    <a href="#" class="logout">
                        <i class="fa-solid fa-sign-out-alt"></i> Cerrar sesión
                    </a>
                `;
            }
            
            menu.innerHTML = menuHTML;
            menu.classList.toggle("oculto");
        }
    });
    
    if (menu) {
        document.addEventListener("click", () => {
            menu.classList.add("oculto");
        });
        
        menu.addEventListener("click", (e) => {
            e.stopPropagation();
        });
        
        menu.addEventListener("click", (e) => {
            const logoutBtn = e.target.closest(".logout");
            if (logoutBtn) {
                e.preventDefault();
                cerrarSesion();
            }
        });
    }
}

// ==============================
// 🚀 CARGAR DESTINOS
// ==============================
async function cargarDestinos() {
    const contenedor = document.getElementById("listaDestinos");

    if (contenedor) {
        contenedor.innerHTML = "<div class='loading-spinner'>✨ Cargando destinos...</div>";
    }

    try {
        const res = await fetch("http://localhost:3000/destinos");

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();
        destinosGlobal = data;
        mostrarDestinos(destinosGlobal);

    } catch (error) {
        console.error("❌ Error cargando destinos:", error);
        if (contenedor) {
            contenedor.innerHTML = "<p class='error-message'>⚠️ Error cargando destinos</p>";
        }
    }
}

// ==============================
// MOSTRAR DESTINOS
// ==============================
function obtenerImagen(destino) {
    if (!destino || !destino.imagenes) return IMG_FALLBACK;

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
        return imagen || IMG_FALLBACK;
    } catch (error) {
        return IMG_FALLBACK;
    }
}

function mostrarDestinos(lista) {
    const contenedor = document.getElementById("listaDestinos");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = "<p class='no-results'>No hay destinos disponibles</p>";
        return;
    }

    lista.forEach(destino => {
        const imagen = obtenerImagen(destino);
        contenedor.innerHTML += `
        <div class="card" onclick="verDetalle('${destino.id}')">
            <img src="${imagen}" alt="${destino.nombre}" loading="lazy">
            <h3>${destino.nombre || "Sin nombre"}</h3>
            <p class="precio">$${Number(destino.precio || 0).toLocaleString()}</p>
        </div>`;
    });
}

// ==============================
// DETALLE
// ==============================
function verDetalle(id) {
    destinoActual = destinosGlobal.find(d => String(d.id) === String(id));
    if (!destinoActual) return;

    const campos = ["detalleNombre", "detallePrecio", "detalleDescripcion", "detalleCategoria", "detalleClima", "detalleRating", "detalleNombreOverlay"];
    const valores = [destinoActual.nombre, Number(destinoActual.precio || 0).toLocaleString(), destinoActual.descripcion, destinoActual.categoria, destinoActual.clima, destinoActual.rating, destinoActual.nombre];
    
    campos.forEach((campo, i) => {
        const el = document.getElementById(campo);
        if (el) el.textContent = valores[i] || "";
    });

    let imagenes = [];
    try {
        if (typeof destinoActual.imagenes === "string") {
            imagenes = JSON.parse(destinoActual.imagenes);
        } else if (Array.isArray(destinoActual.imagenes)) {
            imagenes = destinoActual.imagenes;
        }
    } catch (e) {}

    imagenes = imagenes.map(img => img && !img.startsWith("http") ? `http://localhost:3000${img}` : img || IMG_FALLBACK);
    const [img0, img1, img2] = [imagenes[0] || IMG_FALLBACK, imagenes[1] || IMG_FALLBACK, imagenes[2] || IMG_FALLBACK];

    const principal = document.getElementById("detalleImagen");
    if (principal) principal.src = img0;
    
    ["mini1", "mini2", "mini3"].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.src = [img0, img1, img2][i];
    });

    document.getElementById("detalleDestino")?.classList.remove("oculto");
}

function cambiarImagen(img) {
    const principal = document.getElementById("detalleImagen");
    if (principal) principal.src = img.src;
}

function cerrarDetalle() {
    document.getElementById("detalleDestino")?.classList.add("oculto");
    destinoActual = null;
}

// ==============================
// RESERVA - CORREGIDO CON VALIDACIÓN DE FECHAS
// ==============================
function reservarDestino() {
    if (!usuarioActual.autenticado) {
        mostrarModalAuth();
        return;
    }
    
    if (!destinoActual) {
        alert("❌ Selecciona un destino primero");
        return;
    }
    
    // Configurar fecha mínima (hoy) y máxima (6 meses después)
    const hoy = new Date();
    const fechaMin = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    
    const fechaMax = new Date();
    fechaMax.setMonth(fechaMax.getMonth() + 6);
    const fechaMaxStr = `${fechaMax.getFullYear()}-${String(fechaMax.getMonth()+1).padStart(2,'0')}-${String(fechaMax.getDate()).padStart(2,'0')}`;
    
    const fechaInput = document.getElementById("reservaFecha");
    if (fechaInput) {
        fechaInput.min = fechaMin;
        fechaInput.max = fechaMaxStr;
    }
    
    const nombreSpan = document.getElementById("reservaDestinoNombre");
    if (nombreSpan) nombreSpan.textContent = destinoActual.nombre;
    
    // Limpiar campos anteriores
    const fechaField = document.getElementById("reservaFecha");
    const personasField = document.getElementById("reservaPersonas");
    const notasField = document.getElementById("reservaNotas");
    
    if (fechaField) fechaField.value = '';
    if (personasField) personasField.value = '1';
    if (notasField) notasField.value = '';
    
    const modal = document.getElementById("modalReserva");
    if (modal) modal.classList.remove("oculto");
}

function cerrarModalReserva() {
    const modal = document.getElementById("modalReserva");
    if (modal) {
        modal.classList.add("oculto");
    }
}

// ==============================
// ENVIAR RESERVA
// ==============================
async function enviarReserva(e) {
    e.preventDefault();
    if (!usuarioActual.autenticado) {
        mostrarModalAuth();
        return;
    }
    
    const fecha = document.getElementById("reservaFecha")?.value;
    const personas = document.getElementById("reservaPersonas")?.value;
    const notas = document.getElementById("reservaNotas")?.value;
    
    // Validaciones
    if (!fecha) {
        alert("❌ Por favor selecciona una fecha para el viaje");
        return;
    }
    
    if (!personas || personas < 1) {
        alert("❌ Por favor indica el número de personas (mínimo 1)");
        return;
    }
    
    if (personas > 20) {
        alert("❌ El máximo de personas por reserva es 20");
        return;
    }
    
    // Validar que la fecha no sea pasada
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
        alert("❌ No se pueden hacer reservas para fechas pasadas");
        return;
    }
    
    // Validar que no sea más de 6 meses
    const fechaMax = new Date();
    fechaMax.setMonth(fechaMax.getMonth() + 6);
    if (fechaSeleccionada > fechaMax) {
        alert("❌ Las reservas solo se pueden hacer con máximo 6 meses de anticipación");
        return;
    }
    
    // Calcular fecha fin (3 días después por defecto)
    const fechaFin = new Date(fechaSeleccionada);
    fechaFin.setDate(fechaFin.getDate() + 3);
    const fechaFinStr = fechaFin.toISOString().split('T')[0];
    
    // Obtener nombre del usuario desde localStorage
    const nombreUsuario = localStorage.getItem('nombre') || '';
    const emailUsuario = localStorage.getItem('email') || '';
    const userId = localStorage.getItem('userId');
    
    try {
        const reserva = {
            usuario_id: userId,
            destino_id: destinoActual.id,
            nombre_cliente: nombreUsuario,
            email: emailUsuario,
            destino: destinoActual.nombre,
            fecha_inicio: fecha,
            fecha_fin: fechaFinStr,
            personas: parseInt(personas),
            precio_total: destinoActual.precio * parseInt(personas),
            estado: "pendiente",
            created_at: new Date().toISOString()
        };
        
        console.log("📝 Enviando reserva:", reserva);
        
        const response = await fetch("http://localhost:3000/reservas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reserva)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log("✅ Reserva creada:", result);
            
            alert(`✅ ¡Reserva confirmada!\n\nDestino: ${destinoActual.nombre}\nFecha de inicio: ${new Date(fecha).toLocaleDateString('es-CO')}\nFecha de fin: ${new Date(fechaFinStr).toLocaleDateString('es-CO')}\nPersonas: ${personas}\nTotal: $${(destinoActual.precio * personas).toLocaleString()}\n\nPuedes ver tus reservas en el historial.`);
            
            cerrarModalReserva();
            
            // Preguntar si quiere ver historial
            if (confirm("¿Ver tus reservas ahora?")) {
                window.location.href = "historial.html";
            }
        } else {
            const error = await response.text();
            console.error("Error del servidor:", error);
            alert("❌ Error al crear la reserva. Intenta nuevamente.");
        }
    } catch (error) {
        console.error("Error en reserva:", error);
        alert("❌ Error de conexión con el servidor");
    }
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
    agregarMensaje("✍️ Escribiendo...", "bot");
    
    try {
        const res = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensaje: pregunta })
        });
        const data = await res.json();
        const chat = document.getElementById("chatMensajes");
        if (chat?.lastChild) chat.removeChild(chat.lastChild);
        agregarMensaje(data.respuesta || "No entendí 😅", "bot");
    } catch (error) {
        const chat = document.getElementById("chatMensajes");
        if (chat?.lastChild) chat.removeChild(chat.lastChild);
        agregarMensaje("Error con el servidor 😢", "bot");
    }
}

// ==============================
// INICIALIZAR
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 App iniciada");
    const currentPage = window.location.pathname;
    
    if (currentPage.includes("index.html") || currentPage === "/" || currentPage.endsWith("/")) {
        cargarDestinos();
        inicializarMenuUsuario();
        inicializarModal();
        
        const buscador = document.getElementById("buscar");
        if (buscador) {
            buscador.addEventListener("input", (e) => {
                const termino = e.target.value.toLowerCase();
                const filtrados = destinosGlobal.filter(d => 
                    d.nombre?.toLowerCase().includes(termino) ||
                    d.categoria?.toLowerCase().includes(termino)
                );
                mostrarDestinos(filtrados);
            });
        }
        
        const formReserva = document.getElementById("formReserva");
        if (formReserva) formReserva.addEventListener("submit", enviarReserva);
        
    } else if (currentPage.includes("login.html")) {
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;
                const result = await iniciarSesion(email, password);
                if (!result.success) alert(`❌ ${result.error}`);
            });
        }
    } else if (currentPage.includes("registro.html")) {
        const registroForm = document.getElementById("registroForm");
        if (registroForm) {
            registroForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const nombre = document.getElementById("nombre").value;
                const apellido = document.getElementById("apellido").value;
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;
                if (password.length < 6) {
                    alert("❌ La contraseña debe tener al menos 6 caracteres");
                    return;
                }
                const result = await registrarUsuario(nombre, apellido, email, password);
                if (!result.success) alert(`❌ ${result.error}`);
            });
        }
    }
});