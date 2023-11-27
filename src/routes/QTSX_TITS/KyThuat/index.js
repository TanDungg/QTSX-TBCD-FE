import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

//Quy trình công nghệ
const QuyTrinhCongNghe = asyncComponent(() =>
  import("./QuyTrinhCongNghe/QuyTrinhCongNghe")
);
const QuyTrinhCongNgheForm = asyncComponent(() =>
  import("./QuyTrinhCongNghe/QuyTrinhCongNgheForm")
);

//Danh sách chi tiết
const DanhSachChiTiet = asyncComponent(() =>
  import("./DanhSachChiTiet/DanhSachChiTiet")
);
const DanhSachChiTietForm = asyncComponent(() =>
  import("./DanhSachChiTiet/DanhSachChiTietForm")
);

//OEM
const OEM = asyncComponent(() => import("./OEM/OEM"));
const OEMForm = asyncComponent(() => import("./OEM/OEMForm"));

const BOM = asyncComponent(() => import("./BOM/BOM"));
const BOMForm = asyncComponent(() => import("./BOM/BOMForm"));
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Quy trình công nghệ */}
      <Route
        path={`${match.url}/quy-trinh-cong-nghe`}
        exact
        component={Auth(QuyTrinhCongNghe, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-cong-nghe/them-moi`}
        exact
        component={Auth(QuyTrinhCongNgheForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-cong-nghe/:id/chinh-sua`}
        exact
        component={Auth(QuyTrinhCongNgheForm, menus, pathname, permission)}
      />
      {/* Danh sách chi tiết */}
      <Route
        path={`${match.url}/danh-sach-chi-tiet`}
        exact
        component={Auth(DanhSachChiTiet, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/danh-sach-chi-tiet/them-moi`}
        exact
        component={Auth(DanhSachChiTietForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/danh-sach-chi-tiet/:id/chinh-sua`}
        exact
        component={Auth(DanhSachChiTietForm, menus, pathname, permission)}
      />
      {/* OEM */}
      <Route
        path={`${match.url}/oem`}
        exact
        component={Auth(OEM, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/oem/them-moi`}
        exact
        component={Auth(OEMForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/oem/:id/chinh-sua`}
        exact
        component={Auth(OEMForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/oem/:id/chi-tiet`}
        exact
        component={Auth(OEMForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/oem/:id/xac-nhan`}
        exact
        component={Auth(OEMForm, menus, pathname, permission)}
      />
      {/* BOM */}
      <Route
        path={`${match.url}/bom`}
        exact
        component={Auth(BOM, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom/them-moi`}
        exact
        component={Auth(BOMForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom/:id/chinh-sua`}
        exact
        component={Auth(BOMForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
