let destinos = [
    {
        id: "cartagena",
        nombre: "Cartagena",
        pais: "colombia",
        categoria: "playa",
        clima: "cálido",
        precio: 1500000,
        rating: 4.8,
        imagenes: [],
        descripcion: "Ciudad amurallada con playas caribeñas."
    }
];

if (localStorage.getItem('destinosAdmin')) {
    destinos = JSON.parse(localStorage.getItem('destinosAdmin'));
}

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    mostrarSeccion('destinos');
    cargarDestinos();
    cargarUsuarios();
    cargarReservas();
});

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    document.getElementById(seccion).classList.add('activa');
}

function cargarDestinos() {
    const lista = document.getElementById('listaDestinosAdmin');
    lista.innerHTML = '';

    destinos.forEach(destino => {
        const card = document.createElement('div');
        card.className = 'destino-card';

        card.innerHTML = `
            <h3>${destino.nombre}</h3>
            <p>${destino.descripcion}</p>
            <p>Precio: $${destino.precio.toLocaleString()}</p>
            <button class="edit-btn" onclick="editarDestino('${destino.id}')">Editar</button>
            <button class="delete-btn" onclick="eliminarDestino('${destino.id}')">Eliminar</button>
        `;

        lista.appendChild(card);
    });
}

function abrirModalDestino(id = null) {
    const modal = document.getElementById('modalDestino');
    const form = document.getElementById('formDestino');
    const title = document.getElementById('modalTitle');

    if (id) {
        const destino = destinos.find(d => d.id === id);

        if (destino) {
            document.getElementById('destinoId').value = destino.id;
            document.getElementById('destinoNombre').value = destino.nombre;
            document.getElementById('destinoPais').value = destino.pais;
            document.getElementById('destinoCategoria').value = destino.categoria;
            document.getElementById('destinoClima').value = destino.clima;
            document.getElementById('destinoPrecio').value = destino.precio;
            document.getElementById('destinoRating').value = destino.rating;
            document.getElementById('destinoDescripcion').value = destino.descripcion;

            title.textContent = 'Editar Destino';
        }
    } else {
        form.reset();
        document.getElementById('destinoId').value = '';
        title.textContent = 'Añadir Destino';
    }

    modal.classList.remove('oculto');
}

function cerrarModalDestino() {
    document.getElementById('modalDestino').classList.add('oculto');
}

document.getElementById('formDestino').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('destinoId').value;
    const nombre = document.getElementById('destinoNombre').value;
    const pais = document.getElementById('destinoPais').value;
    const categoria = document.getElementById('destinoCategoria').value;
    const clima = document.getElementById('destinoClima').value;
    const precio = parseInt(document.getElementById('destinoPrecio').value);
    const rating = parseFloat(document.getElementById('destinoRating').value);
    const descripcion = document.getElementById('destinoDescripcion').value;

    if (id) {
        const index = destinos.findIndex(d => d.id === id);

        if (index !== -1) {
            destinos[index] = {
                ...destinos[index],
                nombre,
                pais,
                categoria,
                clima,
                precio,
                rating,
                descripcion
            };
        }
    } else {
        const newId = nombre.toLowerCase().replace(/\s+/g, '-');

        destinos.push({
            id: newId,
            nombre,
            pais,
            categoria,
            clima,
            precio,
            rating,
            descripcion,
            imagenes: []
        });
    }

    localStorage.setItem('destinosAdmin', JSON.stringify(destinos));
    cargarDestinos();
    cerrarModalDestino();
});

function editarDestino(id) {
    abrirModalDestino(id);
}

function eliminarDestino(id) {
    if (confirm('¿Eliminar este destino?')) {
        destinos = destinos.filter(d => d.id !== id);
        localStorage.setItem('destinosAdmin', JSON.stringify(destinos));
        cargarDestinos();
    }
}

function cargarUsuarios() {
    const lista = document.getElementById('listaUsuarios');
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    lista.innerHTML =
        '<h3>Usuarios registrados:</h3><ul>' +
        usuarios.map(u => `<li>${u.nombre} ${u.apellido} - ${u.email}</li>`).join('') +
        '</ul>';
}

function cargarReservas() {
    const lista = document.getElementById('listaReservas');
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');

    lista.innerHTML =
        '<h3>Reservas:</h3><ul>' +
        reservas.map(r => `<li>${r.destino} - ${r.usuario} - ${r.fecha}</li>`).join('') +
        '</ul>';
}

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
}