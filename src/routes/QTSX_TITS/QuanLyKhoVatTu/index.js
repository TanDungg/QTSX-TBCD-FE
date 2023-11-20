import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const NhapKhoVatTu = asyncComponent(() =>
  import("./NhapKhoVatTu/NhapKhoVatTu")
);
const NhapKhoVatTuForm = asyncComponent(() =>
  import("./NhapKhoVatTu/NhapKhoVatTuForm")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Theo dõi đơn hàng */}
      <Route
        path={`${match.url}/nhap-kho`}
        exact
        component={Auth(NhapKhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/them-moi`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/:id/chinh-sua`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/:id/chi-tiet`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
