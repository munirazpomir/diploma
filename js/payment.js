document.addEventListener('DOMContentLoaded', () => {
const params = new URLSearchParams(window.location.search);

const movie = params.get('movie') || 'Название фильма';
const time = params.get('time') || '--:--';
const hall = params.get('hall') || '-';
const seats = params.get('seats') || '';
const price = params.get('price') || '0';
const date = params.get('date') || new Date().toLocaleDateString('ru-RU');

document.getElementById('movie').textContent = movie;
document.getElementById('time').textContent = time;
document.getElementById('hall').textContent = hall;
document.getElementById('seats').textContent = seats;
document.getElementById('price').textContent = price;

const getCodeBtn = document.querySelector('.pay-btn');
const qrWrapper = document.getElementById('qrWrapper');
const qrContainer = document.getElementById('qrcode');
const priceRow = document.querySelector('#priceRow');
const note = document.querySelector('.note');

getCodeBtn.addEventListener('click', () => {
  const bookingCode = 
  'ВК-' +
  Math.random()
  .toString(36)
  .substring(2, 10)
  .toUpperCase();

  const qrText = `VK-${bookingCode};` 

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