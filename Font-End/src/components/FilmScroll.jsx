import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Star, Crown } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate } from 'react-router-dom';

export default function FilmScroll({ title = 'Phim Đang Hot', category = '' }) {
  const navigate  = useNavigate();
  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      const url = new URL('http://localhost:5000/api/moviescroll');
      if (category) url.searchParams.append('category', category);
      try {
        const response = await fetch(url.toString(), { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMovies(data.map(movie => ({
          id:     movie.MovieID,
          title:  movie.Title,
          year:   movie.ReleaseDate ? new Date(movie.ReleaseDate).getFullYear() : 'N/A',
          rating: (movie.AverageRating != null && movie.AverageRating > 0)
                    ? Number(movie.AverageRating).toFixed(1)
                    : '10.0',
          image:  movie.PosterURL
                    ? encodeURI(`http://localhost:5000${movie.PosterURL}`)
                    : 'https://via.placeholder.com/220x320',
          isVip:  movie.IsVip === 1,  // ← VIP flag
        })));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [category]);

  if (loading) return (
    <section className="bg-black text-white pt-10">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-3xl font-semibold mb-4">{title}</h2>
        <p>Đang tải...</p>
      </div>
    </section>
  );
  if (error) return (
    <section className="bg-black text-white pt-10">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-3xl font-semibold mb-4">{title}</h2>
        <p className="text-red-500">Lỗi: {error}</p>
      </div>
    </section>
  );
  if (!loading && !error && movies.length === 0) return null;

  return (
    <section className="bg-black text-white pt-5">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-3xl font-semibold mb-4">{title}</h2>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          breakpoints={{ 320:{slidesPerView:1}, 640:{slidesPerView:2}, 768:{slidesPerView:3}, 1024:{slidesPerView:5} }}
          navigation autoplay={{ delay: 2500 }} loop
        >
          {movies.map(movie => (
            <SwiperSlide key={movie.id}>
              <div className="relative group cursor-pointer" onClick={() => navigate(`/trailer/${movie.id}`)}>
                <div className="overflow-hidden rounded-lg w-[220px] h-[320px] relative">
                  <img src={movie.image} alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />

                  {/* ── Badge VIP ── */}
                  {movie.isVip && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
                      <Crown className="w-3 h-3" /> VIP
                    </div>
                  )}

                  {/* Overlay hover */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition duration-500 ease-in-out bg-gradient-to-t from-black p-4">
                    <h3 className="text-xl font-bold text-white drop-shadow">{movie.title}</h3>
                    <p className="text-yellow-400 font-medium">{movie.year}</p>
                    <p className="text-pink-400 text-sm mt-1">
                      <Star className="inline text-yellow-300 fill-current" size={14} /> {movie.rating}/10
                    </p>
                    {movie.isVip && (
                      <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Nội dung VIP
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
