import "./transaction.scss"
import TransactionStats from "../../components/statistic/transactionStats/transactionStats"
import ScrollToTop from "../../ScrollToTop"

const Transaction = () => {
    return (
        <div className="transactionPage">
            <ScrollToTop />
            <TransactionStats />
        </div>
    )
}

export default Transaction