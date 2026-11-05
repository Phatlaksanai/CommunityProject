import Post from "../post/post";
import "./posts.scss";
import { useInfiniteQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

const Posts = ({ userId, project, commuId, isDescCommu, isDescProject }) => {
  const { ref, inView } = useInView(); // ref ตัวนี้จะเอาไปแปะไว้ล่างสุดของหน้าจอ

  const {
    isLoading,
    error,
    data,
    fetchNextPage,    // ฟังก์ชันสำหรับดึงข้อมูลหน้าถัดไป
    hasNextPage,      // เช็คว่ามีข้อมูลหน้าถัดไปให้ดึงอีกไหม
    isFetchingNextPage // เช็คว่ากำลังโหลดข้อมูลหน้าถัดไปอยู่หรือไม่
  } = useInfiniteQuery({
    queryKey: ["posts", userId, project, commuId],
    queryFn: ({ pageParam = 0 }) => {
      // ส่งค่า page ไปใน API
      let url = "/posts";
      if (userId) url = `/posts/user/${userId}`;
      if (project) url = `/posts/project/${project}`;
      if (commuId) url = `/posts/community/${commuId}`;

      return makeRequest.get(`${url}?page=${pageParam}`).then(res => res.data);
    },
    // กำหนดว่าหน้าถัดไปคือเลขอะไร
    getNextPageParam: (lastPage, allPages) => {
      // ถ้าหน้าล่าสุดมีข้อมูลครบ 5 ตัว แสดงว่าน่าจะมีหน้าถัดไป
      return lastPage.length === 5 ? allPages.length : undefined;
    },
  });

  // เมื่อเลื่อนมาถึงจุดที่แปะ ref ไว้ ให้สั่งโหลดหน้าถัดไปทันที
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) return <div className="posts">Loading...</div>;
  if (error || !data) return <div className="posts">Something went wrong or No data.</div>;

  return (
    <div className="posts">
      {/* ข้อมูลจาก useInfiniteQuery จะซ้อนอยู่ใน data.pages */}
      {data?.pages?.map((page) =>
        page.map((post) => <Post post={post} key={post.post_id} commuId={commuId} isDescCommu={isDescCommu} isDescProject={isDescProject} />)
      )}

      {/* จุดล่างสุดที่ใช้ตรวจจับการเลื่อน */}
      <div ref={ref} style={{ padding: "20px", textAlign: "center" }}>
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