const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message'); // สมมติว่ามี <p id="error-message"></p> ไว้โชว์สีแดง

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // ลอจิก: หยุดไม่ให้หน้าเว็บรีเฟรชตอนกด Submit เพื่อให้ JS จัดการต่อ

    // 1. ดึงค่าที่ผู้ใช้พิมพ์มา
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 2. ลอจิก: ด่านตรวจคนเข้าเมืองฝั่ง Frontend (Regex)
    // (?=.*[A-Z]) = ต้องมีพิมพ์ใหญ่ 1 ตัว
    // (?=.*[!@#$%^&*]) = ต้องมีอักขระพิเศษ 1 ตัว
    // .{8,} = ความยาวรวมต้อง 8 ตัวขึ้นไป
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    
    if (!passwordRegex.test(password)) {
        errorMessage.textContent = "Password must be at least 8 characters, contain 1 uppercase letter and 1 special character.";
        return; // ลอจิก: ถ้าไม่ผ่านเงื่อนไข สั่ง return เพื่อ "เตะกลับ" ทันที ไม่ส่งข้อมูลไปกวน Backend
    }

    try {
        // 3. ลอจิก: แพ็คกล่องพัสดุ (JSON) ส่งไปให้ Backend ที่พอร์ต 3000
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        // 4. ลอจิก: รอรับผลการตรวจจาก Backend
        if (response.status === 201) {
            // สำเร็จ! เด้งแจ้งเตือนแล้วเตะผู้ใช้ไปหน้า Login
            alert("Registration Successful! Please login.");
            window.location.href = 'login.html'; 
        } else {
            // ไม่สำเร็จ (เช่น อีเมลซ้ำ) เอาข้อความจาก Backend มาโชว์
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        console.error("Error:", error);
    }
});