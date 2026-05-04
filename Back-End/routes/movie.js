const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'DB_XPTT'
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'poster') cb(null, 'Film/Poster');
    else if (file.fieldname === 'video') cb(null, 'Film/Video');
    else if (file.fieldname === 'trailer') cb(null, 'Film/Trailer');
    else cb(new Error('Invalid file type'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Lấy thông tin chi tiết 1 phim
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await mysql.createConnection(dbConfig);

  try {
    const [movies] = await connection.query(`
      SELECT m.*, GROUP_CONCAT(c.Name) as categories
      FROM Movies m
      LEFT JOIN MovieCategories mc ON m.MovieID = mc.MovieID
      LEFT JOIN Categories c ON mc.CategoryID = c.CategoryID
      WHERE m.MovieID = ?
      GROUP BY m.MovieID
    `, [id]);

    if (movies.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy phim' });
    }

    const movie = movies[0];
    movie.categories = movie.categories ? movie.categories.split(',') : [];

    // Format đường dẫn file (nếu cần thiết)
    movie.posterUrl = movie.PosterURL ? `/` + movie.PosterURL : '';
    movie.videoUrl = movie.VideoURL ? `/` + movie.VideoURL : '';
    movie.trailerUrl = movie.TrailerURL ? `/` + movie.TrailerURL : '';

    res.json(movie);
  } catch (error) {
    console.error('Lỗi khi lấy phim:', error);
    res.status(500).json({ error: 'Không thể tải thông tin phim' });
  } finally {
    await connection.end();
  }
});


// tất cả movie
router.get('/', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [movies] = await connection.query(`
      SELECT m.*, GROUP_CONCAT(c.Name) as categories
      FROM Movies m
      LEFT JOIN MovieCategories mc ON m.MovieID = mc.MovieID
      LEFT JOIN Categories c ON mc.CategoryID = c.CategoryID
      GROUP BY m.MovieID
    `);
    const formattedMovies = movies.map(movie => ({
      ...movie,
      categories: movie.categories ? movie.categories.split(',') : []
    }));
    res.json(formattedMovies);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim:', error);
    res.status(500).json({ error: 'Lỗi server' });
  } finally {
    await connection.end();
  }
});

// thêm
router.post('/', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'trailer', maxCount: 1 }
]), async (req, res) => {
  const { title, description, releaseDate, genre, categories } = req.body;
  const poster = req.files['poster'] ? req.files['poster'][0].filename : null;
  const video = req.files['video'] ? req.files['video'][0].filename : null;
  const trailer = req.files['trailer'] ? req.files['trailer'][0].filename : null;

  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'INSERT INTO Movies (Title, Description, PosterURL, VideoURL, TrailerURL, ReleaseDate, Genre, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [title, description, poster ? `/Film/Poster/${poster}` : null, video ? `/Film/Video/${video}` : null, trailer ? `/Film/Trailer/${trailer}` : null, releaseDate, genre]
    );

    const movieId = result.insertId;

    if (categories && Array.isArray(JSON.parse(categories))) {
      const [categoryRows] = await connection.query(
        'SELECT CategoryID, Name FROM Categories WHERE Name IN (?)',
        [JSON.parse(categories)]
      );

      const categoryInserts = categoryRows.map(row => [movieId, row.CategoryID]);
      if (categoryInserts.length > 0) {
        await connection.query(
          'INSERT INTO MovieCategories (MovieID, CategoryID) VALUES ?',
          [categoryInserts]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Phim đã được thêm thành công', movieId });
  } catch (error) {
    await connection.rollback();
    console.error('Lỗi khi thêm phim:', error);
    res.status(500).json({ error: 'Upload thất bại' });
  } finally {
    await connection.end();
  }
});

// Sửa
router.put('/:id', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'trailer', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const { title, description, releaseDate, genre, categories } = req.body;
  const poster = req.files['poster'] ? req.files['poster'][0].filename : null;
  const video = req.files['video'] ? req.files['video'][0].filename : null;
  const trailer = req.files['trailer'] ? req.files['trailer'][0].filename : null;

  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.beginTransaction();

    // Update movie details
    const [result] = await connection.execute(
      `UPDATE Movies 
       SET Title = ?, Description = ?, 
           PosterURL = COALESCE(?, PosterURL), 
           VideoURL = COALESCE(?, VideoURL), 
           TrailerURL = COALESCE(?, TrailerURL), 
           ReleaseDate = ?, Genre = ?
       WHERE MovieID = ?`,
      [title, description, poster ? `/Film/Poster/${poster}` : null, video ? `/Film/Video/${video}` : null, trailer ? `/Film/Trailer/${trailer}` : null, releaseDate, genre, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy phim');
    }

    // Update categories
    await connection.execute('DELETE FROM MovieCategories WHERE MovieID = ?', [id]);

    if (categories && Array.isArray(JSON.parse(categories))) {
      const [categoryRows] = await connection.query(
        'SELECT CategoryID, Name FROM Categories WHERE Name IN (?)',
        [JSON.parse(categories)]
      );

      const categoryInserts = categoryRows.map(row => [id, row.CategoryID]);
      if (categoryInserts.length > 0) {
        await connection.query(
          'INSERT INTO MovieCategories (MovieID, CategoryID) VALUES ?',
          [categoryInserts]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Phim đã được cập nhật thành công' });
  } catch (error) {
    await connection.rollback();
    console.error('Lỗi khi cập nhật phim:', error);
    res.status(500).json({ error: 'Cập nhật thất bại' });
  } finally {
    await connection.end();
  }
});

// Xóa phim 
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();

    // Xóa tất cả dữ liệu liên quan đến phim trước
    const deleteQueries = [
      'DELETE FROM MovieCategories WHERE MovieID = ?',
      'DELETE FROM FavoriteMovies WHERE MovieID = ?',
      'DELETE FROM WatchHistory WHERE MovieID = ?',
      'DELETE FROM Ratings WHERE MovieID = ?'
    ];

    for (const query of deleteQueries) {
      await connection.execute(query, [id]);
    }
    // Xóa phim chính
    const [result] = await connection.execute('DELETE FROM Movies WHERE MovieID = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy phim');
    }
    await connection.commit();
    res.json({ message: 'Phim và các dữ liệu liên quan đã được xóa thành công' });
  } catch (error) {
    await connection.rollback();
    console.error('Lỗi khi xóa phim:', error);
    res.status(500).json({ error: 'Xóa thất bại' });
  } finally {
    await connection.end();
  }
});

module.exports = router;