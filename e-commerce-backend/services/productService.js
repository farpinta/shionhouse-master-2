const fs = require('fs');
const path = require('path');

// Read and parse the local JSON file
const fetchAllProducts = () => {
    const dataPath = path.join(__dirname, '../data/products.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
};

module.exports = {
    fetchAllProducts
};