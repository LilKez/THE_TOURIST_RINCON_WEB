document.addEventListener('DOMContentLoaded', function() {
    cargarHistorial();
});

function cargarHistorial() {
    const container = document.getElementById('historialContainer');
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');

    if (reservas.length === 0) {
        container.innerHTML = '<p>No tienes historial de reservas. <a href="index.html">¡Haz tu primera reserva!</a></p>';
        return;
    }

    container.innerHTML = '';
    reservas.forEach(reserva => {
        const item = document.createElement('div');
        item.className = 'reserva-item';
        item.innerHTML = `
            <div>
                <h3>${reserva.destino}</h3>
                <p>Fecha de viaje: ${new Date(reserva.fecha).toLocaleDateString()}</p>
                <p>Personas: ${reserva.personas}</p>
            </div>
            <div class="meta">
                <span class="estado ok">Confirmada</span>
                <span>$1.500.000</span> <!-- Placeholder -->
            </div>
        `;
        container.appendChild(item);
    });
}