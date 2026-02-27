const today = new Date();
let selectedDate = new URLSearchParams(window.location.search).get('date') || today.toISOString().slice(0, 10);

const datesContainer = document.getElementById('dates');
const daysCount = 6;
let offset = 0;

const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function renderDates() {
  datesContainer.innerHTML = '';

  const today = new Date();

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '<';
  prevBtn.className = 'nav-btn';
  prevBtn.disabled = offset === 0;

  prevBtn.addEventListener('click', () => {
    if (offset >= daysCount) {
      offset -= daysCount;
      renderDates();
    }
  });

  datesContainer.append(prevBtn);

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset + i);

    const dayName = weekDays[date.getDay()];
    const dayNumber = date.getDate();

    const button = document.createElement('button');
    button.className = 'date-item';

    const isToday = offset + i === 0;
    
    if (isToday) {
      button.innerHTML = `
      <span class="day-name">Сегодня</span>
      <span class="day-number">${dayName}, ${dayNumber}</span>
      `;
    } else {
      button.innerHTML = `
      <span class="day-name">${dayName},</span>
      <span class="day-number">${dayNumber}</span>
      `;
    }

    const currentDate = date.toISOString().slice(0, 10);

    // активная дата
    if (selectedDate === currentDate) {
      button.classList.add('active');
    }

    // выходные
    if (date.getDay() === 0 || date.getDay() === 6) {
      button.classList.add('weekend');
    }

    button.addEventListener('click', () => {
      document
        .querySelectorAll('.date-item')
        .forEach(b => b.classList.remove('active'));

      button.classList.add('active');

      selectedDate = currentDate;

      window.history.replaceState({}, '', `?date=${selectedDate}`);

      window.renderClientPage(selectedDate);
    });

    datesContainer.append(button);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '>';
  nextBtn.className = 'nav-btn';

  nextBtn.addEventListener('click', () => {
    offset += daysCount;
    renderDates();
  });

  datesContainer.append(nextBtn);
}

renderDates();