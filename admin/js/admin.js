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
let originalHallConfig = [];

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
  
      title.classList.toggle('active');
      content.classList.toggle('collapsed');
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
  
      const data = response.result || response;
  
      halls = data.halls || [];
  
      movies = (data.films || []).map(movie => ({
        ...movie,
        color: getRandomColor()
      }));
  
      seances = (data.seances || []).map(s => {
        const movie = movies.find(m => m.id === s.seance_filmid);
  
        return {
          id: s.id,
          hallId: s.seance_hallid,
          movieId: s.seance_filmid,
          time: s.seance_time,
          duration: movie ? Number(movie.film_duration) : 0,
          title: movie ? movie.film_name : '',
          color: movie ? movie.color : getRandomColor()
        };
      });
  
      renderHalls();
      renderConfigHallList();
      renderPriceHalls();
      renderSalesHalls();
      renderMovies();
      renderHallSchedules();
      renderSeances();
      renderTimelineTimes();
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
      hallList.append(li);
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
  
    rowsInput.value = hall.hall_rows;
    seatsInput.value = hall.hall_places;
  
    if (hall.hall_config) {
  
      if (typeof hall.hall_config === 'string') {
        try {
          hallConfig = JSON.parse(hall.hall_config);
        } catch {
          hallConfig = [];
        }
      } else {
        hallConfig = hall.hall_config;
      }
  
    } else {
      hallConfig = [];
    }
  
    if (!hallConfig.length) {
      const rows = Number(hall.hall_rows);
      const seats = Number(hall.hall_places);
  
      hallConfig = Array.from({ length: rows }, () =>
        Array.from({ length: seats }, () => 'standart')
      );
    }

    originalHallConfigHallConfig = JSON.parse(JSON.stringify(hallConfig));
  
    renderHallGrid();
  }

  const hallGrid = document.getElementById('hallGrid');
  const configHallList = document.getElementById('configHallList');

  function renderConfigHallList() {
    configHallList.innerHTML = '';
  
    if (!halls.length) return;
  
    halls.forEach(hall => {
      if (!hall) return;
  
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
  
      configHallList.append(btn);
    });
  
    const firstBtn = configHallList.querySelector('.hall-btn');
    if (firstBtn) {
      firstBtn.classList.add('active');
      selectHallForConfig(halls[0]);
    }
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

      rowEl.append(seatEl);
    });

    hallGrid.append(rowEl);
  });
}

function toggleSeatType(row, seat) {
  const order = ['standart', 'vip', 'disabled'];
  const current = hallConfig[row][seat];
  const next = order[(order.indexOf(current) + 1) % order.length];

  console.log('CURRENT TYPE:', current);
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
    originalHallConfig = JSON.parse(JSON.stringify(hallConfig));
    await loadData();
    alert('Конфигурация зала сохранена');
  } catch (e) {
    alert('Ошибка сохранения конфигурации');
  }
});

const configCancelBtn = document.getElementById('configCancelBtn');

