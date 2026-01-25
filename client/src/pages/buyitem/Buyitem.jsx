import "./buyitem.scss";
import Lbuy from "../../components/Lbuy/Lbuy"
import Rbuy from "../../components/Rbuy/Rbuy"

const Buyitem = () => {
    return (
        <div className="buyitem">
            <div className="Lbuyitem">
                <Lbuy />
            </div>
           
            <div className="Rbuyitem">
                <Rbuy />
            </div>
        </div>
    );
};

export default Buyitem;