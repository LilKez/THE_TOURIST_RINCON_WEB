document.addEventListener('DOMContentLoaded', function() {
    cargarReservas();
});

function cargarReservas() {
    const container = document.getElementById('reservasContainer');
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');

    if (reservas.length === 0) {
        container.innerHTML = '<p>No tienes reservas aún. <a href="index.html">¡Reserva un viaje!</a></p>';
        return;
    }

    container.innerHTML = '';
    reservas.forEach((reserva, index) => {
        const card = document.createElement('div');
        card.className = 'card-reserva';
        card.innerHTML = `
            <img src="https://images.unsplash.com/photo-1586611292717-f828b167408c" alt="${reserva.destino}">
            <div class="reserva-info">
                <h3>${reserva.destino}</h3>
                <p><strong>Fecha de viaje:</strong> ${new Date(reserva.fecha).toLocaleDateString()}</p>
                <p><strong>Personas:</strong> ${reserva.personas}</p>
                <p><strong>Notas:</strong> ${reserva.notas || 'Ninguna'}</p>
                <button class="btn-reserva cancelar" onclick="cancelarReserva(${index})">Cancelar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function cancelarReserva(index) {
    if (confirm('¿Cancelar esta reserva?')) {
        let reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
        reservas.splice(index, 1);
        localStorage.setItem('reservas', JSON.stringify(reservas));
        cargarReservas();
    }
}