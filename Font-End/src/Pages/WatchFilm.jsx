// pages/WatchFilm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderLogin        from '../components/HeaderLogin';
import Footer             from '../components/Footer';
import WatchFilmComponent from '../components/WatchFilm';
import SaveFilm           from '../components/Savefilm';
import History            from '../components/History';
import SearchFilm         from '../components/SearchFilm';
import Users              from '../components/UserControl';
import VipUpgrade         from '../components/Vip';

export default function WatchFilmPage() {
  const navigate = useNavigate();

  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [showUsers,     setShowUsers]     = useState(false);
  const [showVip,       setShowVip]       = useState(false);

  const resetAll = () => {
    setShowFavorites(false);
    setShowHistory(false);
    setShowSearch(false);
    setShowUsers(false);
    setShowVip(false);
  };

  const handleMenuClick = (label) => {
    resetAll();
    if (label === 'Trang chủ')    { navigate('/main'); return; }
    if (label === 'Phim đã lưu')  { setShowFavorites(true); return; }
    if (label === 'Lịch sử xem')  { setShowHistory(true);   return; }
    if (label === 'Tìm kiếm sâu') { setShowSearch(true);    return; }
    if (label === 'Tài khoản')    { setShowUsers(true);      return; }
    if (label === 'VIP')          { setShowVip(true);        return; }
  };

  return (
    <div className="bg-black text-white">
      <HeaderLogin
        onMenuClick={handleMenuClick}
        onCategoryChange={() => {}}
        onSearch={() => {}}
        hideNavbar={true}
      >
        {showFavorites ? <SaveFilm />
          : showHistory  ? <History />
          : showSearch   ? <SearchFilm />
          : showUsers    ? <Users />
          : showVip      ? <VipUpgrade />
          : <WatchFilmComponent />}
      </HeaderLogin>
      <Footer />
    </div>
  );
}
