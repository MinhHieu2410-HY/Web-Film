// Routes/categories
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT Name FROM Categories');
    const names = rows.map(row => row.Name);
    res.json(names);
  } catch (err) {
    console.error('Lỗi truy vấn:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT CategoryID,Name FROM Categories');
    res.json(rows)
  } catch (err) {
    console.error('Lỗi truy vấn:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
