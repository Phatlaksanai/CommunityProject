Object 3D
1.กดแล้วโชว์ ไม่เข้าเครื่อง
2.มีไฟล์แต่ดูไม่ได้ ต้องกดที่โปรไฟล์เจ้าของแล้วค่อยหาไฟล์เปิดดู
2.1 upload เข้าโปรไฟล์ตัวเอง

โหลดเพิ่มเติม
npm install concurrently --save-dev // เพื่อ run front+back พร้อมกัน
npm install cookie-parser //server
npm install jsonwebtoken //server
npm install axios //client
npm install cors //server
npm install dayjs //server + client
npm install @mui/icons-material @mui/material @emotion/styled @emotion/react // client 
npm install -D sass-embedded // client 
npm install @tanstack/react-query // client 
npm install multer-storage-cloudinary multer --legacy-peer-deps // server =============new
npm install three // client ================new

สิ่งที่ต้องเพิ่ม
0.สถิติ หน้า descproject ✅
1.แจ้งเตือนมีเมลแล้วก่อนส่ง otp ✅
2.เปลี่ยนตาราง OTP ใน DB แยกออกจาก User ให้เป็นส่งแล้ว กอรกแล้ว ลบทิ้งเอง ประมาณนั้น
3.เปลี่ยน DB ไปใช้ On-Cloud
4.ทำโพสต์ฉบับสมบูรณ์ มี like, comment เป็นต้น
5.หน้ากรองรายละเอียดด้านซ้ายในด้าน download 
6.หน้า descitem ฝั่งขวา / buyitem ที่ถูกลืม
7.หน้าจัดการโปรไฟล์ เปลี่ยนชื่อ, รูป, ปก เป็นต้น
8.หน้า home ฝั่ง leftbar, rightbar 
9.ทำให้ลบ post, ลบ item, ลบ project จากนั้นเก็บ log หรือ something ไว้ แล้วลบใน DB กับ cloud ด้วย 
10.ระบบแอดเพื่อน
11.แยก backend / รวมไฟล์ให้ดูสะอาดตา frontend

Feature
1.run 3D ขึ้นโชว์ ✅
2.upload object/mod ✅
3.AI chat bot
4.จ้างงาน (คน post จ้างงาน)✅
5.พูดคุยทั่วไป
6.ข่าวสาร/กิจกรรม (คน post กิจกรรม)✅
7.รายงาน

ทดสอบระบบ

https://chatgpt.com/share/698c3597-9998-8002-b10e-aff5e93e8369

server
│
├── config
│   ├── db.js
│   └── cloudinary.js
│
├── middleware
│   └── verifyToken.js
│
├── controllers
│   ├── authController.js
│   ├── postController.js
│   ├── projectController.js
│   ├── itemController.js
│   └── uploadController.js
│
├── routes
│   ├── authRoutes.js
│   ├── postRoutes.js
│   ├── projectRoutes.js
│   ├── itemRoutes.js
│   └── uploadRoutes.js
│
├── services
│   └── mailService.js
│
├── server.js

