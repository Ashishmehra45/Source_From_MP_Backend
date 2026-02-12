const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const exporterSchema = mongoose.Schema({
    companyName: { type: String, required: true },
    authorizedPerson: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyHeritage: { type: String, required: true },
    hasIECode: { type: Boolean, default: false },
    iecNumber: { type: String },
    exportCountries: { type: String },
    catalogPath: { type: String }, // File path storage
    status: { type: String, default: 'pending' } // Industry standard review status
}, { timestamps: true });

// Password hashing before saving
exporterSchema.pre('save', async function(next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Seller', exporterSchema);