// 1. CONFIGURACIÓN
const SUPABASE_URL = "https://zznylyznxkfvwockczck.supabase.co";
const SUPABASE_KEY = "sb_publishable_TY-D-APBQDoCs98DN35Ljw_594qqAxF";

// Verificamos si la librería cargó antes de intentar usarla
let _supabase;
if (typeof supabase !== 'undefined') {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Supabase cargado correctamente");
} else {
    console.error("❌ Error: La librería de Supabase no se ha detectado. Revisa el orden en tu HTML.");
}

/* ==============================
   USUARIO ACTUAL (Simulación de estado de autenticación y rol para controlar acceso a funciones como reservar)
================================ */
let usuarioActual = {
    autenticado: false, // true si el usuario ha iniciado sesión, false si es un visitante
    rol: "visitante" // visitante | usuario | admin
};

let destinoActual = null; // Para guardar el destino seleccionado

// Crear usuario admin por defecto si no existe
let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
if (!usuarios.find(u => u.email === 'admin@admin.com')) {
    usuarios.push({ nombre: 'Admin', apellido: 'Admin', email: 'admin@admin.com', password: 'admin123' });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// Verificar si hay token para mantener sesión
const token = localStorage.getItem('token');
if (token) {
    usuarioActual.autenticado = true;
    usuarioActual.rol = localStorage.getItem('rol') || 'usuario';
}

/* =========================
   LOGIN OBLIGATORIO
========================= */
function abrirLogin() {
    document.getElementById("loginModal").classList.remove("oculto");
}

function cerrarLogin() {
    document.getElementById("loginModal").classList.add("oculto");
}

/* =========================
   DATA DESTINOS (Esta es la base de datos simulada de destinos turísticos, 
   con toda la información necesaria para mostrar en la aplicación)
========================= */
const destinos = [
{
    id: "cartagena",
    nombre: "Cartagena",
    pais: "colombia",
    categoria: "playa",
    clima: "cálido",
    precio: 1500000,
    rating: 4.8,
    imagenes: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/f6/92/cd/cartagena-colombia.jpg?w=400&h=-1&s=1",
      "https://itinari-images.s3.eu-west-1.amazonaws.com/activity/images/original/7db9aeec-3a83-459a-8a43-da6d2b6c59ff-istock-683355900.jpg",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/8d/4a/60/castillo-de-san-felipe.jpg?h=500&s=1&w=900",
      "https://images.adsttc.com/media/images/594b/fc1c/b22e/3898/a700/05a4/large_jpg/26482014295_9a6b9cc855_k.jpg?1498151950=",
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/b3/35/98/cartagena-de-indias.jpg?h=500&s=1&w=900"
    ],
    descripcion: "Ciudad amurallada con playas caribeñas."
},
{
    id: "santa-marta",
    nombre: "Santa Marta",
    pais: "colombia",
    categoria: "naturaleza",
    clima: "cálido",
    precio: 1200000,
    rating: 4.6,
    imagenes: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        "https://motionarray.imgix.net/motion-array-2405173-dACsL0SawG-high_0000.jpg?auto=format&fit=max&q=60&w=660",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/fc/5d/cf/caption.jpg?h=1200&s=1&w=1200",
        "https://i.pinimg.com/originals/5b/3c/0d/5b3c0dbef55eefb2c93dda1256953f51.jpg"
    ],
    descripcion: "Playas, naturaleza y Sierra Nevada."
},
{
    id: "medellin",
    nombre: "Medellín",
    pais: "colombia",
    categoria: "ciudad",
    clima: "templado",
    precio: 1000000,
    rating: 4.7,
    imagenes: [
        "https://images.openai.com/thumbnails/url/U7h3rHicu5meUVJSUGylr5-al1xUWVCSmqJbkpRnoJdeXJJYkpmsl5yfq5-Zm5ieWmxfaAuUsXL0S7F0Tw5Jc_QzS9c1zijKr6pKTgkI94xwzHEydjF3MvcMinIKK8tMLysPrtQNCK5IVyu2NTQAAAdNJQU",
        "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/5f/26/2c.jpg",
        "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/5f/26/30.jpg",
        "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/5f/26/3a.jpg"
    ],
    descripcion: "La ciudad de la eterna primavera."
},
{
    id: "cali",
    nombre: "Cali",
    pais: "colombia",
    categoria: "cultural",
    clima: "cálido tropical",
    rating: 4.6,
    precio: 850000,
    imagenes: [
        "https://www.cali.gov.co/info/caligovco_se/media/pubInt/thumbs/thpubInt_700X400_186322.webp",
        "https://www.cali.gov.co/info/caligovco_se/media/galeria/thumbs/thgaleria_220X220_319638.webp",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8nF8EttXBrm88c7R3D0LRDdAYQJBGVU0Wqg&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdihinyPu2xNOmmeB1NpqiKS1FCyqRshUtCscEorEezA&s"
    ],
    descripcion: "Capital mundial de la salsa y vida nocturna vibrante."
},
{
    id: "barranquilla",
    nombre: "Barranquilla",
    pais: "colombia",
    categoria: "cultural",
    clima: "cálido",
    rating: 4.5,
    precio: 780000,
    imagenes: [
        "https://www.tripadvisor.co/AttractionProductReview-g297476-d19868753-Barranquilla_Puerto_Colombia_city_tour-Cartagena_Cartagena_District_Bolivar_Depart.html",
        "https://probarranquilla.org/wp-content/uploads/2022/10/Banner-barranquilla5.jpg",
        "https://xixerone.com/wp-content/uploads/2019/04/Las-15-mejores-atracciones-que-ver-en-Barranquilla-Colombia.jpg",
        "https://www.policia.gov.co/sites/default/files/2025-04/Banner%20de%20la%20Metropolitana%20de%20Barranquilla.jpg"
    ],
    descripcion: "Ciudad alegre famosa por su Carnaval."
},
{
    id: "bogota",
    nombre: "Bogotá",
    pais: "colombia",
    categoria: "ciudad",
    clima: "frío templado",
    rating: 4.7,
    precio: 920000,
    imagenes: [
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/4b/86/ee/caption.jpg?w=300&h=300&s=1",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/b4/9b/52/museo-del-oro.jpg?w=500&h=-1&s=1",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/32/11/40/parque-central-simon.jpg?w=700&h=400&s=1",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/45/7e/4d/caption.jpg?w=800&h=400&s=1"
    ],
    descripcion: "Capital de Colombia con historia, cultura y modernidad."
},
{
    id: "san-andres",
    nombre: "San Andrés",
    pais: "colombia",
    categoria: "playa",
    clima: "cálido",
    rating: 4.9,
    precio: 1200000,
    imagenes: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Johnny_Cay.jpg/960px-Johnny_Cay.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Hotel_Sunrise_San_Andres_Colombia.jpg/330px-Hotel_Sunrise_San_Andres_Colombia.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Panor%C3%A1mica_de_San_Andres.JPG/330px-Panor%C3%A1mica_de_San_Andres.JPG",
        "https://www.tripadvisor.co/Tourism-g297482-San_Andres_Island_San_Andres_and_Providencia_Department-Vacations.html"
    ],
    descripcion: "Isla caribeña famosa por su mar de siete colores."
},
{
    id: "nevado-del-ruiz",
    nombre: "Nevado del Ruiz",
    pais: "colombia",
    categoria: "montaña",
    clima: "frío de alta montaña",
    rating: 4.7,
    precio: 1050000,
    imagenes: [
        "https://www.lapatria.com/sites/default/files/noticia/2025-03/granizada%20volcan%20nevado%20del%20ruiz%2002_0.jpeg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLhsKZIgZ2gRUeoI-yg7DgDZUY7UDEgLgkbA&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrRbhv6ZJfRj6T_O5dHC5CTQRGnpYgJ5cxQg&s",
        "https://www.piensageotermia.com/wp-content/uploads/2017/03/Macizo_VolcanicoDelRuiz_Columbia.jpg"
    ],
    descripcion: "Volcán nevado ideal para aventura y alta montaña."
}
];

