document.addEventListener('DOMContentLoaded', () => {
  const booking = JSON.parse(localStorage.getItem('currentBooking'));

  if (!booking) {
    alert('Данные бронирования не найдены');
    return;
  }

  // вывод информации
  document.getElementById('movie').textContent = booking.movie;
  document.getElementById('hall').textContent = booking.hall;
  document.getElementById('time').textContent = booking.time;
  document.getElementById('seats').textContent = booking.seats;
  document.getElementById('price').textContent = booking.price;

  const getCodeBtn = document.querySelector('.pay-btn');
  const qrWrapper = document.getElementById('qrWrapper');
  const qrContainer = document.getElementById('qrcode');
  const priceRow = document.querySelector('#priceRow');
  const note = document.querySelector('.note');

  getCodeBtn.addEventListener('click', () => {
    const bookingCode =
    'VK-' +
    Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();
        
    const qrText = `
    БИЛЕТ В КИНО
        
    Фильм: ${booking.movie}
    Дата: ${booking.date ?? ''}
    Время: ${booking.time}
    Зал: ${booking.hall}
    Места: ${Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
    Стоимость: ${booking.price} руб
        
    Билет действителен строго на свой сеанс
    Код бронирования: ${bookingCode}
    `.trim();
        
    // сохраняем бронь
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
    bookings.push({
      ...booking,
      code: bookingCode,
      createdAt: Date.now()
    });
    
    localStorage.setItem('bookings', JSON.stringify(bookings));
        
    // помечаем места как занятые
    const takenSeats = JSON.parse(localStorage.getItem('takenSeats') || '{}');
    
    if (!takenSeats[booking.seanceId]) {
      takenSeats[booking.seanceId] = [];
    }
        
    if (Array.isArray(booking.seats)) {
      booking.seats.forEach(s => {
        const [row, seat] = s.split('-').map(Number);
        takenSeats[booking.seanceId].push({ row, seat });
      });
    }
    
    localStorage.setItem('takenSeats', JSON.stringify(takenSeats));
        
    // QR
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: qrText,
      width: 200,
      height: 200,
      correctLevel: QRCode.CorrectLevel.L
    });
    
    qrWrapper.style.display = 'block';
    getCodeBtn.style.display = 'none';
    if (priceRow) priceRow.style.display = 'none';
    if (note) note.style.display = 'none';
  });
});