import "./leftbarDL.scss";
import { AuthContext } from "../../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const LeftBarDownload = ({ filters = {}, setFilters }) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
  const dateLabels = {
    AllTime: "All time",
    ThisMonth: "This month",
    ThisWeek: "This week",
    ThisDay: "This day",
  };
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      makeRequest.get("/items/categories").then((res) => res.data),
  });
  const handleChange = (id) => {
    setFilters((prev) => {
      const categories = prev.categories || [];
      const exists = prev.categories.includes(id);

      const newFilters = {
        ...prev,
        categories: exists
          ? categories.filter((c) => c !== id)
          : [...categories, id],
      };

      return newFilters;
    });
  };

  const handleDateChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      date: value,
    }));
  };

  const handleAddItemClick = async () => {
    if (!currentUser) return;

    try {
      const res = await makeRequest.get(`/payments/check-stripe/${currentUser.user_id}`);
      const data = res.data;
      if (data.isSetupComplete) {
        navigate("/additem");
      }
      // ถ้ามีบัญชีแล้ว แต่ยังกรอกข้อมูลกับ Stripe ไม่เสร็จ (มี URL ส่งกลับมา)
      else if (data.url) {
        window.location.href = data.url;
      }
      else {
        try {
          const onboardRes = await makeRequest.post("/payments/create-stripe-account", {
            userId: currentUser.user_id,
            email: currentUser.email
          });

          // เด้งไปหน้า Stripe Onboarding
          if (onboardRes.data.url) {
            window.location.href = onboardRes.data.url;
          }
        } catch (onboardErr) {
          console.error("Error creating Stripe account:", onboardErr);
          setError("Failed to setup Stripe account. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error checking Stripe Connect status:", err);
      setError("Error checking account status");
    }
  };

  const displayName = currentUser?.name || currentUser?.username || "Guest";
  const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName;

  return (
    <div className="leftBarDownload">
      <div className="leftBarDownloadItem">
        <img src={currentUser?.profilePic || defaultPic} alt="profile" />
        <span className="custom-tooltip" data-tip={displayName}>
          {truncatedName}
        </span>
        <button onClick={handleAddItemClick} style={{ cursor: "pointer" }}>Add Item</button>
      </div>

      <h3>Detailed search</h3>
      <hr />
      <form>
        <p>Category</p>
        {categories.map((category) => (
          <div key={category.category_id}>
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={filters.categories?.includes(category.category_id) || false}
              onChange={() => handleChange(category.category_id)}
            />
            <span>{category.type}</span>
          </div>
        ))}
        <hr />
        <p>Date</p>
        {Object.keys(dateLabels).map((item) => (
          <div key={item}>
            <input
              type="radio"
              className="custom-radio"
              id={item}
              name="date"
              checked={filters.date === item}
              onChange={() => handleDateChange(item)}
            />
            <label htmlFor={item}>{dateLabels[item]}</label>
          </div>
        ))}
      </form>
      <br></br>
      {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
      {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
    </div>
  );
};

export default LeftBarDownload;
