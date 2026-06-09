import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X, Calendar } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SearchFilm({ searchTerm: initialSearchTerm }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [showGenres, setShowGenres] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/categories/id')
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error('Lỗi khi lấy danh sách thể loại:', err);
        setError('Không thể tải danh sách thể loại');
      });
  }, []);

  const fetchRatingsAverage = async (movieId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/ratings?movieId=${movieId}`);
      if (!res.ok) return 10;
      const ratings = await res.json();
      if (ratings.length === 0) return 10;
      const avg = ratings.reduce((acc, r) => acc + r.Score, 0) / ratings.length;
      return avg.toFixed(1);
    } catch {
      return 10;
    }
  };

  const searchMovies = async () => {
    if (!searchTerm.trim() && selectedGenres.length === 0) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (selectedGenres.length > 0) params.categoryIds = selectedGenres.join(',');

      const response = await axios.get('http://localhost:5000/api/search/search-with-categories', {
        params,
      });

      const moviesWithRatings = await Promise.all(
        response.data.map(async movie => {
          const averageRating = await fetchRatingsAverage(movie.MovieID);
          return {
            ...movie,
            averageRating
          };
        })
      );

      setSearchResults(moviesWithRatings);
    } catch (err) {
      console.error('Lỗi khi tìm kiếm phim:', err);
      setError('Đã xảy ra lỗi khi tìm kiếm phim');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreToggle = (categoryId) => {
    setSelectedGenres((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const clearGenres = () => {
    setSelectedGenres([]);
  };

  useEffect(() => {
    setSearchTerm(initialSearchTerm || '');
  }, [initialSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMovies();
    }, 500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedGenres]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.CategoryID == categoryId);
    return category ? category.Name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
          🎬 Tìm Kiếm Phim
        </h1>

        <div className="relative mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-gray-900 rounded-lg border-2 border-gray-700 focus-within:border-red-500 transition-colors">
            <div className="flex items-center flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-3 sm:ml-4" />
              <input
                type="text"
                placeholder="Nhập tên phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-3 sm:p-4 bg-transparent outline-none text-white placeholder-gray-400 text-base sm:text-lg"
              />
            </div>
            <button
              onClick={() => setShowGenres(!showGenres)}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-4 text-red-400 hover:text-red-300 transition-colors border-t sm:border-t-0 sm:border-l border-gray-700"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Thể loại</span>
              {showGenres ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {showGenres && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-900 rounded-lg border border-gray-700 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Chọn thể loại</h3>
              {selectedGenres.length > 0 && (
                <button onClick={clearGenres} className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-red-400 hover:text-red-300 transition-colors">
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Xóa tất cả</span>
                  <span className="sm:hidden">Xóa</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category.CategoryID}
                  onClick={() => handleGenreToggle(category.CategoryID)}
                  className={`p-2 sm:p-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                    selectedGenres.includes(category.CategoryID)
                      ? 'bg-red-600 text-white shadow-lg scale-105'
                      : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  {category.Name}
                </button>
              ))}
            </div>

            {selectedGenres.length > 0 && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                <p className="text-gray-400 mb-2 sm:mb-3 text-sm sm:text-base">Đã chọn:</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {selectedGenres.map((categoryId) => (
                    <span
                      key={categoryId}
                      className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-red-900 text-red-100 rounded-full text-xs sm:text-sm"
                    >
                      {getCategoryName(categoryId)}
                      <button onClick={() => handleGenreToggle(categoryId)} className="hover:bg-red-800 rounded-full p-0.5 sm:p-1">
                        <X className="w-2 h-2 sm:w-3 sm:h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-400">Đang tải kết quả...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-400">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Kết quả ({searchResults.length})</h2>
              {(searchTerm || selectedGenres.length > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGenres([]);
                  }}
                  className="text-red-400 hover:text-red-300 underline transition-colors text-sm sm:text-base self-start sm:self-auto"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {searchResults.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="flex justify-center mb-4 sm:mb-6">
                <img 
                  src='/capoo.png' 
                  alt="Capoo" 
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
                />
              </div>
              <p className="text-gray-400 text-lg sm:text-xl mb-2">Không tìm thấy phim nào</p>
              <p className="text-gray-500 text-sm sm:text-base">Thử thay đổi từ khóa hoặc thể loại tìm kiếm</p>
            </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {searchResults.map((movie) => (
                <div
                  key={movie.MovieID}
                  className="relative group cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => navigate(`/trailer/${movie.MovieID}`)}
                >
                  {/* Movie Poster - Always visible */}
                  <div className="w-full aspect-[2/3]">
                    <img
                      src={movie.PosterURL 
                        ? `http://localhost:5000${movie.PosterURL}`
                        : 'https://via.placeholder.com/220x320'
                      }
                      alt={movie.Title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/220x320';
                      }}
                    />
                  </div>

                  {/* Basic Info (Always visible) */}
                  <div className="p-2 bg-gray-900/80 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-white truncate">{movie.Title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-yellow-400">{formatDate(movie.ReleaseDate)}</span>
                      <span className="text-xs text-yellow-300 flex items-center">
                        ★ {movie.averageRating}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Info (Visible on hover) - Now with semi-transparent background */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                    <h3 className="text-lg font-bold text-white mb-1">{movie.Title}</h3>
                    <p className="text-yellow-400 text-sm mb-2">{formatDate(movie.ReleaseDate)}</p>
                    <p className="text-pink-400 text-sm mb-3">
                      <span className="text-yellow-300">★</span> {movie.averageRating}/10
                    </p>
                    {movie.categories && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {movie.categories.split(', ').slice(0, 3).map((categoryName, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-blue-900/80 text-blue-100 rounded-full text-xs font-medium"
                          >
                            {categoryName}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-300 text-xs line-clamp-3">{movie.Description || 'No description available'}</p>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}