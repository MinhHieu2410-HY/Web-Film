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

// ─── HELPER: Kiểm tra quyền VIP ──────────────────────────────────────────────
// Trả về { isLoggedIn, isVip } dựa vào header 'user-id'
async function checkUserAccess(req) {
  const rawId  = req.headers['user-id'];
  // Lọc bỏ giá trị rác từ frontend ("null", "undefined", khoảng trắng)
  const userId = (rawId && rawId !== 'null' && rawId !== 'undefined' && String(rawId).trim() !== '')
    ? String(rawId).trim()
    : null;
  if (!userId) return { isLoggedIn: false, isVip: false, role: null };

  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.query(
      'SELECT Role, VipType, VipExpire FROM Users WHERE UserID = ?',
      [userId]
    );
    if (rows.length === 0) return { isLoggedIn: false, isVip: false, role: null };

    const user = rows[0];
    const isVip =
      user.Role === 'Admin' ||
      (user.VipType > 0 && user.VipExpire && new Date(user.VipExpire) > new Date());

    return { isLoggedIn: true, isVip, role: user.Role };
  } finally {
    await connection.end();
  }
}

// ─── GET /api/movie/:id ───────────────────────────────────────────────────────
// Public: trả về thông tin phim + trailer. Nếu phim IsVip=1 mà user không có VIP
// thì ẩn VideoURL (chỉ xem trailer).
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { isLoggedIn, isVip, role } = await checkUserAccess(req);

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
    movie.posterUrl  = movie.PosterURL  ? '/' + movie.PosterURL  : '';
    movie.trailerUrl = movie.TrailerURL ? '/' + movie.TrailerURL : '';

    // Ép kiểu IsVip về số để tránh so sánh string "1" vs number 1
    const isVipMovie = parseInt(movie.IsVip) === 1;


    // Kiểm soát quyền xem video chính
    if (isVipMovie) {
      if (!isLoggedIn) {
        movie.VideoURL    = null;
        movie.videoUrl    = null;
        movie.accessLevel = 'trailer_only';
      } else if (!isVip) {
        movie.VideoURL    = null;
        movie.videoUrl    = null;
        movie.accessLevel = 'need_vip';
      } else {
        movie.videoUrl    = movie.VideoURL ? '/' + movie.VideoURL : '';
        movie.accessLevel = 'full';
      }
    } else {
      // Phim thường – chỉ cần đăng nhập
      if (!isLoggedIn) {
        movie.VideoURL    = null;
        movie.videoUrl    = null;
        movie.accessLevel = 'trailer_only';
      } else {
        movie.videoUrl    = movie.VideoURL ? '/' + movie.VideoURL : '';
        movie.accessLevel = 'full';
      }
    }

    res.json(movie);
  } catch (error) {
    console.error('Lỗi khi lấy phim:', error);
    res.status(500).json({ error: 'Không thể tải thông tin phim' });
  } finally {
    await connection.end();
  }
});

