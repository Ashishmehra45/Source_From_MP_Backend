const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
};

// 🔥 Export karna mat bhulna
module.exports = { getAllProducts };