import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, Tag, History, Trash2, ChevronDown } from 'lucide-react'; // Thêm Trash2 cho nút xóa
import moment from 'moment'; // Sử dụng moment.js để xử lý ngày tháng dễ dàng hơn

const WatchHistoryComponent = () => { // Đổi tên component
  const [movies, setMovies] = useState([]); // Đổi tên state để dễ hiểu hơn là 'historyItems' nếu muốn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('newest'); // Dành cho sắp xếp chung
  const [groupingOption, setGroupingOption] = useState('none'); // Dành cho nhóm theo thời gian
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Lấy userId từ authentication
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    } else {
      setError('Vui lòng đăng nhập để xem lịch sử xem'); // Thay đổi thông báo
      setLoading(false);
    }
  }, []);

  // API call để lấy danh sách lịch sử xem
  const fetchWatchHistory = async (userId) => { // Đổi tên hàm
    try {
      setLoading(true);
      setError(null);
      
      // THAY ĐỔI ĐIỂM ENDPOINT API Ở ĐÂY
      const response = await fetch(`http://localhost:5000/api/History/${userId}`); 
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMovies(data); // Vẫn dùng 'movies' hoặc đổi thành 'historyItems'
    } catch (err) {
      setError('Không thể tải lịch sử xem'); // Thay đổi thông báo
      console.error('Error fetching watch history:', err);
    } finally {
      setLoading(false);
    }
  };

  // API call để xóa phim khỏi lịch sử xem
  const removeWatchHistoryItem = async (movieId) => { // Đổi tên hàm
    try {
      // THAY ĐỔI ĐIỂM ENDPOINT API Ở ĐÂY CHO VIỆC XÓA
      const response = await fetch(`http://localhost:5000/api/watchhistory/${movieId}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId.toString()
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Cập nhật danh sách sau khi xóa
      setMovies(movies.filter(movie => movie.MovieID !== movieId));
    } catch (err) {
      console.error('Error removing watch history item:', err);
      setError('Không thể xóa phim khỏi lịch sử xem'); // Thay đổi thông báo
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWatchHistory(userId); // Gọi hàm mới
    }
  }, [userId]);

  // Sắp xếp và nhóm phim (sử dụng WatchedAt thay vì CreatedAt)
  const groupedAndSortedMovies = useMemo(() => {
    let currentMovies = [...movies];

    // Sắp xếp chung
    switch (sortOption) {
      case 'newest':
        currentMovies.sort((a, b) => new Date(b.WatchedAt || b.CreatedAt) - new Date(a.WatchedAt || a.CreatedAt)); // Sử dụng WatchedAt
        break;
      case 'oldest':
        currentMovies.sort((a, b) => new Date(a.WatchedAt || a.CreatedAt) - new Date(b.WatchedAt || b.CreatedAt)); // Sử dụng WatchedAt
        break;
      case 'title-asc':
        currentMovies.sort((a, b) => a.Title.localeCompare(b.Title));
        break;
      case 'title-desc':
        currentMovies.sort((a, b) => b.Title.localeCompare(a.Title));
        break;
      case 'release-newest':
        currentMovies.sort((a, b) => new Date(b.ReleaseDate) - new Date(a.ReleaseDate));
        break;
      case 'release-oldest':
        currentMovies.sort((a, b) => new Date(a.ReleaseDate) - new Date(b.ReleaseDate));
        break;
      default:
        break;
    }

    // Nhóm theo thời gian
    if (groupingOption !== 'none') {
      const grouped = {};
      currentMovies.forEach(movie => {
        let key;
        const watchedAt = moment(movie.WatchedAt || movie.CreatedAt); // Sử dụng WatchedAt
        if (groupingOption === 'day') {
          key = watchedAt.format('YYYY-MM-DD');
          if (watchedAt.isSame(moment(), 'day')) {
            key = 'Hôm nay';
          } else if (watchedAt.isSame(moment().subtract(1, 'days'), 'day')) {
            key = 'Hôm qua';
          } else if (watchedAt.isSame(moment(), 'week')) {
            key = watchedAt.format('dddd, DD [tháng] MM');
          } else {
            key = watchedAt.format('DD [tháng] MM, YYYY');
          }
        } else if (groupingOption === 'month') {
          key = watchedAt.format('YYYY-MM');
          if (watchedAt.isSame(moment(), 'month')) {
            key = 'Tháng này';
          } else if (watchedAt.isSame(moment().subtract(1, 'months'), 'month')) {
            key = 'Tháng trước';
          } else {
            key = watchedAt.format('[Tháng] M, YYYY');
          }
        } else if (groupingOption === 'year') {
          key = watchedAt.format('YYYY');
        }
        
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(movie);
      });

      const sortedKeys = Object.keys(grouped).sort((a, b) => {
        if (groupingOption === 'day' || groupingOption === 'month' || groupingOption === 'year') {
          const aIsToday = a === 'Hôm nay';
          const bIsToday = b === 'Hôm nay';
          const aIsYesterday = a === 'Hôm qua';
          const bIsYesterday = b === 'Hôm qua';
          const aIsThisMonth = a === 'Tháng này';
          const bIsThisMonth = b === 'Tháng này';
          const aIsLastMonth = a === 'Tháng trước';
          const bIsLastMonth = b === 'Tháng trước';

          if (aIsToday) return -1;
          if (bIsToday) return 1;
          if (aIsYesterday) return -1;
          if (bIsYesterday) return 1;
          if (aIsThisMonth) return -1;
          if (bIsThisMonth) return 1;
          if (aIsLastMonth) return -1;
          if (bIsLastMonth) return 1;
          
          if (groupingOption === 'day') {
            return moment(b, 'DD [tháng] MM, YYYY').valueOf() - moment(a, 'DD [tháng] MM, YYYY').valueOf();
          } else if (groupingOption === 'month') {
            return moment(b, '[Tháng] M, YYYY').valueOf() - moment(a, '[Tháng] M, YYYY').valueOf();
          } else if (groupingOption === 'year') {
            return parseInt(b) - parseInt(a);
          }
        }
        return 0;
      });

      return sortedKeys.map(key => ({
        groupTitle: key,
        movies: grouped[key].sort((a, b) => new Date(b.WatchedAt || b.CreatedAt) - new Date(a.WatchedAt || a.CreatedAt)) // Sắp xếp trong mỗi nhóm
      }));
    }

    return [{ groupTitle: null, movies: currentMovies }];
  }, [movies, sortOption, groupingOption]);


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

  const handleRemoveFromHistory = (movieId) => { // Đổi tên hàm xử lý
    removeWatchHistoryItem(movieId); // Gọi hàm xóa mới
  };

  const sortOptions = [
    { value: 'newest', label: 'Xem gần đây nhất' }, // Thay đổi label
    { value: 'oldest', label: 'Xem cũ nhất' },      // Thay đổi label
    { value: 'title-asc', label: 'Tên A-Z' },
    { value: 'title-desc', label: 'Tên Z-A' },
    { value: 'release-newest', label: 'Phát hành mới nhất' },
    { value: 'release-oldest', label: 'Phát hành cũ nhất' }
  ];

  const groupingOptions = [
    { value: 'none', label: 'Không nhóm' },
    { value: 'day', label: 'Theo ngày' },
    { value: 'month', label: 'Theo tháng' },
    { value: 'year', label: 'Theo năm' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Đang tải lịch sử xem...</p> {/* Thay đổi thông báo */}
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
              onClick={() => fetchWatchHistory(userId)} // Gọi hàm fetch mới
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
              <History className="text-blue-500 w-8 h-8" /> 
              <h1 className="text-3xl font-bold text-white">Lịch Sử Xem</h1> {/* Thay đổi tiêu đề */}
            </div>
            <div className="flex gap-4"> 
              {/* Dropdown Sắp xếp */}
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

              {/* Dropdown Nhóm theo thời gian */}
              <div className="relative">
                <button 
                  onClick={() => setIsGroupOpen(!isGroupOpen)}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>{groupingOptions.find(opt => opt.value === groupingOption)?.label || 'Nhóm theo'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`} />
                </button>
                {isGroupOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
                    {groupingOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setGroupingOption(option.value);
                          setIsGroupOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${groupingOption === option.value ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {movies.length === 0 ? (
          <div className="text-center py-16">
            <History className="text-gray-600 w-16 h-16 mx-auto mb-4" /> 
            <h2 className="text-2xl text-gray-400 mb-2">Chưa có lịch sử xem nào</h2> {/* Thay đổi thông báo */}
            <p className="text-gray-500">Hãy xem một số phim để hiển thị lịch sử ở đây!</p>
          </div>
        ) : (
          <div className="space-y-8"> 
            {groupedAndSortedMovies.map((group, groupIndex) => (
              <div key={group.groupTitle || `nogroup-${groupIndex}`}>
                {group.groupTitle && (
                  <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                    {group.groupTitle}
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> 
                  {group.movies.map((movie) => (
                    <div key={movie.MovieID} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group relative">
                      {/* Poster */}
                      <div className="relative w-full h-48">
                        <img
                          src={`http://localhost:5000${movie.PosterURL}`}
                          alt={movie.Title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/error.webp'; 
                          }}
                        />
                        {/* Biểu tượng đã xem/lưu sẽ không cần ở đây nếu đây là lịch sử xem */}
                        {/* <div className="absolute -top-1 -right-1">
                          <BookmarkCheck className="text-blue-500 w-6 h-6 fill-current bg-gray-900 rounded-full p-0.5" />
                        </div> */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleWatchMovie(movie.MovieID)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            <span>Xem lại</span> {/* Thay đổi label */}
                          </button>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-white font-bold text-lg mb-1 truncate">{movie.Title}</h3> 
                        <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {formatDate(movie.ReleaseDate)}</span>
                          <span className="bg-gray-700 px-2 py-0.5 rounded text-xs"><Tag className="w-3 h-3 inline-block mr-1" /> {movie.Genre}</span>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                          {movie.Description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          {/* Dùng WatchedAt */}
                          <History className="w-3 h-3 mr-1" /> {/* Hoặc Clock icon */}
                          <span>Đã xem: {formatDate(movie.WatchedAt || movie.CreatedAt)}</span> 
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRemoveFromHistory(movie.MovieID)} // Gọi hàm xử lý mới
                            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors" // Đổi màu nút xóa
                          >
                            <Trash2 className="w-4 h-4" /> {/* Thay icon */}
                            <span>Xóa khỏi lịch sử</span> {/* Thay đổi label */}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchHistoryComponent;