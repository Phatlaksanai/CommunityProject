import Project from "../project/project";
import "./projects.scss";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query"; // เปลี่ยนมาใช้ตัวนี้
import { makeRequest } from "../../../api/axios";
import { useInView } from "react-intersection-observer"; // เพิ่มเข้ามา
import { useEffect } from "react";

const Projects = ({ userId, isProfile }) => {
  const { ref, inView } = useInView();

  const {
    isLoading,
    error,
    data,
    fetchNextPage,    // ฟังก์ชันสำหรับดึงข้อมูลหน้าถัดไป
    hasNextPage,      // เช็คว่ามีข้อมูลหน้าถัดไปให้ดึงอีกไหม
    isFetchingNextPage // เช็คว่ากำลังโหลดข้อมูลหน้าถัดไปอยู่หรือไม่
  } = useInfiniteQuery({
    queryKey: ["projects", userId],
    queryFn: ({ pageParam = 0 }) => {
      if (userId) {
        return makeRequest.get(`/projects/user/${userId}?page=${pageParam}`).then(res => res.data);
      }
      return makeRequest.get("/projects").then(res => res.data);
    },
    getNextPageParam: (lastPage, allPages) => {
      // ถ้าหน้าล่าสุดมีข้อมูลครบ 15 ตัว แสดงว่าน่าจะมีหน้าถัดไป
      return lastPage.length === 15 ? allPages.length : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) return "Loading projects...";
  if (error) return "Something went wrong!";

  return <div className="projects">
    {data?.pages?.map((page) => (
      page.map((project) => (
        <Project project={project} key={project.project_id} isProfile={isProfile} />
      ))
    ))}

    <div ref={ref} style={{ padding: "20px", textAlign: "center", color: "#ffffff"}}>
        {isFetchingNextPage
          ? "Loading..."
          : hasNextPage
            ? "Scroll down to see more posts"
            : "No more posts to load"}
    </div>
  </div>

};

export default Projects;
