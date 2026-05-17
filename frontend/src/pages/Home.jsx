import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Film, Tv, Music, Drama, Trophy, Sparkles } from 'lucide-react';
import { getNowPlaying, getUpcoming, getPopular, IMG } from '../lib/tmdb';
import { PROMO_BANNERS } from '../mock';
import { catalogApi } from '../lib/api';
import { MovieCard, EventCard, SkeletonCard, ScrollRow } from '../components/MovieCard';
const HeroCarousel = () => {
  const [idx, setIdx] = useState(0);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    getPopular().then(data => {
      const top = data.slice(0, 5).map(m => ({
        id: m.id,
        image: IMG(m.backdrop_path, 'original'),
        title: m.title,
        overview: m.overview
      }));
      setBanners(top.length ? top : PROMO_BANNERS);
    }).catch(() => setBanners(PROMO_BANNERS));
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) {
    return <div className="skeleton w-full" style={{ height: 380 }} />;
  }

  return (
    <div className="relative bg-[#222]" style={{ height: 380 }}>
      <div className="max-w-7xl mx-auto h-full relative overflow-hidden">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === idx ? 1 : 0 }}
          >
            <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white max-w-md">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{b.title}</h2>
              {b.overview && <p className="text-sm text-gray-200 line-clamp-2">{b.overview}</p>}
            </div>
          </div>
        ))}
        <button onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)} className="hero-arrow absolute left-4 top-1/2 -translate-y-1/2">
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <button onClick={() => setIdx(i => (i + 1) % banners.length)} className="hero-arrow absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((b, i) => (
            <button key={b.id} onClick={() => setIdx(i)} className="w-2 h-2 rounded-full" style={{ background: i === idx ? 'white' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryStrip = () => {
  const cats = [
    { label: 'Movies', Icon: Film, color: '#f84464' },
    { label: 'Stream', Icon: Tv, color: '#7e57c2' },
    { label: 'Events', Icon: Music, color: '#26a69a' },
    { label: 'Plays', Icon: Drama, color: '#ff7043' },
    { label: 'Sports', Icon: Trophy, color: '#ffb300' },
    { label: 'Activities', Icon: Sparkles, color: '#5c6bc0' }
  ];
  return (
    <div className="bg-[#f5f5fa] py-3">
      <div className="max-w-7xl mx-auto px-4 flex justify-center md:justify-between overflow-x-auto gap-6">
        {cats.map(c => (
          <div key={c.label} className="flex flex-col items-center cursor-pointer text-xs text-gray-700 hover:text-red-500">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
              <c.Icon className="w-5 h-5" style={{ color: c.color }} />
            </div>
            <span className="whitespace-nowrap">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [events, setEvents] = useState([]);
  const [plays, setPlays] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getNowPlaying(), getUpcoming()])
      .then(([np, up]) => {
        setNowPlaying(np);
        setUpcoming(up);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    catalogApi.events().then(setEvents).catch(() => {});
    catalogApi.plays().then(setPlays).catch(() => {});
    catalogApi.sports().then(setSports).catch(() => {});
  }, []);

  const skel = Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />);

  return (
    <div className="pb-10">
      <HeroCarousel />
      <CategoryStrip />

      <ScrollRow title="Recommended Movies" viewAll={() => navigate('/movies')}>
        {loading ? skel : nowPlaying.slice(0, 12).map((m, i) => <MovieCard key={m.id} movie={m} recommended={i < 2} />)}
      </ScrollRow>

      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="rounded-lg overflow-hidden relative" style={{ background: 'linear-gradient(90deg, #1f1135 0%, #2d1b69 100%)' }}>
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <p className="text-xs tracking-widest text-yellow-300 mb-1">PREMIERE</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-1">Watch the latest & biggest premieres</h3>
              <p className="text-sm text-gray-200">From international titles to your favorite shows.</p>
            </div>
            <button className="bg-white text-gray-900 px-5 py-2 rounded-md text-sm font-semibold hover:bg-gray-100">Explore Now</button>
          </div>
        </div>
      </section>

      <ScrollRow title="The Best Of Live Events" viewAll={() => navigate('/events')}>
        {events.map(e => <EventCard key={e.id} item={e} />)}
      </ScrollRow>

      <ScrollRow title="Premieres" viewAll={() => navigate('/movies')}>
        {loading ? skel : upcoming.slice(0, 12).map(m => <MovieCard key={m.id} movie={m} />)}
      </ScrollRow>

      <ScrollRow title="Plays In Your City" viewAll={() => navigate('/plays')}>
        {plays.map(p => <EventCard key={p.id} item={p} />)}
      </ScrollRow>

      <ScrollRow title="Sports Events" viewAll={() => navigate('/sports')}>
        {sports.map(s => <EventCard key={s.id} item={s} />)}
      </ScrollRow>
    </div>
  );
};

export default Home;
