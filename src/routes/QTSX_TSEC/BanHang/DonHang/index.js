import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

/* Quản lý đơn hàng */
const QuanLyDonHang = asyncComponent(() =>
  import("./QuanLyDonHang/QuanLyDonHang")
);
const QuanLyDonHangForm = asyncComponent(() =>
  import("./QuanLyDonHang/QuanLyDonHangForm")
);

/* Thực hiện công việc */
const ThucHienCongViec = asyncComponent(() =>
  import("./ThucHienCongViec/ThucHienCongViec")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Quản lý đơn hàng */}
      <Route
        path={`${match.url}`}
        exact
        component={Auth(QuanLyDonHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/them-moi`}
        exact
        component={Auth(QuanLyDonHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/:id/chinh-sua`}
        exact
        component={Auth(QuanLyDonHangForm, menus, pathname, permission)}
      />

      {/* Thực hiện công việc */}
      <Route
        path={`${match.url}/thuc-hien-cong-viec`}
        exact
        component={Auth(ThucHienCongViec, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
