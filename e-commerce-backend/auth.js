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


// Route สำหรับสมัครสมาชิก (POST /api/register)
router.post('/api/register', async (req, res) => {
    try {
        // 1. แกะกล่องพัสดุที่ Frontend ส่งมา
        const { name, email, password } = req.body;

        // 2. ลอจิก: อ่านสมุดทะเบียน (Database)
        const filePath = './data/auth_user.json';
        const usersData = fs.readFileSync(filePath, 'utf-8');
        const users = JSON.parse(usersData); // แปลงข้อความให้เป็น Array เพื่อให้ค้นหาง่ายขึ้น

        // 3. ลอจิก: ด่านตรวจคนซ้ำซ้อน (Duplicate Check)
        // เอาอีเมลใหม่ ไปวิ่งหาเทียบกับ username ของทุกคนในระบบ
        const existingUser = users.find(u => u.username === email);
        if (existingUser) {
            // ถ้าเจอคนซ้ำ สั่งตีกลับด้วยสถานะ 400 (Bad Request) ทันที
            return res.status(400).json({ message: "Email already exists" });
        }

        // 4. ลอจิก: ตู้เซฟแปลงรหัส (Hashing)
        // เอาพาสเวิร์ดดิบๆ มาปั่นรวมกับเกลือ (Salt) 10 รอบ เพื่อแปลงร่างให้เป็นอักขระมั่วๆ ยาวๆ แบบ Bcrypt
        // นี่คือจุดที่เราจะแก้แค้น Error 500 เมื่อกี้ค่ะ!
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. ลอจิก: สร้างบัตรประชาชนใบใหม่
        const newUser = {
            first_name: name,
            username: email,
            password: hashedPassword, // เซฟรหัสที่แปลงร่างแล้วเท่านั้น ห้ามเซฟรหัสผ่านดิบเด็ดขาด!
            date_of_registration: new Date().toISOString()
        };

        // 6. ลอจิก: บันทึกลงสมุดทะเบียน (เขียนทับไฟล์เดิม)
        users.push(newUser); // ดันคนใหม่เข้าต่อท้ายแถว
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2)); // เซฟไฟล์ทับลงไปใหม่

        // 7. ลอจิก: จบงาน ส่งสัญญาณบอก Frontend ว่าสำเร็จด้วยสถานะ 201 (Created)
        return res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;