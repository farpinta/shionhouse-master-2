const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = 3000;

// Import the modular routes
const productRoutes = require('./routes/products');

// Middleware to parse incoming JSON
app.use(express.json());

// Mount the product routes at the /api/products path
app.use('/api/products', productRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});