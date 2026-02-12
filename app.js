const express = require('express');
const cors = require('cors');
const path = require('path');
const exporterRoutes = require('./routes/exporterRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/sellers', exporterRoutes);

module.exports = app;