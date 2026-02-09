const moviesContainer = document.getElementById('moviesContainer');

async function renderClientPage() {
  const data = await getAllData();

  const movies = data.films;
  const seances = data.seances;
  const halls = data.halls;
  const hallOpen = JSON.parse(localStorage.getItem('hallOpen') || '[]');

  moviesContainer.innerHTML = '';

  movies.forEach(movie => {
    const movieSeances = seances.filter(s => s.movieId == movie.id);

    if (!movieSeances.length) return;

    const section = document.createElement('section');
    section.className = 'movie';

    section.innerHTML = `
      <img class="poster" src="img/poster1.jpg" alt="">
      <div class="movie-info">
        <h2>${movie.film_name}</h2>
        <p class="desc">${movie.film_description || ''}</p>
        <p class="meta">${movie.film_duration} минут ${movie.film_country || ''}</p>
      </div>
      <div class="hall"></div>
    `;

    const hallBlock = section.querySelector('.hall');

    const groupedByHall = {};

    movieSeances.forEach(seance => {
      if (!groupedByHall[seance.hallId]) {
        groupedByHall[seance.hallId] = [];
      }
      groupedByHall[seance.hallId].push(seance);
    });

    Object.keys(groupedByHall).forEach(hallId => {
      const hall = halls.find(h => h.id == hallId);
      if (!hall) return;

      const openInfo = hallOpen.find(h => h.id == hall.id);
      if (openInfo && openInfo.open === 0) return;

      const hallTitle = document.createElement('h3');
      hallTitle.className = 'hall-title';
      hallTitle.textContent = hall.hall_name;

      const times = document.createElement('div');
      times.className = 'times';

      groupedByHall[hallId].forEach(seance => {
        const a = document.createElement('a');
        a.className = 'time';
        a.textContent = seance.time;
      
        const selectedDate = localStorage.getItem('selectedDate') || new Date().toISOString().slice(0, 10);
        
        const today = new Date().toISOString().slice(0, 10);
        
        const [hours, minutes] = seance.time.split(':').map(Number);
        
        const seanceMinutes = hours * 60 + minutes;
        
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        
        let isPast = false;
        
        if (selectedDate === today && seanceMinutes < nowMinutes) {
          isPast = true;
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
}

renderClientPage();