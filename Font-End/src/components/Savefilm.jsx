// component/SaveFilm
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Play, Calendar, Tag, Clock, BookmarkCheck, ChevronDown } from 'lucide-react';

const FavoriteMoviesComponent = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Lấy userId từ authentication (ví dụ: localStorage, context, v.v.)
  useEffect(() => {
    // Trong ứng dụng thực tế, bạn sẽ lấy userId từ authentication context hoặc localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    } else {
      setError('Vui lòng đăng nhập để xem phim đã lưu');
      setLoading(false);
    }
  }, []);

  // API call để lấy danh sách phim yêu thích
  const fetchFavoriteMovies = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/favorites/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setError('Không thể tải danh sách phim yêu thích');
      console.error('Error fetching favorite movies:', err);
    } finally {
      setLoading(false);
    }
  };

  // API call để xóa phim khỏi danh sách yêu thích
  const removeFavoriteMovie = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId.toString() // Gửi userId trong header
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Cập nhật danh sách phim sau khi xóa
      setMovies(movies.filter(movie => movie.MovieID !== movieId));
    } catch (err) {
      console.error('Error removing favorite movie:', err);
      setError('Không thể xóa phim khỏi danh sách yêu thích');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFavoriteMovies(userId);
    }
  }, [userId]);

  useEffect(() => {
    const sortedMovies = [...movies];
    switch (sortOption) {
      case 'newest':
        sortedMovies.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        break;
      case 'oldest':
        sortedMovies.sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
        break;
      case 'title-asc':
        sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
        break;
      case 'title-desc':
        sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
        break;
      case 'release-newest':
        sortedMovies.sort((a, b) => new Date(b.ReleaseDate) - new Date(a.ReleaseDate));
        break;
      case 'release-oldest':
        sortedMovies.sort((a, b) => new Date(a.ReleaseDate) - new Date(b.ReleaseDate));
        break;
      default:
        break;
    }
    setMovies(sortedMovies);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleWatchMovie = (movieId) => {
    navigate(`/trailer/${movieId}`);
  };

  const handleBookmark = (movieId) => {
    removeFavoriteMovie(movieId);
  };

  const sortOptions = [
    { value: 'newest', label: 'Mới lưu nhất' },
    { value: 'oldest', label: 'Cũ lưu nhất' },
    { value: 'title-asc', label: 'Tên A-Z' },
    { value: 'title-desc', label: 'Tên Z-A' },
    { value: 'release-newest', label: 'Phát hành mới nhất' },
    { value: 'release-oldest', label: 'Phát hành cũ nhất' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Đang tải phim đã lưu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          {userId && (
            <button 
              onClick={() => fetchFavoriteMovies(userId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookmarkCheck className="text-blue-500 w-8 h-8" />
              <h1 className="text-3xl font-bold text-white">Phim Đã Lưu</h1>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span>{sortOptions.find(opt => opt.value === sortOption)?.label || 'Sắp xếp'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortOption(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${sortOption === option.value ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {movies.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="text-gray-600 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl text-gray-400 mb-2">Chưa có phim đã lưu</h2>
            <p className="text-gray-500">Hãy lưu một số phim để xem sau!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {movies.map((movie) => (
              <div key={movie.MovieID} className="flex items-center gap-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all duration-300 group">
                {/* Poster */}
                <div className="relative">
                  <img
                    src={`http://localhost:5000${movie.PosterURL}`}
                    alt={movie.Title}
                    className="w-20 h-28 object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/error.webp';
                    }}
                  />
                  <div className="absolute -top-1 -right-1">
                    <BookmarkCheck className="text-blue-500 w-5 h-5 fill-current bg-gray-900 rounded-full p-0.5" />
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">{movie.Title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <span>{formatDate(movie.ReleaseDate)}</span>
                    <span className="bg-gray-700 px-2 py-0.5 rounded text-xs">{movie.Genre}</span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                    {movie.Description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Đã lưu: {formatDate(movie.CreatedAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 transition-opacity">
                  <button
                    onClick={() => handleWatchMovie(movie.MovieID)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Xem phim</span>
                  </button>
                  <button
                    onClick={() => handleBookmark(movie.MovieID)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                  >
                    <Bookmark className="w-3 h-3" />
                    <span>Bỏ lưu</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteMoviesComponent;