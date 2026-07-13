import "./Lbuy.scss";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

const Lbuy = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async () => {

        if(!stripe || !elements){
            return;
        }
        const result = await stripe.confirmPayment({
            elements,
            confirmParams:{
                return_url:"http://localhost:5173/download"
            }
        });
        if(result.error){
            console.log(result.error.message);
        }
    };

    return (
        <div className="Lbuy">
            <div className="container">
                <div className="item new-releases">
                    <div className="item payment">
                        <PaymentElement />
                        {/* <p className="expire">Expire at 10.26 PM</p>
                        <span className="desc">Please complete your payment before clicking comfirm.</span> */}
                        <div className="confirmBox">
                            <button onClick={handleSubmit}>Confirm</button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Lbuy;
