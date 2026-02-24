import { buyTicket } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  const seanceId = Number(params.get('seanceId'));
  const ticketDate = params.get('date');
  const seatsParam = params.get('seats');

  if (!seanceId || !ticketDate || !seatsParam) {
    alert('Некорректные данные бронирования');
    window.location.href = 'index.html';
    return;
  }

  const getCodeBtn = document.querySelector('.pay-btn');
  const qrWrapper = document.getElementById('qrWrapper');
  const qrContainer = document.getElementById('qrcode');
  const priceRow = document.querySelector('#priceRow');
  const note = document.querySelector('.note');

  // --- парсим места ---
  const tickets = seatsParam.split(',').map(seat => {
    const [row, place] = seat.split('-');
    return {
      row: Number(row),
      place: Number(place),
      coast: 100 
    };
  });

  // --- вывод информации ---
  document.getElementById('seats').textContent =
    tickets.map(t => `${t.row}-${t.place}`).join(', ');

  document.getElementById('price').textContent =
    tickets.reduce((sum, t) => sum + t.coast, 0);

  // --- обработка покупки ---
  getCodeBtn.addEventListener('click', async () => {
    try {
      const ticketData = {
        seanceId,
        ticketDate,
        tickets
      };

      console.log('Отправляем на сервер:');
      console.log(JSON.stringify(ticketData, null, 2));

      const response = await buyTicket(ticketData);

      const boughtTickets = response.result.tickets;

      if (!boughtTickets || !boughtTickets.length) {
        alert('Ошибка покупки билета');
        return;
      }

      const bookingCode = `TICKET-${boughtTickets[0].id}`;

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
      alert(error.message || 'Ошибка при покупке билета');
    }
  });
});