import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const CauTrucKho = asyncComponent(() => import("./CauTrucKho/CauTrucKho"));
const Ke = asyncComponent(() => import("./Ke/Ke"));
const VatTu = asyncComponent(() => import("./VatTu/VatTu"));
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/cau-truc-kho`}
        exact
        component={Auth(CauTrucKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke`}
        exact
        component={Auth(Ke, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vat-tu`}
        exact
        component={Auth(VatTu, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
