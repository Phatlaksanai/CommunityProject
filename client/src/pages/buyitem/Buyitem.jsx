import "./buyitem.scss";
import Lbuy from "../../components/Left/Lbuy/Lbuy"
import Rbuy from "../../components/Right/Rbuy/Rbuy"

import CloseIcon from '@mui/icons-material/Close';

import { useNavigate } from "react-router-dom";

const Buyitem = () => {
    const navigate = useNavigate();
    return (
        <div className="buyitem">
            <div className="Lbuyitem">
                <Lbuy />
            </div>

            <div className="Rbuyitem" >
                <div className="Rbuy">
                    <div className="container">
                        <div className="menu">
                            <div className="header">
                                <span>Order Summary</span>
                                <CloseIcon onClick={() => navigate("/download")} style={{ cursor: "pointer" }} />
                            </div>
                            <br />
                            <Rbuy />
                            <br />
                            <div className="row">
                                <span>Subtotal</span> <span>฿500.00</span>
                            </div>
                            <div className="row">
                                <span>Platform fee (3.5%)</span> <span>฿1000.00</span>
                            </div>
                        </div>

                        <hr />
                        <div className="menu">
                            <span>Total Amount</span>
                            <div className="buttons">
                                <button>Buy</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <Rbuy /> */}
            </div>
        </div>
    );
};

export default Buyitem;