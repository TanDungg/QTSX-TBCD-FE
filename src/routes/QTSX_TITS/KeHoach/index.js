import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

// const Home = asyncComponent(() => import("../Home"));
const CongDoan = asyncComponent(() =>
  import("./KeHoachSanXuat/DanhMucCongDoan/DanhMucCongDoan")
);
const CongDoanForm = asyncComponent(() =>
  import("./KeHoachSanXuat/DanhMucCongDoan/DanhMucCongDoanForm")
);
const DonHangSanXuat = asyncComponent(() =>
  import("./DonHangSanXuat/DonHangSanXuat")
);
const DonHangSanXuatForm = asyncComponent(() =>
  import("./DonHangSanXuat/DonHangSanXuatForm")
);
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/ke-hoach-san-xuat/cong-doan`}
        exact
        component={Auth(CongDoan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke-hoach-san-xuat/cong-doan/them-moi`}
        exact
        component={Auth(CongDoanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke-hoach-san-xuat/cong-doan/:id/chinh-sua`}
        exact
        component={Auth(CongDoanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-hang`}
        exact
        component={Auth(DonHangSanXuat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-hang/them-moi`}
        exact
        component={Auth(DonHangSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-hang/:id/chinh-sua`}
        exact
        component={Auth(DonHangSanXuatForm, menus, pathname, permission)}
      />
      {/* <Route path="*" component={Auth(Home, menus, pathname, permission)} /> */}
    </Switch>
  );
};

export default App;
