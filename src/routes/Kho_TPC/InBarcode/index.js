import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const NotFound = asyncComponent(() => import("../../NotFound/NotFound"));

const CauTrucKho = asyncComponent(() => import("./CauTrucKho/CauTrucKho"));
const CauTrucKhoThanhPham = asyncComponent(() =>
  import("./CauTrucKhoThanhPham/CauTrucKhoThanhPham")
);
const SanPham = asyncComponent(() => import("./SanPham/SanPham"));
const VatTu = asyncComponent(() => import("./VatTu/VatTu"));
const VatTuForm = asyncComponent(() => import("./VatTu/VatTuForm"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/cau-truc-kho-vat-tu`}
        exact
        component={Auth(CauTrucKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cau-truc-kho-thanh-pham`}
        exact
        component={Auth(CauTrucKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vat-tu`}
        exact
        component={Auth(VatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vat-tu/them-moi`}
        exact
        component={Auth(VatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vat-tu/:id/chinh-sua`}
        exact
        component={Auth(VatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/san-pham`}
        exact
        component={Auth(SanPham, menus, pathname, permission)}
      />
      <Route path="*" component={Auth(NotFound, menus, pathname)} />
    </Switch>
  );
};

export default App;
