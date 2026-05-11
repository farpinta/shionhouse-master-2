const orderRepository = require('../repositories/orderRepository');

// ฟังก์ชันจำลองการเรียก API ไปยัง Service อื่น (Simulated Microservice Call)
const mockFetch = async (url) => {
    // ในสถานการณ์จริง จะใช้ library 'node-fetch' หรือ 'axios'
    if (url.includes('/api/products/1')) return { id: 1, price: 500, stock: 10 };
    if (url.includes('/api/users/101')) return { id: 101, status: 'active' };
    return null;
};

const placeOrder = async (orderPayload) => {
    const { user_id, product_id, quantity } = orderPayload;

    // 🎯 ดึง Base URL จาก .env (ถ้าไม่มีไฟล์ .env ให้ใช้ค่าเดิมสำรองไว้ ระบบจะได้ไม่พัง)
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service';
    const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://product-service';

    // 1. ตรวจสอบการมีอยู่ของ User ผ่าน Identity Service
    const user = await mockFetch(`${userServiceUrl}/api/users/${user_id}`);
    if (!user) {
        const error = new Error('User does not exist');
        error.statusCode = 401; // Unauthorized
        throw error;
    }

    // 2. ตรวจสอบข้อมูลสินค้าและราคาจริงจาก Catalog Service
    const product = await mockFetch(`${productServiceUrl}/api/products/${product_id}`);
    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404; // Not Found
        throw error;
    }

    // 3. ตรวจสอบเงื่อนไขทางธุรกิจ (Business Logic)
    if (quantity <= 0) {
        const error = new Error('Quantity must be greater than zero');
        error.statusCode = 400;
        throw error;
    }

    // 4. คำนวณราคาสุทธิที่ Backend (Server-side Calculation)
    const total_price = product.price * quantity;

    // 5. บันทึกลงฐานข้อมูลผ่าน Repository
    return orderRepository.createOrder({
        user_id,
        product_id,
        quantity,
        total_price
    });
};

module.exports = {
    placeOrder
};