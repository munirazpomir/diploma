const hallScheme = hall.hallConfig;

const seatsContainer = document.getElementById('seats');

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

    if (seatType === 1) {
      seat.classList.add('free');
      seat.dataset.price = 250;
    }

    if (seatType === 2) { 
      seat.classList.add('vip');
      seat.dataset.price = 350;
    }

    if (seatType === 3) {
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

const params = new URLSearchParams(window.location.search);
const seanceId = params.get('seanceId');

if (!seanceId) {
  alert('Сеанс не найден');
  throw new Error('No seanceId');
}

const seances = JSON.parse(localStorage.getItem('seances')) || [];
const movies = JSON.parse(localStorage.getItem('movies')) || [];
const halls = JSON.parse(localStorage.getItem('halls')) || [];

const seance = seances.find(s => s.id == seanceId);

if (!seance) {
  alert('Сеанс не найден');
  throw new Error('Invalid seanceId');
}

const movie = movies.find(m => m.id === seance.movieId);
const hall = halls.find(h => h.id === seance.hallId);

document.getElementById('movieTitle').textContent = movie?.title || 'Название фильма';

document.getElementById('sessionTime').textContent = seance.time || '--:--';

document.getElementById('hallNumber').textContent = hall?.tittle || '-';

const bookBtn = document.querySelector('.book-btn');

bookBtn.addEventListener('click', () => {
  const selectedSeats = document.querySelectorAll('.seat.selected');

  if (selectedSeats.length === 0) {
    alert('Выберите хотя бы одно место');
    return;
  }

  let totalPrice = 0;
  const seatsNumbers = [];

  selectedSeats.forEach((seat, index) => {
    const price = Number(seat.dataset.price);
  
    if (!price) return;
  
    totalPrice += price;
    seatsNumbers.push(`${seat.dataset.row}-${seat.dataset.seat}`);
  });

  const params = new URLSearchParams({
    movie,
    time,
    hall,
    seats: seatsNumbers.join(','),
    price: totalPrice
  });

  const booking ={
    seanceId,
    seats: seatsNumbers,
    totalPrice
  };

  window.location.href = `payment.html?${params.toString()}`;
});