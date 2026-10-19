import "./user.scss"
import UserStats from "../../components/statistic/userStats/UserStats"
import ScrollToTop from "../../ScrollToTop"

const User = () => {
    return (
        <div className="userPage">
            <ScrollToTop />
            <UserStats />
        </div>
    )
}

export default User