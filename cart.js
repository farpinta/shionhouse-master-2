// assets/cart.js

// 1. โหลดตะกร้าจาก LocalStorage ก่อน (ถ้าไม่มีให้เป็น Array ว่าง)
let cart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];

// 2. เลือก Parent container สำหรับ Event Delegation
const productContainer = document.getElementById('product-container');
if (!productContainer) {
  console.warn('⚠️ ไม่พบ #product-container บนหน้านี้ แต่ระบบตะกร้ายังพร้อมทำงาน');
} else {
  // ติดตั้ง Event Listener
  productContainer.addEventListener('click', handleAddToCart);
}

// 3. Handler function เมื่อมีการคลิก
function handleAddToCart(event) {
  const targetButton = event.target.closest('.add-to-cart-link');
  if (!targetButton) return;
  event.preventDefault();

  // 👉 เช็กจุดตายที่ 1: ให้มันปริ้นท์บอกว่าปุ่มโดนคลิกแล้ว!
  console.log("👆 ยูนาบอกว่า: ตรวจพบการคลิกปุ่มตะกร้า!");

  // ดึงค่า ID และ Price จากปุ่ม HTML โดยตรง
  const productId = targetButton.dataset.productId; 
  const productPrice = parseFloat(targetButton.dataset.productPrice);
  
  addToCart(productId, productPrice);
}

// 4. ลอจิกเพิ่มสินค้าลงตะกร้า 
function addToCart(productID, productPrice) {
  let existingItem = cart.find(item => item.id == productID);

  if (existingItem) {
    existingItem.quantity += 1;
    console.log(`🛒 อัปเดต: สินค้า ID ${productID} มี ${existingItem.quantity} ชิ้นแล้ว`);
  } else {
    cart.push({ 
      id: productID, 
      price: productPrice, 
      quantity: 1 
    });
    console.log(`🛒 เพิ่มใหม่: สินค้า ID ${productID} ลงตะกร้าเรียบร้อย`);
  }

  // 1. บันทึกลงตู้เซฟ (โค้ดเดิมของคุณ)
  saveToLocalStorage();
  
  // 👉 2. เติมบรรทัดนี้ลงไป! เพื่อสั่งให้อัปเดตหน้าจอทันทีที่กดเพิ่มของ
  updateCartUI(); 

  console.log("📦 สถานะตะกร้าล่าสุด:", cart);
}

// 5. บันทึกตะกร้าลงตู้เซฟ LocalStorage
function saveToLocalStorage() {
  localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
}

