import Posts from "../../components/posts/posts"
import Share from "../../components/share/share"
import "./home1.scss"

const Home = () => {
  return (
    <div className="home">
      <Share/>
      <Posts/>
      
    </div>
  )
}

export default Home