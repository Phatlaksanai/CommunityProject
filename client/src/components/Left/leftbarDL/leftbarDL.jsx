import "./leftbarDL.scss";
import { AuthContext } from "../../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

const LeftBarDownload = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";


  const [filters, setFilters] = useState({
    category: {
      Vehicles: false,
      Characters: false,
      Furniture: false,
      Sports: false,
      FoodDrink: false,
      Electronics: false,
    },
    date: "AllTime",
    others: {
      Downloadable: false,
    },
  });

  const dateLabels = {
    AllTime: "All time",
    ThisMonth: "This month",
    ThisWeek: "This week",
    ThisDay: "This day",
  };

  const handleChange = (group, name) => {
    setFilters((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [name]: !prev[group][name],
      },
    }));
  };
  const handleDateChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      date: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Filters:", filters);
  };

  return (
    <div className="leftBarDownload">
      <div className="leftBarDownloadItem">
        <img src={currentUser?.profilePic || defaultPic} alt="profile" />
        <span>{currentUser?.name || currentUser?.username || "Guest"}</span>
        <button onClick={() => navigate("/additem")} style={{ cursor: "pointer" }}>Add Item</button>
      </div>
      
      
      <h3>Detailed search</h3>
      <hr />
      <form onSubmit={handleSubmit}>
        <p>Category</p>
        {Object.keys(filters.category).map((item) => (
          <div key={item}>
            <input
              type="checkbox"
              id={item}
              checked={filters.category[item]}
              onChange={() => handleChange("category", item)}
            />
            <label htmlFor={item}>
              {" "}
              {item === "FoodDrink" ? "Food & Drink" : item}
            </label>
          </div>
        ))}
        <hr />
        <p>Date</p>
        {Object.keys(dateLabels).map((item) => (
          <div key={item}>
            <input
              type="radio"
              id={item}
              name="date"
              checked={filters.date === item}
              onChange={() => handleDateChange(item)}
            />
            <label htmlFor={item}>{dateLabels[item]}</label>
          </div>
        ))}
        <hr />
        <p>Others</p>
        <div>
          <input
            type="checkbox"
            id="Downloadable"
            checked={filters.others.Downloadable}
            onChange={() => handleChange("others", "Downloadable")}
          />
          <label htmlFor="Downloadable"> Downloadable</label>
        </div>
      </form>
    </div>
  );
};

export default LeftBarDownload;
