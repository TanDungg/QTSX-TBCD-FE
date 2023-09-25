import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const BCNhapKho = asyncComponent(() => import("./NhapKho/NhapKho"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/nhap-kho`}
        exact
        component={Auth(BCNhapKho, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
