import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { IMG } from '../lib/tmdb';

export const MovieCard = ({ movie, recommended }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/movies/${movie.id}`)}
      className="movie-card cursor-pointer flex-shrink-0 w-44 md:w-52"
    >
      <div className="relative rounded-lg overflow-hidden bg-gray-200" style={{ aspectRatio: '2/3' }}>
        {movie.poster_path ? (
          <img src={IMG(movie.poster_path)} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">No Image</div>
        )}
        <div className="absolute top-2 left-2 flex items-center bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          <Star className="w-3 h-3 fill-red-400 text-red-400 mr-1" />
          <span>{movie.vote_average?.toFixed(1) || '—'}/10</span>
        </div>
        {recommended && (
          <div className="absolute top-0 left-0 bg-yellow-400 text-[10px] px-2 py-0.5 font-semibold">RECOMMENDED</div>
        )}
      </div>
      <h3 className="mt-2 font-semibold text-sm text-gray-800 truncate">{movie.title}</h3>
      <p className="text-xs text-gray-500 truncate">Drama/Action</p>
    </div>
  );
};

export const EventCard = ({ item }) => (
  <div className="movie-card cursor-pointer flex-shrink-0 w-44 md:w-52">
    <div className="relative rounded-lg overflow-hidden bg-gray-200" style={{ aspectRatio: '2/3' }}>
      <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-white text-[10px]">{item.date}</p>
      </div>
    </div>
    <h3 className="mt-2 font-semibold text-sm text-gray-800 truncate">{item.title}</h3>
    <p className="text-xs text-gray-500 truncate">{item.venue}</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="flex-shrink-0 w-44 md:w-52">
    <div className="skeleton rounded-lg" style={{ aspectRatio: '2/3' }} />
    <div className="skeleton h-3 mt-2 rounded" />
    <div className="skeleton h-2 mt-1 rounded w-2/3" />
  </div>
);

export const ScrollRow = ({ title, children, viewAll }) => (
  <section className="max-w-7xl mx-auto px-4 mt-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="section-title">{title}</h2>
      {viewAll && <button onClick={viewAll} className="text-sm text-red-500 hover:underline">See All &gt;</button>}
    </div>
    <div className="flex gap-4 overflow-x-auto scroll-row pb-2">
      {children}
    </div>
  </section>
);
