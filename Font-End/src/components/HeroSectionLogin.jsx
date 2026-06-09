// components/HeroSectionLogin.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';

export default function LoginHeroSection() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Nếu được redirect từ trang khác (ví dụ /trailer/5) thì sau login quay lại đó
  // Mặc định về /
  const from = location.state?.from || '/';

  const [showCodeForm, setShowCodeForm] = useState(false);
  const [email,        setEmail]        = useState('');
  const [code,         setCode]         = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const clearError = () => setTimeout(() => setError(''), 5000);

  const validateEmail = () => {
    if (!email.includes('@gmail.com')) {
      setError('Vui lòng nhập Gmail hợp lệ');
      return false;
    }
    setError('');
    return true;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/otp/send', { email });
      setShowCodeForm(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi mã thất bại. Vui lòng thử lại.');
      clearError();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/otp/send', { email });
      setError('');
      alert('Mã xác thực đã được gửi lại!');
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể gửi lại mã.');
      clearError();
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Mã code phải có 6 ký tự');
      clearError();
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/otp/verify', {
        email,
        otpCode: code,
      });

      const { token, user } = res.data;
      localStorage.setItem('token',    token);
      localStorage.setItem('userId',   user.UserID);
      localStorage.setItem('userRole', user.Role || 'User'); // lưu role để check Admin

      // Quay lại trang trước đó hoặc trang chủ
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Mã không đúng hoặc đã hết hạn');
      clearError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <section
        className="bg-cover bg-center min-h-screen flex items-center justify-center"
        style={{ backgroundImage: 'url(/movie.jpg)' }}
      >
        <div className="bg-black/60 p-8 rounded-2xl shadow-2xl w-full max-w-md text-white backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-2 text-center">Đăng nhập</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Đăng nhập để xem phim đầy đủ và lưu lịch sử xem
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Bước 1: nhập email */}
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Địa chỉ Gmail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                autoComplete="off"
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl bg-gray-800/80 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@gmail.com"
                required
              />
            </div>
            {!showCodeForm && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-xl font-semibold transition"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
            )}
          </form>

          {/* Bước 2: nhập mã OTP */}
          {showCodeForm && (
            <div className="mt-6">
              <label htmlFor="code" className="block text-sm font-medium mb-2">
                Mã xác thực (6 chữ số)
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl bg-gray-800/80 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Nhập mã 6 chữ số"
                maxLength="6"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl text-sm transition"
                >
                  Gửi lại mã
                </button>
                <button
                  type="button"
                  onClick={handleCodeSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-xl font-semibold transition"
                >
                  {loading ? 'Đang xác nhận...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          )}

          {/* Link quay lại */}
          <p className="mt-6 text-center text-gray-400 text-sm">
            <button
              onClick={() => navigate(from === '/login' ? '/' : from)}
              className="text-gray-400 hover:text-white underline transition"
            >
              ← Quay lại xem phim
            </button>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
