// routes/favorites
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware để kiểm tra userId từ token hoặc session
const authenticate = (req, res, next) => {
  const userId = req.headers['user-id']; // Giả sử userId được gửi trong header
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập' });
  }
  req.userId = parseInt(userId);
  next();
};

// Lấy danh sách phim yêu thích của người dùng bằng userId (public access)
router.get('/favorites/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'ID người dùng không hợp lệ' });
    }

    // Truy vấn để lấy tất cả phim yêu thích của người dùng
    const [favoriteMovies] = await pool.query(
      `SELECT m.* FROM Movies m
       JOIN FavoriteMovies fm ON m.MovieID = fm.MovieID
       WHERE fm.UserID = ?`,
      [parseInt(userId)]
    );

    res.json(favoriteMovies);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phim yêu thích:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Kiểm tra trạng thái yêu thích của phim
router.get('/favorites/:movieId', authenticate, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.userId;

    const [rows] = await pool.query(
      'SELECT * FROM FavoriteMovies WHERE UserID = ? AND MovieID = ?',
      [userId, parseInt(movieId)]
    );

    res.json({ isBookmarked: rows.length > 0 });
  } catch (err) {
    console.error('Lỗi khi kiểm tra trạng thái yêu thích:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Thêm phim vào danh sách yêu thích
router.post('/favorites', authenticate, async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.userId;

    if (!movieId || isNaN(parseInt(movieId))) {
      return res.status(400).json({ error: 'ID phim không hợp lệ' });
    }

    await pool.query(
      'INSERT INTO FavoriteMovies (UserID, MovieID) VALUES (?, ?)',
      [userId, parseInt(movieId)]
    );

    res.json({ message: 'Đã thêm phim vào danh sách yêu thích' });
  } catch (err) {
    console.error('Lỗi khi thêm phim yêu thích:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xóa phim khỏi danh sách yêu thích
router.delete('/favorites/:movieId', authenticate, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.userId;

    await pool.query(
      'DELETE FROM FavoriteMovies WHERE UserID = ? AND MovieID = ?',
      [userId, parseInt(movieId)]
    );

    res.json({ message: 'Đã xóa phim khỏi danh sách yêu thích' });
  } catch (err) {
    console.error('Lỗi khi xóa phim yêu thích:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;