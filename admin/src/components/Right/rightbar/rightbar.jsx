import "./rightbar.scss";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PendingIcon from '@mui/icons-material/Pending';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const RightBar = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const { isLoading: ordersLoading, error: ordersError, data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => makeRequest.get("/admin/dashboard/orders").then((res) => res.data),
  });
  const { isLoading: reportsLoading, error: reportsError, data: reports } = useQuery({
    queryKey: ["reports"],
    queryFn: () => makeRequest.get("/admin/dashboard/countReportsType").then((res) => res.data),
  });

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item new-releases">
          <span className="box-title">Recent Orders</span>
          {ordersError ? "Something went wrong" : ordersLoading ? "Loading..." :
            orders?.map((order) => {
              const displayName = order.name;
              const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName;
              return (
                <div className="user" key={order.order_id}>
                  <div className="userInfo">
                    <img src={order.profilePic || defaultPic} alt="" />
                  </div>
                  <div className="buttons">
                    <span>{order.orderRef}</span>
                    <span className="custom-tooltip" data-tip={displayName}>
                      {truncatedName}
                    </span>
                  </div>
                  <div className="price">
                    <span>฿ {order.amount.toFixed(2)}</span>
                    <div className={`status ${order.status?.toLowerCase()}`}>
                      <span>{order.status}</span>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>

        <div className="item">
          <span className="box-title">Reports</span>
          <div className="reports-list">
            <div className="report-item">
              <div className="report-left">
                <FileCopyIcon className="icon" />
                <span>CopyRight</span>
              </div>
              <span className="report-count">{reports?.copyright || 0}</span>
            </div>

            <div className="report-item">
              <div className="report-left">
                <ReportProblemIcon className="icon" />
                <span>inappropriate</span>
              </div>
              <span className="report-count">{reports?.inappropriate || 0}</span>
            </div>

            <div className="report-item">
              <div className="report-left">
                <HighlightOffIcon className="icon" />
                <span>spam</span>
              </div>
              <span className="report-count">{reports?.spam || 0}</span>
            </div>

            <div className="report-item">
              <div className="report-left">
                <ReportGmailerrorredIcon className="icon" />
                <span>scam</span>
              </div>
              <span className="report-count">{reports?.scam || 0}</span>
            </div>

            <div className="report-item">
              <div className="report-left">
                <PendingIcon className="icon" />
                <span>Other</span>
              </div>
              <span className="report-count">{reports?.other || 0}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RightBar;