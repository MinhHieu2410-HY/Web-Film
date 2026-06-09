import React, { useState, useEffect } from 'react';
import { User, Mail, Save, X, Edit3, Crown, CheckCircle, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfileEditor = () => {
  const navigate = useNavigate();

  const [isEditing,      setIsEditing]      = useState(false);
  const [userData,       setUserData]       = useState(null);
  const [editData,       setEditData]       = useState({});
  const [avatarPreview,  setAvatarPreview]  = useState('');
  const [avatarOptions,  setAvatarOptions]  = useState([]);
  const [error,          setError]          = useState('');
  const [loading,        setLoading]        = useState(true);
  const [showCodeForm,   setShowCodeForm]   = useState(false);
  const [otp,            setOtp]            = useState('');

  // ── Avatar options ──────────────────────────────────────────────────────────
  useEffect(() => {
    setAvatarOptions(Array.from({ length: 10 }, (_, i) => `/Avatar/av(${i + 1}).svg`));
  }, []);

  // ── Fetch user data ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUserData = async () => {
      const userID = localStorage.getItem('userId');
      if (!userID) { setError('Không tìm thấy ID người dùng'); setLoading(false); return; }
      try {
        const res = await axios.get(`http://localhost:5000/api/users?userID=${userID}`);
        if (res.data.length > 0) {
          setUserData(res.data[0]);
          setEditData(res.data[0]);
          setAvatarPreview(res.data[0].AvatarURL);
        }
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 5000);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // ── VIP helpers ─────────────────────────────────────────────────────────────
  const isVipActive = u =>
    u?.VipType > 0 && u?.VipExpire && new Date(u.VipExpire) > new Date();

  const vipLabel = u => {
    if (!u) return null;
    if (!u.VipType || u.VipType === 0) return null;
    if (new Date(u.VipExpire) <= new Date()) return 'expired';
    return u.VipType === 2 ? 'year' : 'month';
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  const daysLeft = d => {
    if (!d) return 0;
    const diff = new Date(d) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleInputChange = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));

  const validateEmail = () => {
    if (!editData.Email.includes('@gmail.com')) {
      setError('Vui lòng nhập Gmail hợp lệ');
      setTimeout(() => setError(''), 5000);
      return false;
    }
    setError(''); return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/otp/send', { email: editData.Email });
      setShowCodeForm(true); setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi mã OTP thất bại');
      setTimeout(() => setError(''), 5000);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Mã OTP phải có 6 ký tự'); return; }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/otp/verify', { email: editData.Email, otpCode: otp });
      localStorage.setItem('token',  res.data.token);
      localStorage.setItem('userId', res.data.user.UserID);
      await axios.put('http://localhost:5000/api/users', { UserID: editData.UserID, Email: editData.Email, AvatarURL: editData.AvatarURL });
      setUserData({ ...editData });
      setIsEditing(false); setShowCodeForm(false); setOtp('');
    } catch (err) {
      setError(err.response?.data?.error || 'Mã OTP không đúng hoặc đã hết hạn');
      setTimeout(() => setError(''), 5000);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (editData.Email !== userData.Email) { await handleSendOtp(); return; }
    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/users', { UserID: editData.UserID, Email: editData.Email, AvatarURL: editData.AvatarURL });
      setUserData({ ...editData });
      localStorage.setItem('avatarURL', editData.AvatarURL);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally { setLoading(false); }
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setAvatarPreview(userData.AvatarURL);
    setIsEditing(false); setShowCodeForm(false); setOtp(''); setError('');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
    </div>
  );

  if (!userData) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <p className="text-red-400">{error || 'Không tìm thấy dữ liệu người dùng'}</p>
    </div>
  );

  const vipStatus = vipLabel(userData);
  const vipActive = isVipActive(userData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-1">Thông Tin Tài Khoản</h1>
          <p className="text-slate-400 text-sm">Quản lý thông tin cá nhân của bạn</p>
        </div>

        {/* ── VIP Status Card ── */}
        <div className={`rounded-2xl p-5 border ${
          vipActive
            ? 'bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border-yellow-500/40'
            : vipStatus === 'expired'
              ? 'bg-gradient-to-r from-red-900/30 to-red-800/10 border-red-500/30'
              : 'bg-gradient-to-r from-slate-800 to-slate-800/50 border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                vipActive ? 'bg-yellow-500/20' : 'bg-slate-700'
              }`}>
                <Crown className={`w-5 h-5 ${vipActive ? 'text-yellow-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {vipActive
                    ? `VIP ${userData.VipType === 2 ? 'Năm' : 'Tháng'}`
                    : vipStatus === 'expired'
                      ? 'VIP đã hết hạn'
                      : 'Thành viên thường'
                  }
                </p>
                <p className="text-sm">
                  {vipActive ? (
                    <span className="text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Còn {daysLeft(userData.VipExpire)} ngày · hết {fmtDate(userData.VipExpire)}
                    </span>
                  ) : vipStatus === 'expired' ? (
                    <span className="text-red-400">Hết hạn {fmtDate(userData.VipExpire)}</span>
                  ) : (
                    <span className="text-slate-400">Chưa đăng ký VIP</span>
                  )}
                </p>
              </div>
            </div>

            {/* Nút hành động VIP */}
            {vipActive ? (
              <button
                onClick={() => navigate('/', { state: { openVip: true } })}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-400 rounded-xl text-sm font-medium transition"
              >
                <Crown className="w-4 h-4" /> Gia hạn
              </button>
            ) : (
              <button
                onClick={() => navigate('/', { state: { openVip: true } })}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black rounded-xl text-sm font-bold transition-transform hover:scale-105 shadow-lg"
              >
                <Crown className="w-4 h-4" />
                {vipStatus === 'expired' ? 'Gia hạn VIP' : 'Đăng ký VIP'}
              </button>
            )}
          </div>

          {/* Progress bar còn hạn */}
          {vipActive && userData.VipExpire && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Thời hạn còn lại</span>
                <span>{daysLeft(userData.VipExpire)} / {userData.VipType === 2 ? 365 : 30} ngày</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (daysLeft(userData.VipExpire) / (userData.VipType === 2 ? 365 : 30)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Quyền lợi VIP */}
          {vipActive && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['Xem phim VIP độc quyền', 'Không quảng cáo', 'Âm thanh Dolby Atmos', 'Hỗ trợ VIP 24/7'].map(b => (
                <div key={b} className="flex items-center gap-2 text-xs text-yellow-300">
                  <CheckCircle className="w-3 h-3 flex-shrink-0" /> {b}
                </div>
              ))}
            </div>
          )}

          {/* Kêu gọi nếu chưa VIP */}
          {!vipActive && (
            <p className="text-slate-400 text-sm mt-3">
              {vipStatus === 'expired'
                ? '⚠ VIP đã hết hạn. Gia hạn ngay để tiếp tục xem phim độc quyền.'
                : '✨ Nâng cấp VIP để xem toàn bộ phim độc quyền, không quảng cáo và nhiều đặc quyền khác.'
              }
            </p>
          )}
        </div>

        {/* ── Profile Card ── */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-white">Hồ Sơ Người Dùng</h2>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-transform hover:scale-105">
                  <Edit3 className="w-4 h-4" /> Chỉnh sửa
                </button>
              ) : (
                <>
                  <button onClick={handleSave} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg text-sm transition">
                    <Save className="w-4 h-4" /> {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button onClick={handleCancel} disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition">
                    <X className="w-4 h-4" /> Hủy
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-500 shadow-lg">
                <img src={avatarPreview || '/user.png'} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {vipActive && (
                <span className="mt-2 flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-xs font-bold px-3 py-1 rounded-full">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              )}
              {isEditing && (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {avatarOptions.map((url, i) => (
                    <img key={i} src={url} alt={`avatar-${i}`}
                      className={`w-14 h-14 rounded-full border-4 cursor-pointer transition-all duration-200
                        ${avatarPreview === url ? 'border-red-500 scale-110' : 'border-transparent hover:border-slate-500'}`}
                      onClick={() => { setAvatarPreview(url); handleInputChange('AvatarURL', url); }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white font-medium text-sm">
                <Mail className="w-4 h-4 text-red-400" /> Email
              </label>
              {error && <div className="p-3 bg-red-900/40 border border-red-500/40 text-red-300 rounded-lg text-sm">{error}</div>}
              {isEditing ? (
                <>
                  <input type="email" value={editData.Email}
                    onChange={e => handleInputChange('Email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                    placeholder="example@gmail.com" />
                  {showCodeForm && (
                    <div className="space-y-3 mt-2">
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                        placeholder="Nhập mã OTP 6 chữ số" maxLength="6" />
                      <div className="flex justify-between">
                        <button onClick={() => handleSendOtp()} disabled={loading} className="text-blue-400 hover:underline text-sm">Gửi lại mã</button>
                        <button onClick={handleVerifyOtp} disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition">
                          {loading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                        </button>
                      </div>
                    </div>
                  )}
                  {!showCodeForm && editData.Email !== userData.Email && (
                    <button onClick={handleSendOtp} disabled={loading}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
                      {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                    </button>
                  )}
                </>
              ) : (
                <div className="px-4 py-3 bg-slate-700 rounded-lg text-white border border-slate-600 text-sm">
                  {userData.Email}
                </div>
              )}
            </div>

            {/* Thông tin tài khoản */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Vai trò</p>
                <p className={`font-medium ${userData.Role === 'Admin' ? 'text-red-400' : 'text-white'}`}>
                  {userData.Role || 'User'}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Ngày tham gia</p>
                <p className="text-white font-medium">{fmtDate(userData.CreatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Đăng xuất ── */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-xl transition text-sm font-medium">
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>

      </div>
    </div>
  );
};

export default UserProfileEditor;
