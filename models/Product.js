const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // 1. Link to Seller (Kaun bech raha hai?)
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller', // Tera Seller model ka naam yahan aayega
        required: true
    },

    // 2. Basic Details
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true
    },

    // 3. Export Specifics
    hscode: {
        type: String, // String rakha hai kyuki HS code me dots ho skte hai (e.g. 5007.20)
        trim: true,
        default: 'N/A'
    },

    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: [ // Wahi list jo frontend me hai, taaki galat category na aaye
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
    },

    // 4. Media & Info
    image: {
        type: String, // Yahan image ka path store hoga (e.g., "uploads/seller_products/img-123.jpg")
        required: [true, 'Product image is required']
    },

    description: {
        type: String,
        trim: true,
        maxLength: [1000, 'Description cannot exceed 1000 characters']
    },

    // 5. Status (Optional - future ke liye)
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true }); // CreatedAt aur UpdatedAt apne aap aa jayega

module.exports = mongoose.model('Product', productSchema);