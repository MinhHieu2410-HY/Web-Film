// Routes/ratings
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// POST endpoint để lưu bình luận
router.post('/', async (req, res) => {
  const { userId, movieId, score, comment } = req.body;

  if (!userId || !movieId || !score || !comment) {
    return res.status(400).json({ error: 'Thiếu các trường bắt buộc: userId, movieId, score, comment' });
  }

  if (isNaN(parseInt(userId)) || isNaN(parseInt(movieId)) || score < 1 || score > 10) {
    return res.status(400).json({ error: 'userId, movieId hoặc score không hợp lệ' });
  }

  try {
    // Use the pool instead of creating a new connection
    const [movieCheck] = await pool.execute('SELECT MovieID FROM Movies WHERE MovieID = ?', [movieId]);
    if (movieCheck.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy phim' });
    }

    const [userCheck] = await pool.execute('SELECT UserID FROM Users WHERE UserID = ?', [userId]);
    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const query = `
      INSERT INTO Ratings (UserID, MovieID, Score, Comment, CreatedAt)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await pool.execute(query, [userId, movieId, score, comment]);

    res.status(201).json({ message: 'Bình luận được lưu thành công' });
  } catch (error) {
    console.error('Lỗi khi lưu bình luận:', error);
    res.status(500).json({ error: `Không thể lưu bình luận: ${error.message}` });
  }
});

// GET endpoint để lấy đánh giá cho một phim
router.get('/', async (req, res) => {
  const { movieId } = req.query;

  if (!movieId || isNaN(parseInt(movieId))) {
    return res.status(400).json({ error: 'Tham số movieId không hợp lệ' });
  }

  try {
    const [rows] = await pool.execute(`
      SELECT r.RatingID, r.UserID, r.Score, r.Comment, r.CreatedAt, u.Email, u.AvatarURL
      FROM Ratings r
      LEFT JOIN Users u ON r.UserID = u.UserID
      WHERE r.MovieID = ?
      ORDER BY r.CreatedAt DESC
    `, [movieId]);

    res.json(rows);
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá:', error);
    res.status(500).json({ error: `Không thể lấy đánh giá: ${error.message}` });
  }
});

module.exports = router;