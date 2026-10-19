import "./content.scss"
import ContentStats from "../../components/statistic/contentStats/ContentStats"
import ScrollToTop from "../../ScrollToTop"

const Content = () => {
    return (
        <div className="contentPage">
            <ScrollToTop />
            <ContentStats />
        </div>
    )
}

export default Content