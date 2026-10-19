import Dashboard from "../../components/statistic/dashboard/dashboard"
import ScrollToTop from "../../ScrollToTop"
import "./home.scss"

const Home = () => {
  return (
    <div className="home">
      <ScrollToTop />
      <Dashboard />
    </div>
  )
}

export default Home