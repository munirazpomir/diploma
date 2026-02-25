import { getAllData, getHallConfig } from './api.js'

const params = new URLSearchParams(window.location.search);
const seanceId = params.get('seanceId');


if (!seanceId) {
  alert('Сеанс не найден');
  throw new Error('No seanceId');
}

const selectedDate =
  new URLSearchParams(window.location.search).get('date') ||
  new Date().toISOString().slice(0, 10);

const data = await getAllData();
const seances = data.result.seances;
const movies = data.result.films;
const halls = data.result.halls;

// 3. Находим сеанс
const seance = seances.find(s => Number(s.id) === Number(seanceId));

if (!seance) {
  alert('Сеанс не найден');
  throw new Error('Invalid seanceId');
}

const hallConfigResponse = await getHallConfig(seanceId, selectedDate);

const hallScheme = hallConfigResponse.result;

const seanceMovieId = seance.movieId ?? seance.seance_filmid;
const seanceHallId  = seance.hallId ?? seance.seance_hallid;
const seanceTime    = seance.seance_time || '--:--';

// 4. Фильм и зал
const movie = movies.find(m => Number(m.id) === Number(seance.seance_filmid));
const movieTitle = movie?.film_name || 'Название фильм';

const hall = halls.find(
  h => Number(h.id) === Number(seanceHallId)
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
document.getElementById('movieTitle').textContent = movieTitle;

document.getElementById('sessionTime').textContent = seanceTime;

document.getElementById('hallNumber').textContent =
  hall?.hall_name ?? '-';

// 6. Схема зала

const seatsContainer = document.getElementById('seats');
seatsContainer.innerHTML = '';

hallScheme.forEach((row, rowIndex) => {
  const rowDiv = document.createElement('div');
  rowDiv.classList.add('row');

  row.forEach((seatType, seatIndex) => {
    const seat = document.createElement('div');
    seat.classList.add('seat', seatType);

    seat.dataset.row = rowIndex + 1;
    seat.dataset.seat = seatIndex + 1;

    if (seatType === 'standart') {
      seat.dataset.price = regularPrice;
    }

    if (seatType === 'vip') {
      seat.dataset.price = vipPrice;
    }

    if (seatType === 'taken') {
      seat.classList.add('taken');
    }

    if (seatType === 'disabled') {
      seat.classList.add('empty');
    }

    seat.addEventListener('click', () => {
      if (
        seat.classList.contains('taken') ||
        seat.classList.contains('empty')
      ) return;

      seat.classList.toggle('selected');
    });

    rowDiv.appendChild(seat);
  });

  seatsContainer.appendChild(rowDiv);
});

// 7. Бронирование
const bookBtn = document.querySelector('.book-btn');

bookBtn.addEventListener('click', () => {
  const selectedSeats = [...document.querySelectorAll('.seat.selected')]
  .filter(seat => seat.dataset.row && seat.dataset.seat);

  if (!selectedSeats.length) {
    alert('Выберите хотя бы одно место');
    return;
  }

  let totalPrice = 0;
  const seatsNumbers = [];

  selectedSeats.forEach(seat => {
    const price = Number(seat.dataset.price);
    totalPrice += price;
    seatsNumbers.push({
      row: Number(seat.dataset.row),
      seat: Number(seat.dataset.seat)
    });
  });

  const booking = {
    seanceId: seance.id,
    ticketDate: selectedDate,
    tickets: selectedSeats.map(seat => ({
      row: Number(seat.dataset.row),
      place: Number(seat.dataset.seat),
      coast: Number(seat.dataset.price)
    })),
    movie: movieTitle,
    hall: hall.hall_name,
    time: seanceTime
  };

  const bookingParam = encodeURIComponent(JSON.stringify(booking));
  
  window.location.href = `payment.html?booking=${bookingParam}`;
});