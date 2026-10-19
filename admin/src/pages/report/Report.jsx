import "./report.scss"
import ReportStats from "../../components/statistic/reportStats/reportStats"
import ScrollToTop from "../../ScrollToTop"

const Report = () => {
    return (
        <div className="reportPage">
            <ScrollToTop />
            <ReportStats />
        </div>
    )
}

export default Report