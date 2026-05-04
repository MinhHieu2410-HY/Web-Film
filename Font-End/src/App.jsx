import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';

import Test from "./Pages/Test"

import Home from "./Pages/Home";
import Main from "./Pages/HomeIn"
import HeroSectionLogin from "./components/HeroSectionLogin";
import WatchTrailer from './components/WatchTrailer';
import WatchFilm from './Pages/WatchFilm';

function App() {
  const [message, setMessage] = useState(''); // Sửa đúng useState

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/status') // URL đúng với backend auth
      .then(res => res.text())
      .then(data => {
        console.log('Phản hồi từ server:', data);
        setMessage(data); // Cập nhật state message
      })
      .catch(err => {
        console.error('Lỗi kết nối server:', err);
        setMessage('Không thể kết nối server');
      });
  }, []); // [] để gọi 1 lần khi component mount

  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<HeroSectionLogin />} />
          <Route path="/main" element={<Main />} />
          <Route path="/trailer/:movieID" element={<WatchTrailer />} />
          <Route path="/watch/:movieID" element={<WatchFilm />} />
          <Route path="/test" element={<Test />} />
        </Routes>

        {/* Hiển thị thông báo kết nối server */}
        <div style={{ position: "fixed", bottom: 10, left: 10, fontSize: 12, color: 'gray',display:'none', }}>
          Server: {message || "Đang kết nối..."}
        </div>
      </>
    </Router>
  );
}

export default App;
