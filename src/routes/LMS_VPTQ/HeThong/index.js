import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

/* Menu */
const Menu = asyncComponent(() => import("./Menu/Menu"));
const MenuForm = asyncComponent(() => import("./Menu/MenuForm"));

/* Cán bộ nhân viên */
const CanBoNhanVien = asyncComponent(() =>
  import("./CanBoNhanVien/CanBoNhanVien")
);
const CanBoNhanVienForm = asyncComponent(() =>
  import("./CanBoNhanVien/CanBoNhanVienForm")
);

/* Người dùng */
const NguoiDung = asyncComponent(() => import("./NguoiDung/NguoiDung"));
const NguoiDungForm = asyncComponent(() => import("./NguoiDung/NguoiDungForm"));

/* Vai trò */
const VaiTro = asyncComponent(() => import("./VaiTro/VaiTro"));
const VaiTroForm = asyncComponent(() => import("./VaiTro/VaiTroForm"));

/* Quyền */
const Quyen = asyncComponent(() => import("./Quyen/Quyen"));

/* Email phòng đào tạo */
const EmailPhongDaoTao = asyncComponent(() => import("./EmailPhongDaoTao/EmailPhongDaoTao"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Menu */}
      <Route
        path={`${match.url}/menu`}
        exact
        component={Auth(Menu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/menu/them-moi`}
        exact
        component={Auth(MenuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/menu/:id/chinh-sua`}
        exact
        component={Auth(MenuForm, menus, pathname, permission)}
      />

      {/* Cán bộ nhân viên */}
      <Route
        path={`${match.url}/can-bo-nhan-vien`}
        exact
        component={Auth(CanBoNhanVien, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/can-bo-nhan-vien/them-moi`}
        exact
        component={Auth(CanBoNhanVienForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/can-bo-nhan-vien/:id/chinh-sua`}
        exact
        component={Auth(CanBoNhanVienForm, menus, pathname, permission)}
      />

      {/* Người dùng */}
      <Route
        path={`${match.url}/nguoi-dung`}
        exact
        component={Auth(NguoiDung, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nguoi-dung/them-moi`}
        exact
        component={Auth(NguoiDungForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nguoi-dung/:id/chinh-sua`}
        exact
        component={Auth(NguoiDungForm, menus, pathname, permission)}
      />

      {/* Vai trò */}
      <Route
        path={`${match.url}/vai-tro`}
        exact
        component={Auth(VaiTro, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vai-tro/them-moi`}
        exact
        component={Auth(VaiTroForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vai-tro/:id/chinh-sua`}
        exact
        component={Auth(VaiTroForm, menus, pathname, permission)}
      />

      {/* Quyền */}
      <Route
        path={`${match.url}/vai-tro/:id/phan-quyen`}
        exact
        component={Auth(Quyen, menus, pathname, permission)}
      />

      {/* Email phòng đào tạo */}
      <Route
        path={`${match.url}/email-phong-dao-tao`}
        exact
        component={Auth(EmailPhongDaoTao, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
