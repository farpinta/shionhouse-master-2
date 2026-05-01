// assets/cart.js

// 1. โหลดตะกร้าจาก LocalStorage ก่อน (ถ้าไม่มีให้เป็น Array ว่าง)
let cart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];

// 2. เลือก Parent container สำหรับ Event Delegation
const productContainer = document.getElementById('product-container');
if (!productContainer) {
  console.warn('⚠️ ไม่พบ #product-container บนหน้านี้ แต่ระบบตะกร้ายังพร้อมทำงานนะ');
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

// 4. ลอจิกเพิ่มสินค้าลงตะกร้า (ไม่ต้องไปง้อ allProducts แล้ว!)
function addToCart(productID, productPrice) {
  // ใช้ == เพื่อป้องกันบั๊กกรณีที่ Type เป็น String vs Number
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

  saveToLocalStorage();
  
  // 👉 เช็กจุดตายที่ 2: ดูว่าข้อมูลเข้า Array จริงไหม
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

// 📌 อย่าลืมเรียกใช้งานฟังก์ชันนี้ตอนที่หน้าเว็บโหลดเสร็จด้วยนะคะ!
// เอาโค้ดบรรทัดนี้ไปวางไว้ล่างสุดของไฟล์ cart.js ได้เลย
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});