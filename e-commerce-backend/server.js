const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 3000;

// Initialize database connection + table creation
require('./config/database');

// Import the modular routes
const productRoutes = require('./routes/products');
const checkoutRoutes = require('./routes/checkoutRoutes');

// Middleware to parse incoming JSON
app.use(express.json());

// Mount the product routes at the /api/products path
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use(require('./auth'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});