const API_URL = 'https://shfe-diplom.neto-server.ru';

async function requestPublic(url, options = {}) {
  const response = await fetch(API_URL + url, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Ошибка сервера');
  }

  return data.result;
}

async function requestPrivate(url, options = {}) {
  const response = await fetch(API_URL + url, {
    ...options
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Ошибка сервера');
  }

  return data.result;
}

function loginAdmin(login, password) {
  const fd = new FormData();
  fd.append('login', login);
  fd.append('password', password);

  return requestPublic('/login', {
    method: 'POST',
    body: fd
  });
}

function getAllData() {
  return requestPublic('/alldata');
}

getAllData().then(data => {
  console.log(data.halls);
});

function createHall(name, rows, places) {
  const fd = new FormData();
  fd.append('hall_name', name);
  fd.append('hall_rows', rows);
  fd.append('hall_places', places);

  return requestPrivate('/hall', {
    method: 'POST',
    body: fd
  });
}

function deleteHall(id) {
  return requestPrivate(`/hall/${id}`, {
    method: 'DELETE'
  });
}

function updateHallConfig(id, rows, places, config) {
  const fd = new FormData();

  fd.append('hall_rows', String(rows));
  fd.append('hall_places', String(places));
  fd.append('hall_config', JSON.stringify(config));

  // ВАЖНО: логируем то, что реально уходит
  for (let pair of fd.entries()) {
    console.log(pair[0], pair[1]);
  }

  return requestPrivate(`/hall/${id}`, {
    method: 'POST',
    body: fd
  });
}

function setHallPrices(id, price, vipPrice) {
  const fd = new FormData();
  fd.append('hall_price_standart', price);
  fd.append('hall_price_vip', vipPrice);

  return requestPrivate(`/hall/${id}/price`, {
    method: 'POST',
    body: fd
  });
}

function toggleHallSales(id, open) {
  const fd = new FormData();
  fd.append('hall_open', open ? '1' : '0');

  return requestPrivate(`/hall/${id}/open`, {
    method: 'POST',
    body: fd
  });
}

function createMovie(title, duration, description, country) {
  const fd = new FormData();
  fd.append('title', title);
  fd.append('duration', duration);
  fd.append('description', description);
  fd.append('country', country);

  return requestPrivate('/movie', {
    method: 'POST',
    body: fd
  });
}

function deleteMovie(id) {
  return requestPrivate(`/movie/${id}`, {
    method: 'DELETE'
  });
}

function createSeance(movieId, hallId, time) {
  const fd = new FormData();
  fd.append('movie_id', movieId);
  fd.append('hall_id', hallId);
  fd.append('time', time);

  return requestPrivate('/seance', {
    method: 'POST',
    body: fd
  });
}

function deleteSeance(id) {
  return requestPrivate(`/seance/${id}`, {
    method: 'DELETE'
  });
}

function getHallConfig(seanceId, date) {
  return requestPublic(
    `/hallconfig?seance_id=${seanceId}&date=${date}`
  );
}

function buyTicket(seanceId, places) {
  const fd = new FormData();
  fd.append('seance_id', seanceId);
  fd.append('places', JSON.stringify(places));

  return requestPrivate('/ticket', {
    method: 'POST',
    body: fd
  });
}