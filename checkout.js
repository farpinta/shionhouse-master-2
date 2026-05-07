// ดึงฟอร์มและพื้นที่สำหรับโชว์ Error มาจากหน้าเว็บ
const checkoutForm = document.getElementById('checkout-form');
const errorMessageDiv = document.getElementById('error-messages'); // กล่อง <div> สำหรับโชว์ตัวหนังสือสีแดง

checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // ลอจิก: หยุดการรีเฟรชหน้าเว็บ เพื่อให้ JS ทำงานต่อ

    // 1. ดึงข้อมูลที่ผู้ใช้พิมพ์จากหน้าจอ
    const email = document.getElementById('email').value;
    const creditCard = document.getElementById('creditCard').value;

    // 2. ดึงข้อมูลตะกร้าสินค้า (โดยปกติจะดึงจาก localStorage ของเบราว์เซอร์)
    // *หมายเหตุ: สมมติว่าตะกร้ามีของอยู่ 1 ชิ้น เพื่อใช้ทดสอบส่งไปให้ Backend คำนวณราคา
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [
        { id: 101, name: "Premium T-Shirt Model C", price: 32.50, quantity: 2 }
    ];

    try {
        // 3. แพ็คข้อมูลลงกล่อง JSON แล้วโยนไปให้ Backend ตรวจสอบ
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                cartItems: cartItems, 
                email: email, 
                creditCard: creditCard 
            })
        });

        const data = await response.json();

        // ==========================================
        // 4. ลอจิกจัดการผลลัพธ์ (State Management)
        // ==========================================
        
        // กรณีที่ 1: สำเร็จ (201 Created)
        if (response.status === 201) {
            // สำเร็จ! ถึงจะสามารถ "ล้างตะกร้าสินค้า" ได้
            localStorage.removeItem('cart'); 
            
            alert(`✅ ${data.message} \nTotal Charged: $${data.totalCharged}`);
            
            // ส่งกลับไปหน้าแรกหลังจากจ่ายเงินเสร็จ
            window.location.href = 'index.html'; 
        } 
        
        // กรณีที่ 2: ข้อมูลผิดพลาด (400 Bad Request)
        else if (response.status === 400) {
            // *CRITICAL*: ไม่ต้องล้างตะกร้า! แต่ให้โชว์ข้อความด่าจาก Backend แทน
            let errorText = "❌ Checkout Failed:\n";
            
            // เช็คว่า Backend แจ้ง Error ฟิลด์ไหนมาบ้าง ก็เอามาต่อกัน
            if (data.errors.email) errorText += `- ${data.errors.email}\n`;
            if (data.errors.creditCard) errorText += `- ${data.errors.creditCard}\n`;
            if (data.errors.cartItems) errorText += `- ${data.errors.cartItems}\n`;

            errorMessageDiv.innerText = errorText;
            errorMessageDiv.style.color = "red";
        } 
        
        // กรณีที่ 3: เซิร์ฟเวอร์พัง (500 Internal Server Error)
        else {
            errorMessageDiv.innerText = "❌ Server Error. Please try again later.";
            errorMessageDiv.style.color = "red";
        }

    } catch (error) {
        // กรณีไม่ได้เปิด Backend หรือเน็ตหลุด
        console.error("Fetch error:", error);
        errorMessageDiv.innerText = "❌ Connection failed. Please check your internet or server.";
    }
});