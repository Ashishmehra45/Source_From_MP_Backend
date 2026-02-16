const Exporter = require('../models/seller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');

const registerSeller = async (req, res) => {
    try {
        const { companyName, authorizedPerson, mobileNumber, email, password, companyHeritage, hasIECode, iecNumber, exportCountries } = req.body;

        const userExists = await Exporter.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Exporter already exists' });

        const exporter = await Exporter.create({
            companyName, authorizedPerson, mobileNumber, email, password,
            companyHeritage, hasIECode, iecNumber, exportCountries,
            catalogPath: req.file ? req.file.path : null
        });

        if (exporter) {
            res.status(201).json({
                _id: exporter._id,
                companyName: exporter.companyName,
                token: jwt.sign({ id: exporter._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const loginSeller = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation: Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        // 2. Find Exporter by email
        const exporter = await Exporter.findOne({ email });

        // 3. Match Password using bcrypt
        if (exporter && (await bcrypt.compare(password, exporter.password))) {
            
            // 4. Generate Industry Standard Response with Token
            res.status(200).json({
                success: true,
                _id: exporter._id,
                email: exporter.email,
                companyName: exporter.companyName,
                token: jwt.sign({ id: exporter._id }, process.env.JWT_SECRET, { 
                    expiresIn: '30d' 
                }),
                message: "Login successful"
            });
        } else {
            // Security Tip: Kabhi mat batao ki email galat hai ya password, hamesha generic message do
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error(`Login Error: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const addProduct = async (req, res) => {
    try {
        const { name, hscode, category, desc } = req.body;

        // 1. Image Check
        if (!req.file) {
            return res.status(400).json({ message: 'Product image is required' });
        }

        // 2. Auth Check (Req.user middleware se aayega)
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, seller not found' });
        }

        // 3. Create Product
        const product = await Product.create({
            seller: req.user._id, // Logged-in Exporter ki ID
            name,
            hscode: hscode || 'N/A',
            category,
            description: desc,
            image: req.file.path
        });

        res.status(201).json({
            success: true,
            message: 'Product listed successfully',
            product
        });

    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({ message: error.message });
    }
};
const getMyProducts = async (req, res) => {
    try {
        // req.user._id Auth middleware se aa raha hai
        const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Fetch Products Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ... Export me add kar dena
module.exports = { registerSeller, loginSeller, addProduct, getMyProducts };

