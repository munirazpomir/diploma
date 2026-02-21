import { getAllData } from './api.js';
import './dates.js'

const moviesContainer = document.getElementById('moviesContainer');

async function renderClientPage() {
  const data = await getAllData();

  const movies = data.result.films;
  const seances = data.result.seances;
  const halls = data.result.halls;

  moviesContainer.innerHTML = '';

  movies.forEach(movie => {
    const movieSeances = seances.filter(s => s.seance_filmid == movie.id);

    if (!movieSeances.length) return;

    const section = document.createElement('section');
    section.className = 'movie';

    section.innerHTML = `
      <img class="poster" src="${movie.film_poster}" alt="">
      <div class="movie-info">
        <h2>${movie.film_name}</h2>
        <p class="desc">${movie.film_description || ''}</p>
        <p class="meta">${movie.film_duration} минут ${movie.film_origin || ''}</p>
      </div>
      <div class="hall"></div>
    `;

    const hallBlock = section.querySelector('.hall');

    const groupedByHall = {};

    movieSeances.forEach(seance => {
      if (!groupedByHall[seance.seance_hallid]) {
        groupedByHall[seance.seance_hallid] = [];
      }
      groupedByHall[seance.seance_hallid].push(seance);
    });

    Object.keys(groupedByHall).forEach(hallId => {
      const hall = halls.find(h => h.id == hallId);
      if (!hall) return;
      if (hall.hall_open === 0) return;

      const hallTitle = document.createElement('h3');
      hallTitle.className = 'hall-title';
      hallTitle.textContent = hall.hall_name;

      const times = document.createElement('div');
      times.className = 'times';

      groupedByHall[hallId].forEach(seance => {
        const a = document.createElement('a');
        a.className = 'time';
        a.textContent = seance.seance_time;
      
        const selectedDate =
          localStorage.getItem('selectedDate') ||
          new Date().toISOString().slice(0, 10);
      
        const today = new Date().toISOString().slice(0, 10);
      
        let isPast = false;
      
        // Проверяем прошедший сеанс ТОЛЬКО если выбрана сегодняшняя дата
        if (selectedDate === today) {
          const [hours, minutes] = seance.seance_time.split(':').map(Number);
      
          const seanceMinutes = hours * 60 + minutes;
      
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
      
          if (seanceMinutes < nowMinutes) {
            isPast = true;
          }
        }
      
        if (isPast) {
          a.classList.add('time--disabled');
        } else {
          a.href = `hall.html?seanceId=${seance.id}`;
        }
      
        times.appendChild(a);
      });

      hallBlock.appendChild(hallTitle);
      hallBlock.appendChild(times);
    });

    moviesContainer.appendChild(section);
  });

  
  console.log('SEANCES:', seances);
  console.log('HALLS:', halls)
}

renderClientPage();