configCancelBtn.addEventListener('click', () => {

  if (!selectedHall) return;

  rowsInput.value = selectedHall.hall_rows;
  seatsInput.value = selectedHall.hall_places;

  hallConfig = JSON.parse(JSON.stringify(originalHallConfig));

  renderHallGrid();
});


  /* ================== ЦЕНЫ ================== */

  const priceHallList = document.getElementById('priceHallList');
  const priceRegularInput = document.getElementById('priceRegular');
  const priceVipInput = document.getElementById('priceVip');
  const priceSaveBtn = document.getElementById('priceSave');

  let selectedPriceHall = null;

  function renderPriceHalls() {
    priceHallList.innerHTML = '';
    if (!halls.length) return;
  
    halls.forEach(hall => {
      if (!hall) return;
  
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
  
      priceHallList.append(btn);
    });
  
    const firstBtn = priceHallList.querySelector('.hall-btn');
    if (firstBtn) {
      firstBtn.classList.add('active');
      selectedPriceHall = halls[0];
      priceRegularInput.value = halls[0].hall_price_standart || 0;
      priceVipInput.value = halls[0].hall_price_vip || 0;
    }
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

  const priceCancelBtn = document.getElementById('priceCancel');

priceCancelBtn.addEventListener('click', () => {

  if (!selectedPriceHall) return;

  priceRegular.value = selectedPriceHall.hall_price_standart;
  priceVip.value = selectedPriceHall.hall_price_vip;

});

  /* ================== ОТКРЫТИЕ ПРОДАЖ ================== */

  const salesHallList = document.getElementById('salesHallList');
  const salesStatus = document.getElementById('salesStatus');
  const toggleSalesBtn = document.getElementById('toggleSalesBtn');

  let selectedSalesHall = null;

  function renderSalesHalls() {
    salesHallList.innerHTML = '';
  
    halls.forEach((hall, index) => {
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
  
      if (index === 0) {
        btn.classList.add('active');
        selectedSalesHall = hall;
        updateSalesUI();
      }
  
      salesHallList.append(btn);
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

  async function openSales(hall) {
    const newStatus = hall.hall_open === 1 ? 0 : 1;
  
    const params = new FormData();
    params.set('hallOpen', newStatus.toString());
  
    const response = await fetch(
      `https://shfe-diplom.neto-server.ru/open/${hall.id}`,
      {
        method: 'POST',
        body: params
      }
    );
  
    const data = await response.json();
  
    return data;
  }

  toggleSalesBtn.addEventListener('click', async () => {
    if (!selectedSalesHall) {
      alert('Выберите зал');
      return;
    }
  
    try {
      const updatedHall = await openSales(selectedSalesHall);
  
      selectedSalesHall.hall_open = updatedHall.hall_open;
  
      updateSalesUI();
  
      await loadData();
  
    } catch (error) {
      alert('Ошибка изменения статуса продаж');
    }
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
  
      movieList.append(card);
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
  const description = document.getElementById('movieDescription').value.trim();
  const country = document.getElementById('movieCountry').value.trim();
  const posterInput = document.getElementById('moviePoster');
  const file = posterInput.files[0];

  if (!title || duration <= 0 || !description || !country || !file) {
    alert('Заполните все поля и загрузите постер');
    return;
  }

  if (file.type !== 'image/png') {
    alert('Файл должен быть PNG');
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    alert('Файл больше 3MB');
    return;
  }

  try {
    await createFilm({
      name: title,
      duration,
      description,
      origin: country,
      poster: file
    });

    movieModal.style.display = 'none';
    await loadData();
  } catch (err) {
    alert(err.message);
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
      sessionHall.append(option);
    });
  
    movies.forEach(m => {
      const option = document.createElement('option');
      option.value = m.id;
      option.textContent = m.film_name;
      if (m.id == movieId) option.selected = true;
      sessionMovie.append(option);
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
  
    const movie = movies.find(m => m.id === movieId);
    const duration = Number(movie.film_duration);
  
    const [h, m] = time.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + duration;
  
    if (endMinutes > 23 * 60 + 59) {
      alert('Сеанс выходит за пределы 23:59');
      return;
    }
  
    const hallSeances = seances.filter(s => s.hallId === hallId);
  
    for (const s of hallSeances) {
      const existingMovie = movies.find(m => m.id === s.movieId);
      const existingDuration = Number(existingMovie.film_duration);
  
      const [eh, em] = s.time.split(':').map(Number);
      const existingStart = eh * 60 + em;
      const existingEnd = existingStart + existingDuration;
  
      if (
        startMinutes < existingEnd &&
        endMinutes > existingStart
      ) {
        alert('Сеансы пересекаются!');
        return;
      }
    }
  
    try {
     addSessionToTimeline(movieId, hallId, time);
      sessionModal.style.display = 'none';
    } catch (err) {
      alert(err.message);
    }
  });

  function addSessionToTimeline(movieId, hallId, time) {
    const movie = movies.find(m => m.id == movieId);
    if (!movie) return;
  
    const timeline = document.querySelector(
      `.hall-schedule[data-hall="${hallId}"] .timeline`
    );
    if (!timeline) return;
  
    const TOTAL_MINUTES = 24 * 60;
    const [h, m] = time.split(':').map(Number);
    const minutes = h * 60 + m;
  
    const block = document.createElement('div');
    block.className = 'session';
    block.textContent = movie.film_name;
    block.style.background = movie.color || getRandomColor();
  
    block.dataset.movieId = movieId;
    block.dataset.hallId = hallId;
    block.dataset.time = time;
  
    block.style.left = (minutes / TOTAL_MINUTES) * 100 + '%';
    block.style.width =
      (movie.film_duration / TOTAL_MINUTES) * 100 + '%';
  
    timeline.append(block);
  }

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

      session.addEventListener('dragstart', () => {
        draggedSeanceId = seance.id;
      
        const hall = session.closest('.hall-schedule');
        const timeline = hall.querySelector('.timeline-wrapper');
      
        const timelineRect = timeline.getBoundingClientRect();
        const panelRect = hallsPanel.getBoundingClientRect();
      
        const trashHeight = 50; 
      
        seanceTrash.style.top =
          (timelineRect.top - panelRect.top +
           timelineRect.height / 2 -
           trashHeight / 2) + 'px';
      
        seanceTrash.classList.add('active');
      });

      session.addEventListener('dragend', () => {
        draggedSeanceId = null;
        seanceTrash.classList.remove('active');
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
  
      timeline.append(session);
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

    hallsPanel.append(wrap);
  });

  initTimelineDnD();
}

function renderTimelineTimes() {
  const TOTAL_MINUTES = 24 * 60;

  document.querySelectorAll('.hall-schedule').forEach(schedule => {
    const hallId = Number(schedule.dataset.hall);
    const timesContainer = schedule.querySelector('.timeline-times');

    timesContainer.innerHTML = '';

    const hallSeances = seances.filter(s => s.hallId === hallId);

    hallSeances.forEach(seance => {
      if (!seance.time) return;

      const [h, m] = seance.time.split(':').map(Number);
      const minutes = h * 60 + m;

      const label = document.createElement('div');
      label.className = 'timeline-time';
      label.textContent = seance.time;

      label.style.left = (minutes / TOTAL_MINUTES) * 100 + '%';

      timesContainer.append(label);
    });
  });
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
}

const seanceTrash = document.getElementById('seanceTrash');
const deleteSeanceModal = document.getElementById('deleteSeanceModal');
const confirmDeleteSeance = document.getElementById('confirmDeleteSeance');
const cancelDeleteSeance = document.getElementById('cancelDeleteSeance');
const deleteSeanceText = document.getElementById('deleteSeanceText');

let pendingDeleteSeanceId = null;

seanceTrash.addEventListener('dragover', e => e.preventDefault());

seanceTrash.addEventListener('drop', e => {
  e.preventDefault();

  if (!draggedSeanceId) return;

  const seance = seances.find(s => s.id === draggedSeanceId);
  const movie = movies.find(m => m.id === seance.movieId);

  deleteSeanceText.textContent =
    `Вы действительно хотите снять с сеанса фильм «${movie.film_name}»?`;

  pendingDeleteSeanceId = draggedSeanceId;
  deleteSeanceModal.style.display = 'flex';
});

confirmDeleteSeance.addEventListener('click', async () => {
  if (!pendingDeleteSeanceId) return;

  try {
    await deleteSeance(pendingDeleteSeanceId);
    await loadData();
  } catch (err) {
    alert('Ошибка удаления сеанса');
  }

  deleteSeanceModal.style.display = 'none';
  seanceTrash.classList.remove('active');
  pendingDeleteSeanceId = null;
});

cancelDeleteSeance.addEventListener('click', () => {
  deleteSeanceModal.style.display = 'none';
  seanceTrash.classList.remove('active');
  pendingDeleteSeanceId = null;
});

const saveBtn = document.getElementById('seanceSaveBtn');

saveBtn.addEventListener('click', async () => {
  const sessions = document.querySelectorAll('.session:not([data-seance-id])');

  if (!sessions.length) {
    alert('Нет новых сеансов');
    return;
  }

  try {
    for (const s of sessions) {

      const hallId = Number(s.dataset.hallId);
      const movieId = Number(s.dataset.movieId);
      const time = s.dataset.time;
    
      console.log('SAVING:', hallId, movieId, time);
    
      await createSeance({
        hallId: hallId,
        movieId: movieId,
        time: time
      });
    
    }

    await loadData();
    alert('Сеансы сохранены');

  } catch (e) {
    console.error('CREATE SEANCE RESPONSE:', e);
    alert('Ошибка сохранения');
  }
});

const cancelBtn = document.getElementById('cancelSeanceBtn');

cancelBtn.addEventListener('click', () => {
  renderSeances();
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