// Cargar destinos desde localStorage si existen (sincronizado con admin)
if (localStorage.getItem('destinosAdmin')) {
    const destinosAdmin = JSON.parse(localStorage.getItem('destinosAdmin'));
    // Reemplazar el array
    destinos.splice(0, destinos.length, ...destinosAdmin);
}

/* =========================
   RENDER DESTINOS
========================= */
function renderDestinos(destinos) {
    const contenedor = document.getElementById("listaDestinosAdmin");
    contenedor.innerHTML = "";

    destinos.forEach(destino => {

        // ✅ FIX mínimo
        const imagen = (destino.imagenes && destino.imagenes.length > 0)
            ? destino.imagenes[0]
            : "../img/default.jpg";

        contenedor.innerHTML += `
            <div class="destino-card">
                <img src="${imagen}" onerror="this.src='../img/default.jpg'">
                <h3>${destino.nombre}</h3>
                <p>${destino.pais}</p>

                <button>Editar</button>
                <button>Eliminar</button>
            </div>
        `;
    });
}

/* =========================
   BUSCADOR GENERAL (Filtra destinos por texto libre; incluye nombre, descripción, categoría y país)
========================= */
function buscarDestinos() {
    const texto = document.getElementById("buscar").value.toLowerCase();

    const filtrados = destinos.filter(d => {
        // buscamos en nombre, descripción, categoría y país
        return (
            d.nombre.toLowerCase().includes(texto) ||
            d.descripcion.toLowerCase().includes(texto) ||
            d.categoria.toLowerCase().includes(texto) ||
            d.pais.toLowerCase().includes(texto)
        );
    });

    mostrarDestinos(filtrados);
}

    const buscarInput = document.getElementById('buscar');
    const buscarBtn = document.querySelector('.icon-buscar-btn');

    function attachSearchListeners() {
        if (buscarInput) {
            // Permitir buscar al presionar Enter
            buscarInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    // Si el botón de buscar existe, simular click; si no, llamar directamente a la función de búsqueda
                    if (buscarBtn) {
                        buscarBtn.click();
                    } else {
                        buscarDestinos();
                    }
                }
            });
        }
        if (buscarBtn) {
            buscarBtn.addEventListener('click', buscarDestinos);
        }
    }

    attachSearchListeners();