// ─── GET /api/movies ──────────────────────────────────────────────────────────
// Trả về tất cả phim (kèm IsVip flag để frontend hiển thị badge)
router.get('/', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    let sql = `
      SELECT m.*, GROUP_CONCAT(c.Name) as categories
      FROM Movies m
      LEFT JOIN MovieCategories mc ON m.MovieID = mc.MovieID
      LEFT JOIN Categories c ON mc.CategoryID = c.CategoryID
    `;
    const params = [];

    // Lọc theo category nếu có
    if (req.query.category && req.query.category !== 'Tất cả') {
      sql += ' WHERE c.Name = ?';
      params.push(req.query.category);
    }

    sql += ' GROUP BY m.MovieID ORDER BY m.CreatedAt DESC';

    const [movies] = await connection.query(sql, params);
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

// ─── POST /api/movies ─────────────────────────────────────────────────────────
// Thêm phim mới (có trường isVip)
router.post('/', upload.fields([
  { name: 'poster',  maxCount: 1 },
  { name: 'video',   maxCount: 1 },
  { name: 'trailer', maxCount: 1 }
]), async (req, res) => {
  const { title, description, releaseDate, genre, categories, isVip } = req.body;
  const poster  = req.files['poster']  ? req.files['poster'][0].filename  : null;
  const video   = req.files['video']   ? req.files['video'][0].filename   : null;
  const trailer = req.files['trailer'] ? req.files['trailer'][0].filename : null;

  const vipFlag = isVip === 'true' || isVip === '1' ? 1 : 0;

  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO Movies
        (Title, Description, PosterURL, VideoURL, TrailerURL, ReleaseDate, Genre, IsVip, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title, description,
        poster  ? `/Film/Poster/${poster}`   : null,
        video   ? `/Film/Video/${video}`     : null,
        trailer ? `/Film/Trailer/${trailer}` : null,
        releaseDate, genre, vipFlag
      ]
    );

    const movieId = result.insertId;

    if (categories) {
      const parsed = JSON.parse(categories);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const [categoryRows] = await connection.query(
          'SELECT CategoryID FROM Categories WHERE Name IN (?)',
          [parsed]
        );
        const inserts = categoryRows.map(row => [movieId, row.CategoryID]);
        if (inserts.length > 0) {
          await connection.query(
            'INSERT INTO MovieCategories (MovieID, CategoryID) VALUES ?',
            [inserts]
          );
        }
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

// ─── PUT /api/movies/:id ──────────────────────────────────────────────────────
// Sửa phim (có trường isVip)
router.put('/:id', upload.fields([
  { name: 'poster',  maxCount: 1 },
  { name: 'video',   maxCount: 1 },
  { name: 'trailer', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const { title, description, releaseDate, genre, categories, isVip } = req.body;
  const poster  = req.files['poster']  ? req.files['poster'][0].filename  : null;
  const video   = req.files['video']   ? req.files['video'][0].filename   : null;
  const trailer = req.files['trailer'] ? req.files['trailer'][0].filename : null;

  const vipFlag = isVip === 'true' || isVip === '1' ? 1 : 0;

  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE Movies
       SET Title = ?, Description = ?,
           PosterURL  = COALESCE(?, PosterURL),
           VideoURL   = COALESCE(?, VideoURL),
           TrailerURL = COALESCE(?, TrailerURL),
           ReleaseDate = ?, Genre = ?, IsVip = ?
       WHERE MovieID = ?`,
      [
        title, description,
        poster  ? `/Film/Poster/${poster}`   : null,
        video   ? `/Film/Video/${video}`     : null,
        trailer ? `/Film/Trailer/${trailer}` : null,
        releaseDate, genre, vipFlag, id
      ]
    );

    if (result.affectedRows === 0) throw new Error('Không tìm thấy phim');

    await connection.execute('DELETE FROM MovieCategories WHERE MovieID = ?', [id]);

    if (categories) {
      const parsed = JSON.parse(categories);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const [categoryRows] = await connection.query(
          'SELECT CategoryID FROM Categories WHERE Name IN (?)',
          [parsed]
        );
        const inserts = categoryRows.map(row => [id, row.CategoryID]);
        if (inserts.length > 0) {
          await connection.query(
            'INSERT INTO MovieCategories (MovieID, CategoryID) VALUES ?',
            [inserts]
          );
        }
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

// ─── DELETE /api/movies/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'ID không hợp lệ' });

  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();
    for (const q of [
      'DELETE FROM MovieCategories WHERE MovieID = ?',
      'DELETE FROM FavoriteMovies WHERE MovieID = ?',
      'DELETE FROM WatchHistory WHERE MovieID = ?',
      'DELETE FROM Ratings WHERE MovieID = ?'
    ]) {
      await connection.execute(q, [id]);
    }
    const [result] = await connection.execute('DELETE FROM Movies WHERE MovieID = ?', [id]);
    if (result.affectedRows === 0) throw new Error('Không tìm thấy phim');
    await connection.commit();
    res.json({ message: 'Xóa phim thành công' });
  } catch (error) {
    await connection.rollback();
    console.error('Lỗi khi xóa phim:', error);
    res.status(500).json({ error: 'Xóa thất bại' });
  } finally {
    await connection.end();
  }
});

module.exports = router;
