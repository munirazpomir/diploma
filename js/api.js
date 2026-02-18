const API_URL = 'https://shfe-diplom.neto-server.ru';
/**
 * Универсальный запрос
 */
async function request(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

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


export async function login(loginValue, passwordValue) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      login: loginValue,
      password: passwordValue
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Ошибка авторизации');
  }

  return data;
}


/**
 * Залы
 */
export async function createHall(name) {
  const params = new FormData();
  params.set('hallName', name);

  const response = await fetch(`${API_URL}/hall`, {
    method: 'POST',
    body: params
  });

  const data = await response.json();

  console.log('CREATE HALL RESPONSE:', data);

  return data;
}

export function deleteHall(hallId) {
  return request(`/hall/${hallId}`, {
    method: 'DELETE'
  });
}

export async function updateHall(hallId, rowCount, placeCount, configArray) {
  const params = new FormData();

  params.append('rowCount', String(rowCount));
  params.append('placeCount', String(placeCount));
  params.append('config', JSON.stringify(configArray));

  const response = await fetch(`${API_URL}/hall/${hallId}`, {
    method: 'POST',
    body: params
  });

  const data = await response.json();

  console.log('UPDATE HALL RESPONSE:', data);

  return data;
}

export async function setPrices(hallId, regular, vip) {
  const params = new FormData();
  params.set('priceStandart', regular);
  params.set('priceVip', vip);

  const response = await fetch(
    `https://shfe-diplom.neto-server.ru/price/${hallId}`,
    {
      method: 'POST',
      body: params
    }
  );

  const data = await response.json();
  console.log('SET PRICE RESPONSE:', data);

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.result;
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