const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const sellerRoutes = require('./routes/sellerRoutes');
const buyerRoutes = require('./routes/buyerRoute');
const allProductsRoutes = require('./routes/allProductsRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/sellers', sellerRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/products', allProductsRoutes); 
 

module.exports = app;