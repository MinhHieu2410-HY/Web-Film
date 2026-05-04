// routes/stream.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Route phát video trực tiếp (Trailer hoặc Video)
router.get('/:type/:filename', (req, res) => {
  const { type, filename } = req.params;

  // Chỉ cho phép 2 loại thư mục: Poster và Trailer
  if (!['Trailer', 'Video'].includes(type)) {
    return res.status(400).send('Loại file không hợp lệ');
  }

  const filePath = path.join(__dirname, '..', 'Film', type, filename);

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return res.status(404).send('Không tìm thấy file');
    }

    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

module.exports = router;
