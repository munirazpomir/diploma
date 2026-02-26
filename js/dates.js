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
    button.textContent =
      offset + i === 0
        ? `Сегодня, ${dayNumber}`
        : `${dayName}, ${dayNumber}`;

        const currentDate = date.toISOString().slice(0, 10);
        
        if (selectedDate === currentDate) {
          button.classList.add('active');
        }

    button.addEventListener('click', () => {
      document
        .querySelectorAll('.dates button')
        .forEach(b => b.classList.remove('active'));
    
      button.classList.add('active');
    
      selectedDate = currentDate;
      
      window.history.replaceState({}, '', `?date=${selectedDate}`);
      
      window.renderClientPage(selectedDate);
    });

    datesContainer.append(button);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '›';

  nextBtn.addEventListener('click', () => {
    offset += daysCount;
    renderDates();
  });

  datesContainer.append(nextBtn);
}

renderDates();