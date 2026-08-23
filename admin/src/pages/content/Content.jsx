import "./content.scss"
import DonutChart from "../../components/Right/donutChart/donutChart"
import ContentStats from "../../components/statistic/contentStats/ContentStats"

const Content = () => {
    return (
        <div className="contentPage">
            <div className="left">
                <ContentStats />
            </div>
            <div className="right">
                <DonutChart isContent={true} />
            </div>
        </div>
    )
}

export default Content