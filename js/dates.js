const datesContainer = document.getElementById('dates');
const daysCount = 6;
let offset = 0;

const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function renderDates() {
  datesContainer.innerHTML = '';

  const today = new Date();
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '<';
  prevBtn.disabled = offset === 0;

  prevBtn.addEventListener('click', () => {
    if (offset >= daysCount) {
      offset -= daysCount;
      renderDates();
    }
  });

  datesContainer.appendChild(prevBtn);

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset + i);

    const dayName = weekDays[date.getDay()];
    const dayNumber = date.getDate();

    const button = document.createElement('button');
    button.textContent =
      offset + i === 0
        ? `Сегодня, ${dayNumber}`
        : `${dayName}, ${dayNumber}`;

    if (i === 0) button.classList.add('active');

    button.addEventListener('click', () => {
      document
        .querySelectorAll('.dates button')
        .forEach(b => b.classList.remove('active'));
      button.classList.add('active');
    });

    datesContainer.appendChild(button);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '›';

  nextBtn.addEventListener('click', () => {
    offset += daysCount;
    renderDates();
  });

  datesContainer.appendChild(nextBtn);
}

renderDates();