// pages/Home.jsx  –  Trang công khai (chưa đăng nhập)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Crown, Play, Lock } from 'lucide-react';
import Header    from '../components/Header';
import HeroSection from '../components/HeroSection';
import Features  from '../components/Features';
import Footer    from '../components/Footer';
import SearchFilm from '../components/SearchFilm';

function Home() {
  const navigate   = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (query) => {
    if (query.trim()) {
      setSearchTerm(query);
      setShowSearch(true);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header với ô tìm kiếm public */}
      <Header onSearch={handleSearch} />

      {showSearch ? (
        /* Khi tìm kiếm: chỉ hiển thị kết quả + trailer, không cho xem full */
        <div className="pt-4">
          {/* Banner nhắc nhở quyền hạn */}
          <div className="max-w-7xl mx-auto px-4 mb-4">
            <div className="flex flex-wrap items-center gap-4 bg-gray-900/80 border border-gray-700 rounded-xl px-5 py-3 text-sm">
              <span className="flex items-center gap-2 text-green-400"><Play size={14} /> Xem trailer: Miễn phí</span>
              <span className="flex items-center gap-2 text-blue-400"><Lock size={14} /> Xem phim đầy đủ: Cần đăng nhập</span>
              <span className="flex items-center gap-2 text-yellow-400"><Crown size={14} /> Phim VIP: Cần tài khoản VIP</span>
              <button onClick={() => setShowSearch(false)} className="ml-auto text-gray-400 hover:text-white text-xs underline">
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
          <SearchFilm searchTerm={searchTerm} publicMode />
        </div>
      ) : (
        <>
          <HeroSection onSearch={handleSearch} />

          {/* Section giới thiệu 3 cấp quyền */}
          <section className="py-12 bg-gray-950">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">Trải nghiệm theo cấp độ thành viên</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Khách */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-200">Khách</h3>
                  <p className="text-gray-500 text-sm mb-4">Không cần tài khoản</p>
                  <ul className="text-sm text-left space-y-2 text-gray-400">
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Tìm kiếm phim</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Xem trailer</li>
                    <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Xem phim đầy đủ</li>
                    <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Lưu / Lịch sử</li>
                    <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Đánh giá phim</li>
                  </ul>
                </div>

                {/* Thành viên */}
                <div className="bg-gray-900 border border-blue-500/40 rounded-2xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Miễn phí
                  </div>
                  <div className="w-14 h-14 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-blue-300">Thành viên</h3>
                  <p className="text-gray-500 text-sm mb-4">Đăng nhập bằng Gmail</p>
                  <ul className="text-sm text-left space-y-2 text-gray-400">
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Tìm kiếm phim</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Xem trailer</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Xem phim thường</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Lưu / Lịch sử xem</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Đánh giá phim</li>
                    <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Phim độc quyền VIP</li>
                  </ul>
                  <button onClick={() => navigate('/login')}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition">
                    Đăng nhập ngay
                  </button>
                </div>

                {/* VIP */}
                <div className="bg-gray-900 border border-yellow-500/40 rounded-2xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Crown size={10} /> VIP
                  </div>
                  <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-7 h-7 text-yellow-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-yellow-300">VIP</h3>
                  <p className="text-gray-500 text-sm mb-4">Từ 199.000đ/tháng</p>
                  <ul className="text-sm text-left space-y-2 text-gray-400">
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Tất cả quyền thành viên</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Phim độc quyền VIP</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Không quảng cáo</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Âm thanh Dolby Atmos</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Hỗ trợ VIP 24/7</li>
                    <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Chiếu sớm & độc quyền</li>
                  </ul>
                  <button onClick={() => navigate('/login')}
                    className="mt-5 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-2 rounded-xl transition">
                    Nâng cấp VIP
                  </button>
                </div>
              </div>
            </div>
          </section>

          <Features />
        </>
      )}
      <Footer />
    </div>
  );
}

export default Home;
