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

    // сохраняем итоговую бронь
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    bookings.push({
      ...booking,
      code: bookingCode,
      createdAt: Date.now()
    });

    localStorage.setItem('bookings', JSON.stringify(bookings));

    // сохраняем занятые места
    const takenSeats = JSON.parse(localStorage.getItem('takenSeats') || '{}');
    
    if (!takenSeats[booking.seanceId]) {
      takenSeats[booking.seanceId] = [];
    }
    
    booking.seats.split(',').forEach(s => {
      const [row, seat] = s.trim().split('-').map(Number);
      takenSeats[booking.seanceId].push({ row, seat });
    });
    
    localStorage.setItem('takenSeats', JSON.stringify(takenSeats));

    // QR
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: bookingCode,
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