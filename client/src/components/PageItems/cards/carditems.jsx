import CardItem from "../carditem/carditem";

import "./carditems.scss";

const CardItems = ({ items }) => {

 if (!items || items.length === 0) {
    return <div className="carditems">No items in cart</div>;
  }

  return <div className="carditems">
    {items.map((card) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <CardItem card={card} key={card.cart_items_id} />
    ))}
  </div>

};

export default CardItems;
