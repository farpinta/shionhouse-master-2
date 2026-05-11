const orderRepository = require('../repositories/orderRepository');

// ฟังก์ชันจำลองการเรียก API ไปยัง Service อื่น (Simulated Microservice Call)
const mockFetch = async (url) => {
    // ในสถานการณ์จริง จะใช้ library 'node-fetch' หรือ 'axios'
    // นี่คือการจำลองผลลัพธ์ที่ได้จาก Product Service และ User Service
    if (url.includes('/api/products/1')) return { id: 1, price: 500, stock: 10 };
    if (url.includes('/api/users/101')) return { id: 101, status: 'active' };
    return null;
};

const placeOrder = async (orderPayload) => {
    const { user_id, product_id, quantity } = orderPayload;

    // 1. ตรวจสอบการมีอยู่ของ User ผ่าน Identity Service [cite: 3060, 3184]
    const user = await mockFetch(`http://user-service/api/users/${user_id}`);
    if (!user) {
        const error = new Error('User does not exist');
        error.statusCode = 401; // Unauthorized [cite: 3233]
        throw error;
    }

    // 2. ตรวจสอบข้อมูลสินค้าและราคาจริงจาก Catalog Service [cite: 3330]
    const product = await mockFetch(`http://product-service/api/products/${product_id}`);
    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404; // Not Found [cite: 2849]
        throw error;
    }

    // 3. ตรวจสอบเงื่อนไขทางธุรกิจ (Business Logic) [cite: 2695, 3330]
    if (quantity <= 0) {
        const error = new Error('Quantity must be greater than zero');
        error.statusCode = 400;
        throw error;
    }

    // 4. คำนวณราคาสุทธิที่ Backend (Server-side Calculation) [cite: 3026, 3330]
    // ป้องกันการโกงราคาจากหน้าเว็บ
    const total_price = product.price * quantity;

    // 5. บันทึกลงฐานข้อมูลผ่าน Repository [cite: 3507, 3743]
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