import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "src/helpers/Auth";

/* Phiếu yêu cầu */
const PhieuYeuCau = asyncComponent(() => import("./PhieuYeuCau/PhieuYeuCau"));
const PhieuYeuCauForm = asyncComponent(() =>
  import("./PhieuYeuCau/PhieuYeuCauForm")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Phiếu yêu cầu */}
      <Route
        path={`${match.url}`}
        exact
        component={Auth(PhieuYeuCau, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/them-moi`}
        exact
        component={Auth(PhieuYeuCauForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/:id/chinh-sua`}
        exact
        component={Auth(PhieuYeuCauForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
