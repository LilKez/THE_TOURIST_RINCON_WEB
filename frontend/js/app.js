/* ==============================
   USUARIO ACTUAL (Simulación de estado de autenticación y rol para controlar acceso a funciones como reservar)
================================ */
let usuarioActual = {
    autenticado: false,
    rol: "visitante" // visitante | usuario | admin
};

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

/* =========================
   RENDER DESTINOS (Esto es para mostrar las tarjetas de destinos al cargar la página o al filtrar)
========================= */
function mostrarDestinos(lista) {
    const contenedor = document.getElementById("listaDestinos");
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<p>No se encontraron destinos</p>`;
        return;
    }

    lista.forEach(destino => {
        contenedor.innerHTML += `
            <div class="card" onclick="verDetalle('${destino.id}')">
                <img src="${destino.imagenes[1]}" alt="${destino.nombre}">
                <div class="contenido">
                    <h3>${destino.nombre}</h3>
                    <p>${destino.descripcion}</p>
                    <div class="meta">
                        <span>⭐ ${destino.rating}</span>
                        <span>$ ${destino.precio.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

/* =========================
   BUSCADOR GENERAL (Esto permite filtrar destinos por texto libre y por país, combinando ambos criterios)
========================= */
function buscarDestinos() {
    const texto = document.getElementById("buscarDestino").value.toLowerCase();
    const pais = document.getElementById("buscarPais").value.toLowerCase();

    const filtrados = destinos.filter(d => {
        const coincideTexto =
            d.nombre.toLowerCase().includes(texto) ||
            d.descripcion.toLowerCase().includes(texto) ||
            d.categoria.toLowerCase().includes(texto);

        const coincidePais =
            pais === "" || d.pais.toLowerCase().includes(pais);

        return coincideTexto && coincidePais;
    });

    mostrarDestinos(filtrados);
}

/* =========================
   DETALLE DESTINO (Mostrar información completa al hacer clic en una tarjeta)
========================= */
function verDetalle(id) {
    const destino = destinos.find(d => d.id === id);
    if (!destino) return;

    // Imagen principal
    document.getElementById("detalleImagen").src = destino.imagenes[1];

    // Miniaturas diferentes
    document.getElementById("mini1").src = destino.imagenes[1] || destino.imagenes[0];
    document.getElementById("mini2").src = destino.imagenes[2] || destino.imagenes[0];
    document.getElementById("mini3").src = destino.imagenes[3] || destino.imagenes[0];

    // Título overlay
    document.getElementById("detalleNombreOverlay").textContent = destino.nombre;

    // Información
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


/* =========================
   INIT (esto es para mostrar todo al cargar la página)
========================= */
mostrarDestinos(destinos);

/* =========================
    RESERVAR DESTINO
========================= */
function reservarDestino() {
    if (!usuarioActual.autenticado) {
        abrirLoginReq();
        return;
    }

    alert("Reserva realizada con éxito ✈️");
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
    const modal = document.getElementById("modalLoginReq");
    if (!modal) return;
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

    if (token) {
        usuarioActual.autenticado = true;
        usuarioActual.rol = 'usuario';
        accountButton.title = 'Mi cuenta';

        // Al hacer click, mostrar/ocultar el menú de cuenta
        accountButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (menu) menu.classList.toggle('oculto');
        });

        // Enlace de logout dentro del menú
        const logoutLink = document.querySelector('#accountMenu .logout');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(ev) {
                ev.preventDefault();
                if (menu) menu.classList.add('oculto');
                cerrarSesion();
            });
        }
    } else {
        accountButton.title = 'Iniciar sesión';
        accountButton.addEventListener('click', function() { window.location.href = 'login.html'; });
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

    // Handlers para formularios de registro y login (comunican con el backend)
    document.addEventListener('DOMContentLoaded', function() {
        const registroForm = document.getElementById('registroForm');
        if (registroForm) {
            registroForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const nombre = document.getElementById('nombre')?.value?.trim();
                const apellido = document.getElementById('apellido')?.value?.trim();
                const email = document.getElementById('email')?.value?.trim();
                const password = document.getElementById('password')?.value;

                try {
                    const res = await fetch('/registrar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email, password })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        alert(data.error || data.message || 'Error en el registro');
                        return;
                    }
                    alert('Registro exitoso. Serás redirigido al login.');
                    window.location.href = 'login.html';
                } catch (err) {
                    console.error('Error registrando:', err);
                    alert('No se pudo conectar con el servidor. Intenta más tarde.');
                }
            });
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const email = document.getElementById('email')?.value?.trim();
                const password = document.getElementById('password')?.value;

                try {
                    const res = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email, password })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        alert(data.error || 'Credenciales inválidas');
                        return;
                    }
                    // Guardar token y estado de usuario
                    if (data.token) localStorage.setItem('token', data.token);
                    usuarioActual.autenticado = true;
                    usuarioActual.rol = 'usuario';
                    alert('Inicio de sesión exitoso');
                    window.location.href = 'index.html';
                } catch (err) {
                    console.error('Error login:', err);
                    alert('No se pudo conectar con el servidor. Intenta más tarde.');
                }
            });
        }
    });

    document.addEventListener("DOMContentLoaded", () => {

    const accountBtn = document.getElementById("accountBtn");
    const accountMenu = document.getElementById("accountMenu");
    const logoutBtn = document.querySelector(".logout");

    //  Abrir / cerrar menú
    if (accountBtn && accountMenu) {
        accountBtn.addEventListener("click", () => {
            accountMenu.classList.toggle("oculto");
        });
    }

    // Cerrar sesión
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }

});
