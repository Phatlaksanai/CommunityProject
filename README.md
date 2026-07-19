Object 3D
1.กดแล้วโชว์ ไม่เข้าเครื่อง
2.มีไฟล์แต่ดูไม่ได้ ต้องกดที่โปรไฟล์เจ้าของแล้วค่อยหาไฟล์เปิดดู
2.1 upload เข้าโปรไฟล์ตัวเอง

คำสั่ง Webhook
stripe listen --forward-to localhost:8080/api/payments/webhook

โหลดเพิ่มเติม
npm install concurrently --save-dev // เพื่อ run front+back พร้อมกัน
npm install cookie-parser //server
npm install jsonwebtoken //server
npm install axios //client
npm install cors //server
npm install dayjs //server + client
npm install @mui/icons-material @mui/material @emotion/styled @emotion/react // client 

npm install -D sass // client 
npm install @tanstack/react-query // client 
npm install cloudinary multer // server 
npm install three // client 
npm install @supabase/supabase-js // server
npm install swiper // client
npm i react-intersection-observer // client

npm install algoliasearch // server
npm install algoliasearch react-instantsearch // client 

npm install stripe // server 🆕🆕🆕🆕
npm install @stripe/react-stripe-js @stripe/stripe-js // client 🆕🆕🆕🆕

    เพิ่มลบ project ได้ และก็ลบรูปออกจาก cloud ด้วย

สิ่งที่ต้องเพิ่ม
0.สถิติ หน้า descproject ✅
1.แจ้งเตือนมีเมลแล้วก่อนส่ง otp ✅
2.เปลี่ยนตาราง OTP ใน DB แยกออกจาก User ให้เป็นส่งแล้ว กอรกแล้ว ลบทิ้งเอง ประมาณนั้น ✅
3.เปลี่ยน DB ไปใช้ On-Cloud ✅
4.ทำโพสต์ฉบับสมบูรณ์ มี like, comment เป็นต้น ✅
5.หน้ากรองรายละเอียดด้านซ้ายในด้าน download ✅
6.หน้า descitem ฝั่งขวา / buyitem ที่ถูกลืม
7.หน้าจัดการโปรไฟล์ เปลี่ยนชื่อ, รูป, ปก เป็นต้น ✅
8.หน้า home ฝั่ง leftbar, rightbar  
9.ทำให้ลบ post ✅, ลบ item, ลบ project จากนั้นเก็บ log หรือ something ไว้ แล้วลบใน DB กับ cloud ด้วย 
10.ระบบแอดเพื่อน
11.แยก backend / รวมไฟล์ให้ดูสะอาดตา frontend ✅
12.แก้แสดงผล 3D nigga ✅/2
13.แสดงผล % ขณะโหลด
14.เลือก project ตอน post ✅
15.ทำให้หน้า home โหลด post มาแสดงทีละนิด แล้วค่อยโหลดเพิ่มเมื่อเลื่อนลงไป ✅
16.ทำให้โมเดลแต่ละตัวตอนโพสต์ เล็ก ใหญ่ ไม่เพี้ยน สีไม่ Nig
17.ลบ row users กรณีที่ผู้ใช้ไม่สมัครสมาชิกเป็นเวลากี่วัน... 
18.หน้า edit item ✅ || ลบ item???? 
19.เปลี่ยน Fetch ปกติเป็น Axios ให้หมด ✅
20.จัดหน้าตาพวก setError , setSuccess ให้เป็นระเบียบ ✅
21.โพสที่มาจากโปรเจคให้ขึ้นเหมือนคอมมู

Feature
1.run 3D ขึ้นโชว์ ✅
2.upload object/mod ✅
3.จ้างงาน (คน post จ้างงาน)✅
4.พูดคุยทั่วไป
5.ข่าวสาร/กิจกรรม (คน post กิจกรรม)✅
6.รายงาน

ทดสอบระบบ
จำลองการสอบ -เปลี่ยนระบบเป็นเข้าได้ทุกครั้งไม่ต้องจดจำผู้ใช้ เอา token ออก

