// =========================
// ГЛОБАЛЬНЫЕ ДАННЫЕ
// =========================

let halls = [];
let movies = [];
let seances = [];

let selectedHall = null;
let selectedConfigHall = null;
let selectedPriceHall = null;

// =========================
// УТИЛИТЫ СОХРАНЕНИЯ
// =========================

function saveHalls() {
  localStorage.setItem('halls', JSON.stringify(halls));
}

function saveMovies() {
  localStorage.setItem('movies', JSON.stringify(movies));
}

function saveSeances() {
  localStorage.setItem('seances', JSON.stringify(seances));
}

// =========================
// ЗАГРУЗКА ДАННЫХ
// =========================

async function loadData() {
  const savedHalls = localStorage.getItem('halls');
  const savedMovies = localStorage.getItem('movies');
  const savedSeances = localStorage.getItem('seances');

  if (savedHalls && savedMovies && savedSeances) {
    halls = JSON.parse(savedHalls);
    movies = JSON.parse(savedMovies);
    seances = JSON.parse(savedSeances);
    initAdmin();
    return;
  }

  const data = await getData();

  halls = data.halls.map(h => ({
    id: h.id,
    hall_name: h.hall_name,
    hall_config: h.hall_config || [],
    hall_price_standart: h.hall_price_standart || 0,
    hall_price_vip: h.hall_price_vip || 0,
    hall_open: false
  }));

  movies = data.films;
  seances = [];

  saveHalls();
  saveMovies();
  saveSeances();

  initAdmin();
}

// =========================
// ИНИЦИАЛИЗАЦИЯ
// =========================

function initAdmin() {
  renderHallList();
  renderConfigHalls();
  renderPriceHalls();
  renderSalesHalls();
  renderMovies();
}

// =========================
// УПРАВЛЕНИЕ ЗАЛАМИ
// =========================

const hallList = document.getElementById('hallList');
const addHallBtn = document.getElementById('addHallBtn');

function renderHallList() {
  hallList.innerHTML = '';
  halls.forEach(hall => {
    const li = document.createElement('li');
    li.textContent = hall.hall_name;
    hallList.appendChild(li);
  });
}

// =========================
// КОНФИГУРАЦИЯ ЗАЛА
// =========================

const configHallList = document.getElementById('configHallList');
const hallGrid = document.getElementById('hallGrid');
const rowsInput = document.getElementById('rowsInput');
const seatsInput = document.getElementById('seatsInput');
const saveConfigBtn = document.getElementById('saveConfigBtn');

function renderConfigHalls() {
  configHallList.innerHTML = '';
  halls.forEach(hall => {
    const btn = document.createElement('button');
    btn.className = 'hall-btn';
    btn.textContent = hall.hall_name;

    btn.onclick = () => {
      selectedConfigHall = hall;
      rowsInput.value = hall.hall_config.length || 5;
      seatsInput.value = hall.hall_config[0]?.length || 5;
      renderHallScheme();
    };

    configHallList.appendChild(btn);
  });
}

function renderHallScheme() {
  if (!selectedConfigHall) return;

  hallGrid.innerHTML = '';
  const rows = Number(rowsInput.value);
  const seats = Number(seatsInput.value);

  if (!selectedConfigHall.hall_config.length) {
    selectedConfigHall.hall_config = Array.from({ length: rows }, () =>
      Array.from({ length: seats }, () => 1)
    );
  }

  selectedConfigHall.hall_config.forEach((row, r) => {
    row.forEach((seat, s) => {
      const div = document.createElement('div');
      div.className = 'seat';
      div.classList.add(
        seat === 1 ? 'standart' :
        seat === 2 ? 'vip' : 'disabled'
      );

      div.onclick = () => {
        selectedConfigHall.hall_config[r][s] =
          seat === 1 ? 2 : seat === 2 ? 0 : 1;
        renderHallScheme();
      };

      hallGrid.appendChild(div);
    });
  });
}

saveConfigBtn.onclick = () => {
  if (!selectedConfigHall) return;
  saveHalls();
  alert('Конфигурация зала сохранена');
};

// =========================
// КОНФИГУРАЦИЯ ЦЕН
// =========================

const priceHallList = document.getElementById('priceHallList');
const priceRegularInput = document.getElementById('priceRegular');
const priceVipInput = document.getElementById('priceVip');
const priceSaveBtn = document.getElementById('priceSave');

function renderPriceHalls() {
  priceHallList.innerHTML = '';
  halls.forEach(hall => {
    const btn = document.createElement('button');
    btn.className = 'hall-btn';
    btn.textContent = hall.hall_name;

    btn.onclick = () => {
      selectedPriceHall = hall;
      priceRegularInput.value = hall.hall_price_standart;
      priceVipInput.value = hall.hall_price_vip;
    };

    priceHallList.appendChild(btn);
  });
}

priceSaveBtn.onclick = () => {
  if (!selectedPriceHall) return;

  selectedPriceHall.hall_price_standart = Number(priceRegularInput.value);
  selectedPriceHall.hall_price_vip = Number(priceVipInput.value);

  saveHalls();
  alert('Цены сохранены');
};

// =========================
// ПРОДАЖИ
// =========================

const salesHallList = document.getElementById('salesHallList');
const salesStatus = document.getElementById('salesStatus');
const toggleSalesBtn = document.getElementById('toggleSalesBtn');

function renderSalesHalls() {
  salesHallList.innerHTML = '';
  halls.forEach(hall => {
    const btn = document.createElement('button');
    btn.className = 'hall-btn';
    btn.textContent = hall.hall_name;

    btn.onclick = () => {
      selectedHall = hall;
      updateSalesUI();
    };

    salesHallList.appendChild(btn);
  });
}

function updateSalesUI() {
  if (!selectedHall) return;
  salesStatus.textContent = selectedHall.hall_open
    ? 'Продажи открыты'
    : 'Продажи закрыты';

  toggleSalesBtn.textContent = selectedHall.hall_open
    ? 'Закрыть продажу билетов'
    : 'Открыть продажу билетов';
}

toggleSalesBtn.onclick = () => {
  if (!selectedHall) return;
  selectedHall.hall_open = !selectedHall.hall_open;
  saveHalls();
  updateSalesUI();
};

// =========================
// ФИЛЬМЫ
// =========================

const movieList = document.getElementById('movieList');

function renderMovies() {
  movieList.innerHTML = '';
  movies.forEach(movie => {
    const div = document.createElement('div');
    div.className = 'movie-item';
    div.textContent = movie.title;
    movieList.appendChild(div);
  });
}

// =========================
// СТАРТ
// =========================

document.addEventListener('DOMContentLoaded', loadData);