```
CommunityProject
├─ client
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ 404.jsx
│  │  ├─ api
│  │  │  └─ axios.js
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ 1.png
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ comments
│  │  │  │  ├─ comments.jsx
│  │  │  │  └─ comments.scss
│  │  │  ├─ Left
│  │  │  │  ├─ Lbuy
│  │  │  │  │  ├─ Lbuy.jsx
│  │  │  │  │  └─ Lbuy.scss
│  │  │  │  ├─ leftbar
│  │  │  │  │  ├─ leftbar.jsx
│  │  │  │  │  └─ leftbar.scss
│  │  │  │  ├─ leftbarDL
│  │  │  │  │  ├─ leftbarDL.jsx
│  │  │  │  │  └─ leftbarDL.scss
│  │  │  │  ├─ leftDI
│  │  │  │  │  ├─ leftDI.jsx
│  │  │  │  │  └─ leftDI.scss
│  │  │  │  └─ leftDP
│  │  │  │     ├─ leftDP.jsx
│  │  │  │     └─ leftDP.scss
│  │  │  ├─ modelViewer
│  │  │  │  ├─ model_viewer.jsx
│  │  │  │  └─ model_viewer.scss
│  │  │  ├─ navbar
│  │  │  │  ├─ navbar.jsx
│  │  │  │  └─ navbar.scss
│  │  │  ├─ PageItems
│  │  │  │  ├─ item
│  │  │  │  │  ├─ item.jsx
│  │  │  │  │  └─ item.scss
│  │  │  │  ├─ items
│  │  │  │  │  ├─ items.jsx
│  │  │  │  │  └─ items.scss
│  │  │  │  ├─ post
│  │  │  │  │  ├─ post.jsx
│  │  │  │  │  └─ post.scss
│  │  │  │  ├─ posts
│  │  │  │  │  ├─ posts.jsx
│  │  │  │  │  └─ posts.scss
│  │  │  │  ├─ project
│  │  │  │  │  ├─ project.jsx
│  │  │  │  │  └─ project.scss
│  │  │  │  └─ projects
│  │  │  │     ├─ projects.jsx
│  │  │  │     └─ projects.scss
│  │  │  ├─ Right
│  │  │  │  ├─ Rbuy
│  │  │  │  │  ├─ Rbuy.jsx
│  │  │  │  │  └─ Rbuy.scss
│  │  │  │  ├─ rightbar
│  │  │  │  │  ├─ rightbar.jsx
│  │  │  │  │  └─ rightbar.scss
│  │  │  │  └─ rightDI
│  │  │  │     ├─ rightDI.jsx
│  │  │  │     └─ rightDI.scss
│  │  │  ├─ share
│  │  │  │  ├─ share.jsx
│  │  │  │  └─ share.scss
│  │  │  └─ TopDetail
│  │  │     ├─ ProfileDetail
│  │  │     │  ├─ ProfileDetail.jsx
│  │  │     │  └─ profileDetail.scss
│  │  │     └─ ProjectDetail
│  │  │        ├─ ProjectDetail.jsx
│  │  │        └─ ProjectDetail.scss
│  │  ├─ context
│  │  │  ├─ authContext.jsx
│  │  │  └─ darkModeContext.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ additem
│  │  │  │  ├─ Additem.jsx
│  │  │  │  └─ additem.scss
│  │  │  ├─ addproject
│  │  │  │  ├─ addproject.jsx
│  │  │  │  └─ addproject.scss
│  │  │  ├─ buyitem
│  │  │  │  ├─ Buyitem.jsx
│  │  │  │  └─ buyitem.scss
│  │  │  ├─ descItem
│  │  │  │  ├─ DescItem.jsx
│  │  │  │  └─ descItem.scss
│  │  │  ├─ descProject
│  │  │  │  ├─ descProject.jsx
│  │  │  │  └─ descProject.scss
│  │  │  ├─ download
│  │  │  │  ├─ download.scss
│  │  │  │  └─ Download1.jsx
│  │  │  ├─ home
│  │  │  │  ├─ Home1.jsx
│  │  │  │  └─ home1.scss
│  │  │  ├─ login
│  │  │  │  ├─ login.scss
│  │  │  │  └─ Login1.jsx
│  │  │  ├─ profile
│  │  │  │  ├─ Profile.jsx
│  │  │  │  ├─ profile.scss
│  │  │  │  ├─ ProfileItems.jsx
│  │  │  │  └─ ProfileProjects.jsx
│  │  │  └─ register
│  │  │     ├─ register.scss
│  │  │     └─ Register1.jsx
│  │  └─ style.scss
│  └─ vite.config.js
├─ note
├─ package-lock.json
├─ package.json
├─ README.md
├─ report.html
├─ server
│  ├─ config
│  │  ├─ cloudinary.js
│  │  ├─ db.js
│  │  └─ multerCloudinary.js
│  ├─ controllers
│  │  ├─ authController.js
│  │  ├─ itemController.js
│  │  ├─ postController.js
│  │  ├─ projectController.js
│  │  └─ uploadController.js
│  ├─ middleware
│  │  └─ verifyToken.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  ├─ itemRoutes.js
│  │  ├─ MyRouter.js
│  │  ├─ postRoutes.js
│  │  ├─ projectRoutes.js
│  │  └─ uploadRoutes.js
│  ├─ server.js
│  └─ services
│     └─ mailService.js
└─ upload.html

```