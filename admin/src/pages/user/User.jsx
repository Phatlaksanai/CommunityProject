import "./user.scss"
import DonutChart from "../../components/Right/donutChart/donutChart"
import UserStats from "../../components/statistic/userStats/UserStats"

const User = () => {
    return (
        <div className="userPage">
            <div className="left">
                <UserStats />
            </div>
            <div className="right">
                <DonutChart isUser={true} />
            </div>
        </div>
    )
}

export default User