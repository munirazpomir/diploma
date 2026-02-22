import { request } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const booking = JSON.parse(localStorage.getItem('currentBooking'));

  if (!booking) {
    alert('Данные бронирования не найдены');
    window.location.href = 'index.html';
    return;
  }

  const getCodeBtn = document.querySelector('.pay-btn');
  const qrWrapper = document.getElementById('qrWrapper');
  const qrContainer = document.getElementById('qrcode');
  const priceRow = document.querySelector('#priceRow');
  const note = document.querySelector('.note');

  // вывод выбранной информации
  document.getElementById('movie').textContent = booking.movie;
  document.getElementById('hall').textContent = booking.hall;
  document.getElementById('time').textContent = booking.time;
  document.getElementById('seats').textContent =
    booking.tickets.map(t => `${t.row}-${t.place}`).join(', ');
  document.getElementById('price').textContent =
    booking.tickets.reduce((sum, t) => sum + t.coast, 0);

  getCodeBtn.addEventListener('click', async () => {
    try {
      const response = await request('/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(booking)
      });

      const tickets = response.result.tickets;

      if (!tickets.length) {
        alert('Ошибка покупки билета');
        return;
      }

      // Используем id первого билета как код
      const bookingCode = `TICKET-${tickets[0].id}`;

      qrContainer.innerHTML = '';

      new QRCode(qrContainer, {
        text: bookingCode,
        width: 200,
        height: 200
      });

      qrWrapper.style.display = 'block';
      getCodeBtn.style.display = 'none';
      if (priceRow) priceRow.style.display = 'none';
      if (note) note.style.display = 'none';

    } catch (error) {
      console.error(error);
      alert('Ошибка при отправке билета');
    }
  });
});