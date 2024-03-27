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

/* Phân công công việc */
const PhanCongCongViec = asyncComponent(() =>
  import("./PhanCongCongViec/PhanCongCongViec")
);

/* Thực hiện công việc */
const ThucHienCongViec = asyncComponent(() =>
  import("./ThucHienCongViec/ThucHienCongViec")
);

/* Báo giá */
const PhieuBaoGia = asyncComponent(() => import("./PhieuBaoGia/PhieuBaoGia"));
const PhieuBaoGiaForm = asyncComponent(() => import("./PhieuBaoGia/PhieuBaoGiaForm"));

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

      {/* Phân công công việc */}
      <Route
        path={`${match.url}/phan-cong-cong-viec`}
        exact
        component={Auth(PhanCongCongViec, menus, pathname, permission)}
      />

      {/* Thực hiện công việc */}
      <Route
        path={`${match.url}/thuc-hien-cong-viec`}
        exact
        component={Auth(ThucHienCongViec, menus, pathname, permission)}
      />

      {/* Báo giá */}
      <Route
        path={`${match.url}/phieu-bao-gia`}
        exact
        component={Auth(PhieuBaoGia, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-bao-gia/them-moi`}
        exact
        component={Auth(PhieuBaoGiaForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-bao-gia/:id/chinh-sua`}
        exact
        component={Auth(PhieuBaoGiaForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
