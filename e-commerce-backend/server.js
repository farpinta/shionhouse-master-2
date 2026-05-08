const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // 📍 1. เพิ่มการ Import SQLite

const app = express();
app.use(cors());
const PORT = 3000;

// 📍 2. ตั้งค่าการเชื่อมต่อฐานข้อมูล SQLite ไว้ช่วงต้น
const db = new sqlite3.Database('./store.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database (store.db).');
    }
});

// สร้าง Table orders อัตโนมัติหากยังไม่มีในระบบ
db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    total_price REAL
)`);

// Import the modular routes
const productRoutes = require('./routes/products');

// Middleware to parse incoming JSON
app.use(express.json());

// Mount the product routes at the /api/products path
app.use('/api/products', productRoutes);
app.use(require('./auth'));

// 📍 3. แทรก Route สำหรับ API Checkout ไว้ก่อน app.listen
app.post('/api/checkout', (req, res) => {
    const { user_id, product_id, quantity, total_price } = req.body;

    // Gatekeeper Validation เบื้องต้น
    if (!user_id || !product_id || !quantity || !total_price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // SQL INSERT Command
    const sql = `INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)`;

    db.run(sql, [user_id, product_id, quantity, total_price], function(err) {
        if (err) {
            console.error('Error inserting order:', err.message);
            return res.status(500).json({ error: 'Failed to save the order' });
        }
        
        res.status(201).json({
            message: 'Order placed successfully',
            order_id: this.lastID 
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});