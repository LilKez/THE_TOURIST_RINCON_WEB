const API_URL = 'http://localhost:3000';

let destinos = [];

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    mostrarSeccion('destinos');
    cargarDestinos();
    cargarPerfiles();
    cargarReservas();
});

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    document.getElementById(seccion).classList.add('activa');
}

// DESTINOS DESDE SUPABASE
async function cargarDestinos() {
    const lista = document.getElementById('listaDestinosAdmin');
    lista.innerHTML = '<p>Cargando destinos...</p>';

    try {
        const res = await fetch(`${API_URL}/destinos`);
        const data = await res.json();

        destinos = data;
        lista.innerHTML = '';

        destinos.forEach(destino => {
            const card = document.createElement('div');
            card.className = 'destino-card';

            card.innerHTML = `
            <h3>${destino.nombre}</h3>
            <p>${destino.descripcion}</p>
            <p>Precio: $${destino.precio}</p>
            <div class="card-buttons">
            <button class="edit-btn" onclick="editarDestino(${destino.id})">Editar</button>
            <button class="delete-btn" onclick="eliminarDestino(${destino.id})">Eliminar</button>
            </div>
            `;

            lista.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        lista.innerHTML = '<p>Error cargando destinos</p>';
    }
}

// MODAL DESTINO (VENTANA EMERGENTE PARA CREAR O EDITAR DESTINOS)
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

// GUARDAR (POST / PUT)
document.getElementById('formDestino').addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('destinoId').value;

    const destinoData = {
        nombre: document.getElementById('destinoNombre').value,
        pais: document.getElementById('destinoPais').value,
        categoria: document.getElementById('destinoCategoria').value,
        clima: document.getElementById('destinoClima').value,
        precio: parseInt(document.getElementById('destinoPrecio').value),
        rating: parseFloat(document.getElementById('destinoRating').value),
        descripcion: document.getElementById('destinoDescripcion').value
    };

    try {
        if (id) {
            // EDITAR DESTINO
            await fetch(`${API_URL}/destinos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(destinoData)
            });
        } else {
            // CREAR NUEVO DESTINO
            await fetch(`${API_URL}/destinos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(destinoData)
            });
        }

        cargarDestinos();
        cerrarModalDestino();

    } catch (error) {
        console.error(error);
    }
});

function editarDestino(id) {
    abrirModalDestino(id);
}

// ELIMINAR DESTINO
async function eliminarDestino(id) {
    if (confirm('¿Eliminar este destino?')) {
        try {
            await fetch(`${API_URL}/destinos/${id}`, {
                method: 'DELETE'
            });

            cargarDestinos();
        } catch (error) {
            console.error(error);
        }
    }
}

// PERFILES (USUARIOS)
async function cargarPerfiles() {
    const lista = document.getElementById('listaUsuarios');
    lista.innerHTML = '<p>Cargando usuarios...</p>';

    try {
        const res = await fetch(`${API_URL}/perfiles`);
        const perfiles = await res.json();

        lista.innerHTML =
    '<h3>Usuarios registrados:</h3><div class="usuarios-grid">' +
    perfiles.map(u => `
        <div class="usuario-card">
            <h3><i class="fa fa-user"></i> ${u.nombre} ${u.apellido}</h3>
            <p><i class="fa fa-envelope"></i> ${u.email}</p>
            <span class="rol ${u.rol}">${u.rol}</span>
        </div>
    `).join('') +
    '</div>';

    } catch (error) {
        console.error(error);
        lista.innerHTML = '<p>Error cargando usuarios</p>';
    }
}

// RESERVAS (conectadas al backend)
async function cargarReservas() {
    const tbody = document.getElementById('listaReservas');
    tbody.innerHTML = '<tr><td colspan="8">Cargando reservas...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/reservas`);
        const reservas = await res.json();

        tbody.innerHTML = '';

        if (!reservas || reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No hay reservas registradas</td></tr>';
            return;
        }

        reservas.forEach(reserva => {
            const row = document.createElement('tr');

            // Estado con clase CSS
            const estadoClass = reserva.estado ? reserva.estado.toLowerCase() : 'pendiente';
            const estadoText = reserva.estado || 'Pendiente';

            row.innerHTML = `
                <td>${reserva.nombre_cliente || 'N/A'}</td>
                <td>${reserva.email_cliente || 'N/A'}</td>
                <td>${reserva.destino || 'N/A'}</td>
                <td>${reserva.fecha_inicio || 'N/A'} - ${reserva.fecha_fin || 'N/A'}</td>
                <td>${reserva.numero_personas || 'N/A'}</td>
                <td>$${reserva.precio_total ? Number(reserva.precio_total).toLocaleString() : 'N/A'}</td>
                <td><span class="estado ${estadoClass}">${estadoText}</span></td>
                <td class="acciones">
                    <button class="edit-btn" onclick="editarReserva('${reserva.id}')">
                        <i class="fa fa-pen"></i>
                    </button>
                    <button class="delete-btn" onclick="eliminarReserva('${reserva.id}')">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error cargando reservas:', error);
        tbody.innerHTML = '<tr><td colspan="8">Error cargando reservas</td></tr>';
    }
}

// EDITAR RESERVA
function editarReserva(id) {
    alert(`Función editar reserva en desarrollo. ID: ${id}\n\nPróximamente podrás cambiar el estado de la reserva.`);
}

// ELIMINAR RESERVA
async function eliminarReserva(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
        try {
            const res = await fetch(`${API_URL}/reservas/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Reserva eliminada correctamente');
                cargarReservas(); // Recargar la lista
            } else {
                alert('Error eliminando la reserva');
            }
        } catch (error) {
            console.error('Error eliminando reserva:', error);
            alert('Error eliminando la reserva');
        }
    }
}

// LOGOUT (ELIMINAR TOKEN Y REDIRIGIR)
function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
}