/* =========================
   DETALLE DESTINO
========================= */
function verDetalle(id) {
    console.log('verDetalle called with id:', id);
    const destino = destinos.find(d => d.id === id);
    if (!destino) {
        console.error('Destino no encontrado para id:', id);
        return;
    }

    destinoActual = destino;

    /*=========================== 
    FIX mínimo (fix es para asegurar que si no hay imágenes, no rompa la página y muestre una imagen por defecto) 
    =============================0*/
    document.getElementById("detalleImagen").src =
        destino.imagenes?.[0] || "../img/default.jpg";

    document.getElementById("mini1").src =
        destino.imagenes?.[0] || "../img/default.jpg";

    document.getElementById("mini2").src =
        destino.imagenes?.[1] || destino.imagenes?.[0] || "../img/default.jpg";

    document.getElementById("mini3").src =
        destino.imagenes?.[2] || destino.imagenes?.[0] || "../img/default.jpg";

    document.getElementById("detalleNombreOverlay").textContent = destino.nombre;

    document.getElementById("detalleNombre").textContent = destino.nombre;
    document.getElementById("detalleDescripcion").textContent = destino.descripcion;
    document.getElementById("detalleCategoria").textContent = destino.categoria;
    document.getElementById("detalleClima").textContent = destino.clima;
    document.getElementById("detalleRating").textContent = destino.rating;
    document.getElementById("detallePrecio").textContent = destino.precio.toLocaleString();

    document.getElementById("detalleDestino").classList.remove("oculto");
}

/* =========================
   CERRAR DETALLE
========================= */
function cerrarDetalle() {
    document.getElementById("detalleDestino").classList.add("oculto");
}

