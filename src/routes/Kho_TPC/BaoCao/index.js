import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const BCNhapKho = asyncComponent(() => import("./NhapKho/NhapKho"));
const BCXuatKho = asyncComponent(() => import("./XuatKho/XuatKho"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/nhap-kho`}
        exact
        component={Auth(BCNhapKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho`}
        exact
        component={Auth(BCXuatKho, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
