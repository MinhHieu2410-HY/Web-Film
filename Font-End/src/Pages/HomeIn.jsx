// pages/HomeIn.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderLogin from '../components/HeaderLogin';
import Footer      from '../components/Footer';
import FilmScroll  from '../components/FilmScroll';
import AllFilm     from '../components/Allfilm';
import Manager     from '../components/Manager';
import SaveFilm    from '../components/Savefilm';
import History     from '../components/History';
import SearchFilm  from '../components/SearchFilm';
import Users       from '../components/UserControl';
import VipUpgrade  from '../components/Vip';
import AIRecommend from '../components/AIRecommend';

export default function HomeIn() {
  const navigate = useNavigate();
  const location  = useLocation();
  const isLoggedIn = !!localStorage.getItem('userId');
  const userRole   = localStorage.getItem('userRole'); // 'Admin' hoặc 'User'
  const isAdmin    = userRole === 'Admin';

  const [activeCategory,   setActiveCategory]   = useState(null);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [scrollCategories, setScrollCategories] = useState([]);
  const [showManager,      setShowManager]      = useState(false);
  const [showFavorites,    setShowFavorites]    = useState(false);
  const [showHistory,      setShowHistory]      = useState(false);
  const [showSearch,       setShowSearch]       = useState(false);
  const [showUsers,        setShowUsers]        = useState(false);
  const [showVip,          setShowVip]          = useState(false);

  // Nếu được redirect từ WatchTrailer với state openVip → mở trang VIP luôn
  useEffect(() => {
    if (location.state?.openVip) {
      setShowVip(true);
      // Xóa state để F5 không bị mở lại
      window.history.replaceState({}, '');
    }
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setScrollCategories(data))
      .catch(console.error);
  }, []);

  const resetAll = () => {
    setShowManager(false);
    setShowFavorites(false);
    setShowHistory(false);
    setShowSearch(false);
    setShowUsers(false);
    setShowVip(false);
    setActiveCategory(null);
    setSearchTerm('');
  };

  // Các menu cần đăng nhập
  const REQUIRE_LOGIN = ['Phim đã lưu', 'Lịch sử xem', 'Tài khoản', 'Quản lý'];
  // Các menu chỉ Admin mới dùng
  const REQUIRE_ADMIN = ['Quản lý'];

  const handleMenuClick = (label) => {
    // Nếu chưa đăng nhập và menu cần login → về trang login
    if (!isLoggedIn && REQUIRE_LOGIN.includes(label)) {
      navigate('/login');
      return;
    }
    // Nếu đã login nhưng không phải Admin → bỏ qua
    if (isLoggedIn && REQUIRE_ADMIN.includes(label) && !isAdmin) {
      return;
    }

    resetAll();
    if (label === 'Trang chủ')    return;
    if (label === 'Quản lý')      { setShowManager(true);   return; }
    if (label === 'Phim đã lưu')  { setShowFavorites(true); return; }
    if (label === 'Lịch sử xem')  { setShowHistory(true);   return; }
    if (label === 'Tìm kiếm sâu') { setShowSearch(true);    return; }
    if (label === 'Tài khoản')    { setShowUsers(true);      return; }
    if (label === 'VIP')          { setShowVip(true);        return; }
  };

  const handleCategoryChange = (category) => {
    resetAll();
    setActiveCategory(category);
  };

  const handleSearch = (query) => {
    if (!query.trim()) return;
    resetAll();
    setSearchTerm(query);
    setShowSearch(true);
  };

  return (
    <div>
      <HeaderLogin
        onMenuClick={handleMenuClick}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        hideSearch={showSearch}
        hideNavbar={showSearch}
        isLoggedIn={isLoggedIn}
      >
        {showManager   ? <Manager />
          : showFavorites ? <SaveFilm />
          : showHistory   ? <History />
          : showSearch    ? <SearchFilm searchTerm={searchTerm} />
          : showUsers     ? <Users />
          : showVip       ? <VipUpgrade />
          : activeCategory !== null
            ? <AllFilm category={activeCategory} searchTerm={searchTerm} />
            : (
              <>
                <AIRecommend />
                <FilmScroll key="all-movies" title="Tất cả phim" category={null} />
                {scrollCategories.map(cat => (
                  <FilmScroll key={cat} title={cat} category={cat} />
                ))}
              </>
            )
        }
      </HeaderLogin>
      <Footer />
    </div>
  );
}
