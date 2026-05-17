import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getNowPlaying, getUpcoming, getPopular, searchMovies } from '../lib/tmdb';
import { MovieCard, EventCard, SkeletonCard } from '../components/MovieCard';
import { LANGUAGES, GENRES } from '../mock';
import { catalogApi } from '../lib/api';

const ListingPage = ({ type }) => {
  const [params] = useSearchParams();
  const q = params.get('q');
  const [movies, setMovies] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState(null);
  const [filterGenre, setFilterGenre] = useState(null);
  const navigate = useNavigate();

  const titles = {
    movies: q ? `Search results for "${q}"` : 'Movies',
    events: 'Events',
    plays: 'Plays',
    sports: 'Sports'
  };

  useEffect(() => {
    setLoading(true);
    if (type === 'movies') {
      const loader = q ? searchMovies(q) : Promise.all([getNowPlaying(), getUpcoming(), getPopular()]).then(([a, b, c]) => {
        const map = new Map();
        [...a, ...b, ...c].forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });
      loader.then(data => { setMovies(data); setLoading(false); }).catch(() => setLoading(false));
    } else {
      const fetcher = type === 'events' ? catalogApi.events : type === 'plays' ? catalogApi.plays : catalogApi.sports;
      fetcher().then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [type, q]);

  // items is from state above

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-[#333] text-white py-5">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-semibold">{titles[type]}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {type === 'movies' && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700 mr-2 self-center">Languages:</span>
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => setFilterLang(filterLang === l ? null : l)} className={`chip ${filterLang === l ? 'active' : ''}`}>{l}</button>
            ))}
            <span className="text-sm font-medium text-gray-700 mx-2 self-center">Genres:</span>
            {GENRES.map(g => (
              <button key={g} onClick={() => setFilterGenre(filterGenre === g ? null : g)} className={`chip ${filterGenre === g ? 'active' : ''}`}>{g}</button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {type === 'movies'
            ? (loading ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />) : movies.map(m => <MovieCard key={m.id} movie={m} />))
            : items.map(it => <EventCard key={it.id} item={it} />)}
        </div>

        {type === 'movies' && !loading && movies.length === 0 && (
          <p className="text-center text-gray-500 py-10">No movies found.</p>
        )}
      </div>
    </div>
  );
};

export default ListingPage;
