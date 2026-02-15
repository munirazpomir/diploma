const API_URL = 'https://shfe-diplom.neto-server.ru';

/**
 * Универсальный запрос
 */
async function request(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Если body — обычный объект, превращаем в JSON
  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API error');
  }

  return data;
}

/**
 * Получить все данные
 */
export function getAllData() {
  return request('/alldata');
}

/**
 * Авторизация
 */
let token = localStorage.getItem('token');

export async function login(loginValue, passwordValue) {
  const data = await request('/login', {
    method: 'POST',
    body: {
      login: loginValue,
      password: passwordValue
    }
  });

  token = data.result?.token || data.token;
  localStorage.setItem('token', token);

  return data;
}

/**
 * Залы
 */
export function createHall(name) {
  return request('/hall', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      hall_name: name
    })
  });
}

export function deleteHall(hallId) {
  return request(`/hall/${hallId}`, {
    method: 'DELETE'
  });
}

export function updateHall(hallId, rows, seats, config) {
  return request(`/hall/${hallId}`, {
    method: 'POST',
    body: JSON.stringify({ rows, seats, config })
  });
}

export function setPrices(hallId, priceStandard, priceVip) {
  return request(`/price/${hallId}`, {
    method: 'POST',
    body: JSON.stringify({
      priceStandart: priceStandard,
      priceVip: priceVip
    })
  });
}

export function openSales(hallId) {
  return request(`/open/${hallId}`, {
    method: 'POST'
  });
}

export function getHallConfig() {
  return request('/hallconfig');
}

/**
 * Фильмы
 */
export function createFilm(filmData) {
  return request('/film', {
    method: 'POST',
    body: JSON.stringify(filmData)
  });
}

export function deleteFilm(filmId) {
  return request(`/film/${filmId}`, {
    method: 'DELETE'
  });
}

/**
 * Сеансы
 */
export function createSeance(seanceData) {
  return request('/seance', {
    method: 'POST',
    body: JSON.stringify(seanceData)
  });
}

export function deleteSeance(seanceId) {
  return request(`/seance/${seanceId}`, {
    method: 'DELETE'
  });
}

/**
 * Покупка билетов
 */
export function buyTicket(ticketData) {
  return request('/ticket', {
    method: 'POST',
    body: JSON.stringify(ticketData)
  });
}