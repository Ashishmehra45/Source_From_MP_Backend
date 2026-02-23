const Inquiry = require('../models/Inquiry');

exports.createInquiry = async (req, res) => {
  try {
    // 1. Destructure all fields that your Schema needs
    const { 
      productName, 
      productId, 
      productImage, 
      hscode, 
      email, 
      quantity, 
      whatsapp, 
      message,
      buyerId,   // <--- Yeh zaroori hai
      sellerId   // <--- Yeh zaroori hai
    } = req.body;

    // 2. Simple Validation
    if (!email || !productId || !buyerId || !sellerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields (Email, Product, Buyer, or Seller ID)" 
      });
    }

    // 3. Create new document with all fields
    const newInquiry = new Inquiry({
      productName,
      productId,
      buyerId,   // Schema ke 'buyerId' field mein save karo
      sellerId,  // Schema ke 'sellerId' field mein save karo
      productImage,
      hscode,
      email,
      quantity,
      whatsapp,
      message
    });

    // 4. Save to Database
    await newInquiry.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Inquiry sent successfully!" 
    });

  } catch (error) {
    console.error("Inquiry Controller Error:", error); // Debugging ke liye
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};