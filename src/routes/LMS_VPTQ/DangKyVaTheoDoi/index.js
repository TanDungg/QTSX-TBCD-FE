import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Đăng ký đào tạo */
const DangKyDaoTao = asyncComponent(() =>
  import("./DangKyDaoTao/DangKyDaoTao")
);
const DangKyDaoTaoForm = asyncComponent(() =>
  import("./DangKyDaoTao/DangKyDaoTaoForm")
);
const KiemTraVaDuyet = asyncComponent(() =>
  import("./DangKyDaoTao/KiemTraVaDuyet")
);

/* Quản lý đăng ký đào tạo */
const QuanLyDangKyDaoTao = asyncComponent(() =>
  import("./QuanLyDangKyDaoTao/QuanLyDangKyDaoTao")
);

/* Lớp học */
const LopHoc = asyncComponent(() => import("./LopHoc/LopHoc"));
const LopHocForm = asyncComponent(() => import("./LopHoc/LopHocForm"));
const DuyetLopHoc = asyncComponent(() => import("./LopHoc/DuyetLopHoc"));

/* Theo dõi đào tạo */
const TheoDoiDaoTao = asyncComponent(() =>
  import("./TheoDoiDaoTao/TheoDoiDaoTao")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Đăng ký đào tạo */}
      <Route
        path={`${match.url}/dang-ky-dao-tao`}
        exact
        component={Auth(DangKyDaoTao, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dang-ky-dao-tao/them-moi`}
        exact
        component={Auth(DangKyDaoTaoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dang-ky-dao-tao/:id/chinh-sua`}
        exact
        component={Auth(DangKyDaoTaoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dang-ky-dao-tao/kiem-tra-va-duyet`}
        exact
        component={Auth(KiemTraVaDuyet, menus, pathname, permission)}
      />

      {/* Đăng ký đào tạo */}
      <Route
        path={`${match.url}/quan-ly-dang-ky-dao-tao`}
        exact
        component={Auth(QuanLyDangKyDaoTao, menus, pathname, permission)}
      />

      {/* Lớp học */}
      <Route
        path={`${match.url}/lop-hoc`}
        exact
        component={Auth(LopHoc, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/lop-hoc/:id/chinh-sua`}
        exact
        component={Auth(LopHocForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/lop-hoc/duyet`}
        exact
        component={Auth(DuyetLopHoc, menus, pathname, permission)}
      />

      {/* Theo dõi đào tạo */}
      <Route
        path={`${match.url}/theo-doi-dao-tao`}
        exact
        component={Auth(TheoDoiDaoTao, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
