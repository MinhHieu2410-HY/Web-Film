// routes/history.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ghi nhận lịch sử xem phim
router.post('/:userId/:movieId', async (req, res) => {
    try {
        const { userId, movieId } = req.params;

        // Kiểm tra xem bản ghi đã tồn tại chưa
        const [existing] = await db.query(
            'SELECT * FROM WatchHistory WHERE UserID = ? AND MovieID = ?',
            [userId, movieId]
        );

        if (existing.length > 0) {
            // Nếu đã tồn tại, cập nhật thời gian xem
            await db.query(
                'UPDATE WatchHistory SET WatchedAt = CURRENT_TIMESTAMP WHERE UserID = ? AND MovieID = ?',
                [userId, movieId]
            );
        } else {
            // Nếu chưa tồn tại, thêm mới
            await db.query(
                'INSERT INTO WatchHistory (UserID, MovieID) VALUES (?, ?)',
                [userId, movieId]
            );
        }

        res.status(200).json({ message: 'Lịch sử xem đã được cập nhật' });
    } catch (error) {
        console.error('Lỗi khi cập nhật lịch sử xem:', error);
        res.status(500).json({ error: 'Lỗi server khi cập nhật lịch sử xem' });
    }
});

// Lấy danh sách lịch sử xem của người dùng
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [history] = await db.query(
            `SELECT m.MovieID, m.Title, m.PosterURL, m.Description, wh.WatchedAt 
             FROM WatchHistory wh
             JOIN Movies m ON wh.MovieID = m.MovieID
             WHERE wh.UserID = ?
             ORDER BY wh.WatchedAt DESC`,
            [userId]
        );

        res.status(200).json(history);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử xem:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy lịch sử xem' });
    }
});

module.exports = router;