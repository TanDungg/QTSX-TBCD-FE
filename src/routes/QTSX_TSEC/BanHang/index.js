import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

/* Yêu cầu báo giá */
const YeuCauBaoGia = asyncComponent(() => import("./YeuCauBaoGia"));

/* Phiếu yêu cầu */
const PhieuYeuCau = asyncComponent(() => import("./PhieuYeuCau"));

/* Đơn hàng */
const DonHang = asyncComponent(() => import("./DonHang"));

const App = ({ match, location, menus }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Yêu cầu báo giá */}
      <Route
        path={`${match.url}/yeu-cau-bao-gia`}
        component={Auth(YeuCauBaoGia, menus, pathname)}
      />

      {/* Phiếu yêu cầu */}
      <Route
        path={`${match.url}/phieu-yeu-cau`}
        component={Auth(PhieuYeuCau, menus, pathname)}
      />

       {/* Đơn hàng */}
       <Route
        path={`${match.url}/don-hang`}
        component={Auth(DonHang, menus, pathname)}
      />
    </Switch>
  );
};

export default App;
