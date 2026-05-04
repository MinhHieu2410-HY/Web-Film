// Routes/Users
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  const userID = req.query.userID;
  if (!userID) {
    return res.status(400).json({ error: 'Thiếu userID' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [userID]);
    res.json(rows);
  } catch (err) {
    console.error('Lỗi truy vấn:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.put('/', async (req, res) => {
  const { UserID, Email, AvatarURL } = req.body;
  if (!UserID || !Email) {
    return res.status(400).json({ error: 'Thiếu UserID hoặc Email' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET Email = ?, AvatarURL = ? WHERE UserID = ?',
      [Email, AvatarURL, UserID]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
