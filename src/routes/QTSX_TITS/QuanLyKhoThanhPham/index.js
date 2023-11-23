import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const KhoThanhPham = asyncComponent(() =>
  import("./KhoThanhPham/KhoThanhPham")
);
const LayoutKhoThanhPham = asyncComponent(() =>
  import("./LayoutKhoThanhPham/LayoutKhoThanhPham")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/kho-thanh-pham`}
        exact
        component={Auth(KhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/layout-kho-thanh-pham`}
        exact
        component={Auth(LayoutKhoThanhPham, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
