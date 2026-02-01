document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  const movie = params.get('movie') || 'Название фильма';
  const time = params.get('time') || '--:--';
  const hall = params.get('hall') || '-';
  const seatsStr = params.get('seats') || '';
  const price = params.get('price') || '0';
  const seanceId = Number(params.get('seanceId'));
  const hallId = Number(params.get('hallId'));

  // вывод данных
  document.getElementById('movie').textContent = movie;
  document.getElementById('time').textContent = time;
  document.getElementById('hall').textContent = hall;
  document.getElementById('seats').textContent = seatsStr;
  document.getElementById('price').textContent = price;

  const getCodeBtn = document.querySelector('.pay-btn');
  const qrWrapper = document.getElementById('qrWrapper');
  const qrContainer = document.getElementById('qrcode');
  const priceRow = document.querySelector('#priceRow');
  const note = document.querySelector('.note');

  getCodeBtn.addEventListener('click', () => {
    // генерация кода бронирования
    const bookingCode =
      'VK-' +
      Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

    // сохраняем бронь
    const seats = seatsStr
      .split(',')
      .filter(Boolean)
      .map(s => {
        const [row, seat] = s.split('-').map(Number);
        return { row, seat };
      });

    const booking = {
      seanceId,
      hallId,
      movie,
      time,
      hall,
      seats,
      price: Number(price),
      code: bookingCode
    };

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // QR-код
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