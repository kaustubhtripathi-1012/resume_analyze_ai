const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf' && ext !== '.docx') {
    const err = new Error('Unsupported file type. Only PDF and DOCX files are allowed.');
    err.code = 'UNSUPPORTED_FILE_TYPE';
    err.statusCode = 415;
    return cb(err, false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE
  },
  fileFilter
});

function verifyMagicBytes(filePath, fileType) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    if (fileType === 'pdf') {
      // PDF starts with %PDF (0x25 0x50 0x44 0x46)
      return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    } else if (fileType === 'docx') {
      // DOCX is a zip file, starts with PK\x03\x04 (0x50 0x4B 0x03 0x04)
      return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
    }
    return false;
  } catch (err) {
    return false;
  }
}

module.exports = {
  upload,
  verifyMagicBytes
};

