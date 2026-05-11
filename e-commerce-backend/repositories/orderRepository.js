const db = require('../config/database');

const createOrder = ({ user_id, product_id, quantity, total_price }) => {
    const sql = `INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)`;

    return new Promise((resolve, reject) => {
        db.run(sql, [user_id, product_id, quantity, total_price], function (err) {
            if (err) {
                return reject(err);
            }

            resolve({ order_id: this.lastID });
        });
    });
};

module.exports = {
    createOrder
};
