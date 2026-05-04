// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const app = express();

const authRoutes = require('./routes/auth'); //Google
const categoryRoutes = require('./routes/categories');     // Lấy thể loại
const movieUploadRoutes = require('./routes/movie');       // Tải film lên
const moviescroll = require('./routes/moviescroll');       // lấy phim (số lượng lớn)
const getMovieRoutes = require('./routes/GetMovie');       // lấy phim
const streamRoutes = require('./routes/stream');           // lấy trailer film
const ratingsRoutes = require('./routes/ratings');         // lấy và lưu bình luận
const favoritesRouter = require('./routes/favorites');     // Phim đã lưu
const historyRoutes = require('./routes/History');         // Lịch sử xem phim
const searchRoutes = require('./routes/Search');           // Tìm kiếm
const UsersRoutes = require('./routes/Users')              // Người dùng

dotenv.config();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Serve static files from /Film
app.use('/Film', express.static(path.join(__dirname, 'Film')));

// Route cấu trúc rõ ràng, tránh trùng nhau
app.use('/api/movies', movieUploadRoutes);                            // POST thêm phim
app.use('/api/movie', getMovieRoutes);                                // GET 1 phim theo ID
app.use('/api/moviescroll', moviescroll);                             // phim cho scroll
app.use('/api/categories', categoryRoutes);                           // thể loại phim
app.use('/api/auth', authRoutes);                                     // google
app.use('/stream', streamRoutes);                                     // lấy trailer
app.use('/api/ratings', ratingsRoutes);                               // bình luận phim
app.use('/api', favoritesRouter);                                     // phim đã lưu
app.use('/api/history', historyRoutes);                               // Lịch sử xem phim
app.use('/api/search', searchRoutes);                                 // Tìm kiếm phim
app.use('/api/users',UsersRoutes)                                     // Dữ liệu người dùng
                                                      
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});