// ฟังก์ชันสำหรับโหลดข้อมูลตะกร้าจาก LocalStorage
function loadCart() {
  try {
    // 1. ดึงข้อมูล String จาก LocalStorage (ใช้ Key เดิมที่เราตอนเซฟ)
    const savedCart = localStorage.getItem('ecommerce_cart');

    // 2. เช็กว่ามีข้อมูลถูกเซฟไว้ไหม
    if (savedCart) {
      // 3. ถ้ามี ให้ใช้ JSON.parse() แปลง String กลับมาเป็น Array แล้วยัดใส่ตัวแปร cart
      cart = JSON.parse(savedCart);
      console.log("📥 โหลดข้อมูลตะกร้ากลับมาเรียบร้อย:", cart);
    } else {
      // 4. ถ้าไม่มี (เช่น เข้าเว็บครั้งแรก) ให้เมคชัวร์ว่า cart เป็น Array ว่าง
      cart = [];
      console.log("🛒 ยังไม่มีสินค้าในตะกร้า เริ่มต้นตะกร้าใหม่เอี่ยม!");
    }
  } catch (error) {
    // เผื่อกรณีข้อมูลใน LocalStorage พังหรืออ่านไม่ได้ ระบบจะได้ไม่แครช
    console.error("⚠️ เกิดข้อผิดพลาดในการโหลดตะกร้า:", error);
    cart = []; 
  }

  // 5. โหลดเสร็จแล้ว สั่งอัปเดตหน้าจอ UI ทันที
  updateCartUI();
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

// 6. ฟังก์ชันอัปเดตหน้าจอ (Distributed UI Synchronization)
function updateCartUI() {
  // หาจำนวนสินค้า "ทั้งหมด" ในตะกร้า
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // หาไอคอนรถเข็นบน Navbar (รองรับหลายตำแหน่ง เช่น Desktop/Mobile)
  const cartIcons = document.querySelectorAll('.cart-count');

  if (cartIcons.length > 0) {
    cartIcons.forEach((icon) => {
      icon.textContent = totalItems;
    });
  } else {
    const cartIcon = document.getElementById('cart-count');
    if (cartIcon) {
      cartIcon.textContent = totalItems;
    }
  }
  
  // แจ้งเตือนใน Console ให้รู้ว่าอัปเดต UI แล้ว
  console.log(`🔄 อัปเดต UI: ตอนนี้มีสินค้าทั้งหมด ${totalItems} ชิ้นในตะกร้า`);
}

// อัปเดตฟังก์ชัน addToCart เล็กน้อย เพื่อเรียกใช้ updateCartUI หลังจากเซฟ
// โดยเข้าไปเติมบรรทัดนี้ต่อท้าย saveToLocalStorage() ใน addToCart

// function addToCart(productID, productPrice) {
//   ... ลอจิกเดิม ...
//   saveToLocalStorage();
//   console.log("📦 สถานะตะกร้าล่าสุด:", cart);
//   
//updateCartUI();
// }

// 7. ระบบชำระเงิน (Checkout Flow) - ส่งข้อมูลไป Backend

// ดึงปุ่ม Checkout มาใช้งาน (เมคชัวร์ว่าในไฟล์ HTML ของคุณมีปุ่มที่ใส่ id="checkout-btn" นะคะ)
const checkoutBtn = document.getElementById('checkout-btn');

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
        // 1. ดึงข้อมูลตะกร้าสินค้าปัจจุบันจาก LocalStorage (ใช้ชื่อ key 'ecommerce_cart' ให้ตรงกับด้านบน)
        const currentCart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];

        if (currentCart.length === 0) {
            alert('ตะกร้าของคุณยังว่างเปล่าค่ะ!');
            return; // หยุดการทำงานถ้าไม่มีของ
        }

        // 2. เตรียมข้อมูล (Payload) ให้ตรงกับที่ Backend ต้องการ
        // สำหรับการเทสเบื้องต้น เราดึงสินค้าชิ้นแรก (currentCart[0]) มาส่งก่อนนะคะ
        const firstItem = currentCart[0]; 
        
        const orderPayload = {
            user_id: 101, // สมมติว่า User ID เ
            product_id: firstItem.id, // ดึง id จาก object ในตะกร้า
            quantity: firstItem.quantity, // จำนวนชิ้น
            total_price: (firstItem.price * firstItem.quantity) // ราคารวม
        };

        try {
            // 3. ยิง Request ไปที่ Backend ของเรา
            console.log('กำลังส่งข้อมูล Order ไปที่ Backend...', orderPayload);
            
            const response = await fetch('http://localhost:3000/api/checkout', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(orderPayload) 
            });

            // 4. รอรับ Response กลับมาจาก Backend
            const result = await response.json();

            if (response.status === 201) {
                // Happy Path: สั่งซื้อสำเร็จ!
                alert(`🎉 สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อของคุณคือ: ${result.order_id}`);
                
                // สิ่งที่ต้องทำหลังจากสั่งซื้อสำเร็จคือ "ล้างตะกร้า"
                localStorage.removeItem('ecommerce_cart'); // ลบข้อมูลใน LocalStorage
                cart = []; // ล้างตัวแปรใน memory
                updateCartUI(); // อัปเดตตัวเลขตะกร้าให้เป็น 0
                
            } else {
                // ติด Gatekeeper: ส่งข้อมูลไม่ครบ หรือจำนวนติดลบ
                alert(`❌ เกิดข้อผิดพลาด: ${result.error}`);
            }

        } catch (error) {
            // กรณี Backend ล่ม
            console.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้:', error);
            alert('❌ ระบบขัดข้อง ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ในขณะนี้');
        }
    });
}