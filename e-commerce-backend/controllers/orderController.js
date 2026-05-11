const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    try {
        const { user_id, product_id, quantity, total_price } = req.body;
        const result = await orderService.placeOrder({
            user_id,
            product_id,
            quantity,
            total_price
        });

        return res.status(201).json({
            message: 'Order placed successfully',
            order_id: result.order_id
        });
    } catch (error) {
        console.error('Error inserting order:', error.message);
        const status = error.statusCode || 500;
        const message = error.statusCode ? error.message : 'Failed to save the order';

        return res.status(status).json({ error: message });
    }
};

module.exports = {
    createOrder
};