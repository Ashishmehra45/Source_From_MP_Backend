const express = require('express');
const router = express.Router();
const { 
    registerBuyer, 
    loginBuyer, 
    getBuyerProfile 
} = require('../controllers/buyerController');
const { protectBuyer } = require('../middlewares/BuyerauthMiddleware');

// Public Routes
router.post('/register', registerBuyer);
router.post('/login', loginBuyer);

// Private Routes (Sirf logged-in buyer ke liye)
router.get('/profile', protectBuyer, getBuyerProfile);

module.exports = router;