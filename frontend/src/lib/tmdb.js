import axios from 'axios';

const TMDB_KEY = 'c8dea14dc917687ac631a52620e4f7ad';
const BASE = 'https://api.themoviedb.org/3';
export const IMG = (path, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : '';

const cache = new Map();
const cached = async (key, fn) => {
  if (cache.has(key)) return cache.get(key);
  const data = await fn();
  cache.set(key, data);
  return data;
};

export const getNowPlaying = () => cached('now', async () => {
  const r = await axios.get(`${BASE}/movie/now_playing`, { params: { api_key: TMDB_KEY, region: 'IN', page: 1 } });
  return r.data.results;
});

export const getUpcoming = () => cached('upcoming', async () => {
  const r = await axios.get(`${BASE}/movie/upcoming`, { params: { api_key: TMDB_KEY, region: 'IN', page: 1 } });
  return r.data.results;
});

export const getPopular = () => cached('popular', async () => {
  const r = await axios.get(`${BASE}/movie/popular`, { params: { api_key: TMDB_KEY, region: 'IN', page: 1 } });
  return r.data.results;
});

export const getMovieDetails = (id) => cached(`m_${id}`, async () => {
  const r = await axios.get(`${BASE}/movie/${id}`, { params: { api_key: TMDB_KEY, append_to_response: 'credits,videos,images' } });
  return r.data;
});

export const searchMovies = async (q) => {
  const r = await axios.get(`${BASE}/search/movie`, { params: { api_key: TMDB_KEY, query: q } });
  return r.data.results;
};
