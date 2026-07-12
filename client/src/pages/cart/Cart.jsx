import "./cart.scss";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const Cart = () => {
  return (
    <div className="cart">
      <div className="container">

        <div className="cartItem">
          <div className="left">
            <img
              src="https://i.pinimg.com/200x150/6d/69/ce/6d69ced1f99dd83942228425f0c20ec0.jpg"
              alt=""
            />

            <div className="info">
              <h1>Cart</h1>
              <p>$2222</p>
            </div>
          </div>

          <DeleteForeverIcon className="delete" />
        </div>

      </div>

      <div className="checkoutBar">
        <button>Check Out</button>
      </div>
    </div>
  );
};

export default Cart;