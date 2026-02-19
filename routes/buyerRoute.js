const express = require('express');
const router = express.Router();
const { 
    registerBuyer, 
    loginBuyer, 
    getBuyerProfile ,
    getRecommendedProducts,
    toggleSaveProduct,
    getSavedProducts
} = require('../controllers/buyerController');
const { protectBuyer } = require('../middlewares/BuyerauthMiddleware');

// Public Routes
router.post('/register', registerBuyer);
router.post('/login', loginBuyer);

// Private Routes (Sirf logged-in buyer ke liye)
router.get('/profile', protectBuyer, getBuyerProfile);
router.get('/recommendations', protectBuyer, getRecommendedProducts);
// 🔥 Saved Items Routes
router.get('/saved-items', protectBuyer, getSavedProducts); // Saved list dekhne ke liye
router.post('/toggle-save/:productId', protectBuyer, toggleSaveProduct); // Save/Unsave karne ke liye


module.exports = router;    