/*==========================
    Ventanda emergente (Modal) de detalles
=========================== */
function abrirModal(titulo, imagen, descripcion, rating, precio) {
    document.getElementById("modalTitulo").innerText = titulo;
    document.getElementById("modalImagen").src = imagen;
    document.getElementById("modalDescripcion").innerText = descripcion;
    document.getElementById("modalRating").innerText = rating;
    document.getElementById("modalPrecio").innerText = precio;

    const modalDet = document.getElementById("modalDetalles");
    if (modalDet) {
        modalDet.classList.remove('oculto');
        document.body.classList.add('no-scroll');
    }
}

function cerrarModal() {
    const modalDet = document.getElementById("modalDetalles");
    if (modalDet) {
        modalDet.classList.add('oculto');
        document.body.classList.remove('no-scroll');
    }
}



                console.log('destinoActual recuperado desde detalle:', destinoActual.nombre);
            }
        }
    }

    if (!destinoActual) {
        console.warn('No hay destino seleccionado; no se puede reservar');
        alert('Selecciona un destino antes de reservar.');
        return;
    }

    const modalReserva = document.getElementById('modalReserva');
    if (!modalReserva) {
        console.error('No se encontró modalReserva en la página');
        alert('Error: no se puede abrir el modal de reserva. Revisa la consola.');
        return;
    }

    console.log('Abriendo modal de reserva para', destinoActual.nombre);
    const destinoNombre = destinoActual.nombre;
    document.getElementById('reservaDestinoNombre').textContent = destinoNombre;
    modalReserva.classList.remove('oculto');

    // Cerrar el detalle del destino
    cerrarDetalle();
}

function cerrarModalReserva() {
    document.getElementById('modalReserva').classList.add('oculto');
}



/* =========================
   BOT TURÍSTICO (Cascara de chatbot simple para responder preguntas frecuentes sobre destinos)
========================= */
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

function preguntarBot() {
    const input = document.getElementById("preguntaBot");
    const pregunta = input.value.toLowerCase().trim();
    if (!pregunta) return;

    agregarMensaje(input.value, "user");
    input.value = "";

    let respuesta = "No entendí tu pregunta 🤔";

    if (pregunta.includes("barato")) {
        const barato = destinos.reduce((a, b) => a.precio < b.precio ? a : b);
        respuesta = `El destino más barato es ${barato.nombre} con un precio aproximado de $${barato.precio.toLocaleString()}.`;
    }

    else if (pregunta.includes("mejor rating")) {
        const mejor = destinos.reduce((a, b) => a.rating > b.rating ? a : b);
        respuesta = `El destino mejor calificado es ${mejor.nombre} con ⭐ ${mejor.rating}.`;
    }

    else if (pregunta.includes("playa")) {
        const playas = destinos.filter(d => d.categoria === "playa");
        respuesta = `Destinos de playa recomendados: ${playas.map(d => d.nombre).join(", ")}.`;
    }

    else if (pregunta.includes("colombia")) {
        respuesta = `Tenemos ${destinos.length} destinos disponibles en Colombia.`;
    }

    setTimeout(() => agregarMensaje(respuesta, "bot"), 500);
}
/* =========================
   MODAL LOGIN (Ventana emergente para requerir login al intentar reservar)
========================= */
function abrirLoginReq() {
    console.log('abrirLoginReq called');
    const modal = document.getElementById("modalLoginReq");
    if (!modal) {
        console.error('Modal modalLoginReq no encontrado');
        return;
    }
    modal.classList.remove("oculto");
    // bloquear scroll usando clase (evita estilos inline)
    document.body.classList.add('no-scroll');
}

function cerrarLoginReq() {
    const modal = document.getElementById("modalLoginReq");
    if (!modal) return;
    modal.classList.add("oculto");
    document.body.classList.remove('no-scroll');
}

function irLogin() {
    window.location.href = "login.html";
}

function irRegistro() {
    window.location.href = "registro.html";
}


/* =========================
CAMBIAR IMAGEN (Función para cambiar la imagen principal al hacer clic en las miniaturas)
========================= */
function cambiarImagen(imagen) {
    document.getElementById("detalleImagen").src = imagen.src;
}

