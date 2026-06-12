const multer = require('multer');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('Only JPEG, PNG, WebP, GIF or SVG images are allowed'), { status: 422, code: 'INVALID_FILE_TYPE' }));
  }
});

module.exports = upload;
