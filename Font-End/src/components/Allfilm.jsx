import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const AllFilm = ({ category, searchTerm }) => {
  const [movies, setMovies]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy]   = useState('newest');
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let url = 'http://localhost:5000/api/moviescroll';
    if (category && category !== 'Tất cả') url += `?category=${encodeURIComponent(category)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(console.error);
  }, [category]);

  useEffect(() => {
    let tmp = [...movies];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      tmp = tmp.filter(m => m.Title.toLowerCase().includes(q));
    }
    tmp.sort((a, b) => {
      if (sortBy === 'rating') return (b.AverageRating || 0) - (a.AverageRating || 0);
      if (sortBy === 'title')  return a.Title.localeCompare(b.Title, 'vi');
      return new Date(b.ReleaseDate) - new Date(a.ReleaseDate);
    });
    setFiltered(tmp);
  }, [movies, searchTerm, sortBy]);

  if (filtered.length === 0) return null;

  return (
    <div className="py-8 bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" value={searchTerm} readOnly placeholder="Tìm kiếm phim..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-800'}`}>
              <Grid size={20} />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-800'}`}>
              <List size={20} />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="mr-2">Sắp xếp:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg">
            <option value="newest">Mới nhất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="title">Tên A-Z</option>
          </select>
        </div>

        {/* Grid view */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(movie => {
              const imageUrl = movie.PosterURL?.startsWith('http')
                ? movie.PosterURL
                : `${API_BASE}${movie.PosterURL}`;
              return (
                <Link key={movie.MovieID} to={`/trailer/${movie.MovieID}`} className="cursor-pointer group">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
                    <img src={encodeURI(imageUrl)} alt={movie.Title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy" />

                    {/* VIP Badge */}
                    {movie.IsVip === 1 && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
                        <Crown className="w-3 h-3" /> VIP
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 font-bold text-sm truncate">{movie.Title}</h3>
                  <p className="text-gray-400 text-xs">
                    {new Date(movie.ReleaseDate).getFullYear()}
                    {movie.IsVip === 1 && <span className="ml-2 text-yellow-400">👑</span>}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="space-y-4">
            {filtered.map(movie => {
              const imageUrl = movie.PosterURL?.startsWith('http')
                ? movie.PosterURL
                : `${API_BASE}${movie.PosterURL}`;
              return (
                <Link key={movie.MovieID} to={`/trailer/${movie.MovieID}`}
                  className="flex items-center gap-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition">
                  <div className="relative flex-shrink-0">
                    <img src={encodeURI(imageUrl)} alt={movie.Title}
                      className="w-20 h-28 object-cover rounded-lg" loading="lazy" />
                    {movie.IsVip === 1 && (
                      <div className="absolute -top-1 -left-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> VIP
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{movie.Title}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(movie.ReleaseDate).toLocaleDateString('vi-VN')}
                    </p>
                    {movie.IsVip === 1 && (
                      <span className="inline-flex items-center gap-1 text-yellow-400 text-xs mt-1">
                        <Crown className="w-3 h-3" /> Nội dung VIP
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllFilm;
