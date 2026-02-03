const params = new URLSearchParams(window.location.search);
const seanceId = params.get('seanceId');

// загружаем занятые места для сеанса
const takenSeatsMap =
  JSON.parse(localStorage.getItem('takenSeats') || '{}');

const takenSeatsForSeance =
  takenSeatsMap[seanceId] || [];

if (!seanceId) {
  alert('Сеанс не найден');
  throw new Error('No seanceId');
}

// 2. Данные из localStorage
const seances = JSON.parse(localStorage.getItem('seances')) || [];
const movies = JSON.parse(localStorage.getItem('movies')) || [];
const halls = JSON.parse(localStorage.getItem('halls')) || [];

// 3. Находим сеанс
const seance = seances.find(s => Number(s.id) === Number(seanceId));

if (!seance) {
  alert('Сеанс не найден');
  throw new Error('Invalid seanceId');
}

const seanceMovieId = seance.movieId ?? seance.seance_filmid;
const seanceHallId  = seance.hallId ?? seance.seance_hallid;
const seanceTime    = seance.seance_time ?? seance.time ?? '--:--';

// 4. Фильм и зал
const movieTitle = seance.title || movie?.title || 'Название фильма';

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
    if (seatType === 'disabled') {
      const empty = document.createElement('div');
      empty.classList.add('seat', 'empty');
      empty.dataset.disabled = 'true';
      rowDiv.appendChild(empty);
      return;
    }
  
    const seat = document.createElement('div');
    seat.classList.add('seat', seatType);
  
    seat.dataset.row = rowIndex + 1;
    seat.dataset.seat = seatIndex + 1;
    
    const isTaken = takenSeatsForSeance.some(
      s =>
        s.row === rowIndex + 1 &&
      s.seat === seatIndex + 1
    );
    
    if (isTaken) {
      seat.classList.add('taken');
      seat.dataset.price = 0;
    }
  
    if (!seat.classList.contains('taken')) {
      if (seatType === 'standart') {
        seat.dataset.price = regularPrice;
      }
    
      if (seatType === 'vip') {
        seat.dataset.price = vipPrice;
      }
    }
  
    if (seatType === 'taken') {
      seat.classList.add('taken');
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
    seatsNumbers.push(`${seat.dataset.row}-${seat.dataset.seat}`);
  });

  const booking = {
    seanceId: seance.id,
    movie: movieTitle,
    hall: hall.hall_name,
    time: seanceTime,
    date: new Date().toLocaleDateString('ru-Ru'),
    seats: seatsNumbers,
    price: totalPrice
  };

  localStorage.setItem('currentBooking', JSON.stringify(booking));

  window.location.href = 'payment.html';
});