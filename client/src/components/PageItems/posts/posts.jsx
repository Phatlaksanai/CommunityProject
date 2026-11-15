import Post from "../post/post";
import "./posts.scss";

import { makeRequest } from "../../../api/axios";
import { useInfiniteQuery } from "@tanstack/react-query"; // ค่อย ๆ โหลดข้อมูลไม่ทับของเดิม
import { useInView } from "react-intersection-observer"; // ตรวจจับจอ

import { useEffect } from "react";

const Posts = ({ userId, project, commuId, isDescCommu, isDescProject }) => {
  const { ref, inView } = useInView(); // ตัวแปะล่างจอเป็น false ถ้าเลื่อนยังไม่ถึง ถ้า loading... โผล่มาในจอคือ true เลย

  const {
    isLoading,
    error,
    data,
    fetchNextPage,    // ฟังก์ชันดึงข้อมูลโพสชุดต่อไป auto
    hasNextPage,      // เช็คว่ามีข้อมูลหน้าถัดไปให้ดึงอีกไหม ผลจาก getNextPageParam ค่าเป็น true / false
    isFetchingNextPage // เช็คโหลดหน้าถัดไปอยู่ป่าวตอนเลื่อนจอสุด แสดง Loading...
  } = useInfiniteQuery({ // โหลดข้อมูลเป็นชุด ๆ
    queryKey: ["posts", userId, project, commuId], // "posts" เป็นป้ายชื่อให้เว็ปเช็คว่าถ้ามีแล้วก็ไม่ต้องโหลดใหม่ตอนเปลี่ยนหน้าไปกลับ
    queryFn: ({ pageParam = 0 }) => { // รอบแรกไม่มีเลขหน้าส่ง 0 รอบหน้าเอาเลขหน้ามาจาก getNextPageParam
      let url = "/posts";
      if (userId) url = `/posts/user/${userId}`;
      if (project) url = `/posts/project/${project}`;
      if (commuId) url = `/posts/community/${commuId}`;

      return makeRequest.get(`${url}?page=${pageParam}`).then(res => res.data);
    },
    // ถ้ามีข้อมูลครบ 5 ตัว ส่งเลขหน้าถัดไปให้ pageParam บรรทัด 20
    getNextPageParam: (lastPage, allPages) => { // lastPage ได้ข้อมุลจาก data ก็คือดึงมาได้ 5 โพสก็คือ arr มี 5 ตัว
      return lastPage.length === 5 ? allPages.length : undefined; // ถ้าไม่ครบ 5 ไม่มีหน้าถัดไป hasNextPage = false
    },
  });

  // จะเรียกโหลดหน้าต่อไป / เลื่อนไปเจอ loading.. inView = T / มีหน้าถัดไป hasNextPage = T
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]); // useEffect จะทำงานก็คือเมื่อค่าใดค่านึงในนี้เปลี่ยน [inView, hasNextPage, fetchNextPage]
  // เอา fetchNextPage ไแปะไว้ใน [] ของ useEffect เป็นกฏคือถ้าเอาฟังก์ชันไปใช้ใน useEffect ก็แปะไปในนี้ด้วย
  if (isLoading) return <div className="posts">Loading...</div>;
  if (error || !data) return <div className="posts">Something went wrong or No data.</div>;

  return (
    <div className="posts">
      {/* ข้อมูลจาก useInfiniteQuery จะซ้อนอยู่ใน data.pages */}
      {data?.pages?.map((page) =>
        page.map((post) => <Post post={post} key={post.post_id} commuId={commuId} isDescCommu={isDescCommu} isDescProject={isDescProject} />)
      )}

      {/* ตัวตรวจวาเลื่อนมาล่างสุดยังอยู่ล่างโพสที่ค่อย ๆ ดึงมาอีกที ก็คือถ้าเลื่อนมาถึง inView = true */}
      <div ref={ref} style={{ padding: "20px", textAlign: "center", color:"#ffffff" }}>
        {isFetchingNextPage
          ? "Loading..."
          : hasNextPage
            ? "Scroll down to see more posts"
            : "No more posts to load"}
      </div>
    </div>
  );
};

export default Posts;