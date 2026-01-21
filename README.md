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
แจ้งเตือนมีเมลแล้วก่อนส่ง otp

เพิ่มหน้า download
กับแก้ใน App
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
│  │  │  ├─ item
│  │  │  │  ├─ item.jsx
│  │  │  │  └─ item.scss
│  │  │  ├─ items
│  │  │  │  ├─ items.jsx
│  │  │  │  └─ items.scss
│  │  │  ├─ leftbar
│  │  │  │  ├─ leftbar.jsx
│  │  │  │  └─ leftbar.scss
│  │  │  ├─ leftbarDL
│  │  │  │  ├─ leftbarDL.jsx
│  │  │  │  └─ leftbarDL.scss
│  │  │  ├─ modelViewer
│  │  │  │  ├─ model_viewer.jsx
│  │  │  │  └─ model_viewer.scss
│  │  │  ├─ navbar
│  │  │  │  ├─ navbar.jsx
│  │  │  │  └─ navbar.scss
│  │  │  ├─ post
│  │  │  │  ├─ post.jsx
│  │  │  │  └─ post.scss
│  │  │  ├─ posts
│  │  │  │  ├─ posts.jsx
│  │  │  │  └─ posts.scss
│  │  │  ├─ rightbar
│  │  │  │  ├─ rightbar.jsx
│  │  │  │  └─ rightbar.scss
│  │  │  └─ share
│  │  │     ├─ share.jsx
│  │  │     └─ share.scss
│  │  ├─ context
│  │  │  ├─ authContext.jsx
│  │  │  └─ darkModeContext.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ additem
│  │  │  │  ├─ Additem.jsx
│  │  │  │  └─ additem.scss
│  │  │  ├─ download
│  │  │  │  ├─ download.scss
│  │  │  │  └─ Download1.jsx
│  │  │  ├─ home
│  │  │  │  ├─ Home.jsx
│  │  │  │  ├─ home.scss
│  │  │  │  ├─ Home1.jsx
│  │  │  │  └─ home1.scss
│  │  │  ├─ login
│  │  │  │  ├─ login.scss
│  │  │  │  └─ Login1.jsx
│  │  │  ├─ Login.css
│  │  │  ├─ login.jsx
│  │  │  ├─ profile
│  │  │  │  ├─ Profile.jsx
│  │  │  │  └─ profile.scss
│  │  │  ├─ register
│  │  │  │  ├─ register.scss
│  │  │  │  └─ Register1.jsx
│  │  │  ├─ register.css
│  │  │  └─ register.jsx
│  │  └─ style.scss
│  └─ vite.config.js
├─ note
├─ package-lock.json
├─ package.json
├─ README.md
├─ report.html
├─ server
│  ├─ middleware
│  │  └─ verifyToken.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ routes
│  │  └─ MyRouter.js
│  └─ server.js
└─ upload.html

```