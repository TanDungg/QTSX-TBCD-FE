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
const SoLo = asyncComponent(() => import("./SoLo/SoLo"));
const SoLoForm = asyncComponent(() => import("./SoLo/SoLoForm"));
const SoVin = asyncComponent(() => import("./SoVin/SoVin"));
const SoVinForm = asyncComponent(() => import("./SoVin/SoVinForm"));
const KeHoachTong = asyncComponent(() =>
  import("./KeHoachSanXuat/KeHoachTong/KeHoachTong")
);
const KeHoachChiTiet = asyncComponent(() =>
  import("./KeHoachSanXuat/KeHoachChiTiet/KeHoachChiTiet")
);
const ImportKeHoachTong = asyncComponent(() =>
  import("./KeHoachSanXuat/KeHoachTong/ImportKeHoachTong")
);
const ImportKeHoachChiTiet = asyncComponent(() =>
  import("./KeHoachSanXuat/KeHoachChiTiet/ImportKeHoachChiTiet")
);
const KeHoachGiaoXe = asyncComponent(() =>
  import("./KeHoachGiaoXe/KeHoachGiaoXe")
);
const ImportKeHoachGiaoXe = asyncComponent(() =>
  import("./KeHoachGiaoXe/ImportKeHoachGiaoXe")
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
      <Route
        path={`${match.url}/don-hang/:id/chi-tiet`}
        exact
        component={Auth(DonHangSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-lo`}
        exact
        component={Auth(SoLo, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-lo/them-moi`}
        exact
        component={Auth(SoLoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-lo/:id/chinh-sua`}
        exact
        component={Auth(SoLoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-vin`}
        exact
        component={Auth(SoVin, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-vin/them-moi`}
        exact
        component={Auth(SoVinForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-vin/:id/chinh-sua`}
        exact
        component={Auth(SoVinForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke-hoach-san-xuat/tong`}
        exact
        component={Auth(KeHoachTong, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke-hoach-san-xuat/tong/import`}
        exact
        component={Auth(ImportKeHoachTong, menus, pathname, permission)}
      />{" "}
      <Route
        path={`${match.url}/ke-hoach-san-xuat/kh-chi-tiet/import`}
        exact
        component={Auth(ImportKeHoachChiTiet, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke-hoach-san-xuat/kh-chi-tiet`}
        exact
        component={Auth(KeHoachChiTiet, menus, pathname, permission)}
      />{" "}
      <Route
        path={`${match.url}/ke-hoach-giao-xe/import`}
        exact
        component={Auth(ImportKeHoachGiaoXe, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke-hoach-giao-xe`}
        exact
        component={Auth(KeHoachGiaoXe, menus, pathname, permission)}
      />
      {/* <Route path="*" component={Auth(Home, menus, pathname, permission)} /> */}
    </Switch>
  );
};

export default App;
