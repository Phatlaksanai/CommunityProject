
import { useState } from "react";
import Items from "../../components/PageItems/items/items"
import LeftBarDownload from "../../components/Left/leftbarDL/leftbarDL";
import "./download.scss"

const download = () => {
  const [filters, setFilters] = useState({
    category: {
      Vehicles: false,
      Characters: false,
      Furniture: false,
      Sports: false,
      "Food&Drink": false,
      Electronics: false,
    },
    date: "AllTime",
  });
  return (
    <div className="download">
      <LeftBarDownload filters={filters} setFilters={setFilters} />
      <div className="content">
        <Items filters={filters} />
      </div>
    </div>
  )
}

export default download