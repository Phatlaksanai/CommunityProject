import "./Lbuy.scss";
import { useState } from "react";

const Lbuy = () => {

    return (
        <div className="Lbuy">
            <div className="container">
                <div className="item new-releases">
                    <div className="item payment">
                        <img className="qr"
                            src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                            alt=""
                        />
                        <p className="expire">Expire at 10.26 PM</p>
                        <span className="desc">Please complete your payment before clicking comfirm.</span>
                        <div className="confirmBox">
                            <button>Confirm</button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Lbuy;
