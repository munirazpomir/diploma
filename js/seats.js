const hallScheme = [
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,3,1,1,1,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,0,0],
  [1,1,1,1,1,2,2,1,1,0,0,0],
  [1,1,1,1,2,2,2,2,1,0,0,0],
  [1,1,1,1,2,3,3,3,1,0,0,0],
  [1,1,1,1,2,3,3,2,1,0,0,0],
  [1,1,1,1,1,1,1,1,1,0,0,0],
  [1,3,1,3,1,3,1,1,1,1,1,1],
  [1,1,1,1,1,3,3,3,1,1,1,1],
];

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

const movie = params.get('movie');
const time = params.get('time');
const hall = params.get('hall');

document.getElementById('movieTitle').textContent = movie || 'Название фильма';

document.getElementById('sessionTime').textContent = time || '--:--';

document.getElementById('hallNumber').textContent = hall || '-';

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
    seatsNumbers.push(
      `${seat.dataset.seat}`
    );
  });

  const params = new URLSearchParams({
    movie,
    time,
    hall,
    seats: seatsNumbers.join(','),
    price: totalPrice
  });

  window.location.href = `payment.html?${params.toString()}`;
});