const Buyer = require("../models/buyer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Product = require("../models/Product");

// 1. Register Buyer

const registerBuyer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      country,
      state,
      city,
      interests,
    } = req.body;

    const buyerExists = await Buyer.findOne({ email });
    if (buyerExists) {
      return res
        .status(400)
        .json({ message: "Buyer already exists with this email" });
    }

    const buyer = await Buyer.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      companyName,
      country,
      state,
      city,
      interests,
    });

    if (buyer) {
      res.status(201).json({
        _id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        role: "buyer", // ✅ Response me bheja
        token: jwt.sign(
          { id: buyer._id, role: "buyer" },
          process.env.JWT_SECRET,
          { expiresIn: "30d" },
        ),
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
        role: "buyer", // ✅ Response me bheja
        token: jwt.sign(
          { id: buyer._id, role: "buyer" },
          process.env.JWT_SECRET,
          { expiresIn: "30d" },
        ),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 3. Get Profile
// 3. Get Profile (Logged-in Buyer only)
const getBuyerProfile = async (req, res) => {
  try {
    // req.user humein middleware (protectBuyer) se mil raha hai
    // Hum fir se findById kar rahe hain taaki fresh data (interests, etc.) mile
    const buyer = await Buyer.findById(req.user._id).select("-password");

    if (buyer) {
      res.status(200).json({
        _id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        companyName: buyer.companyName,
        country: buyer.country,
        state: buyer.state,
        city: buyer.city,
        interests: buyer.interests || [], // ✅ Dashboard recommendations ke liye zaruri hai
        role: "buyer", // ✅ Frontend ProtectedRoute conflict rokne ke liye
      });
    } else {
      res.status(404).json({ message: "Buyer profile not found" });
    }
  } catch (error) {
    console.error("Profile Fetch Error:", error.message);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};
// ✅ Interests ke basis par products dikhao
const getRecommendedProducts = async (req, res) => {
  try {
    const { categories } = req.query; // Frontend se aayega: ?categories=Textiles,Spices

    if (!categories) {
      return res.status(400).json({ message: "No categories provided" });
    }

    const categoryArray = categories.split(",");

    // Matching products dhundho
    const products = await Product.find({
      category: { $in: categoryArray },
    }).limit(6);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recommendations" });
  }
};

const toggleSaveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const buyerId = req.user._id;

    const buyer = await Buyer.findById(buyerId);

    // Check karo ki product pehle se saved hai ya nahi
    const isAlreadySaved = buyer.savedItems.includes(productId);

    if (isAlreadySaved) {
      // Agar pehle se hai, toh "PULL" (remove) kar do
      buyer.savedItems.pull(productId);
      await buyer.save();
      return res
        .status(200)
        .json({
          message: "Product removed from saved items",
          savedItems: buyer.savedItems,
        });
    } else {
      // Agar nahi hai, toh "PUSH" (add) kar do
      buyer.savedItems.push(productId);
      await buyer.save();
      return res
        .status(200)
        .json({
          message: "Product saved successfully",
          savedItems: buyer.savedItems,
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling save item", error: error.message });
  }
};


const getSavedProducts = async (req, res) => {
  try {
    
    const buyer = await Buyer.findById(req.user._id).populate("savedItems");

    res.status(200).json(buyer.savedItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved items" });
  }
};

module.exports = {
  registerBuyer,
  loginBuyer,
  getBuyerProfile,
  getRecommendedProducts,
  toggleSaveProduct,
  getSavedProducts,
};