https://mui.com/material-ui/material-icons/

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
│  │  │  │  ├─ leftChat
│  │  │  │  │  ├─ leftChat.jsx
│  │  │  │  │  └─ leftChat.scss
│  │  │  │  ├─ leftDC
│  │  │  │  │  ├─ leftDC.jsx
│  │  │  │  │  └─ leftDC.scss
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
│  │  │  │  ├─ addfriends
│  │  │  │  │  ├─ addfriends.jsx
│  │  │  │  │  └─ addfriends.scss
│  │  │  │  ├─ friend
│  │  │  │  │  ├─ friend.jsx
│  │  │  │  │  └─ friend.scss
│  │  │  │  ├─ friends
│  │  │  │  │  ├─ friends.jsx
│  │  │  │  │  └─ friends.scss
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
│  │  │     ├─ CommuDetail
│  │  │     │  ├─ CommuDetail.jsx
│  │  │     │  └─ commuDetail.scss
│  │  │     ├─ DownloadDetail
│  │  │     │  ├─ DownloadDetail.jsx
│  │  │     │  └─ downloadDetail.scss
│  │  │     ├─ FriendDetail
│  │  │     │  ├─ FriendDetail.jsx
│  │  │     │  └─ friendDetail.scss
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
│  │  │  ├─ addcommu
│  │  │  │  ├─ Addcommu.jsx
│  │  │  │  └─ addcommu.scss
│  │  │  ├─ additem
│  │  │  │  ├─ Additem.jsx
│  │  │  │  └─ additem.scss
│  │  │  ├─ addproject
│  │  │  │  ├─ addproject.jsx
│  │  │  │  └─ addproject.scss
│  │  │  ├─ banMember
│  │  │  │  ├─ banMember.jsx
│  │  │  │  └─ banMember.scss
│  │  │  ├─ buyitem
│  │  │  │  ├─ Buyitem.jsx
│  │  │  │  └─ buyitem.scss
│  │  │  ├─ changepassword
│  │  │  │  ├─ ChangePassword.jsx
│  │  │  │  └─ changepassword.scss
│  │  │  ├─ chat
│  │  │  │  ├─ chat.jsx
│  │  │  │  └─ chat.scss
│  │  │  ├─ deleteaccount
│  │  │  │  ├─ DeleteAccount.jsx
│  │  │  │  └─ deleteaccount.scss
│  │  │  ├─ descCommu
│  │  │  │  ├─ DescCommu.jsx
│  │  │  │  └─ descCommu.scss
│  │  │  ├─ descDownload
│  │  │  │  ├─ DescDownload.jsx
│  │  │  │  └─ descDownload.scss
│  │  │  ├─ descItem
│  │  │  │  ├─ DescItem.jsx
│  │  │  │  └─ descItem.scss
│  │  │  ├─ descProject
│  │  │  │  ├─ descProject.jsx
│  │  │  │  └─ descProject.scss
│  │  │  ├─ editcommu
│  │  │  │  ├─ editCommu.jsx
│  │  │  │  └─ editCommu.scss
│  │  │  ├─ edititem
│  │  │  │  ├─ editItem.jsx
│  │  │  │  └─ editItem.scss
│  │  │  ├─ editprofile
│  │  │  │  ├─ editProfile.jsx
│  │  │  │  └─ editProfile.scss
│  │  │  ├─ editproject
│  │  │  │  ├─ editProject.jsx
│  │  │  │  └─ editProject.scss
│  │  │  ├─ home
│  │  │  │  ├─ Home1.jsx
│  │  │  │  └─ home1.scss
│  │  │  ├─ login
│  │  │  │  ├─ login.scss
│  │  │  │  └─ Login1.jsx
│  │  │  ├─ manageFriend
│  │  │  │  ├─ ManageAddfriend.jsx
│  │  │  │  ├─ ManageFriend.jsx
│  │  │  │  └─ manageFriend.scss
│  │  │  ├─ market
│  │  │  │  ├─ Market.jsx
│  │  │  │  └─ market.scss
│  │  │  ├─ profile
│  │  │  │  ├─ Profile.jsx
│  │  │  │  ├─ profile.scss
│  │  │  │  ├─ ProfileItems.jsx
│  │  │  │  └─ ProfileProjects.jsx
│  │  │  ├─ register
│  │  │  │  ├─ register.scss
│  │  │  │  └─ Register1.jsx
│  │  │  ├─ resetpassword
│  │  │  │  ├─ ResetPassword.jsx
│  │  │  │  └─ resetpassword.scss
│  │  │  └─ setting
│  │  │     ├─ Setting.jsx
│  │  │     └─ setting.scss
│  │  ├─ ScrollToTop.jsx
│  │  ├─ style.scss
│  │  └─ supabaseClient.js
│  └─ vite.config.js
├─ MyRouter.js
├─ note
├─ package-lock.json
├─ package.json
├─ README.md
├─ report.html
├─ server
│  ├─ config
│  │  ├─ cloudinary.js
│  │  └─ db.js
│  ├─ controllers
│  │  ├─ authController.js
│  │  ├─ chatController.js
│  │  ├─ commuController.js
│  │  ├─ friendController.js
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
│  │  ├─ chatRoutes.js
│  │  ├─ commuRoutes.js
│  │  ├─ friendRoutes.js
│  │  ├─ itemRoutes.js
│  │  ├─ postRoutes.js
│  │  ├─ projectRoutes.js
│  │  └─ uploadRoutes.js
│  └─ server.js
└─ upload.html

```