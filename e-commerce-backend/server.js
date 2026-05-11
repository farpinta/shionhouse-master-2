require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000; // 📍 ดึงค่าจาก .env ถ้าไม่มีให้ใช้ 3000 เป็นค่าสำรอง

// Initialize database connection + table creation
require('./config/database');

// Import the modular routes
const productRoutes = require('./routes/products');
const checkoutRoutes = require('./routes/checkoutRoutes');

// Middleware to parse incoming JSON
app.use(express.json({ limit: '10kb' }));

// Mount the product routes at the /api/products path
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use(require('./auth'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

require('dotenv').config();