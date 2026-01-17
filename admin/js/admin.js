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
  const saveBtn = document.getElementById('saveHallConfig');

  let halls = [];
  let movies = [];

  let selectedHallId = null;
  let hallConfig = [];

  /* ================== ЗАГРУЗКА ДАННЫХ ================== */

  async function loadData() {
    try {
      const data = await getAllData();
      halls = data.halls;
      movies = data.films || [];

      renderHalls();
      renderPriceHalls();
      renderSalesHalls();
      renderMovies();
    } catch (err) {
      console.error(err);
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
    selectedHallId = hall.id;
  
    if (Array.isArray(hall.hall_config) && hall.hall_config.length) {
      hallConfig = hall.hall_config;
    } else {
      createHallConfig(hall.hall_rows, hall.hall_places);
      return;
    }
  
    renderHallGrid();
  }

  const hallGrid = document.getElementById('hallGrid');

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

  try {
    await updateHallConfig(selectedHallId, hallConfig);
    alert('Конфигурация сохранена');
    loadData();
  } catch (err) {
    alert(err.message);
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

        priceRegularInput.value = hall.price || 0;
        priceVipInput.value = hall.vip_price || 0;
      });

      priceHallList.appendChild(btn);
    });
  }

  priceSaveBtn.addEventListener('click', async () => {
    if (!selectedPriceHall) {
      alert('Выберите зал');
      return;
    }

    await setHallPrices(selectedPriceHall.id,
      priceRegularInput.value,
      priceVipInput.value
    );

    alert('Цены сохранены');
    loadData();
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

    await openHallSales(
      selectedSalesHall.id,
      !selectedSalesHall.is_open
    );

    loadData();
  });

  /* ================== ФИЛЬМЫ (ПОКА ТОЛЬКО ОТОБРАЖЕНИЕ) ================== */

  const movieList = document.getElementById('movieList');

  function renderMovies() {
    movieList.innerHTML = '';

    if (!movies.length) return;

    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="movie-title">${movie.movie_name}</div>
        <div class="movie-duration">${movie.movie_duration} мин</div>
      `;
      movieList.appendChild(card);
    });
  }

  /* ================== СТАРТ ================== */

  loadData();

});