// components/HeaderLogin.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Menu, SlidersHorizontal, MessageSquare,
  User, Home, FileClock, Book, Crown, LogIn
} from 'lucide-react';

const HeaderLogin = ({
  children,
  onSearch,
  onCategoryChange,
  onMenuClick,
  hideNavbar,
  hideSearch,
  isLoggedIn = !!localStorage.getItem('userId'),
}) => {
  const navigate = useNavigate();
  const [user,             setUser]             = useState(null);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [categories,       setCategories]       = useState([]);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);

  const categoryRef = useRef(null);
  const isDragging  = useRef(false);
  const startX      = useRef(0);
  const scrollLeft  = useRef(0);

  // Danh sách thể loại
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.categories || []);
        setCategories(['Tất cả', ...data]);
      })
      .catch(console.error);
  }, []);

  // User info (chỉ fetch nếu đã login)
  useEffect(() => {
    if (!isLoggedIn) return;
    const userId = localStorage.getItem('userId');
    const avatar = localStorage.getItem('avatarURL');
    axios.get(`http://localhost:5000/api/users?userID=${userId}`)
      .then(res => {
        if (res.data.length > 0) {
          const u = res.data[0];
          if (avatar) u.AvatarURL = avatar;
          setUser(u);
        }
      })
      .catch(err => console.error('Lỗi lấy user:', err));
  }, [isLoggedIn]);

  useEffect(() => {
    if (hideSearch) setSearchQuery('');
  }, [hideSearch]);

  // Kéo ngang thanh thể loại
  useEffect(() => {
    const slider = categoryRef.current;
    if (!slider) return;
    const onMouseDown  = e => { isDragging.current = true; startX.current = e.pageX - slider.offsetLeft; scrollLeft.current = slider.scrollLeft; };
    const onMouseUp    = () => isDragging.current = false;
    const onMouseLeave = () => isDragging.current = false;
    const onMouseMove  = e => {
      if (!isDragging.current) return;
      e.preventDefault();
      slider.scrollLeft = scrollLeft.current - (e.pageX - slider.offsetLeft - startX.current) * 1.5;
    };
    slider.addEventListener('mousedown',  onMouseDown);
    slider.addEventListener('mouseup',    onMouseUp);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('mousemove',  onMouseMove);
    return () => {
      slider.removeEventListener('mousedown',  onMouseDown);
      slider.removeEventListener('mouseup',    onMouseUp);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('mousemove',  onMouseMove);
    };
  }, []);

  const isVipActive = user?.VipType > 0 && user?.VipExpire && new Date(user.VipExpire) > new Date();
  const isAdmin     = user?.Role === 'Admin';

  // Sidebar items – phân theo quyền
  const sidebarItems = [
    { icon: Home,              label: 'Trang chủ',    public: true,  adminOnly: false },
    { icon: Search,            label: 'Tìm kiếm sâu', public: true,  adminOnly: false },
    { icon: Crown,             label: 'VIP',           public: true,  adminOnly: false },
    { icon: User,              label: 'Tài khoản',    public: false, adminOnly: false },
    { icon: Book,              label: 'Phim đã lưu',  public: false, adminOnly: false },
    { icon: FileClock,         label: 'Lịch sử xem',  public: false, adminOnly: false },
    { icon: SlidersHorizontal, label: 'Quản lý',      public: false, adminOnly: true  },
    { icon: MessageSquare,     label: 'Phản hồi',     public: false, adminOnly: false },
  ];

  const handleSearchSubmit = e => { e.preventDefault(); onSearch?.(searchQuery); };
  const handleCategorySelect = cat => { setSelectedCategory(cat); onCategoryChange?.(cat); };
  const handleMenuItemClick  = label => {
    onMenuClick?.(label);
    setTimeout(() => setSidebarOpen(false), 200);
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-50">
        <div className="flex items-center justify-between px-4 py-2">

          {/* Logo + menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 hover:bg-gray-800 rounded-full transition-all duration-200 ${sidebarOpen ? 'bg-gray-800' : ''}`}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span
              className="text-xl font-bold cursor-pointer"
              onClick={() => handleMenuItemClick('Trang chủ')}
            >
              XPTT
            </span>
          </div>

          {/* Search */}
          {!hideSearch && (
            <form className="flex-1 max-w-2xl mx-8" onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm phim..."
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-full focus:outline-none focus:border-gray-500"
                />
                <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 bg-gray-800 border-l border-gray-700 rounded-r-full hover:bg-gray-700">
                  <Search className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </form>
          )}

          {/* Right: VIP badge + avatar hoặc nút đăng nhập */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {isVipActive && (
                  <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-xs font-bold px-2 py-1 rounded-full">
                    <Crown className="w-3 h-3" /> VIP
                  </span>
                )}
                <button
                  onClick={() => handleMenuItemClick('Tài khoản')}
                  className="p-2 hover:bg-gray-800 rounded-full"
                >
                  {user?.AvatarURL
                    ? <img src={user.AvatarURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-600" />
                    : <User className="w-6 h-6" />
                  }
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Thanh thể loại ── */}
      {!hideNavbar && (
        <div className="pt-16 bg-black border-b border-gray-800">
          <div
            ref={categoryRef}
            className="overflow-x-auto px-4 py-3 whitespace-nowrap cursor-grab select-none"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
          >
            <style>{`
              div::-webkit-scrollbar { height: 4px; }
              div::-webkit-scrollbar-track { background: transparent; }
              div::-webkit-scrollbar-thumb { background-color: #333; border-radius: 10px; }
            `}</style>
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => handleCategorySelect(cat)}
                className={`inline-block mr-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${selectedCategory === cat ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300
          ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      >
        <nav
          className={`absolute top-16 left-0 w-64 bg-gray-900 h-full p-4 overflow-y-auto transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          {/* User info hoặc prompt đăng nhập */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-700">
              {user.AvatarURL
                ? <img src={user.AvatarURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center font-bold">
                    {user.Email?.[0]?.toUpperCase()}
                  </div>
              }
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{user.Email?.split('@')[0]}</p>
                {isVipActive
                  ? <span className="flex items-center gap-1 text-yellow-400 text-xs"><Crown className="w-3 h-3" /> VIP</span>
                  : <span className="text-gray-500 text-xs">Thành viên</span>
                }
              </div>
            </div>
          ) : (
            <div className="mb-5 pb-4 border-b border-gray-700">
              <p className="text-gray-400 text-sm mb-3">Đăng nhập để mở khóa đầy đủ tính năng</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập
              </button>
            </div>
          )}

          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Menu</p>

          {sidebarItems.map((item, idx) => {
            // Ẩn các mục private nếu chưa đăng nhập
            if (!item.public && !isLoggedIn) return null;
            // Ẩn Quản lý nếu không phải Admin
            if (item.adminOnly && !isAdmin) return null;

            return (
              <button
                key={idx}
                onClick={() => handleMenuItemClick(item.label)}
                className={`flex items-center w-full mb-1 px-3 py-3 rounded-lg hover:bg-gray-800 text-left transition-all duration-200
                  ${item.label === 'VIP' ? 'text-yellow-400 hover:bg-yellow-500/10' : ''}`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${item.label === 'VIP' ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className={`font-medium ${item.label === 'VIP' ? 'text-yellow-400' : 'text-gray-200'}`}>
                  {item.label}
                </span>
                {item.label === 'VIP' && !isVipActive && (
                  <span className="ml-auto text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full">
                    Nâng cấp
                  </span>
                )}
              </button>
            );
          })}

          {/* Nút đăng xuất nếu đã login */}
          {isLoggedIn && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full text-left px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium transition"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* ── Nội dung chính ── */}
      <main className={`transition-all duration-300 ${!hideNavbar ? 'pt-0' : 'pt-16'} p-6`}>
        {children}
      </main>
    </div>
  );
};

export default HeaderLogin;
