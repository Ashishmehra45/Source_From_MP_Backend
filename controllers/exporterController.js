const Exporter = require('../models/seller');
const Product = require('../models/Product'); // Duplicate removed
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs'); 
const path = require('path'); // ✅ Required for delete/update logic

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

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        const exporter = await Exporter.findOne({ email });

        if (exporter && (await bcrypt.compare(password, exporter.password))) {
            res.status(200).json({
                success: true,
                _id: exporter._id,
                email: exporter.email,
                companyName: exporter.companyName,
                token: jwt.sign({ id: exporter._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
                message: "Login successful"
            });
        } else {
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

        if (!req.file) {
            return res.status(400).json({ message: 'Product image is required' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, seller not found' });
        }

        const product = await Product.create({
            seller: req.user._id,
            name,
            hscode: hscode || 'N/A',
            category,
            description: desc, // Note: DB field is 'description'
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


const getPublicProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(8);

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Public Products Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Security Check
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this product" });
        }

        // Image delete logic
        if (product.image) {
             // __dirname controller folder hai, isliye '..' karke root pe gaye
             const imagePath = path.join(__dirname, '..', product.image);
             if (fs.existsSync(imagePath)) {
                 fs.unlinkSync(imagePath);
             }
        }

        await product.deleteOne();
        res.status(200).json({ success: true, message: "Product deleted successfully" });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


const updateProduct = async (req, res) => {
    try {
        const { name, category, hscode, desc } = req.body;
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Security Check
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to edit this product" });
        }

        // Fields Update
        product.name = name || product.name;
        product.category = category || product.category;
        product.hscode = hscode || product.hscode;
        
        // ✅ Fix: DB me field 'description' hai, 'desc' nahi
        product.description = desc || product.description; 

        // Image Update
        if (req.file) {
            // Purani image delete
            if (product.image) {
                const oldPath = path.join(__dirname, '..', product.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            // Nayi image set
            product.image = req.file.path;
        }

        const updatedProduct = await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    registerSeller,
    loginSeller,
    addProduct,
    getMyProducts,
    getPublicProducts,
    deleteProduct,
    updateProduct
};