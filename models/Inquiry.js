const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  // --- Linkings (All Required) ---
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, "Product ID is mandatory"] 
  },
  buyerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    // ✅ FIX: 'buyer' ko 'User' kar do (Hamesha wahi naam likho jo model register karte waqt diya tha)
    ref: 'User', 
    required: [true, "Buyer ID is mandatory"] 
  },
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    // ✅ FIX: 'seller' ko 'Exporter' ya 'Seller' kar do (Check your model registration)
    ref: 'Exporter', 
    required: [true, "Seller ID is mandatory"] 
  },

  // --- Snapshot Data (Required for record) ---
  productName: { 
    type: String, 
    required: [true, "Product name is required"] 
  },
  productImage: { 
    type: String, 
    required: [true, "Product image is required"] 
  },
  hscode: { 
    type: String, 
    required: [true, "HS Code is required"] 
  },

  // --- Inquiry Details ---
  email: { 
    type: String, 
    required: [true, "Email address is required"],
    lowercase: true,
    trim: true
  },
  quantity: { 
    type: String, 
    required: [true, "Please specify the quantity needed"] 
  },
  message: { 
    type: String, 
    required: [true, "Detailed message/requirement is required"] 
  },

  // --- Optional Field ---
  whatsapp: { 
    type: String, 
    required: false 
  },

  // --- Meta ---
  status: { 
    type: String, 
    // ✅ FIX: 'Approved' add kiya taaki frontend pe error na aaye
    enum: ['Pending', 'Contacted', 'Approved', 'Closed'], 
    default: 'Pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Inquiry', inquirySchema);