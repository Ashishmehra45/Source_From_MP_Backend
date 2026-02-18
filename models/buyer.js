const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 6
    },
    companyName: {
        type: String,
        trim: true
    },
    // --- Location Details ---
    country: {
        type: String,
        required: [true, 'Please select your country']
    },
    state: {
        type: String,
        required: [true, 'Please enter your state']
    },
    city: {
        type: String,
        required: [true, 'Please enter your city']
    },
    // --- Personalization (Interests) ---
    interests: [{
        type: String,
        enum: [ // Wahi categories jo Product model mein hain
            "Sarees & Ethnic Wear",
            "Textiles & Fabrics",
            "Apparel & Garments",
            "Agriculture & Grains",
            "Spices & Condiments",
            "Fruits & Vegetables",
            "Handicrafts & Decor",
            "Leather & Footwear",
            "Gems & Jewellery",
            "Herbal & Ayurveda",
            "Processed Food",
            "Engineering Goods",
            "Other"
        ]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Buyer', buyerSchema);