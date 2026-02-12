const Exporter = require('../models/seller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

module.exports = { registerSeller, loginSeller };