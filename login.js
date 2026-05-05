document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีเฟรช

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    try {
        // ส่งคำขอแบบ POST ไปที่ Backend ของเรา
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        if (response.ok) {
            // ถ้ารหัสผ่านถูก (200 OK)
            const data = await response.json();
            
            // 5. Client stores Token (ตาม Sequence Diagram)
            localStorage.setItem('token', data.token); 
            
            // เปลี่ยนหน้าไปที่หน้าแรกหรือหน้าสินค้า
            window.location.href = 'shop.html'; 
        } else {
            // ถ้ารหัสผ่านผิด หรือไม่พบผู้ใช้ (401 Unauthorized)
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error('Error connecting to the server:', error);
        errorMsg.textContent = "Server error. Please try again later.";
        errorMsg.style.display = 'block';
    }
});