const jwt = require('jsonwebtoken');
const Buyer = require('../models/buyer');

const protectBuyer = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // 1. Token Verify karo
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 2. Role Check (🚨 Sabse Jaruri)
            // Agar token 'seller' role ka hai aur wo buyer route hit kar raha hai toh block karo
            if (decoded.role !== 'buyer') {
                return res.status(403).json({ 
                    message: 'Access Denied: Please login as a Buyer to access this' 
                });
            }

            // 3. Buyer ko search karo
            req.user = await Buyer.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Buyer account not found' });
            }

            next();
        } catch (error) {
            console.error('Buyer Auth Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protectBuyer };