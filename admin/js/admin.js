import {
  login,
  getAllData,
  createHall,
  deleteHall,
  updateHall,
  setPrices,
  openSales,
  createFilm,
  deleteFilm,
  createSeance,
  deleteSeance
} from '../../js/api.js';

let selectedHallId = null;
let selectedHall = null;
let hallConfig = [];

let pendingMovieId = null;
let pendingHallId = null;

let draggedSeanceId = null;
document.addEventListener('DOMContentLoaded', () => {

  /* ================== АВТОРИЗАЦИЯ ================== */

  const form = document.querySelector('#login-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const loginValue = form.querySelector('[name="login"]').value;
      const passwordValue = form.querySelector('[name="password"]').value;

      try {
        await login(loginValue, passwordValue);
        window.location.href = 'index.html';
      } catch (err) {
        alert('Ошибка входа: ' + err.message);
      }
    });
    return;
  }

  /* ================== ОБЩИЕ ЭЛЕМЕНТЫ ================== */

  document.querySelectorAll('.admin-title').forEach(title => {
    title.addEventListener('click', () => {
      const content = title.nextElementSibling;
      content.style.display =
        content.style.display === 'none' ? 'block' : 'none';
    });
  });

  const hallList = document.getElementById('hallList');
  const addHallBtn = document.getElementById('addHallBtn');
  const hallModal = document.getElementById('hallModal');
  const hallNameInput = document.getElementById('hallNameInput');
  const addHallConfirm = document.getElementById('addHallConfirm');
  const closeHallModal = document.getElementById('closeHallModal');
  const cancelHall = document.getElementById('cancelHall');
  const rowsInput = document.getElementById('rowsInput');
  const seatsInput = document.getElementById('seatsInput');

  rowsInput.addEventListener('change', rebuildHallConfig);
  seatsInput.addEventListener('change', rebuildHallConfig);

  let movies = [];
  let halls = [];
  let seances = [];
  selectedHallId = null;
  

  /* ================== ЗАГРУЗКА ДАННЫХ ================== */

  async function loadData() {
    try {
      const response = await getAllData();
  
      console.log('ALDATA RESPONSE:', response);
      console.log('HALLS FROM SERVERE:', response.result?.halls);
  
      const data = response.result || response;
  
      halls = data.halls || [];
      movies = data.films || [];
      seances = (data.seances || []).map(s => ({
        id: s.id,
        hallId: s.seance_hallid,
        movieId: s.seance_filmid,
        time: s.seance_time,
        duration: movies.find(m => m.id === s.seance_filmid)?.film_duration || 0,
        title: movies.find(m => m.id === s.seance_filmid)?.film_name || '',
        color: '#ccc'
      }));
  
      renderHalls();
      renderConfigHallList();
      renderPriceHalls();
      renderSalesHalls();
      renderMovies();
      renderHallSchedules();
      renderSeances();
      initTimelineDnD();
  
      if (halls.length && !selectedHallId) {
        selectHallForConfig(halls[0]);
      }
  
    } catch (err) {
      console.error('LOAD DATA ERROR', err);
      alert('Ошибка загрузки данных');
    }
  }

  

  /* ================== ЗАЛЫ ================== */

  function renderHalls() {
    hallList.innerHTML = '';
  
    halls.forEach(hall => {
      const li = document.createElement('li');
      li.className = 'hall-item';
  
      const name = document.createElement('span');
      name.className = 'hall-name';
      name.textContent = `- ${hall.hall_name}`;
  
      name.addEventListener('click', () => {
        selectHallForConfig(hall);
      });
  
      const del = document.createElement('button');
      del.className = 'hall-delete';
  
      del.addEventListener('click', async () => {
        if (!confirm(`Удалить ${hall.hall_name}?`)) return;
        await deleteHall(hall.id);
        loadData();
      });
  
      li.append(name, del);
      hallList.appendChild(li);
    });
  }

  addHallBtn.addEventListener('click', () => {
    hallNameInput.value = '';
    hallModal.style.display = 'flex';
  });

  function closeHallModalFn() {
    hallModal.style.display = 'none';
  }

  closeHallModal.addEventListener('click', closeHallModalFn);
  cancelHall.addEventListener('click', closeHallModalFn);

  addHallConfirm.addEventListener('click', async () => {
    const name = hallNameInput.value.trim();
    if (!name) {
      alert('Введите название зала');
      return;
    }

    try {
      await createHall(name);
      closeHallModalFn();
      await loadData();
      selectHallForConfig(halls[halls.length - 1]);
    } catch (err) {
      alert(err.message);
    }
  });

  function selectHallForConfig(hall) {
    selectedHall = hall;
    selectedHallId = hall.id;

    if (Array.isArray(hall.hall_config) && hall.hall_config.length) {
      hallConfig = hall.hall_config;
    
      rowsInput.value = hall.hall_rows;
      seatsInput.value = hall.hall_places;
    } else {
      const rows = Number(rowsInput.value);
      const seats = Number(seatsInput.value);
    
      hallConfig = Array.from({ length: rows }, () =>
        Array.from({ length: seats }, () => 'standart')
      );
    }
  
    renderHallGrid();
  }

  const hallGrid = document.getElementById('hallGrid');
  const configHallList = document.getElementById('configHallList');

  function renderConfigHallList() {
    configHallList.innerHTML = '';
  
    halls.forEach(hall => {
      const btn = document.createElement('button');
      btn.className = 'hall-btn';
      btn.textContent = hall.hall_name;
  
      btn.addEventListener('click', () => {
        document
          .querySelectorAll('#configHallList .hall-btn')
          .forEach(b => b.classList.remove('active'));
      
        btn.classList.add('active');
        selectHallForConfig(hall);
      });
  
      configHallList.appendChild(btn);
    });
  }

