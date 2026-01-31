const params = new URLSearchParams(window.location.search);
const seanceId = params.get('seanceId');

if (!seanceId) {
  alert('Сеанс не найден');
  throw new Error('No seanceId');
}

// 2. Данные из localStorage
const seances = JSON.parse(localStorage.getItem('seances')) || [];
const movies = JSON.parse(localStorage.getItem('movies')) || [];
const halls = JSON.parse(localStorage.getItem('halls')) || [];

// 3. Находим сеанс
const seance = seances.find(s => 
  s.id == seanceId && 
  s.hallId &&
  halls.some(h => Number(h.id) === Number(s.hallId))
);

if (!seance) {
  alert('Сеанс не найден');
  throw new Error('Invalid seanceId');
}

// 4. Фильм и зал
const movie = movies.find(
  m => Number(m.id) === Number(seance.movieId)
);

const hall = halls.find(
  h => Number(h.id) === Number(seance.hallId)
);

if (!hall) {
  alert('Зал не найден');
  throw new Error('Hall not found');
}

const regularPrice = hall.hall_price_standart;
const vipPrice = hall.hall_price_vip;

document.getElementById('regularPrice').textContent = `Свободно (${regularPrice} руб)`;
document.getElementById('vipPrice').textContent = `Свободно VIP (${vipPrice} руб)`;

// 5. Заполняем информацию о сеансе
document.getElementById('movieTitle').textContent =
  movie?.title ?? 'Название фильма';

document.getElementById('sessionTime').textContent =
  seance.time ?? '--:--';

document.getElementById('hallNumber').textContent =
  hall?.hall_name ?? '-';

// 6. Схема зала
const hallScheme = hall.hall_config;

const seatsContainer = document.getElementById('seats');
seatsContainer.innerHTML = '';

hallScheme.forEach((row, rowIndex) => {
  const rowDiv = document.createElement('div');
  rowDiv.classList.add('row');

  row.forEach((seatType, seatIndex) => {
    if (seatType === 0) {
      const empty = document.createElement('div');
      empty.classList.add('empty');
      rowDiv.appendChild(empty);
      return;
    }

    const seat = document.createElement('div');
    seat.classList.add('seat');

    seat.dataset.row = rowIndex + 1;
    seat.dataset.seat = seatIndex + 1;

    const type = Number(seatType);

    if (type === 1) {
      seat.classList.add('standart');
      seat.dataset.price = regularPrice;
    }

    if (type === 2) {
      seat.classList.add('vip');
      seat.dataset.price = vipPrice;
    }

    if (type === 3) {
      seat.classList.add('taken');
    }

    seat.addEventListener('click', () => {
      if (seat.classList.contains('taken')) return;
      seat.classList.toggle('selected');
    });

    rowDiv.appendChild(seat);
  });

  seatsContainer.appendChild(rowDiv);
});

// 7. Бронирование
const bookBtn = document.querySelector('.book-btn');

bookBtn.addEventListener('click', () => {
  const selectedSeats = document.querySelectorAll('.seat.selected');

  if (selectedSeats.length === 0) {
    alert('Выберите хотя бы одно место');
    return;
  }

  let totalPrice = 0;
  const seatsNumbers = [];

  selectedSeats.forEach(seat => {
    const price = Number(seat.dataset.price);
    if (!price) return;

    totalPrice += price;
    seatsNumbers.push(`${seat.dataset.row}-${seat.dataset.seat}`);
  });

  const booking = {
    seanceId,
    seats: seatsNumbers,
    totalPrice
  };

  localStorage.setItem('currentBooking', JSON.stringify(booking));

  window.location.href = 'payment.html';
});