import { buyTicket } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const bookingParam = params.get('booking');
  
  if (!bookingParam) {
    alert('Данные бронирования не найдены');
    window.location.href = 'index.html';
    return;
  }
  
  const booking = JSON.parse(decodeURIComponent(bookingParam));

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
        const ticketData = {
          seanceId: Number(booking.seanceId),
          ticketDate: booking.ticketDate,
          tickets: booking.tickets.map(t => ({
            row: Number(t.row),
            place: Number(t.place),
            coast: Number(t.coast)
          }))
        };
    
        console.log('Отправляем на сервер:');
        console.log(JSON.stringify(ticketData, null, 2));

        console.log('Дата отправки:', booking.ticketDate);
        console.log('Тип даты:', typeof booking.ticketDate);
    
        const response = await buyTicket(ticketData);
    
        const tickets = response.result.tickets;
    
        if (!tickets.length) {
          alert('Ошибка покупки билета');
          return;
        }
    
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