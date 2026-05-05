// นำเข้าไลบรารีที่จำเป็นสำหรับ Security & Auth Logic
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const router = express.Router();

// Secret Key สำหรับเซ็นชื่อ (Sign) JWT (ในโลกจริงควรเก็บในไฟล์ .env)
const JWT_SECRET = "super_secret_key_960121";

// POST /api/login - Gatekeeper Route
router.post('/api/login', async (req, res) => {
    try {
        // 1. รับค่า email และ password จาก Client (ต้องส่งผ่าน HTTPS)
        const { email, password } = req.body;

        // 2. อ่านข้อมูลผู้ใช้จากไฟล์ฐานข้อมูลจำลอง (auth_user.json)
        const usersData = fs.readFileSync('./data/auth_user.json', 'utf-8');
        const users = JSON.parse(usersData);

        // 3. ค้นหาผู้ใช้ในฐานข้อมูลด้วยอีเมล (ในไฟล์ JSON เราเก็บอีเมลไว้ที่ฟิลด์ username)
        const user = users.find(u => u.username === email);

        // ==========================================
        // SECURITY CHECK 1: User Existence Check
        // ==========================================
        // หากไม่พบอีเมลในระบบ ให้ตอบกลับด้วย 401 Unauthorized
        // *CRITICAL THINKING*: ใช้ข้อความกำกวม "Invalid email or password" 
        // เพื่อป้องกันการรั่วไหลของข้อมูล (Information Leakage) ไม่ให้แฮ็กเกอร์รู้ว่ามีอีเมลนี้หรือไม่
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // ==========================================
        // SECURITY CHECK 2: Password Verification
        // ==========================================
        // ใช้ bcrypt.compare() นำรหัสผ่านที่รับมา ไปเทียบกับ Hash ที่เก็บไว้ในระบบ
        // ลอจิกนี้เป็น One-way function เราจะไม่ถอดรหัสผ่านเดิมออกมาดู
        const isMatch = await bcrypt.compare(password, user.password);

        // หากรหัสผ่านไม่ตรงกัน ให้ตอบกลับ 401 Unauthorized ด้วยข้อความแบบเดียวกันเป๊ะๆ
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // ==========================================
        // SUCCESS: Create & Sign JWT (The Passport)
        // ==========================================
        // หากผ่านด่าน Gatekeeper ทั้งหมด เซิร์ฟเวอร์จะออก Token ให้
        // Payload เก็บแค่ข้อมูลที่ไม่ Sensitive (เช่น ID/Email)
        const token = jwt.sign(
            { userId: user.username }, // Payload
            JWT_SECRET,                // Signature Key
            { expiresIn: '1h' }        // กำหนดอายุ Token 1 ชั่วโมงเพื่อความปลอดภัย
        );

        // ส่ง Token กลับไปให้ Client พร้อมสถานะ 200 OK
        return res.status(200).json({ 
            status: "success",
            token: token 
        });

    } catch (error) {
        // จัดการ Error กรณีเซิร์ฟเวอร์พัง เช่น หาไฟล์ json ไม่เจอ
        console.error("Login Server Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;