function renderHallGrid() {
  hallGrid.innerHTML = '';

  if (!hallConfig.length) return;

  hallConfig.forEach((row, rowIndex) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'conf-step__row';

    row.forEach((seat, seatIndex) => {
      const seatEl = document.createElement('span');
      seatEl.className = `seat ${seat}`;

      seatEl.addEventListener('click', () => {
        toggleSeatType(rowIndex, seatIndex);
      });

      rowEl.appendChild(seatEl);
    });

    hallGrid.appendChild(rowEl);
  });
}

function toggleSeatType(row, seat) {
  const order = ['standart', 'vip', 'disabled'];
  const current = hallConfig[row][seat];
  const next = order[(order.indexOf(current) + 1) % order.length];

  hallConfig[row][seat] = next;
  renderHallGrid();
}

function rebuildHallConfig() {
  const rows = Number(rowsInput.value);
  const seats = Number(seatsInput.value);

  if (rows <= 0 || seats <= 0) return;

  hallConfig = Array.from({ length: rows }, () =>
    Array.from({ length: seats }, () => 'standart')
  );

  renderHallGrid();
}

const saveConfigBtn = document.getElementById('saveConfigBtn');

saveConfigBtn.addEventListener('click', async () => {
  if (!selectedHallId) {
    alert('Выберите зал');
    return;
  }

  const rows = Number(rowsInput.value);
  const seats = Number(seatsInput.value);

  if (rows <= 0 || seats <= 0) {
    alert('Некорректное количество рядов или мест');
    return;
  }

  console.log('=== BEFORE SAVE ===');
console.log('ROWS:', rows);
console.log('SEATS:', seats);
console.log('CONFIG TYPE:', typeof hallConfig);
console.log('CONFIG VALUE:', hallConfig);

  try {
    await updateHall(selectedHallId, rows, seats, hallConfig);
    await loadData();
    alert('Конфигурация зала сохранена');
  } catch (e) {
    alert('Ошибка сохранения конфигурации');
  }
});


  /* ================== ЦЕНЫ ================== */

  const priceHallList = document.getElementById('priceHallList');
  const priceRegularInput = document.getElementById('priceRegular');
  const priceVipInput = document.getElementById('priceVip');
  const priceSaveBtn = document.getElementById('priceSave');

  let selectedPriceHall = null;

  function renderPriceHalls() {
    priceHallList.innerHTML = '';

    halls.forEach(hall => {
      const btn = document.createElement('button');
      btn.className = 'hall-btn';
      btn.textContent = hall.hall_name;

      btn.addEventListener('click', () => {
        document
          .querySelectorAll('#priceHallList .hall-btn')
          .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');
        selectedPriceHall = hall;

        priceRegularInput.value = hall.hall_price_standart || 0;
        priceVipInput.value = hall.hall_price_vip || 0;
      });

      priceHallList.appendChild(btn);
    });
  }

  priceSaveBtn.addEventListener('click', async () => {
    if (!selectedPriceHall) {
      alert('Выберите зал');
      return;
    }
  
    const regular = Number(priceRegularInput.value);
    const vip = Number(priceVipInput.value);
  
    if (regular < 0 || vip < 0) {
      alert('Цена не может быть отрицательной');
      return;
    }
  
    await setPrices(selectedPriceHall.id, regular, vip);
    await loadData();
  
    alert('Цены сохранены');
  });

  /* ================== ОТКРЫТИЕ ПРОДАЖ ================== */

  const salesHallList = document.getElementById('salesHallList');
  const salesStatus = document.getElementById('salesStatus');
  const toggleSalesBtn = document.getElementById('toggleSalesBtn');

  let selectedSalesHall = null;

  function renderSalesHalls() {
    salesHallList.innerHTML = '';

    halls.forEach(hall => {
      const btn = document.createElement('button');
      btn.className = 'hall-btn';
      btn.textContent = hall.hall_name;

      btn.addEventListener('click', () => {
        document
          .querySelectorAll('#salesHallList .hall-btn')
          .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');
        selectedSalesHall = hall;
        updateSalesUI();
      });

      salesHallList.appendChild(btn);
    });
  }

  function updateSalesUI() {
    if (!selectedSalesHall) return;

    if (selectedSalesHall.hall_open === 1) {
      salesStatus.textContent = 'Продажа билетов открыта';
      toggleSalesBtn.textContent = 'Закрыть продажу билетов';
    } else {
      salesStatus.textContent = 'Все готово к открытию';
      toggleSalesBtn.textContent = 'Открыть продажу билетов';
    }
  }

  toggleSalesBtn.addEventListener('click', async () => {
    if (!selectedSalesHall) {
      alert('Выберите зал');
      return;
    }
  
    await openSales(selectedSalesHall.id);
    await loadData();
  });

  /* ================== ФИЛЬМЫ ================== */

  const movieList = document.getElementById('movieList');

  function renderMovies() {
    movieList.innerHTML = '';
    if (!movies.length) return;
  
    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.draggable = true;
      card.dataset.movieId = movie.id;
      card.style.background = `${movie.color}`;
  
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('movieId', movie.id);
      });
  
      card.innerHTML = `
        <img class="movie-poster" src="${movie.film_poster}" alt="">
        <div class="movie-info">
        <div class="movie-title">${movie.film_name}</div>
        <div class="movie-duration">${movie.film_duration} мин</div>
        </div>
        <button class="movie-delete"></button>
      `;
  
      card.querySelector('.movie-delete').addEventListener('click', async () => {
        if (!confirm(`Удалить фильм «${movie.film_name}»?`)) return;
      
        try {
          await deleteFilm(movie.id);
          await loadData();
        } catch (err) {
          alert('Ошибка удаления фильма');
        }
      });
  
      movieList.appendChild(card);
    });
  }

  const addMovieBtn = document.querySelector('.add-movie-btn');
