const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'payments';
        if (req.originalUrl && req.originalUrl.includes('gallery')) {
            folder = 'gallery';
        } else if (req.originalUrl && req.originalUrl.includes('profile')) {
            folder = 'profiles';
        } else if (req.originalUrl && req.originalUrl.includes('register')) {
            folder = 'nic';
        }
        const dir = path.join(__dirname, `../uploads/${folder}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    // Check extension
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only standard images (jpeg, jpg, png) are permitted!'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter
});

module.exports = upload;
