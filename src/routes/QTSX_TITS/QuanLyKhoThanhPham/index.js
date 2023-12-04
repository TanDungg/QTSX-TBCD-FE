import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const KhoThanhPham = asyncComponent(() =>
  import("./KhoThanhPham/KhoThanhPham")
);
const LayoutKhoThanhPham = asyncComponent(() =>
  import("./LayoutKhoThanhPham/LayoutKhoThanhPham")
);
/* Điều chuyển vật tư */
const DieuChuyenSanPham = asyncComponent(() =>
  import("./DieuChuyen/DieuChuyen")
);
const DieuChuyenSanPhamForm = asyncComponent(() =>
  import("./DieuChuyen/DieuChuyenForm")
);
const ThanhLySanPham = asyncComponent(() => import("./ThanhLy/ThanhLySanPham"));
const ThanhLySanPhamForm = asyncComponent(() =>
  import("./ThanhLy/ThanhLySanPhamForm")
);
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/kho-thanh-pham`}
        exact
        component={Auth(KhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/layout-kho-thanh-pham`}
        exact
        component={Auth(LayoutKhoThanhPham, menus, pathname, permission)}
      />
      {/* Điều chuyển vật tư */}
      <Route
        path={`${match.url}/dieu-chuyen`}
        exact
        component={Auth(DieuChuyenSanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/them-moi`}
        exact
        component={Auth(DieuChuyenSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/chinh-sua`}
        exact
        component={Auth(DieuChuyenSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/chi-tiet`}
        exact
        component={Auth(DieuChuyenSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/xac-nhan`}
        exact
        component={Auth(DieuChuyenSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly`}
        exact
        component={Auth(ThanhLySanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/them-moi`}
        exact
        component={Auth(ThanhLySanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/chinh-sua`}
        exact
        component={Auth(ThanhLySanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/chi-tiet`}
        exact
        component={Auth(ThanhLySanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/xac-nhan`}
        exact
        component={Auth(ThanhLySanPhamForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