/* =========================
   PÁGINA PAGO - Funcionalidad del formulario
========================= */
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar campos de tarjeta basado en la selección del método
    const metodoSelect = document.getElementById('metodo');
    const tarjetaCampos = document.getElementById('tarjeta-campos');
    const formularioPago = document.querySelector('.formulario-pago');

    if (metodoSelect) {
        metodoSelect.addEventListener('change', function() {
            if (this.value === 'tarjeta') {
                tarjetaCampos.classList.add('mostrar');
                // Hacer requeridos los campos de tarjeta
                document.getElementById('titular').required = true;
                document.getElementById('numero').required = true;
                document.getElementById('vencimiento').required = true;
                document.getElementById('cvv').required = true;
            } else {
                tarjetaCampos.classList.remove('mostrar');
                // Hacer no-requeridos los campos de tarjeta
                document.getElementById('titular').required = false;
                document.getElementById('numero').required = false;
                document.getElementById('vencimiento').required = false;
                document.getElementById('cvv').required = false;
            }
        });
    }


    // Manejar el envío del formulario
    if (formularioPago) {
        formularioPago.addEventListener('submit', function(e) {
            e.preventDefault();

            const metodo = document.getElementById('metodo').value;
            
            if (!metodo) {
                alert('Por favor selecciona un método de pago');
                return;
            }

            if (!document.getElementById('terminos').checked) {
                alert('Debes aceptar los términos y condiciones');
                return;
            }

            // Validación
            if (metodo === 'tarjeta') {
                if (!validarTarjeta()) return;
            }

            // Simular envío
            alert(`Pago de $1.500.000 enviado por ${metodo} ✓`);
            
            // Redirigir a reservas
            setTimeout(() => {
                window.location.href = 'historial.html';
            }, 1500);
        });
    }
});

// Cerrar sesión: limpiar token y actualizar estado
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    usuarioActual.autenticado = false;
    usuarioActual.rol = 'visitante';
    alert('Sesión cerrada');
    window.location.href = 'index.html';
}

// Detectar token al cargar y ajustar el botón de cuenta (login / logout)
document.addEventListener('DOMContentLoaded', function() {

    const token = localStorage.getItem('token');
    const btn = document.getElementById('accountBtn');
    const menu = document.getElementById('accountMenu');
    if (!btn) return;

    // Asegurarnos de no duplicar listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    const accountButton = document.getElementById('accountBtn');

    // Siempre añadir listener para toggle menú
    accountButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (menu) menu.classList.toggle('oculto');
    });

    // Ajustar menú basado en autenticación
    if (token) {
        usuarioActual.autenticado = true;
        usuarioActual.rol = localStorage.getItem('rol') || 'usuario';
        accountButton.title = 'Mi cuenta';
        let menuHTML = `
            <a href="#">Mi cuenta</a>
            <a href="#">Configuración</a>
            <a href="#">Preferencias</a>
            <a href="#">Notificaciones</a>
            <hr>
            <a href="#" class="logout">Cerrar sesión</a>
        `;
        if (usuarioActual.rol === 'admin') {
            menuHTML = `
                <a href="admin/admin.html">Panel Admin</a>
                <a href="#">Mi cuenta</a>
                <a href="#">Configuración</a>
                <a href="#">Preferencias</a>
                <a href="#">Notificaciones</a>
                <hr>
                <a href="#" class="logout">Cerrar sesión</a>
            `;
        }
        menu.innerHTML = menuHTML;
        // Enlace de logout
        const logoutLink = menu.querySelector('.logout');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(ev) {
                ev.preventDefault();
                menu.classList.add('oculto');
                cerrarSesion();
            });
        }
    } else {
        usuarioActual.autenticado = false;
        usuarioActual.rol = 'visitante';
        accountButton.title = 'Iniciar sesión';
        menu.innerHTML = `
            <a href="login.html">Iniciar sesión</a>
            <a href="registro.html">Registrarse</a>
        `;
    }

    // Cerrar el menú si se hace click fuera
    document.addEventListener('click', function(e) {
        if (menu && !menu.classList.contains('oculto')) {
            if (!menu.contains(e.target) && !accountButton.contains(e.target)) {
                menu.classList.add('oculto');
            }
        }
    });
});

