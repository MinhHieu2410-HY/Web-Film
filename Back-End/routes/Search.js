// routes/Search.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * Tìm kiếm phim theo tên (tìm kiếm tương đối)
 * @route GET /api/search/search?q= $$$
 * @param {string} q.query.required - Từ khóa tìm kiếm
 * @returns {object} 200 - Danh sách phim phù hợp
 * @returns {Error} 500 - Lỗi server
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        console.log(q);
        if (!q || q.trim() === '') {
            return res.status(400).json({ error: 'Vui lòng nhập từ khóa tìm kiếm' });
        }

        const searchQuery = `%${q}%`; 
        console.log('Search Query being used:', searchQuery);
        const query = `
            SELECT m.*, GROUP_CONCAT(c.Name SEPARATOR ', ') AS categories
            FROM Movies m
            LEFT JOIN MovieCategories mc ON m.MovieID = mc.MovieID
            LEFT JOIN Categories c ON mc.CategoryID = c.CategoryID
            WHERE m.Title LIKE ?
            GROUP BY m.MovieID
            ORDER BY m.Title
        `;
        
        const [movies] = await db.query(query, [searchQuery]);
        
        res.json(movies);
    } catch (error) {
        console.error('Lỗi tìm kiếm phim:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi tìm kiếm phim' });
    }
});

/**
 * Tìm kiếm phim theo tên và thể loại (đồng thời tất cả các thể loại nếu có nhiều ID)
 * @route GET /api/search/search-with-categories?q=$&categoryIds=$,$,$
 * @group Movies - Tìm kiếm phim
 * @param {string} q.query.required - Từ khóa tìm kiếm trong tiêu đề phim
 * @param {string} categoryIds.query - Danh sách ID thể loại cách nhau bằng dấu phẩy (ví dụ: 5,8,12)
 * @returns {Array<object>} 200 - Danh sách phim phù hợp
 * @returns {object} 400 - Lỗi: thiếu từ khóa tìm kiếm
 * @returns {object} 500 - Lỗi hệ thống server
 */

  router.get('/search-with-categories', async (req, res) => {
  try {
    const { q, categoryIds } = req.query;

    if ((!q || q.trim() === '') && (!categoryIds || categoryIds.trim() === '')) {
      return res.status(400).json({ error: 'Vui lòng nhập từ khóa hoặc chọn thể loại' });
    }

    let baseQuery = `
      SELECT m.*, GROUP_CONCAT(DISTINCT c.Name SEPARATOR ', ') AS categories
      FROM Movies m
      JOIN MovieCategories mc ON m.MovieID = mc.MovieID
      JOIN Categories c ON mc.CategoryID = c.CategoryID
      WHERE 1 = 1
    `;
    const params = [];

    if (q && q.trim() !== '') {
      baseQuery += ` AND m.Title LIKE ?`;
      params.push(`%${q}%`);
    }

    let havingClause = '';
    if (categoryIds && categoryIds.trim() !== '') {
      const idsArray = categoryIds.split(',').map(id => parseInt(id.trim())).filter(Boolean);
      if (idsArray.length > 0) {
        const placeholders = idsArray.map(() => '?').join(', ');
        baseQuery += ` AND mc.CategoryID IN (${placeholders})`;
        params.push(...idsArray);

        havingClause = `HAVING COUNT(DISTINCT mc.CategoryID) = ${idsArray.length}`;
      }
    }

    const finalQuery = `
      ${baseQuery}
      GROUP BY m.MovieID
      ${havingClause}
      ORDER BY m.Title
    `;

    const [movies] = await db.query(finalQuery, params);
    res.json(movies);
    } catch (error) {
        console.error('Lỗi tìm kiếm phim theo thể loại hoặc tên:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi tìm kiếm phim' });
    }
    });

/**
 * Lấy danh sách thể loại phim (dùng cho dropdown khi tìm kiếm)
 * @route GET /api/movie/categories
 * @returns {object} 200 - Danh sách thể loại
 * @returns {Error} 500 - Lỗi server
 */
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM Categories ORDER BY Name');
        res.json(categories);
    } catch (error) {
        console.error('Lỗi lấy danh sách thể loại:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách thể loại' });
    }
});

module.exports = router;