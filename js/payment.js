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
  const paymentTitle = document.getElementById('paymentTitle');

  // вывод выбранной информации
  document.getElementById('movie').textContent = booking.movie;
  document.getElementById('hall').textContent = booking.hall;
  document.getElementById('time').textContent = booking.time;
  document.getElementById('seats').textContent = booking.tickets.map(t => `${t.row}-${t.place}`).join(', ');
  document.getElementById('price').textContent = booking.tickets.reduce((sum, t) => sum + t.coast, 0);
  
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
    
      const response = await buyTicket(ticketData);
        
      const tickets = response.result;
        
      if (!tickets || !tickets.length) {
        alert('Ошибка покупки билета');
        return;
      }
        
      const ticketIds = tickets.map(t => t.id).join(',');
        
      const totalPrice = booking.tickets.reduce((sum, t) => sum + Number(t.coast), 0);
        
      const seatsText = booking.tickets.map(t => `Ряд ${t.row}, Место ${t.place}`).join('; ');
        
      const qrText = `
      ID билета: ${ticketIds}
      Дата: ${booking.ticketDate}
      Время: ${booking.time}
      Фильм: ${booking.movie}
      Зал: ${booking.hall}
      ${seatsText}
      Стоимость: ${totalPrice} руб.
      Билет действителен строго на свой сеанс
      `;
        
      qrContainer.innerHTML = '';

      const qrCode = new QRCodeStyling({
        width: 250,
        height: 250,
        data: qrText,
        dotsOptions: {
          color: "#000",
          type: "square"
        },
          
        backgroundOptions: {
          color: "#ffffff"
        },
          
        qrOptions: {
          errorCorrectionLevel: "L" 
        }
      });

      qrCode.append(qrContainer);
    
      qrWrapper.style.display = 'block';
      getCodeBtn.style.display = 'none';
      if (priceRow) priceRow.style.display = 'none';
      if (note) note.style.display = 'none';

      paymentTitle.textContent = 'ЭЛЕКТРОННЫЙ БИЛЕТ';
      
    } catch (error) {
      console.error(error);
      alert('Ошибка при отправке билета');
    }
  });
});