const movieModal = document.getElementById('movieModal');
const closeMovieModal = document.getElementById('closeMovieModal');
const cancelMovie = document.getElementById('cancelMovie');
const addMovieConfirm = document.getElementById('addMovieConfirm');

addMovieBtn.addEventListener('click', () => {
  movieModal.style.display = 'flex';
});

closeMovieModal.addEventListener('click', () => {
  movieModal.style.display = 'none';
});

cancelMovie.addEventListener('click', () => {
  movieModal.style.display = 'none';
});

addMovieConfirm.addEventListener('click', async () => {
  const title = document.getElementById('movieTitle').value.trim();
  const duration = Number(document.getElementById('movieDuration').value);
  const description = document.getElementById('movieDescription').value;
  const country = document.getElementById('movieCountry').value;

  if (!title || duration <= 0) {
    alert('Введите корректное название и длительность');
    return;
  }

  try {
    await createFilm({
      film_name: title,
      film_duration: duration,
      film_description: description,
      film_country: country
    });

    movieModal.style.display = 'none';
    await loadData();
  } catch (err) {
    alert('Ошибка добавления фильма');
  }
});

const sessionModal = document.getElementById('sessionModal');
const closeSessionBtn = document.getElementById('closeSessionModal');
const cancelSessionBtn = document.getElementById('cancelSession');

function closeSessionModal() {
  sessionModal.style.display = 'none';
}

