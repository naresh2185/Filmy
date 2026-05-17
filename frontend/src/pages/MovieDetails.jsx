import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, IMG } from '../lib/tmdb';
import { Star, Clock, Calendar, Play, Heart, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { CINEMAS, SHOWTIMES } from '../mock';
import { useApp } from '../context/AppContext';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [showBookSection, setShowBookSection] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const { city } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getMovieDetails(id).then(d => { setMovie(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading || !movie) {
    return <div className="max-w-7xl mx-auto px-4 py-10"><div className="skeleton h-96 rounded-lg" /></div>;
  }

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') || movie.videos?.results?.[0];
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';
  const genres = movie.genres?.map(g => g.name).join(', ');
  const cast = movie.credits?.cast?.slice(0, 8) || [];
  const certification = 'UA';

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase(), date: d.getDate(), month: d.toLocaleDateString('en', { month: 'short' }).toUpperCase(), full: d };
  });

  const handleSelectShow = (cinemaId, time) => {
    navigate(`/booking/${movie.id}/seats?cinema=${cinemaId}&time=${encodeURIComponent(time)}&date=${dates[selectedDate].full.toISOString()}`);
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative" style={{ background: '#1f1f1f' }}>
        <div className="absolute inset-0 opacity-30">
          {movie.backdrop_path && <img src={IMG(movie.backdrop_path, 'original')} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
          <div className="relative w-56 flex-shrink-0">
            <img src={IMG(movie.poster_path)} alt={movie.title} className="w-full rounded-lg shadow-xl" />
            {trailer && (
              <button onClick={() => setTrailerOpen(true)} className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                </div>
              </button>
            )}
          </div>
          <div className="text-white flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{movie.title}</h1>
            <div className="inline-flex items-center bg-gray-800/80 rounded-md px-3 py-2 mb-3">
              <Star className="w-4 h-4 fill-red-400 text-red-400 mr-2" />
              <span className="font-semibold">{movie.vote_average?.toFixed(1)}/10</span>
              <span className="text-xs text-gray-300 ml-2">({(movie.vote_count / 1000).toFixed(0)}K Votes)</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="chip bg-white/10 border-white/20 text-white">2D</span>
              <span className="chip bg-white/10 border-white/20 text-white">{movie.original_language?.toUpperCase()}</span>
            </div>
            <p className="text-sm text-gray-200 mb-3">{runtime} {runtime && '•'} {genres} {genres && '•'} {certification} {movie.release_date && `• ${new Date(movie.release_date).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })}`}</p>
            <Button
              onClick={() => setShowBookSection(true)}
              className="text-white px-8 py-3 h-auto text-base font-semibold"
              style={{ background: '#f84464' }}
            >
              Book tickets
            </Button>
            <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"><Heart className="w-4 h-4" />In Watchlist</button>
              <button className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"><Share2 className="w-4 h-4" />Share</button>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-3">About the movie</h2>
        <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">{movie.overview}</p>
      </section>

      {/* Cast */}
      {cast.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-xl font-semibold mb-4">Cast</h2>
          <div className="flex gap-6 overflow-x-auto scroll-row pb-3">
            {cast.map(c => (
              <div key={c.id} className="flex-shrink-0 text-center w-24">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-200 mb-2">
                  {c.profile_path ? <img src={IMG(c.profile_path)} alt={c.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300" />}
                </div>
                <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{c.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Showtimes */}
      {showBookSection && (
        <section id="book" className="bg-gray-50 border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-semibold mb-4">Showtimes — {city}</h2>
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
              {dates.map((d, i) => (
                <button
                  key={d.full.toISOString()}
                  onClick={() => setSelectedDate(i)}
                  className={`flex flex-col items-center justify-center min-w-[68px] py-2 px-3 rounded-md border ${selectedDate === i ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'}`}
                  style={selectedDate === i ? { background: '#f84464' } : {}}
                >
                  <span className="text-[10px]">{d.day}</span>
                  <span className="text-xl font-bold leading-none">{d.date}</span>
                  <span className="text-[10px]">{d.month}</span>
                </button>
              ))}
            </div>
            <div className="bg-white rounded-md divide-y divide-gray-100">
              {CINEMAS.map(c => (
                <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="md:w-1/3">
                    <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.address} • {c.distance}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {SHOWTIMES.map(t => (
                      <button
                        key={t}
                        onClick={() => handleSelectShow(c.id, t)}
                        className="px-3 py-1.5 border border-green-500 text-green-600 text-xs rounded hover:bg-green-50 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trailer modal */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black">
          {trailer && (
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title="trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MovieDetails;
