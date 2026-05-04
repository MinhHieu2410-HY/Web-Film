// routes/GetMovie.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Lấy thông tin phim
    const [movieRows] = await db.query('SELECT * FROM Movies WHERE MovieID = ?', [id]);
    if (movieRows.length === 0) return res.status(404).json({ error: 'Không tìm thấy phim' });

    const movie = movieRows[0];

    // Lấy danh sách tên thể loại liên kết
    const [categoryRows] = await db.query(
      `SELECT c.Name 
       FROM MovieCategories mc
       JOIN Categories c ON mc.CategoryID = c.CategoryID
       WHERE mc.MovieID = ?`,
      [id]
    );

    // Chỉ lấy tên thể loại (chuỗi)
    movie.categories = categoryRows.map(row => row.Name);

    res.json(movie);
  } catch (err) {
    console.error('Lỗi GetMovie:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
