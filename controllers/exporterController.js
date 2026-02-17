const Exporter = require('../models/seller');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ❌ ImageKit import ki ab zarurat nahi hai
// const imagekit = require('../config/imagekit'); 

const registerSeller = async (req, res) => {
    try {
        const { companyName, authorizedPerson, mobileNumber, email, password, companyHeritage, hasIECode, iecNumber, exportCountries } = req.body;

        const userExists = await Exporter.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Exporter already exists' });

        // ✅ Catalog Upload Logic (Cloudinary)
        // Multer middleware ne file upload kar di hai, URL req.file.path mein hai
        let catalogUrl = null;
        if (req.file) {
            catalogUrl = req.file.path; // Cloudinary URL
        }

        const exporter = await Exporter.create({
            companyName, authorizedPerson, mobileNumber, email, password,
            companyHeritage, hasIECode, iecNumber, exportCountries,
            catalogPath: catalogUrl // ✅ Cloud URL save kiya
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
    console.log("⚡ STARTING PRODUCT UPLOAD...");

    try {
      
        // 2. Agar User missing hai (Sabse common error)
        if (!req.user || !req.user._id) {
            console.log("❌ ERROR: User not found in request (Auth failed)");
            return res.status(401).json({ message: "User authentication failed. Token might be missing." });
        }

        // 3. Agar File missing hai
        if (!req.file) {
            console.log("❌ ERROR: Image file missing");
            return res.status(400).json({ message: "Product image is required" });
        }

        const { name, hscode, category, desc } = req.body;

        // 4. Database mein save karne ki koshish
        console.log("💾 Saving to MongoDB...");
        
        const product = await Product.create({
            seller: req.user._id,
            name: name,
            hscode: hscode || 'N/A',
            category: category,
            description: desc,
            image: req.file.path // Cloudinary URL
        });

        console.log("✅ SUCCESS: Product Created!", product);
        res.status(201).json({ success: true, product });

    } catch (error) {
        // 🔥 ASLI ERROR YAHAN DIKHEGA
        console.log("🔥 CRITICAL DATABASE ERROR 🔥");
        console.log(error); // Terminal mein poora error object print hoga
        
        res.status(500).json({ 
            message: "Server Error: Check Terminal logs for details",
            error: error.message 
        });
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

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this product" });
        }

        // Future Note: Cloudinary se bhi delete kar sakte hain using public_id
        // Par abhi ke liye sirf DB se hata rahe hain

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

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to edit this product" });
        }

        product.name = name || product.name;
        product.category = category || product.category;
        product.hscode = hscode || product.hscode;
        product.description = desc || product.description;

        // ✅ Image Update Logic (Cloudinary)
        if (req.file) {
            // Agar nayi file aayi hai, to Multer ne upload kar di hai
            product.image = req.file.path; // Naya URL set kiya
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