// Validar número de tarjeta (Luhn algorithm simplificado)
function validarTarjeta() {
    const numero = document.getElementById('numero').value.replace(/\s/g, '');
    const vencimiento = document.getElementById('vencimiento').value;
    const cvv = document.getElementById('cvv').value;

    if (!/^\d{13,19}$/.test(numero)) {
        alert('Número de tarjeta inválido');
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
        alert('Formato de vencimiento inválido (MM/AA)');
        return false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        alert('CVV inválido');
        return false;
    }

    return true;
}

// Formatear número de tarjeta mientras se escribe
document.addEventListener('DOMContentLoaded', function() {
    const numeroInput = document.getElementById('numero');
    if (numeroInput) {
        numeroInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Formatear vencimiento MM/AA
    const vencimientoInput = document.getElementById('vencimiento');
    if (vencimientoInput) {
        vencimientoInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
});

    
    document.addEventListener('DOMContentLoaded', function() {
        const registroForm = document.getElementById('registroForm');
        if (registroForm) {
            registroForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre')?.value?.trim();
    const apellido = document.getElementById('apellido')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim().toLowerCase();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Guardar usuario en localStorage para permitir login sin depender de Supabase.
    // (Si Supabase está cargado, también lo guardamos ahí como respaldo).
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarios.push({ nombre, apellido, email, password });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    if (typeof supabase !== 'undefined' && typeof _supabase !== 'undefined') {
        try {
            const { data, error } = await _supabase
                .from('Perfiles') // Asegúrate que en Supabase se llame así con P mayúscula
                .insert([{ nombre, apellido, email, password }]);

            if (error) {
                console.warn('Error guardando en Supabase:', error.message);
            }
        } catch (err) {
            console.warn('Supabase no disponible:', err);
        }
    }

    alert('¡Registro guardado con éxito!');
    window.location.href = 'login.html';
});
        }

        // Manejador para el formulario de LOGIN con Supabase
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email')?.value?.trim().toLowerCase();
        const password = document.getElementById('password')?.value;

<<<<<<< HEAD
                if (!email || !password) {
                    alert('Por favor, completa todos los campos.');
                    return;
                }

        try {
            // BUSCAMOS al usuario en la tabla 'Perfiles' de Supabase
            const { data: usuario, error } = await _supabase
                .from('Perfiles')
                .select('*')
                .eq('email', email)
                .eq('password', password) // En proyectos reales se usa auth.signIn, pero para tu tabla personalizada es así
                .single();

            if (error || !usuario) {
                alert('Credenciales inválidas: El correo o la contraseña no coinciden.');
                console.error('Error de login:', error);
                return;
            }

            // Si el usuario existe, guardamos la sesión
            const token = 'session-' + Date.now();
            localStorage.setItem('token', token);
            localStorage.setItem('rol', (usuario.email === 'admin@admin.com') ? 'admin' : 'usuario');
            localStorage.setItem('usuarioNombre', usuario.nombre);

            alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
            
            // Redirigir según el rol
            if (localStorage.getItem('rol') === 'admin') {
                window.location.href = 'admin/admin.html';
            } else {
                window.location.href = 'index.html';
            }

        } catch (err) {
            console.error('Error inesperado:', err);
            alert('Ocurrió un error al intentar iniciar sesión.');
=======
        if (!email || !password) {
            alert('Por favor, completa todos los campos.');
            return;
>>>>>>> origin/main
        }
    });
}

        try {
            // BUSCAMOS al usuario en la tabla 'Perfiles' de Supabase
            const { data: usuario, error } = await _supabase
                .from('Perfiles')
                .select('*')
                .eq('email', email)
                .eq('password', password) // En proyectos reales se usa auth.signIn, pero para tu tabla personalizada es así
                .single();

            if (error || !usuario) {
                alert('Credenciales inválidas: El correo o la contraseña no coinciden.');
                console.error('Error de login:', error);
                return;
            }

            // Si el usuario existe, guardamos la sesión
            const token = 'session-' + Date.now();
            localStorage.setItem('token', token);
            localStorage.setItem('rol', (usuario.email === 'admin@admin.com') ? 'admin' : 'usuario');
            localStorage.setItem('usuarioNombre', usuario.nombre);

            alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
            
            // Redirigir según el rol
            if (localStorage.getItem('rol') === 'admin') {
                window.location.href = 'admin/admin.html';
            } else {
                window.location.href = 'index.html';
            }

        } catch (err) {
            console.error('Error inesperado:', err);
            alert('Ocurrió un error al intentar iniciar sesión.');
        }
    });
}

        const loginModalForm = document.getElementById('loginModalForm');
        if (loginModalForm) {
            loginModalForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailRaw = document.getElementById('modalEmail')?.value?.trim();
                const email = emailRaw ? emailRaw.toLowerCase() : '';
                const password = document.getElementById('modalPassword')?.value;

                if (!email || !password) {
                    alert('Por favor, completa todos los campos.');
                    return;
                }

                // Simular login local (normalizar correo)
                let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                const user = usuarios.find(u => u.email.toLowerCase() === email && u.password === password);
                if (!user) {
                    alert('Credenciales inválidas');
                    return;
                }
                // Generar token falso
                const token = 'fake-token-' + Date.now();
                localStorage.setItem('token', token);
                usuarioActual.autenticado = true;
                usuarioActual.rol = (email === 'admin@admin.com') ? 'admin' : 'usuario';
                localStorage.setItem('rol', usuarioActual.rol);
                // Cerrar modal y continuar
                cerrarLoginReq();
                // Ahora que está autenticado, abrir el modal de reserva
                reservarDestino();
            });
        }

        const pagoForm = document.querySelector('.formulario-pago');
        if (pagoForm) {
            pagoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Pago confirmado. ¡Disfruta tu viaje!');
                window.location.href = 'reservas.html';
            });
        }

        const formReserva = document.getElementById('formReserva');
        if (formReserva) {
            formReserva.addEventListener('submit', function(e) {
                e.preventDefault();
                const fecha = document.getElementById('reservaFecha').value;
                const personas = document.getElementById('reservaPersonas').value;
                const notas = document.getElementById('reservaNotas').value;
                const destino = document.getElementById('reservaDestinoNombre').textContent;

                // Guardar reserva
                const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
                const reserva = {
                    destino,
                    fecha,
                    personas,
                    notas,
                    usuario: 'Usuario actual',
                    fechaReserva: new Date().toISOString()
                };
                reservas.push(reserva);
                localStorage.setItem('reservas', JSON.stringify(reservas));

                alert('Reserva realizada con éxito ✈️');
                cerrarModalReserva();
                cerrarDetalle(); // Cerrar detalle del destino
            });
        }

        // Mostrar destinos al cargar
        mostrarDestinos(destinos);

        // Aseguramos que el botón de reservar reaccione aunque haya cambios en el DOM
        const botonReserva = document.querySelector('button.reservar');
        if (botonReserva) {
            botonReserva.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('click event en boton.reservar (DOM load)');
                reservarDestino();
            });
            console.log('Listener agregado a button.reservar');
        } else {
            console.warn('No se encontró button.reservar durante el DOMContentLoaded');
        }
        // Función para bloquear fechas anteriores a hoy en el calendario
function configurarFechaMinima() {
    const fechaInput = document.getElementById('reservaFecha');
    if (fechaInput) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        let mm = hoy.getMonth() + 1; // Meses empiezan en 0
        let dd = hoy.getDate();

        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;

        const fechaMinima = `${yyyy}-${mm}-${dd}`;
        fechaInput.setAttribute('min', fechaMinima);
        console.log("📅 Límite de fecha establecido:", fechaMinima);
    }
    }
});
