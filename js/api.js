const API_URL = 'https://shfe-diplom.neto-server.ru';

async function requestPublic(url, options = {}) {
  const response = await fetch(API_URL + url, {
    ...options
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Ошибка сервера');
  }

  return data.result;
}

async function requestPrivate(url, options = {}) {
  const response = await fetch(API_URL + url, {
    mode: 'cors',
    credentials: 'include',
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

async function getAllData() {
  const data = await requestPublic('/alldata');

  const localHalls = getLocalHalls();

  if (localHalls.length) {
    data.halls = [...data.halls, ...localHalls];
  }

  return data;
}

getAllData().then(data => {
  console.log(data.halls);
});

async function createHall(name, rows = 10, places = 8) {
  const fd = new FormData();
  fd.append('hall_name', name);
  fd.append('hall_rows', rows);
  fd.append('hall_places', places);

  try {
    return await requestPrivate('/hall', {
      method: 'POST',
      body: fd
    });
  } catch (e) {
    console.warn('SERVER FAILED → SAVE LOCAL HALL');

    const halls = getLocalHalls();

    const newHall = {
      id: Date.now(), // локальный ID
      hall_name: name,
      hall_rows: rows,
      hall_places: places,
      hall_config: [],
      hall_price_standart: 0,
      hall_price_vip: 0,
      hall_open: 0,
      __local: true
    };

    halls.push(newHall);
    saveLocalHalls(halls);

    return newHall;
  }
}

async function deleteHall(id) {
  try {
    return await requestPrivate(`/hall/${id}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('SERVER FAILED → DELETE LOCAL HALL');

    const halls = getLocalHalls().filter(h => h.id !== id);
    saveLocalHalls(halls);

    return true;
  }
}

async function updateHallConfig(hallId, config) {
  try {
    const fd = new FormData();
    fd.append('hall_config', JSON.stringify(config));

    return await requestPrivate(`/hall/${hallId}`, {
      method: 'POST',
      body: fd
    });
  } catch (e) {
    console.warn('SERVER FAILED → SAVE CONFIG LOCAL');
    saveLocalHallConfig(hallId, config);
    return true;
  }
}

function setHallPrices(id, price, vipPrice) {
  const fd = new FormData();
  fd.append('price', price);
  fd.append('vip_price', vipPrice);

  return requestPrivate(`/hall/${id}/price`, {
    method: 'POST',
    body: fd
  });
}

function createMovie(name, duration, description, country) {
  const fd = new FormData();
  fd.append('film_name', name);
  fd.append('film_duration', duration);
  fd.append('film_description', description);
  fd.append('film_origin', country);

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

function getLocalHalls() {
  return JSON.parse(localStorage.getItem('localHalls') || '[]');
}

function saveLocalHalls(halls) {
  localStorage.setItem('localHalls', JSON.stringify(halls));
}

function saveLocalHallConfig(hallId, config) {
  localStorage.setItem(
    `hallConfig_${hallId}`,
    JSON.stringify(config)
  );
}

function getLocalHallConfig(hallId) {
  return JSON.parse(
    localStorage.getItem(`hallConfig_${hallId}`) || '[]'
  );
}