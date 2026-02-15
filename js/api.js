const API_URL = 'https://shfe-diplom.neto-server.ru';

/**
 * Универсальный запрос
 */
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Получить все данные (ГЛАВНЫЙ запрос)
 */
export function getAllData() {
  return request('/alldata');
}

/**
 * Авторизация
 */
let token = null;

export async function login(login, password) {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ login, password })
  });

  token = data.token;
  return data;
}

/**
 * Залы
 */
export function createHall(name) {
  return fetch(`${API_URL}/hall`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: new URLSearchParams({
      hall_name: name
    })
  }).then(res => res.json());
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