closeSessionBtn.addEventListener('click', closeSessionModal);
  cancelSessionBtn.addEventListener('click', closeSessionModal);

  function initTimelineDnD() {
    document.querySelectorAll('.timeline').forEach(timeline => {
      timeline.addEventListener('dragover', e => e.preventDefault());
  
      timeline.addEventListener('drop', e => {
        e.preventDefault();

        const movieId = e.dataTransfer.getData('movieId');
        const hallId = timeline.closest('.hall-schedule').dataset.hall;

        openSessionModal(movieId, hallId);
      });
    });
  }

  function openSessionModal(movieId, hallId) {
    pendingMovieId = movieId;
    pendingHallId = hallId;
  
    sessionHall.innerHTML = '';
    sessionMovie.innerHTML = '';
  
    halls.forEach(h => {
      const option = document.createElement('option');
      option.value = h.id;
      option.textContent = h.hall_name;
      if (h.id == hallId) option.selected = true;
      sessionHall.appendChild(option);
    });
  
    movies.forEach(m => {
      const option = document.createElement('option');
      option.value = m.id;
      option.textContent = m.film_name;
      if (m.id == movieId) option.selected = true;
      sessionMovie.appendChild(option);
    });
  
    sessionModal.style.display = 'flex';
  }

  addSessionConfirm.addEventListener('click', async () => {
    const hallId = Number(sessionHall.value);
    const movieId = Number(sessionMovie.value);
    const time = sessionTime.value;
  
    if (!hallId || !movieId || !time) {
      alert('Заполните все поля');
      return;
    }
  
    try {
      await createSeance({
        seance_hallid: hallId,
        seance_filmid: movieId,
        seance_time: time
      });
  
      sessionModal.style.display = 'none';
      await loadData();
    } catch (err) {
      alert('Ошибка добавления сеанса');
    }
  });

  function renderSeances() {
    document.querySelectorAll('.timeline').forEach(t => t.innerHTML = '');
  
    const TOTAL_MINUTES = 24 * 60;
  
    seances.forEach(seance => {
      if (!seance.time || typeof seance.time !== 'string') return;
  
      const timeline = document.querySelector(
        `.hall-schedule[data-hall="${seance.hallId}"] .timeline`
      );
      if (!timeline) return;
  
      const session = document.createElement('div');
      session.className = 'session';
      session.textContent = seance.title;
      session.style.background = seance.color;
      session.draggable = true;
      session.dataset.seanceId = seance.id;

      session.addEventListener('dragstart', e => {
        draggedSeanceId = seance.id;
        session.classList.add('dragging');
      });
  
      const [h, m] = seance.time.split(':').map(Number);
      const minutesFromStart = h * 60 + m;
  
      let duration = Number(seance.duration);
      if (minutesFromStart >= TOTAL_MINUTES) return;
  
      if (minutesFromStart + duration > TOTAL_MINUTES) {
        duration = TOTAL_MINUTES - minutesFromStart;
      }
      if (duration <= 0) return;
  
      session.style.left = (minutesFromStart / TOTAL_MINUTES) * 100 + '%';
      session.style.width = (duration / TOTAL_MINUTES) * 100 + '%';
  
      timeline.appendChild(session);
    });
  }

  const hallsPanel = document.getElementById('hallsPanel');

function renderHallSchedules() {
  hallsPanel.innerHTML = '';

  halls.forEach(hall => {
    const wrap = document.createElement('div');
    wrap.className = 'hall-schedule';
    wrap.dataset.hall = hall.id;

    wrap.innerHTML = `
      <div class="hall-name">${hall.hall_name}</div>
      <div class="timeline-wrapper">
        <div class="timeline"></div>
        <div class="timeline-times"></div>
      </div>
    `;

    hallsPanel.appendChild(wrap);
  });

  initTimelineDnD();
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
}

const seanceTrash = document.getElementById('seanceTrash');

seanceTrash.addEventListener('dragover', e => e.preventDefault());

seanceTrash.addEventListener('drop', async e => {
  e.preventDefault();

  if (!draggedSeanceId) return;

  try {
    await deleteSeance(draggedSeanceId);
    await loadData();
  } catch (err) {
    alert('Ошибка удаления сеанса');
  } finally {
    draggedSeanceId = null;
  }
});

  /* ================== СТАРТ ================== */

  (async () => {
    try {
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Ошибка загрузки данных');
    }
  })();

});