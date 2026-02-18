const Buyer = require('../models/buyer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. Register Buyer

const registerBuyer = async (req, res) => {
    try {
        const { name, email, password, companyName, country, state, city, interests } = req.body;

        const buyerExists = await Buyer.findOne({ email });
        if (buyerExists) {
            return res.status(400).json({ message: 'Buyer already exists with this email' });
        }

        const buyer = await Buyer.create({
            name, email,
            password: await bcrypt.hash(password, 10),
            companyName, country, state, city, interests
        });

        if (buyer) {
            res.status(201).json({
                _id: buyer._id,
                name: buyer.name,
                email: buyer.email,
                role: 'buyer', // ✅ Response me bheja
                token: jwt.sign({ id: buyer._id, role: 'buyer' }, process.env.JWT_SECRET, { expiresIn: '30d' })
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Login Buyer
const loginBuyer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const buyer = await Buyer.findOne({ email });

        if (buyer && (await bcrypt.compare(password, buyer.password))) {
            res.json({
                _id: buyer._id,
                name: buyer.name,
                email: buyer.email,
                role: 'buyer', // ✅ Response me bheja
                token: jwt.sign({ id: buyer._id, role: 'buyer' }, process.env.JWT_SECRET, { expiresIn: '30d' })
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// 3. Get Profile
const getBuyerProfile = async (req, res) => {
    // req.user humein middleware se milega
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(404).json({ message: 'Buyer not found' });
    }
};

module.exports = { registerBuyer, loginBuyer, getBuyerProfile };