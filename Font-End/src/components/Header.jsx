// components/Header.jsx  –  Header công khai (chưa đăng nhập)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import logo from '/Logo.jpg';

export default function Header({ onSearch }) {
  const navigate = useNavigate();
  const [lang, setLang]                 = useState('vi');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  const toggleDropdown   = () => setDropdownOpen(!dropdownOpen);
  const changeLanguage   = (value) => { setLang(value); setDropdownOpen(false); };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <img src={logo} alt="Logo" className="h-10 pl-4 flex-shrink-0 cursor-pointer" onClick={() => navigate('/')} />

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phim, thể loại..."
              className="w-full px-4 py-2 pl-10 bg-gray-900 border border-gray-700 rounded-full focus:outline-none focus:border-gray-500 text-white text-sm"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Language */}
          <div className="relative w-28">
            <div
              className="bg-black text-white px-2 py-1 cursor-pointer flex items-center justify-between text-sm border border-gray-700 rounded"
              onClick={toggleDropdown}
            >
              {lang === 'vi' ? 'Tiếng Việt' : 'English'}
              <span className={`ml-1 border-4 border-transparent border-t-white transition-transform inline-block ${dropdownOpen ? 'rotate-180 mt-1' : '-mt-1'}`} />
            </div>
            {dropdownOpen && (
              <div className="absolute w-full bg-gray-900 border border-gray-700 rounded z-10 mt-1">
                <div className={`px-2 py-1.5 cursor-pointer hover:bg-gray-800 text-sm ${lang === 'vi' ? 'text-white' : 'text-gray-400'}`} onClick={() => changeLanguage('vi')}>Tiếng Việt</div>
                <div className={`px-2 py-1.5 cursor-pointer hover:bg-gray-800 text-sm ${lang === 'en' ? 'text-white' : 'text-gray-400'}`} onClick={() => changeLanguage('en')}>English</div>
              </div>
            )}
          </div>

          <Link to="/login" className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 whitespace-nowrap">
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  );
}
