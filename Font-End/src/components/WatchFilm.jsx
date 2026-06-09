// components/WatchFilm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Star, Clock, Calendar,
  MessageCircle, ThumbsUp, Share2, Bookmark, Settings, Crown, Lock, LogIn
} from 'lucide-react';

const MoviePlayer = () => {
  const { movieID } = useParams();
  const navigate    = useNavigate();

  // ─── Player state ─────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isMuted, setIsMuted]           = useState(false);
  const [volume, setVolume]             = useState(1);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('1080p');
  const [playbackSpeed, setPlaybackSpeed]   = useState(1);

  // ─── App state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]     = useState('overview');
  const [userRating, setUserRating]   = useState(0);
  const [newComment, setNewComment]   = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [movieData, setMovieData] = useState(null);
  const [ratings, setRatings]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // accessLevel: 'full' | 'need_vip' | 'trailer_only'
  const [accessLevel, setAccessLevel] = useState(null);

  const videoRef            = useRef(null);
  const controlsTimeoutRef  = useRef(null);
  const playerContainerRef  = useRef(null);

  // Đọc userId an toàn – loại bỏ giá trị rác như "null" / "undefined"
  const rawId      = localStorage.getItem('userId');
  const userId     = (rawId && rawId !== 'null' && rawId !== 'undefined') ? rawId : null;
  const isLoggedIn = !!userId;

  const qualityOptions = [
    { label: '1080p', value: '1080p' },
    { label: '720p',  value: '720p'  },
    { label: '480p',  value: '480p'  },
    { label: '360p',  value: '360p'  },
  ];
  const speedOptions = [
    { label: '0.25x', value: 0.25 },
    { label: '0.5x',  value: 0.5  },
    { label: '0.75x', value: 0.75 },
    { label: '1x',    value: 1    },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x',  value: 1.5  },
    { label: '2x',    value: 2    },
  ];

  // ─── Fetch movie + access check ───────────────────────────────────────────
  const fetchMovieData = async () => {
    if (!movieID || isNaN(parseInt(movieID))) {
      setError('ID phim không hợp lệ'); setLoading(false); return;
    }
    try {
      setLoading(true); setError(null);
      const res = await fetch(`http://localhost:5000/api/movie/${movieID}`, {
        headers: userId ? { 'user-id': userId } : {}
      });
      if (!res.ok) throw new Error(`Lỗi HTTP! trạng thái: ${res.status}`);
      const data = await res.json();
      setMovieData(data);

      // Nếu backend trả về accessLevel thì dùng, không thì tự tính fallback
      if (data.accessLevel) {
        setAccessLevel(data.accessLevel);
      } else {
        // Backend chưa mount đúng route hoặc chưa có logic accessLevel
        // Fallback tạm: đã login = full, chưa login = trailer_only
        const uid = localStorage.getItem('userId');
        const validUid = (uid && uid !== 'null' && uid !== 'undefined') ? uid : null;
        setAccessLevel(validUid ? 'full' : 'trailer_only');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    if (!movieID || isNaN(parseInt(movieID))) return;
    try {
      const res  = await fetch(`http://localhost:5000/api/ratings?movieId=${parseInt(movieID)}`);
      const data = await res.json();
      setRatings(data);
    } catch (err) { console.error('Lỗi khi lấy đánh giá:', err); }
  };

  const checkBookmarkStatus = async () => {
    if (!userId || !movieID) { setIsBookmarked(false); return; }
    try {
      const res  = await fetch(`http://localhost:5000/api/favorites/${movieID}`, { headers: { 'user-id': userId } });
      const data = await res.json();
      setIsBookmarked(data.isBookmarked);
    } catch (err) { console.error('Lỗi kiểm tra bookmark:', err); }
  };

  const recordWatchHistory = async () => {
    if (!userId || !movieID || isNaN(parseInt(movieID))) return;
    try {
      await fetch(`http://localhost:5000/api/history/${userId}/${movieID}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) { console.error('Lỗi lưu lịch sử:', err); }
  };

  useEffect(() => {
    if (movieID) { fetchMovieData(); fetchRatings(); checkBookmarkStatus(); }
    else { setError('Không cung cấp ID phim'); setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieID]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (showSettings) { setShowControls(true); if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); }
  }, [showSettings]);

  // ─── Player handlers ──────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); }
    else { videoRef.current.play(); recordWatchHistory(); }
    setIsPlaying(!isPlaying);
  };
  const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); } };
  const handleVolumeChange = (e) => { const v = parseFloat(e.target.value); setVolume(v); if (videoRef.current) videoRef.current.volume = v; };
  const handleTimeUpdate   = () => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); };
  const handleLoadedMeta   = () => { if (videoRef.current) setDuration(videoRef.current.duration); };
  const handleSeek = (e) => {
    const newTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * duration;
    if (videoRef.current) { videoRef.current.currentTime = newTime; setCurrentTime(newTime); }
  };
  const formatTime = (t) => `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) playerContainerRef.current?.requestFullscreen().then(() => setIsFullscreen(true));
    else document.exitFullscreen().then(() => setIsFullscreen(false));
  };
  const handleQualityChange = (q) => {
    const t = videoRef.current?.currentTime || 0; const wasPlaying = isPlaying;
    setCurrentQuality(q.value);
    if (videoRef.current && movieData) {
      videoRef.current.load();
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.currentTime = t;
        if (wasPlaying) videoRef.current.play();
      }, { once: true });
    }
    setShowSettings(false);
  };
  const handleSpeedChange = (s) => { setPlaybackSpeed(s.value); if (videoRef.current) videoRef.current.playbackRate = s.value; setShowSettings(false); };
  const showVideoControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => { if (isPlaying && !showSettings) setShowControls(false); }, 3000);
  };
  const getFullUrl = (path) => { if (!path) return ''; if (path.startsWith('http')) return path; return `http://localhost:5000${path}`; };

  // ─── Rating & comment ─────────────────────────────────────────────────────
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.Score, 0) / ratings.length
    : 10;

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || userRating === 0) { alert('Vui lòng nhập bình luận và chọn điểm đánh giá!'); return; }
    if (!userId) { alert('Vui lòng đăng nhập để gửi bình luận!'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(movieID), score: userRating, comment: newComment.trim() })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Lỗi server');
      setNewComment(''); setUserRating(0); fetchRatings();
    } catch (err) { alert(`Lỗi gửi bình luận: ${err.message}`); }
  };

  const toggleBookmark = async () => {
    if (!userId) { alert('Vui lòng đăng nhập để lưu phim!'); return; }
    try {
      const url    = isBookmarked ? `http://localhost:5000/api/favorites/${movieID}` : 'http://localhost:5000/api/favorites';
      const method = isBookmarked ? 'DELETE' : 'POST';
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'user-id': userId },
        body: method === 'POST' ? JSON.stringify({ movieId: parseInt(movieID) }) : undefined
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Lỗi server');
      setIsBookmarked(!isBookmarked);
    } catch (err) { alert(`Lỗi lưu phim: ${err.message}`); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); });
  };

  // ─── Loading / error states ───────────────────────────────────────────────
  if (loading) return (
    <div className="w-full bg-gray-900 text-white flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
        <p>Đang tải phim...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="w-full bg-gray-900 text-white flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-red-500 mb-4">Lỗi: {error}</p>
        <button onClick={() => { fetchMovieData(); fetchRatings(); checkBookmarkStatus(); }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Thử lại</button>
      </div>
    </div>
  );

  if (!movieData) return (
    <div className="w-full bg-gray-900 text-white flex items-center justify-center h-screen">
      <p>Không tìm thấy dữ liệu phim</p>
    </div>
  );

  // ─── ACCESS GUARD: Chặn xem phim nếu không đủ quyền ─────────────────────
  if (accessLevel !== 'full') {
    return (
      <div className="w-full min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* Poster mờ làm nền */}
          <div className="relative mb-8">
            <img
              src={getFullUrl(movieData.PosterURL)}
              alt={movieData.Title}
              className="w-48 h-72 object-cover rounded-xl mx-auto opacity-40 blur-sm"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {accessLevel === 'need_vip'
                ? <Crown className="w-20 h-20 text-yellow-400 drop-shadow-lg" />
                : <Lock  className="w-20 h-20 text-gray-300 drop-shadow-lg" />
              }
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">{movieData.Title}</h2>

          {accessLevel === 'need_vip' ? (
            <>
              <p className="text-yellow-400 font-semibold mb-2 flex items-center justify-center gap-2">
                <Crown size={18} /> Nội dung độc quyền VIP
              </p>
              <p className="text-gray-400 mb-6">
                Bạn cần tài khoản VIP để xem phim này. Nâng cấp ngay để trải nghiệm toàn bộ kho phim không giới hạn.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/vip')}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-xl transition-transform hover:scale-105">
                  <Crown size={20} /> Nâng cấp VIP
                </button>
                <button onClick={() => navigate(`/trailer/${movieID}`)}
                  className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl transition">
                  Xem trailer
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-300 mb-2 flex items-center justify-center gap-2">
                <Lock size={18} /> Đăng nhập để xem phim đầy đủ
              </p>
              <p className="text-gray-400 mb-6">
                Bạn cần đăng nhập để xem toàn bộ nội dung phim. Đăng nhập miễn phí và xem ngay.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-transform hover:scale-105">
                  <LogIn size={20} /> Đăng nhập
                </Link>
                <button onClick={() => navigate(`/trailer/${movieID}`)}
                  className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl transition">
                  Xem trailer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER PLAYER (accessLevel === 'full') ───────────────────────────────
  return (
    <div className="w-full bg-gray-900 text-white mt-10">
      <div ref={playerContainerRef} className={`relative bg-black ${isFullscreen ? 'h-screen' : ''}`}>
        <div
          className="relative group cursor-pointer h-full"
          onMouseMove={showVideoControls}
          onMouseLeave={() => isPlaying && !showSettings && setTimeout(() => setShowControls(false), 1000)}
        >
          <video
            ref={videoRef}
            className={`w-full ${isFullscreen ? 'h-full object-contain' : 'h-[650px] object-cover'}`}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMeta}
            onClick={togglePlay}
            onPlay={() => { setIsPlaying(true); recordWatchHistory(); }}
            onPause={() => setIsPlaying(false)}
            poster={getFullUrl(movieData.PosterURL)}
          >
            <source src={`http://localhost:5000/stream/Video/${movieData.VideoURL?.split('/').pop()}`} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>

          {/* Controls overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls || showSettings ? 'opacity-100' : 'opacity-0'}`}>
            {/* Play/Pause center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={togglePlay} className="bg-white/20 hover:bg-white/30 rounded-full p-4 backdrop-blur-sm transition-all duration-200">
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div className="absolute bottom-16 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-48">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-300">Chất lượng video</h4>
                    <div className="space-y-1">
                      {qualityOptions.map(q => (
                        <button key={q.value} onClick={() => handleQualityChange(q)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentQuality === q.value ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                          {q.label} {currentQuality === q.value && <span className="float-right">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-300">Tốc độ phát</h4>
                    <div className="space-y-1">
                      {speedOptions.map(s => (
                        <button key={s.value} onClick={() => handleSpeedChange(s)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${playbackSpeed === s.value ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                          {s.label} {playbackSpeed === s.value && <span className="float-right">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress bar */}
              <div className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer" onClick={handleSeek}>
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${(currentTime/duration)*100}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={togglePlay} className="hover:text-red-500 transition-colors">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <div className="flex items-center space-x-2">
                    <button onClick={toggleMute} className="hover:text-red-500 transition-colors">
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="w-16" />
                  </div>
                  <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  <span className="text-sm text-gray-300 bg-black/50 px-2 py-1 rounded">{currentQuality}</span>
                  {playbackSpeed !== 1 && (
                    <span className="text-sm text-gray-300 bg-black/50 px-2 py-1 rounded">{playbackSpeed}x</span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={() => setShowSettings(!showSettings)}
                    className={`hover:text-red-500 transition-colors ${showSettings ? 'text-red-500' : ''}`}>
                    <Settings size={20} />
                  </button>
                  <button onClick={toggleFullscreen} className="hover:text-red-500 transition-colors">
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info section */}
      {!isFullscreen && (
        <div className="w-full px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-2">{movieData.Title}</h1>

                {/* VIP badge nếu là phim VIP */}
                {movieData.IsVip === 1 && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-sm px-3 py-1 rounded-full mb-3">
                    <Crown size={14} /> Nội dung VIP
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-4">
                  <div className="flex items-center"><Calendar size={16} className="mr-1" />{new Date(movieData.ReleaseDate).getFullYear()}</div>
                  <div className="flex items-center"><Star size={16} className="mr-1 text-yellow-500" />
                    {(movieData.averageRating != null ? Number(movieData.averageRating).toFixed(1) : averageRating.toFixed(1))}/10
                  </div>
                  <div className="flex items-center"><Clock size={16} className="mr-1" />2h 15m</div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movieData.categories?.map((cat, i) => (
                    <span key={i} className="px-3 py-1 bg-red-600 rounded-full text-sm">{cat}</span>
                  ))}
                </div>

                <div className="flex gap-4 mb-6">
                  <button onClick={toggleBookmark}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isBookmarked ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
                    {isBookmarked ? 'Đã lưu' : 'Lưu phim'}
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all">
                    <Share2 size={20} /> {shareCopied ? 'Đã sao chép!' : 'Chia sẻ'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-700 mb-6">
                <nav className="flex space-x-8">
                  {[{ id: 'overview', label: 'Tổng quan' }, { id: 'reviews', label: 'Đánh giá' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-red-600 text-red-500' : 'border-transparent text-gray-400 hover:text-white'}`}>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Nội dung phim</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">{movieData.Description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-400">Ngày phát hành:</span><span className="ml-2">{new Date(movieData.ReleaseDate).toLocaleDateString('vi-VN')}</span></div>
                    <div><span className="text-gray-400">Thể loại:</span><span className="ml-2">{movieData.categories?.join(', ') || 'Chưa xác định'}</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Đánh giá của bạn</h3>
                    <div className="flex items-center gap-2 mb-4">
                      {[1,2,3,4,5,6,7,8,9,10].map(s => (
                        <button key={s} onClick={() => setUserRating(s)}
                          className={`text-2xl transition-colors ${s <= userRating ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-400'}`}>★</button>
                      ))}
                      <span className="ml-2 text-gray-400">({userRating}/10)</span>
                    </div>
                    <div className="flex gap-3">
                      <img src={localStorage.getItem('avatarUrl') || '/user.png'} alt="Avatar" className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                          placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                          className="w-full p-3 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-600" rows="3" />
                        <button onClick={handleCommentSubmit} className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                          Gửi đánh giá
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Đánh giá từ người xem ({ratings.length})</h3>
                    {ratings.map(rating => (
                      <div key={rating.RatingID} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <img src={rating.User?.AvatarURL || '/user.png'} alt="Avatar" className="w-10 h-10 rounded-full" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{rating.User?.Email?.split('@')[0] || 'Ẩn danh'}</span>
                              <div className="flex items-center"><Star size={16} className="text-yellow-500 mr-1" /><span className="text-yellow-500">{rating.Score}/10</span></div>
                              <span className="text-gray-400 text-sm">{new Date(rating.CreatedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <p className="text-gray-300">{rating.Comment}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                              <button className="flex items-center gap-1 hover:text-white transition-colors"><ThumbsUp size={14} /> Hữu ích</button>
                              <button className="flex items-center gap-1 hover:text-white transition-colors"><MessageCircle size={14} /> Trả lời</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar thông tin */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Thông tin phim</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Đánh giá TB:</span>
                    <span className="text-yellow-500">{(movieData.averageRating != null ? Number(movieData.averageRating).toFixed(1) : averageRating.toFixed(1))}/10</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Số lượt đánh giá:</span><span>{movieData.totalRatings || ratings.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Chất lượng:</span><span className="text-red-500">{currentQuality}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Tốc độ phát:</span><span className="text-blue-500">{playbackSpeed}x</span></div>
                  {movieData.IsVip === 1 && (
                    <div className="flex justify-between pt-1 border-t border-gray-700">
                      <span className="text-gray-400">Loại nội dung:</span>
                      <span className="text-yellow-400 flex items-center gap-1"><Crown size={12} /> VIP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviePlayer;
