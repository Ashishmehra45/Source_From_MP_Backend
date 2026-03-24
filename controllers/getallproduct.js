const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
    try {
        // ✅ 1. 'seller' field ko populate karo aur sirf 'city' aur 'companyName' uthao
        // Yaad rakhna: 'seller' wahi naam hona chahiye jo tere Product Model mein ref field hai.
        const products = await Product.find()
            .populate('seller', 'city companyName address') 
            .sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

// 🔥 Export karna mat bhulna
module.exports = { getAllProducts };