const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../store.db');

const db = new sqlite3.Database(
    dbPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error('Database connection error:', err.message);
        } else {
            console.log('Connected to the SQLite database (store.db).');
        }
    }
);

// Ensure the orders table exists
const createOrdersTable = `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    total_price REAL
)`;

db.run(createOrdersTable);

module.exports = db;
