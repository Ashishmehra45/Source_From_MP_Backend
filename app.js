const express = require('express');
const cors = require('cors');
const path = require('path');
const sellerRoutes = require('./routes/sellerRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/sellers', sellerRoutes);

module.exports = app;