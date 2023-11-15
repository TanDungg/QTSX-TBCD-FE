import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

//Phiếu mua hàng nội bộ
const PhieuMuaHangNoiBo = asyncComponent(() =>
  import("./PhieuMuaHangNoiBo/PhieuMuaHangNoiBo")
);
const PhieuMuaHangNoiBoForm = asyncComponent(() =>
  import("./PhieuMuaHangNoiBo/PhieuMuaHangNoiBoForm")
);

//Phiếu mua hàng ngoài
const PhieuMuaHangNgoai = asyncComponent(() =>
  import("./PhieuMuaHangNgoai/PhieuMuaHangNgoai")
);
const PhieuMuaHangNgoaiForm = asyncComponent(() =>
  import("./PhieuMuaHangNgoai/PhieuMuaHangNgoaiForm")
);

const TheoDoiDonHang = asyncComponent(() =>
  import("./TheoDoiDonHang/TheoDoiDonHang")
);
const TheoDoiDonHangForm = asyncComponent(() =>
  import("./TheoDoiDonHang/TheoDoiDonHangForm")
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
      {/* Phiếu mua hàng nội bộ */}
      <Route
        path={`${match.url}/phieu-mua-hang-noi-bo`}
        exact
        component={Auth(PhieuMuaHangNoiBo, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-mua-hang-noi-bo/them-moi`}
        exact
        component={Auth(PhieuMuaHangNoiBoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-mua-hang-noi-bo/:id/chinh-sua`}
        exact
        component={Auth(PhieuMuaHangNoiBoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-mua-hang-noi-bo/:id/chi-tiet`}
        exact
        component={Auth(PhieuMuaHangNoiBoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-mua-hang-noi-bo/:id/xac-nhan`}
        exact
        component={Auth(PhieuMuaHangNoiBoForm, menus, pathname, permission)}
      />

      {/* Phiếu mua hàng ngoài */}
      <Route
        path={`${match.url}/phieu-mua-hang-ngoai`}
        exact
        component={Auth(PhieuMuaHangNgoai, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-mua-hang-ngoai/them-moi`}
        exact
        component={Auth(PhieuMuaHangNgoaiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-mua-hang-ngoai/:id/chinh-sua`}
        exact
        component={Auth(PhieuMuaHangNgoaiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-mua-hang-ngoai/:id/chi-tiet`}
        exact
        component={Auth(PhieuMuaHangNgoaiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-mua-hang-ngoai/:id/xac-nhan`}
        exact
        component={Auth(PhieuMuaHangNgoaiForm, menus, pathname, permission)}
      />

      {/* Theo dõi đơn hàng */}
      <Route
        path={`${match.url}/theo-doi-don-hang`}
        exact
        component={Auth(TheoDoiDonHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/theo-doi-don-hang/:id/chi-tiet`}
        exact
        component={Auth(TheoDoiDonHangForm, menus, pathname, permission)}
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
