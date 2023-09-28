import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const DeNghiMuaHang = asyncComponent(() =>
  import("./DeNghiMuaHang/DeNghiMuaHang")
);
const DeNghiMuaHangForm = asyncComponent(() =>
  import("./DeNghiMuaHang/DeNghiMuaHangForm")
);
const QuyTrinhDeNghiMuaHang = asyncComponent(() =>
  import("./DeNghiMuaHang/QuyTrinhDeNghiMuaHang")
);
const DatHangNoiBo = asyncComponent(() =>
  import("./DatHangNoiBo/DatHangNoiBo")
);
const DatHangNoiBoForm = asyncComponent(() =>
  import("./DatHangNoiBo/DatHangNoiBoForm")
);
const TraNhaCungCap = asyncComponent(() =>
  import("./TraNhaCungCap/TraNhaCungCap")
);
const TraNhaCungCapForm = asyncComponent(() =>
  import("./TraNhaCungCap/TraNhaCungCapForm")
);
const TheoDoiDonHang = asyncComponent(() =>
  import("./TheoDoiDonHang/TheoDoiDonHang")
);
const TheoDoiHangVe = asyncComponent(() =>
  import("./TheoDoiHangVe/TheoDoiHangVe")
);
const PhieuNhanHang = asyncComponent(() =>
  import("./PhieuNhanHang/PhieuNhanHang")
);
const PhieuNhanHangForm = asyncComponent(() =>
  import("./PhieuNhanHang/PhieuNhanHangForm")
);
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/phieu-de-nghi-mua-hang`}
        exact
        component={Auth(DeNghiMuaHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-mua-hang/them-moi`}
        exact
        component={Auth(DeNghiMuaHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-mua-hang/:id/chinh-sua`}
        exact
        component={Auth(DeNghiMuaHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-mua-hang/:id/chi-tiet`}
        exact
        component={Auth(DeNghiMuaHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-mua-hang/:id/xac-nhan`}
        exact
        component={Auth(DeNghiMuaHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-mua-hang/:id/quy-trinh`}
        exact
        component={Auth(QuyTrinhDeNghiMuaHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dat-hang-noi-bo`}
        exact
        component={Auth(DatHangNoiBo, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dat-hang-noi-bo/them-moi`}
        exact
        component={Auth(DatHangNoiBoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dat-hang-noi-bo/:id/chinh-sua`}
        exact
        component={Auth(DatHangNoiBoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dat-hang-noi-bo/:id/chi-tiet`}
        exact
        component={Auth(DatHangNoiBoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dat-hang-noi-bo/:id/xac-nhan`}
        exact
        component={Auth(DatHangNoiBoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-tra-nha-cung-cap`}
        exact
        component={Auth(TraNhaCungCap, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-tra-nha-cung-cap/them-moi`}
        exact
        component={Auth(TraNhaCungCapForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-tra-nha-cung-cap/:id/chinh-sua`}
        exact
        component={Auth(TraNhaCungCapForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-tra-nha-cung-cap/:id/chi-tiet`}
        exact
        component={Auth(TraNhaCungCapForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-tra-nha-cung-cap/:id/xac-nhan`}
        exact
        component={Auth(TraNhaCungCapForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/theo-doi-don-hang`}
        exact
        component={Auth(TheoDoiDonHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/theo-doi-hang-ve`}
        exact
        component={Auth(TheoDoiHangVe, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhan-hang`}
        exact
        component={Auth(PhieuNhanHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhan-hang/them-moi`}
        exact
        component={Auth(PhieuNhanHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhan-hang/:id/chinh-sua`}
        exact
        component={Auth(PhieuNhanHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhan-hang/:id/chi-tiet`}
        exact
        component={Auth(PhieuNhanHangForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
