// Auth.js - Google
const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const client = require('../config/google');
const transporter = require('../config/nodemailer');
const router = express.Router();

// Đăng nhập bằng Google
router.get('/google', (req, res) => {
  const url = client.generateAuthUrl({
    scope: ['profile', 'email'],
  });
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { tokens } = await client.getToken(req.query.code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, picture } = payload;

    // Tìm người dùng theo GoogleID
    let [user] = await pool.query('SELECT * FROM Users WHERE GoogleID = ?', [sub]);

    if (!user.length) {
      // Nếu chưa có theo GoogleID, thử tìm theo Email
      const [existingUser] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);

      if (existingUser.length) {
        // Nếu email đã tồn tại, cập nhật GoogleID và AvatarURL
        await pool.query(
          'UPDATE Users SET GoogleID = ?, AvatarURL = ? WHERE Email = ? AND GoogleID IS NULL',
          [sub, picture, email]
        );
      } else {
        // Nếu email chưa tồn tại, thêm mới
        await pool.query(
          'INSERT INTO Users (Email, GoogleID, AvatarURL, Role) VALUES (?, ?, ?, ?)',
          [email, sub, picture, 'User']
        );
      }

      // Truy vấn lại người dùng sau khi thêm/cập nhật
      [user] = await pool.query('SELECT * FROM Users WHERE GoogleID = ?', [sub]);
    }

    // Tạo JWT
    const token = jwt.sign(
      { userId: user[0].UserID, email: user[0].Email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        userId: user[0].UserID,
        email: user[0].Email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Gửi OTP
router.post('/otp/send', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

  try {
    await pool.query(
      'INSERT INTO LoginOTP (Email, OTPCode, ExpiredAt) VALUES (?, ?, ?)',
      [email, otpCode, expiredAt]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otpCode}. It is valid for 5 minutes.`,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Xác minh OTP
router.post('/otp/verify', async (req, res) => {
  const { email, otpCode } = req.body;
  if (!email || !otpCode) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM LoginOTP WHERE Email = ? AND OTPCode = ? AND Verified = FALSE AND ExpiredAt > NOW()',
      [email, otpCode]
    );

    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired OTP' });

    await pool.query('UPDATE LoginOTP SET Verified = TRUE WHERE OTPID = ?', [rows[0].OTPID]);

    let [user] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
    if (!user.length) {
      await pool.query('INSERT INTO Users (Email) VALUES (?)', [email]);
      [user] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
    }

    const token = jwt.sign({ userId: user[0].UserID, email: user[0].Email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: user[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

//check
router.get('/status', (req, res) => {
  res.send('Auth backend đang hoạt động');
});

module.exports = router;