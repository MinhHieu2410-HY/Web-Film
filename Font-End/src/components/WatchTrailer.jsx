// components/WatchTrailer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { Star, Eye, Crown, Lock, LogIn } from 'lucide-react';

const SingleMovieTrailer = () => {
  const [movie,   setMovie]   = useState(null);
  const [ratings, setRatings] = useState([]);
  const { movieID }  = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  const userId     = localStorage.getItem('userId');
  const isLoggedIn = !!userId;

  useEffect(() => {
    fetch(`http://localhost:5000/api/movie/${movieID}`, {
      headers: userId ? { 'user-id': userId } : {}
    })
      .then(res => res.json())
      .then(setMovie)
      .catch(console.error);

    fetchRatings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieID]);

  const fetchRatings = async () => {
    try {
      const res  = await fetch(`http://localhost:5000/api/ratings?movieId=${parseInt(movieID)}`);
      const data = await res.json();
      setRatings(data);
    } catch (err) {
    }
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.Score, 0) / ratings.length).toFixed(1)
    : '10.0';
  const totalRatings = ratings.length;

  // Redirect về login, sau khi login xong quay lại trang này
  const goToLogin = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  // Xem phim: nếu chưa login → login trước; nếu đã login → vào /watch
  const handleWatchClick = () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }
    navigate(`/watch/${movieID}`);
  };

  if (!movie) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4" />
        <p>Đang tải...</p>
      </div>
    </div>
  );

  const accessLevel = movie.accessLevel; // 'full' | 'need_vip' | 'trailer_only'

  // ── Nút xem phim – render theo quyền ────────────────────────────────────────
  const WatchButton = () => {
    // Chưa đăng nhập
    if (!isLoggedIn) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 text-sm">
            <Lock size={16} />
            <span>Đăng nhập để xem phim đầy đủ</span>
          </div>
          <button
            onClick={goToLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <LogIn size={18} /> Đăng nhập để xem
          </button>
        </div>
      );
    }

    // Đã login – phim VIP nhưng chưa có VIP
    if (accessLevel === 'need_vip') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-yellow-400 text-sm">
            <Crown size={16} />
            <span>Phim VIP – Cần nâng cấp tài khoản</span>
          </div>
          <button
            onClick={() => navigate('/', { state: { openVip: true } })}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Crown size={18} /> Nâng cấp VIP ngay
          </button>
        </div>
      );
    }

    // Đã login + đủ quyền
    return (
      <button
        onClick={handleWatchClick}
        className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
      >
        <Eye size={18} /> Xem phim ngay
      </button>
    );
  };

  return (
    <div
      className="text-white min-h-screen py-10 px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/movie.jpg)',
        backgroundColor: 'rgba(0,0,0,0.8)',
        backgroundBlendMode: 'overlay',
      }}
    >
      <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

        {/* ── Cột trái ── */}
        <div className="space-y-4 col-span-1">
          {/* Poster */}
          <div className="relative">
            <img
              src={`http://localhost:5000${movie.PosterURL}`}
              alt={movie.Title}
              className="w-full rounded-lg shadow-lg object-cover"
            />
            {movie.IsVip === 1 && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                <Crown size={14} /> VIP
              </div>
            )}
          </div>

          {/* Tên phim */}
          <h1 className="text-3xl font-bold">{movie.Title}</h1>

          {movie.IsVip === 1 && (
            <p className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
              <Crown size={15} /> Nội dung độc quyền VIP
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full w-fit">
            <Star className="text-yellow-400 fill-current" size={18} />
            <span className="text-yellow-400 font-semibold">{averageRating}</span>
            <span className="text-gray-300 text-sm">({totalRatings.toLocaleString()} đánh giá)</span>
          </div>

          {/* Nút xem phim */}
          <WatchButton />
        </div>

        {/* ── Cột phải ── */}
        <div className="space-y-8 col-span-2">

          {/* Trailer – luôn hiển thị */}
          <div>
            <h2 className="text-2xl font-semibold mb-3">Trailer</h2>
            {movie.TrailerURL ? (
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
                <video
                  src={`http://localhost:5000/stream/Trailer/${movie.TrailerURL?.split('/').pop()}`}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-gray-900 flex items-center justify-center text-gray-500">
                Không có trailer
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur">
            <h2 className="text-2xl font-bold mb-3">Nội dung phim</h2>
            <p className="text-gray-200 leading-relaxed">{movie.Description}</p>
          </div>

          {/* Banner kêu gọi hành động nếu chưa đủ quyền */}
          {(!isLoggedIn || accessLevel === 'need_vip') && (
            <div className={`rounded-xl p-6 border ${
              accessLevel === 'need_vip'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}>
              {!isLoggedIn ? (
                <>
                  <h3 className="text-blue-400 font-bold text-lg mb-2 flex items-center gap-2">
                    <LogIn size={20} /> Đăng nhập để xem phim đầy đủ
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Bạn đang xem trailer miễn phí. Đăng nhập để xem toàn bộ nội dung phim hoàn toàn miễn phí.
                  </p>
                  <button
                    onClick={goToLogin}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                  >
                    <LogIn size={16} /> Đăng nhập ngay
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-yellow-400 font-bold text-lg mb-2 flex items-center gap-2">
                    <Crown size={20} /> Nâng cấp VIP để xem phim này
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Thành viên VIP được xem toàn bộ kho phim độc quyền, không quảng cáo và nhiều đặc quyền khác.
                  </p>
                  <button
                    onClick={() => navigate('/', { state: { openVip: true } })}
                    className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg transition"
                  >
                    <Crown size={16} /> Xem gói VIP
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleMovieTrailer;
