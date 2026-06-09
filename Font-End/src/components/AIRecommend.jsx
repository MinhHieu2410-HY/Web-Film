// components/AIRecommend.jsx
// Gợi ý phim thông minh - thuần logic, không cần AI API
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

export default function AIRecommend() {
  const navigate   = useNavigate();
  const userId     = localStorage.getItem('userId');
  const [recs,     setRecs]    = useState([]);
  const [loading,  setLoading] = useState(false);
  const [reason,   setReason]  = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!userId || hasFetched.current) return;
    hasFetched.current = true;
    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecommendations = async () => {
    if (!userId) return;
    setLoading(true); setRecs([]); setReason('');

    try {
      // 1. Lấy lịch sử xem + toàn bộ phim song song
      const [histRes, moviesRes] = await Promise.all([
        fetch(`${API_BASE}/api/history/${userId}`),
        fetch(`${API_BASE}/api/movies`)
      ]);

      const history   = histRes.ok   ? await histRes.json()   : [];
      const allMovies = moviesRes.ok ? await moviesRes.json() : [];
      if (!allMovies.length) return;

      // IDs phim đã xem → dùng để loại ra
      const watchedIds = new Set(history.map(h => h.MovieID || h.movieID));

      // 2. Đếm thể loại hay xem nhất
      const genreCount = {};
      const catCount   = {};

      history.forEach(h => {
        // Genre chính
        const g = h.Genre || h.genre || '';
        if (g) genreCount[g] = (genreCount[g] || 0) + 1;
        // Categories phụ
        const cats = Array.isArray(h.categories)
          ? h.categories
          : (h.categories || '').split(',').map(c => c.trim()).filter(Boolean);
        cats.forEach(c => { catCount[c] = (catCount[c] || 0) + 1; });
      });

      // Top genre và top category
      const topGenre = Object.entries(genreCount).sort((a,b) => b[1]-a[1])[0]?.[0] || '';
      const topCat   = Object.entries(catCount).sort((a,b) => b[1]-a[1])[0]?.[0] || '';

      // 3. Lọc phim chưa xem
      const unwatched = allMovies.filter(m => !watchedIds.has(m.MovieID));
      const pool      = unwatched.length > 0 ? unwatched : allMovies;

      // 4. Tính điểm cho từng phim
      const scored = pool.map(m => {
        let score = 0;
        const mGenre = m.Genre || '';
        const mCats  = Array.isArray(m.categories)
          ? m.categories
          : (m.categories || '').split(',').map(c => c.trim()).filter(Boolean);

        // Khớp genre chính → +3 điểm
        if (topGenre && mGenre.toLowerCase().includes(topGenre.toLowerCase())) score += 3;
        // Khớp category → +2 điểm mỗi cái
        if (topCat) mCats.forEach(c => { if (c === topCat) score += 2; });
        // Rating cao → +1 điểm (chuẩn hoá về 0-1)
        score += ((m.AverageRating || 0) / 10);

        return { ...m, _score: score };
      });

      // 5. Sort theo điểm → lấy top 5
      scored.sort((a, b) => b._score - a._score);
      const top5 = scored.slice(0, 5);

      // 6. Tạo lý do hiển thị
      if (history.length === 0) {
        setReason('Những phim được đánh giá cao nhất trong kho');
      } else if (topGenre || topCat) {
        setReason(`Dựa trên sở thích của bạn với thể loại ${topCat || topGenre}`);
      } else {
        setReason('Phim phù hợp với lịch sử xem của bạn');
      }

      setRecs(top5);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;
  if (!loading && recs.length === 0) return null;

  return (
    <section className="bg-black text-white pt-8 pb-4">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Đề xuất cho bạn</h2>
              {reason && <p className="text-gray-400 text-sm mt-0.5">{reason}</p>}
            </div>
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-full text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2" />
                <div className="h-3 bg-gray-800 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Kết quả */}
        {!loading && recs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recs.map((movie, i) => {
              const imageUrl = movie.PosterURL?.startsWith('http')
                ? movie.PosterURL
                : `${API_BASE}${movie.PosterURL}`;
              return (
                <div key={movie.MovieID}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/trailer/${movie.MovieID}`)}>
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
                    <img src={encodeURI(imageUrl)} alt={movie.Title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={e => { e.target.src = '/error.webp'; }} />
                    {/* Rank */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                      {i + 1}
                    </div>
                    {/* VIP badge */}
                    {parseInt(movie.IsVip) === 1 && (
                      <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        <Crown className="w-2.5 h-2.5" /> VIP
                      </div>
                    )}
                    {/* Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium truncate">{movie.Title}</h3>
                  <p className="text-xs text-gray-500">
                    {movie.ReleaseDate ? new Date(movie.ReleaseDate).getFullYear() : ''}
                    {movie.Genre ? ` · ${movie.Genre}` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
