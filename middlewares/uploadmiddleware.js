const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv'); // 1. Dotenv import kiya

// 2. Config load ki (Force load)
dotenv.config();



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'source_mp_general';
    let resourceType = 'auto';

    if (file.fieldname === 'catalog') {
        folderName = 'mp_source_catalogs';
    } else if (file.fieldname === 'image') {
        folderName = 'mp_source_products';
    }

    return {
      folder: folderName,
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  },
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'catalog') {
        const filetypes = /pdf|doc|docx/;
        const isExtValid = filetypes.test(file.originalname.toLowerCase());
        if (isExtValid) return cb(null, true);
        cb(new Error('Error: Catalog must be a Document (PDF/DOC)!'));
    } 
    else if (file.fieldname === 'image') {
        if (file.mimetype.startsWith('image/')) return cb(null, true);
        cb(new Error('Error: Product file must be an Image (JPG/PNG)!'));
    }
    else {
        cb(null, true);
    }
};

const upload = multer({
    storage: storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;