const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const exporterSchema = mongoose.Schema({
    companyName: { type: String, required: true },
    authorizedPerson: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyHeritage: { type: String, required: true },
    
    // ✅ Nayi Address Fields Add Ki Hain
    address: { type: String, required: true }, // Street / Village
    city: { type: String, required: true },    // District
    state: { type: String, required: true, default: 'Madhya Pradesh' },

    hasIECode: { type: Boolean, default: false },
    iecNumber: { type: String },
    exportCountries: { type: String },
    catalogPath: { type: String }, // File path storage
    status: { type: String, default: 'pending' } // Industry standard review status
}, { timestamps: true });

// Password hashing before saving (Tera original logic - Unchanged ✅)
exporterSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // Fixed: Added return to prevent double next()
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Password verification method (Optional but useful for Login)
exporterSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Seller', exporterSchema);