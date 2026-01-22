let selectedHallId = null;
let selectedHall = null;
let hallConfig = [];
window.getHallConfigDebug = () => hallConfig;
document.addEventListener('DOMContentLoaded', () => {

  /* ================== АВТОРИЗАЦИЯ ================== */

  const form = document.querySelector('#login-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const login = form.querySelector('[name="login"]').value;
      const password = form.querySelector('[name="password"]').value;

      try {
        await loginAdmin(login, password);
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

  let movies = [];
  let halls = [];
  let seances = JSON.parse(localStorage.getItem('seances') || '[]');
  selectedHallId = null;
  

  /* ================== ЗАГРУЗКА ДАННЫХ ================== */

  async function loadData() {
    try {
      const data = await getAllData();
      halls = data.halls;
      const savedPrices = JSON.parse(localStorage.getItem('hallPrices') || '[]');
      savedPrices.forEach(saved => {
        const hall = halls.find(h => h.id === saved.id);
        if (hall) {
          hall.hall_price_standart = saved.price;
          hall.hall_price_vip = saved.vip;
        }
      });
      
      const savedOpen = JSON.parse(localStorage.getItem('hallOpen') || '[]');
      
      savedOpen.forEach(saved => {
        const hall = halls.find(h => h.id === saved.id);
        if (hall) {
          hall.hall_open = saved.open;
        }
      });
      movies = data.films || [];

      renderHalls();
      renderConfigHallList();
      renderPriceHalls();
      renderSalesHalls();
      renderMovies();
      renderSeances();
      initTimelineDnD();
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
  
      const button = document.createElement('button');
      button.className = 'hall-btn';
      button.textContent = hall.hall_name;
  
      button.addEventListener('click', () => {
        selectHallForConfig(hall);
      });
  
      const del = document.createElement('button');
      del.className = 'hall-delete';
  
      del.addEventListener('click', async () => {
        if (!confirm(`Удалить ${hall.hall_name}?`)) return;
        await deleteHall(hall.id);
        loadData();
      });
  
      li.append(button, del);
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
  
    const localConfig = getLocalHallConfig(hall.id);
  
    if (localConfig.length) {
      hallConfig = localConfig;
    } else if (Array.isArray(hall.hall_config) && hall.hall_config.length) {
      hallConfig = hall.hall_config;
    } else {
      createHallConfig(hall.hall_rows, hall.hall_places);
      return;
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

function createHallConfig(rows, seats) {
  hallConfig = Array.from({ length: rows }, () =>
    Array.from({ length: seats }, () => 'standart')
  );

  renderHallGrid();
}

rowsInput.addEventListener('change', () => {
  createHallConfig(+rowsInput.value, +seatsInput.value);
});

seatsInput.addEventListener('change', () => {
  createHallConfig(+rowsInput.value, +seatsInput.value);
});

const saveConfigBtn = document.getElementById('saveConfigBtn');

saveConfigBtn.addEventListener('click', async () => {
  if (!selectedHallId) {
    alert('Выберите зал');
    return;
  }

    await updateHallConfig(selectedHall.id, hallConfig);
    alert('Конфигурация сохранена');
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

  priceSaveBtn.addEventListener('click', () => {
    if (!selectedPriceHall) {
      alert('Выберите зал');
      return;
    }
  
    const regular = Number(priceRegularInput.value);
    const vip = Number(priceVipInput.value);
  
    selectedPriceHall.hall_price_standart = regular;
    selectedPriceHall.hall_price_vip = vip;
  
    localStorage.setItem(
      'hallPrices',
      JSON.stringify(
        halls.map(h => ({
          id: h.id,
          price: h.hall_price_standart,
          vip: h.hall_price_vip
        }))
      )
    );
  
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

  toggleSalesBtn.addEventListener('click', () => {
    if (!selectedSalesHall) {
      alert('Выберите зал');
      return;
    }
  
    selectedSalesHall.hall_open =
      selectedSalesHall.hall_open === 1 ? 0 : 1;
  
    localStorage.setItem(
      'hallOpen',
      JSON.stringify(
        halls.map(h => ({
          id: h.id,
          open: h.hall_open
        }))
      )
    );
  
    updateSalesUI();
  });

  /* ================== ФИЛЬМЫ ================== */

  const movieList = document.getElementById('movieList');

  function renderMovies() {
    movieList.innerHTML = '';
  
    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.draggable = true;
  
      card.dataset.id = movie.id;
      card.dataset.duration = movie.movie_duration;
  
      card.innerHTML = `
        <div class="movie-title">${movie.movie_name}</div>
        <div class="movie-duration">${movie.movie_duration} мин</div>
      `;
  
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData(
          'application/json',
          JSON.stringify({
            id: movie.id,
            title: movie.movie_name,
            duration: movie.movie_duration
          })
        );
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
  const duration = document.getElementById('movieDuration').value;
  const description = document.getElementById('movieDescription').value;
  const country = document.getElementById('movieCountry').value;

  if (!title || !duration) {
    alert('Введите название и длительность');
    return;
  }

  try {
    await createMovie(title, duration, description, country);
    movieModal.style.display = 'none';
    loadData();
  } catch (err) {
    alert(err.message);
  }
});

  function initTimelineDnD() {
    document.querySelectorAll('.timeline').forEach(timeline => {
      timeline.addEventListener('dragover', e => e.preventDefault());
  
      timeline.addEventListener('drop', e => {
        e.preventDefault();
  
        const data = JSON.parse(
          e.dataTransfer.getData('application/json')
        );
  
        const hallId = timeline.closest('.hall-schedule').dataset.hall;
  
        const rect = timeline.getBoundingClientRect();
        const x = e.clientX - rect.left;
  
        const minutes = Math.floor(x / 2);
  
        addSeance({
          hallId: Number(hallId),
          movieId: data.id,
          title: data.title,
          start: minutes,
          duration: data.duration
        });
      });
    });
  }

  function addSeance(seance) {
    seances.push({
      ...seance,
      id: Date.now()
    });
  
    localStorage.setItem('seances', JSON.stringify(seances));
    renderSeances();
  }

  function renderSeances() {
    document.querySelectorAll('.timeline').forEach(t => t.innerHTML = '');
  
    seances.forEach(seance => {
      const timeline = document.querySelector(
        `.hall-schedule[data-hall="${seance.hallId}"] .timeline`
      );
  
      if (!timeline) return;
  
      const el = document.createElement('div');
      el.className = 'seance';
      el.style.left = `${seance.start * 2}px`;
      el.style.width = `${seance.duration * 2}px`;
  
      el.textContent = seance.title;
  
      el.addEventListener('dblclick', () => {
        removeSeance(seance.id);
      });
  
      timeline.appendChild(el);
    });
  }

  function removeSeance(id) {
    seances = seances.filter(s => s.id !== id);
    localStorage.setItem('seances', JSON.stringify(seances));
    renderSeances();
  }

  /* ================== СТАРТ ================== */

  loadData();

});