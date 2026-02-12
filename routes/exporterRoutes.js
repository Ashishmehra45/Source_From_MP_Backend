const express = require('express');
const router = express.Router();
const { registerSeller,
         loginSeller
 } = require('../controllers/exporterController');
const upload = require('../middlewares/uploadmiddleware');

// 'catalog' field name frontend se match hona chahiye
router.post('/register', upload.single('catalog'), registerSeller);
router.post('/login', loginSeller);

module.exports = router;