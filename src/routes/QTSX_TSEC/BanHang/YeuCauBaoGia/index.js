import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

/* Phiếu yêu cầu báo giá */
const PhieuYeuCauBaoGia = asyncComponent(() =>
  import("./PhieuYeuCauBaoGia/PhieuYeuCauBaoGia")
);
const PhieuYeuCauBaoGiaForm = asyncComponent(() =>
  import("./PhieuYeuCauBaoGia/PhieuYeuCauBaoGiaForm")
);

/* Duyệt phiếu yêu cầu báo giá */
const DuyetPhieuYeuCauBaoGia = asyncComponent(() =>
  import("./DuyetPhieuYeuCauBaoGia/DuyetPhieuYeuCauBaoGia")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Phiếu yêu cầu báo giá */}
      <Route
        path={`${match.url}/phieu-yeu-cau`}
        exact
        component={Auth(PhieuYeuCauBaoGia, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-yeu-cau/them-moi`}
        exact
        component={Auth(PhieuYeuCauBaoGiaForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-yeu-cau/:id/chinh-sua`}
        exact
        component={Auth(PhieuYeuCauBaoGiaForm, menus, pathname, permission)}
      />

      {/* Duyệt phiếu yêu cầu báo giá */}
      <Route
        path={`${match.url}/duyet-phieu-yeu-cau`}
        exact
        component={Auth(DuyetPhieuYeuCauBaoGia, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
