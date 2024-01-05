import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

//Quản lý màn hình
const DanhSachManHinh = asyncComponent(() => import("./DanhSachManHinh"));
const DanhSachManHinhForm = asyncComponent(() =>
  import("./DanhSachManHinhForm")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Quản lý màn hình */}
      <Route
        path={`${match.url}/danh-sach-man-hinh`}
        exact
        component={Auth(DanhSachManHinh, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/danh-sach-man-hinh/them-moi`}
        exact
        component={Auth(DanhSachManHinhForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/danh-sach-man-hinh/:id/chinh-sua`}
        exact
        component={Auth(DanhSachManHinhForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
