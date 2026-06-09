import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, Star, Calendar,
  Users, Film, Crown, BarChart2, TrendingUp,
  CheckCircle, XCircle, Clock, Eye
} from 'lucide-react';
import AddMovieComponent  from './NewFilm';
import EditMovieComponent from './UpdateFilm';

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt = n => Number(n || 0).toLocaleString('vi-VN');
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const isVipActive = u =>
  u.VipType > 0 && u.VipExpire && new Date(u.VipExpire) > new Date();

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const FilmAdminDashboard = () => {
  const [activeTab, setActiveTab]         = useState('stats');
  const [searchTerm, setSearchTerm]       = useState('');
  const [showAddModal, setShowAddModal]   = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalMode, setModalMode]         = useState('add');

  const [movies, setMovies]   = useState([]);
  const [users,  setUsers]    = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [vipFilter, setVipFilter]   = useState('all'); // all | active | pending | expired

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({ movies: false, users: false, stats: false });

  // ── Fetch movies ──────────────────────────────────────────────────────────
  const fetchMovies = async () => {
    setLoading(p => ({ ...p, movies: true }));
    try {
      const res = await fetch('http://localhost:5000/api/movies');
      setMovies(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(p => ({ ...p, movies: false })); }
  };

  // ── Fetch users ───────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(p => ({ ...p, users: true }));
    try {
      const res = await fetch('http://localhost:5000/api/users');
      setUsers(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(p => ({ ...p, users: false })); }
  };

  useEffect(() => { fetchMovies(); fetchUsers(); }, []);

  // ── Tính stats từ data đã có ──────────────────────────────────────────────
  useEffect(() => {
    if (!movies.length && !users.length) return;
    const vipMovies   = movies.filter(m => parseInt(m.IsVip) === 1).length;
    const totalUsers  = users.length;
    const vipUsers    = users.filter(u => isVipActive(u)).length;
    const expiredVip  = users.filter(u =>
      u.VipType > 0 && u.VipExpire && new Date(u.VipExpire) <= new Date()
    ).length;
    const adminCount  = users.filter(u => u.Role === 'Admin').length;

    // Doanh thu ước tính (VIP tháng 199k, VIP năm 1490k)
    const revenue = users.reduce((sum, u) => {
      if (!isVipActive(u)) return sum;
      return sum + (u.VipType === 2 ? 1490000 : 199000);
    }, 0);

    setStats({ vipMovies, totalMovies: movies.length, totalUsers, vipUsers, expiredVip, adminCount, revenue });
  }, [movies, users]);

  // ── Handlers phim ─────────────────────────────────────────────────────────
  const handleDelete = async (movieId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phim này?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${movieId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setMovies(movies.filter(m => m.MovieID !== movieId));
    } catch { alert('Xóa phim thất bại'); }
  };

  const handleEdit = (movie) => {
    setSelectedMovie(movie);
    setModalMode('edit');
    setShowAddModal(true);
  };

  // ── Handlers user ─────────────────────────────────────────────────────────
  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Xóa tài khoản "${email}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setUsers(users.filter(u => u.UserID !== userId));
    } catch { alert('Xóa người dùng thất bại'); }
  };

  // ── Kích hoạt / Thu hồi VIP ───────────────────────────────────────────────
  const handleSetVip = async (userId, vipType) => {
    // vipType: 1 = tháng, 2 = năm, 0 = thu hồi
    const labels = { 1: 'VIP 1 tháng', 2: 'VIP 1 năm', 0: 'thu hồi VIP' };
    if (!window.confirm(`Xác nhận ${labels[vipType]} cho user này?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/vip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vipType })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchUsers(); // reload
    } catch (err) { alert('Cập nhật VIP thất bại: ' + err.message); }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredMovies = movies.filter(m =>
    m.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.Email || '').toLowerCase().includes(userSearch.toLowerCase());
    if (!matchSearch) return false;
    if (vipFilter === 'active')  return isVipActive(u);
    if (vipFilter === 'expired') return u.VipType > 0 && !isVipActive(u);
    if (vipFilter === 'none')    return !u.VipType || u.VipType === 0;
    return true;
  });

  // ── Sidebar tabs ──────────────────────────────────────────────────────────
  const tabs = [
    { id: 'stats', icon: BarChart2, label: 'Thống kê'      },
    { id: 'films', icon: Film,      label: 'Quản lý phim'  },
    { id: 'users', icon: Users,     label: 'Người dùng'    },
    { id: 'vip',   icon: Crown,     label: 'Quản lý VIP'   },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:4px}
        .custom-scrollbar::-webkit-scrollbar-track{background:transparent}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:2px}
        .movie-card{width:220px}
        .movie-poster-container{width:220px;height:320px;position:relative;overflow:hidden}
        .movie-info{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          opacity:0;transition:opacity .3s;background:rgba(0,0,0,.8)}
        .movie-card:hover .movie-info{opacity:1}
      `}</style>

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen p-6 mt-6 rounded-xl flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            FilmAdmin
          </h1>
        </div>
        <nav className="space-y-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-600/20 to-blue-600/20 border border-red-500/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.id === 'vip' && stats?.expiredVip > 0 && (
                <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {stats.expiredVip}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 p-6 overflow-auto custom-scrollbar">

        {/* ════════════════ STATS ════════════════ */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <BarChart2 className="text-red-500" /> Tổng quan hệ thống
            </h2>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Film}      label="Tổng số phim"  value={fmt(stats?.totalMovies)} sub={`${fmt(stats?.vipMovies)} phim VIP`}  color="bg-red-600" />
              <StatCard icon={Users}     label="Người dùng"    value={fmt(stats?.totalUsers)}  sub={`${fmt(stats?.adminCount)} Admin`}      color="bg-blue-600" />
              <StatCard icon={Crown}     label="VIP đang hoạt động" value={fmt(stats?.vipUsers)} sub={`${fmt(stats?.expiredVip)} đã hết hạn`} color="bg-yellow-500" />
              <StatCard icon={TrendingUp} label="Doanh thu ước tính" value={`${fmt(stats?.revenue)}đ`} sub="Từ VIP hiện tại" color="bg-green-600" />
            </div>

            {/* Tỷ lệ phim VIP */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-gray-300">Tỷ lệ phim VIP / Thường</h3>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm text-yellow-400 w-24">VIP ({stats?.vipMovies})</span>
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: stats?.totalMovies ? `${(stats.vipMovies / stats.totalMovies) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {stats?.totalMovies ? Math.round((stats.vipMovies / stats.totalMovies) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-24">Thường ({(stats?.totalMovies || 0) - (stats?.vipMovies || 0)})</span>
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: stats?.totalMovies ? `${((stats.totalMovies - stats.vipMovies) / stats.totalMovies) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {stats?.totalMovies ? Math.round(((stats.totalMovies - stats.vipMovies) / stats.totalMovies) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Tỷ lệ VIP users */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-gray-300">Tỷ lệ người dùng VIP</h3>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm text-yellow-400 w-28">VIP ({stats?.vipUsers})</span>
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: stats?.totalUsers ? `${(stats.vipUsers / stats.totalUsers) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {stats?.totalUsers ? Math.round((stats.vipUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-28">Thường ({(stats?.totalUsers || 0) - (stats?.vipUsers || 0)})</span>
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gray-600 rounded-full transition-all"
                    style={{ width: stats?.totalUsers ? `${((stats.totalUsers - stats.vipUsers) / stats.totalUsers) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {stats?.totalUsers ? Math.round(((stats.totalUsers - stats.vipUsers) / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Danh sách user VIP gần nhất */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-gray-300">VIP đang hoạt động gần nhất</h3>
              {users.filter(isVipActive).slice(0, 5).length === 0
                ? <p className="text-gray-500 text-sm">Chưa có user VIP nào</p>
                : (
                  <div className="space-y-3">
                    {users.filter(isVipActive).slice(0, 5).map(u => (
                      <div key={u.UserID} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {u.AvatarURL
                            ? <img src={u.AvatarURL} className="w-8 h-8 rounded-full object-cover" alt="" />
                            : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center text-xs font-bold">{u.Email?.[0]?.toUpperCase()}</div>
                          }
                          <span className="text-sm text-gray-300">{u.Email}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-yellow-400 font-medium">{u.VipType === 2 ? 'VIP Năm' : 'VIP Tháng'}</span>
                          <p className="text-xs text-gray-500">Hết: {fmtDate(u.VipExpire)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        )}

        {/* ════════════════ FILMS ════════════════ */}
        {activeTab === 'films' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl font-bold">Quản lý phim</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Tìm kiếm phim..." value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-red-500 focus:outline-none w-80" />
                </div>
                <button
                  onClick={() => { setSelectedMovie(null); setModalMode('add'); setShowAddModal(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-3 rounded-lg transition-all">
                  <Plus className="w-5 h-5" /> Thêm phim
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies.map(movie => (
                <div key={movie.MovieID} className="movie-card bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <div className="movie-poster-container">
                    <img
                      src={movie.PosterURL ? encodeURI(`http://localhost:5000${movie.PosterURL}`) : '/error.webp'}
                      alt={movie.Title}
                      className="w-[220px] h-[320px] object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = '/error.webp'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    {parseInt(movie.IsVip) === 1 && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        <Crown className="w-3 h-3" /> VIP
                      </div>
                    )}
                    <div className="movie-info">
                      <div className="p-4 space-y-2 text-center">
                        <h3 className="font-bold text-white line-clamp-2">{movie.Title}</h3>
                        <p className="text-gray-400 text-xs">{movie.Genre}</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
                          <Calendar className="w-3 h-3" /> {new Date(movie.ReleaseDate).getFullYear()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1">
                    <p className="text-xs text-white font-medium truncate">{movie.Title}</p>
                    {parseInt(movie.IsVip) === 1 && (
                      <span className="text-yellow-400 text-[10px] flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> VIP
                      </span>
                    )}
                  </div>
                  <div className="p-2 flex gap-2">
                    <button onClick={() => handleEdit(movie)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm">
                      <Edit className="w-3 h-3" /> Sửa
                    </button>
                    <button onClick={() => handleDelete(movie.MovieID)}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm">
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════ USERS ════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Người dùng</h2>
            <div className="flex items-center gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Tìm theo email..." value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-red-500 focus:outline-none w-full" />
              </div>
              <span className="text-gray-400 text-sm">{filteredUsers.length} người dùng</span>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-left">
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Avatar</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Vai trò</th>
                    <th className="px-5 py-4">VIP</th>
                    <th className="px-5 py-4">Hết hạn</th>
                    <th className="px-5 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => (
                    <tr key={u.UserID}
                      className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${idx === filteredUsers.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-5 py-4 text-gray-500">#{u.UserID}</td>
                      <td className="px-5 py-4">
                        {u.AvatarURL
                          ? <img src={u.AvatarURL} className="w-9 h-9 rounded-full object-cover border border-gray-700" alt="" onError={e => { e.target.src = '/error.webp'; }} />
                          : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">{(u.Email?.[0] || '?').toUpperCase()}</div>
                        }
                      </td>
                      <td className="px-5 py-4 text-gray-300">{u.Email || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                          ${u.Role === 'Admin' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'}`}>
                          {u.Role || 'User'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isVipActive(u)
                          ? <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium"><Crown className="w-3 h-3" />{u.VipType === 2 ? 'Năm' : 'Tháng'}</span>
                          : u.VipType > 0
                            ? <span className="text-gray-500 text-xs">Hết hạn</span>
                            : <span className="text-gray-600 text-xs">—</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{u.VipExpire ? fmtDate(u.VipExpire) : '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleDeleteUser(u.UserID, u.Email)}
                          className="inline-flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs">
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════ VIP MANAGEMENT ════════════════ */}
        {activeTab === 'vip' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="text-yellow-400" /> Quản lý VIP
            </h2>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all',     label: `Tất cả (${users.length})` },
                { key: 'active',  label: `Đang VIP (${users.filter(isVipActive).length})` },
                { key: 'expired', label: `Hết hạn (${users.filter(u => u.VipType > 0 && !isVipActive(u)).length})` },
                { key: 'none',    label: `Chưa VIP (${users.filter(u => !u.VipType || u.VipType === 0).length})` },
              ].map(f => (
                <button key={f.key} onClick={() => setVipFilter(f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${vipFilter === f.key ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Tìm theo email..." value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 w-full" />
            </div>

            {/* VIP table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-left">
                    <th className="px-5 py-4">Người dùng</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4">Loại</th>
                    <th className="px-5 py-4">Hết hạn</th>
                    <th className="px-5 py-4 text-center">Kích hoạt VIP</th>
                    <th className="px-5 py-4 text-center">Thu hồi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => (
                    <tr key={u.UserID}
                      className={`border-b border-gray-800 hover:bg-gray-800/30 transition-colors ${idx === filteredUsers.length - 1 ? 'border-b-0' : ''}`}>

                      {/* User info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {u.AvatarURL
                            ? <img src={u.AvatarURL} className="w-9 h-9 rounded-full object-cover" alt="" />
                            : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center font-bold">{(u.Email?.[0] || '?').toUpperCase()}</div>
                          }
                          <div>
                            <p className="text-white text-sm font-medium">{u.Email?.split('@')[0]}</p>
                            <p className="text-gray-500 text-xs">{u.Email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4">
                        {isVipActive(u) ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Đang hoạt động
                          </span>
                        ) : u.VipType > 0 ? (
                          <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Đã hết hạn
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock className="w-3.5 h-3.5" /> Chưa kích hoạt
                          </span>
                        )}
                      </td>

                      {/* Loại VIP */}
                      <td className="px-5 py-4 text-gray-400 text-xs">
                        {u.VipType === 2 ? '🟡 Năm' : u.VipType === 1 ? '🔵 Tháng' : '—'}
                      </td>

                      {/* Hết hạn */}
                      <td className="px-5 py-4 text-gray-400 text-xs">
                        {u.VipExpire ? fmtDate(u.VipExpire) : '—'}
                      </td>

                      {/* Kích hoạt */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleSetVip(u.UserID, 1)}
                            className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap">
                            +1 Tháng
                          </button>
                          <button onClick={() => handleSetVip(u.UserID, 2)}
                            className="bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap">
                            +1 Năm
                          </button>
                        </div>
                      </td>

                      {/* Thu hồi */}
                      <td className="px-5 py-4 text-center">
                        {(isVipActive(u) || u.VipType > 0) && (
                          <button onClick={() => handleSetVip(u.UserID, 0)}
                            className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs transition">
                            Thu hồi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Thêm / Sửa phim */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{modalMode === 'add' ? 'Thêm phim mới' : 'Chỉnh sửa phim'}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
              </div>
              {modalMode === 'add'
                ? <AddMovieComponent  onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchMovies(); }} />
                : <EditMovieComponent movieId={selectedMovie?.MovieID} onBack={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchMovies(); }} />
              }
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FilmAdminDashboard;
