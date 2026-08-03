
import { useState } from "react";
import Items from "../../components/PageItems/items/items"
import LeftBarDownload from "../../components/Left/leftbarDL/leftbarDL";
import ScrollToTop from "../../ScrollToTop";
import "./market.scss"

const Market = () => {
  const [filters, setFilters] = useState({
    categories: [],
    date: "AllTime",
  });
  return (
    <div className="market">
      <LeftBarDownload filters={filters} setFilters={setFilters} />
      <div className="content">
        <ScrollToTop />
        <Items filters={filters} isShop={true}/>
      </div>
    </div>
  )
}

export default Market;