import Item from "../item/item";
import "./items.scss";
import { useInfiniteQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import NotFound from "../../NotFound/notFound";
import Loading from "../../NotFound/loading";

const Items = ({ userId, filters, isProfile, isShop }) => {
  const { currentUser } = useContext(AuthContext);
  const { ref, inView } = useInView(); // ref ตัวนี้จะเอาไปแปะไว้ล่างสุดของหน้าจอ

  const {
    isLoading,
    error,
    data,
    fetchNextPage,    // ฟังก์ชันสำหรับดึงข้อมูลหน้าถัดไป
    hasNextPage,      // เช็คว่ามีข้อมูลหน้าถัดไปให้ดึงอีกไหม
    isFetchingNextPage // เช็คว่ากำลังโหลดข้อมูลหน้าถัดไปอยู่หรือไม่
  } = useInfiniteQuery({
    queryKey: ["items", userId, filters],
    queryFn: ({ pageParam = 0 }) => {
      const query = new URLSearchParams();

      if (filters.categories?.length > 0) {
        filters.categories.forEach((id) => {
          query.append("category_id", id);
        });
      }
      query.append("date", filters?.date || "AllTime");

      // เพิ่ม page เข้าไปใน query
      query.append("page", pageParam);

      // สร้าง URL
      const baseUrl = userId ? `/items/user/${userId}` : `/items`;

      if (currentUser?.user_id) {
        query.set("user_id", currentUser.user_id);
      }

      // ตัว query.toString() จะจัดการเครื่องหมาย & ให้อัตโนมัติ (เช่น ?date=AllTime&page=0)
      return makeRequest.get(`${baseUrl}?${query.toString()}`).then(res => res.data);
    },
    // กำหนดว่าหน้าถัดไปคือเลขอะไร
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

  if (isLoading) return <Loading />;
  if (error || !data) return <NotFound />;

  return <div className="items">
    {data?.pages?.map((page) =>
      page.map((item) => <Item item={item} key={item.item_id} isProfile={isProfile} isShop={isShop} />)
    )}

    <div ref={ref} style={{ padding: "20px", textAlign: "center", color: "#ffffff" }}>
      {isFetchingNextPage
        ? "Loading..."
        : hasNextPage
          ? "Scroll down to see more items"
          : "No more items to load"}
    </div>

  </div>

};

export default Items;
