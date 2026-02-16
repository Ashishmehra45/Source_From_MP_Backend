const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function: Folder ensure karne ke liye (agar nahi hai to bana dega)
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        // CASE 1: Registration ke time (Catalog)
        if (file.fieldname === 'catalog') {
            uploadPath = 'uploads/sellerpitch';
        } 
        // CASE 2: Product Add karte time (Image)
        else if (file.fieldname === 'product_image') {
            uploadPath = 'uploads/seller_products';
        }

        ensureDir(uploadPath); // Folder create karega agar nahi mila
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp-originalname (spaces hata kar)
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${cleanName}`);
    }
});

const fileFilter = (req, file, cb) => {
    // LOGIC 1: Catalog ke liye sirf Documents
    if (file.fieldname === 'catalog') {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Catalog must be a Document (PDF/DOC)!'));
    } 
    // LOGIC 2: Product ke liye sirf Images
    else if (file.fieldname === 'product_image') {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype.startsWith('image/');

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Error: Product file must be an Image (JPG/PNG)!'));
    }
    else {
        cb(new Error('Unexpected field name'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Max size 10MB
});

module.exports = upload;