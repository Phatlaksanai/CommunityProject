# Project README

## 📌 Project Overview

โปรเจกต์เว็บไซต์ Community และ Marketplace สำหรับนักพัฒนาเกม/ครีเอเตอร์ รองรับการแชร์โปรเจกต์ โพสต์ Community การอัปโหลด Object 3D / Mod และระบบซื้อขายไฟล์ รวมถึงระบบชำระเงินและการจัดการผู้ใช้

---

# 🎯 Features

### Community

1. Run 3D ขึ้นโชว์
2. Upload Object / Mod
3. พูดคุยทั่วไป
4. ระบบรายงาน

---

# 💳 Stripe Webhook

ใช้คำสั่งสำหรับ Forward Stripe Webhook ไปยัง Backend

```bash
stripe listen --forward-to localhost:8080/api/payments/webhook
```

---

# 📦 Packages ที่ติดตั้งเพิ่มเติม

## Client + Admin

```bash
npm install react-router-dom
npm install axios
npm install dayjs
npm install @mui/icons-material @mui/material @emotion/styled @emotion/react
npm install -D sass
npm install @tanstack/react-query
```

## Client

```bash
npm install three
npm install swiper
npm install react-intersection-observer
npm install algoliasearch react-instantsearch
```

## Admin

```bash
npm install recharts
```

## Server

```bash
npm install cookie-parser
npm install jsonwebtoken
npm install cors
npm install dayjs
npm install cloudinary multer
npm install @supabase/supabase-js
npm install algoliasearch
```

## Client + Server

```bash
npm install concurrently --save-dev
```

ใช้สำหรับ Run Frontend + Backend พร้อมกัน

---

# 💰 Stripe

### Server

```bash
npm install stripe
```

### Client

```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
```

---

# 📋 สิ่งที่ต้องเพิ่ม / Development Checklist

## 0. Statistics

* [x] สถิติหน้า DescProject

## 1. Authentication / OTP

* [x] แจ้งเตือนว่ามี Email แล้วก่อนส่ง OTP
* [x] เปลี่ยนตาราง OTP ใน DB แยกออกจาก User
* [x] OTP เมื่อส่งแล้ว → กรอกแล้ว → ลบทิ้งเอง

## 2. Database

* [x] เปลี่ยน DB ไปใช้ On-Cloud

## 3. Community / Post

* [x] ทำโพสต์ฉบับสมบูรณ์

  * Like
  * Comment
  * เป็นต้น
* [x] เลือก Project ตอน Post
* [x] ทำให้ลบ Post
* [x] Post ที่มาจาก Project ให้ขึ้นเหมือน Community

## 4. Download

* [x] หน้ากรองรายละเอียดด้านซ้ายในหน้า Download

## 5. Item / Marketplace

* [x] หน้า DescItem ฝั่งขวา / BuyItem ที่ถูกลืม
* [x] หน้า Edit Item
* [x] ทำให้ลบ Item

## 6. Profile

* [x] หน้าจัดการ Profile

  * เปลี่ยนชื่อ
  * เปลี่ยนรูป
  * เปลี่ยนรูปปก
  * เป็นต้น

## 7. Home

* [x] หน้า Home ฝั่ง LeftBar
* [x] หน้า Home ฝั่ง RightBar
* [x] ทำให้หน้า Home โหลด Post มาแสดงทีละนิด
* [x] โหลด Post เพิ่มเมื่อ Scroll ลงไป

## 8. 3D Model

* [x] แก้การแสดงผล 3D
* [ ] แสดงผล % ขณะโหลด
* [ ] ทำให้โมเดลแต่ละตัวตอนโพสต์มีขนาดเล็ก / ใหญ่ได้โดยไม่เพี้ยน
* [ ] แก้ปัญหาสีของโมเดล

## 9. Project

* [x] เลือก Project ตอน Post

## 10. User

* [x] ระบบแอดเพื่อน
* [x] ลบ Row ใน `users` กรณีที่ผู้ใช้ไม่สมัครสมาชิกเป็นเวลากี่วัน...

## 11. Code Structure

* [x] แยก Backend
* [x] รวมไฟล์ Frontend ให้ดูสะอาดตา
* [x] เปลี่ยน Fetch ปกติเป็น Axios ให้หมด
* [x] จัดหน้าตา `setError` / `setSuccess` ให้เป็นระเบียบ

## 12. Community

* [x] Post ที่มาจาก Project ให้ขึ้นเหมือน Community
* [x] ทำให้ลบ Community

---

# 🧪 Testing / System

## Authentication

* [ ] เปลี่ยนระบบเป็นเข้าได้ทุกครั้ง
* [ ] ไม่ต้องจดจำผู้ใช้
* [ ] เอา Token ออก

---

# 🎨 UI / Icons

Material UI Icons:

[Material UI Icons](https://mui.com/material-ui/material-icons/)

---

# 🛠️ Tech Stack

### Frontend

* React
* React Router
* Axios
* React Query
* Three.js
* Swiper
* React Intersection Observer
* React InstantSearch
* Material UI
* SCSS
* Stripe.js

### Backend

* Node.js
* Express
* Axios
* JWT
* Cookie Parser
* CORS
* Cloudinary
* Multer
* Supabase
* Algolia
* Stripe

### Admin

* React
* React Router
* Axios
* React Query
* Material UI
* SCSS
* Recharts
* Algolia

### Database / Cloud

* PostgreSQL / Supabase
* Cloudinary
* Stripe

---

# 🔍 Search

ใช้ Algolia สำหรับระบบค้นหา

### Server

```bash
npm install algoliasearch
```

### Client

```bash
npm install algoliasearch react-instantsearch
```

---

# 📝 Notes

รายการที่ยังมีปัญหาหรืออยู่ระหว่างการพัฒนา:

* แสดง Progress % ขณะโหลดโมเดล
* แก้ปัญหาสีของโมเดล
