// Routes/moviescroll
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const pool = require('../config/db');

router.get('/', async (req, res) => {
  const { category } = req.query;
  // Base SQL
  let sql = `
    SELECT m.MovieID, m.Title, m.PosterURL, m.ReleaseDate, AVG(r.Score) AS AverageRating
    FROM Movies m
    LEFT JOIN Ratings r ON m.MovieID = r.MovieID
  `;
  const params = [];

  if (category) {
    sql += `
      INNER JOIN MovieCategories mc ON m.MovieID = mc.MovieID
      INNER JOIN Categories c ON mc.CategoryID = c.CategoryID AND c.Name = ?
    `;
    params.push(category);
  }

  sql += `
    GROUP BY m.MovieID
    ORDER BY AverageRating DESC
    LIMIT 10;
  `;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error in /api/moviescroll:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
