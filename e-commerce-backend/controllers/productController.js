const productService = require('../services/productService');

const getProducts = (req, res) => {
    try {
        // 1. Ask the service layer for all the data (reads your 20-item JSON)
        let products = productService.fetchAllProducts();
        
        // 2. Check Gatekeeper Logic: Did the client request a specific category?
        // This extracts "?category=Something" from the URL
        const requestedCategory = req.query.category;

        // 3. If a category was requested, filter the products array
        if (requestedCategory) {
            products = products.filter(product => 
                // Convert both to lowercase to prevent case-sensitive errors (e.g., 'hoodie' vs 'Hoodie')
                product.category.toLowerCase() === requestedCategory.toLowerCase()
            );
        }
        
        // 4. Send back the Package (either all products or just the filtered ones) and a 200 OK Status
        res.status(200).json(products);
        
    } catch (error) {
        // 5. Handle scenarios where the server fails
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getProducts
};