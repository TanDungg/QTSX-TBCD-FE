import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

//Quy trình công nghệ
const QuyTrinhCongNghe = asyncComponent(() =>
  import("./QuyTrinhCongNghe/QuyTrinhCongNghe")
);
const QuyTrinhCongNgheForm = asyncComponent(() =>
  import("./QuyTrinhCongNghe/QuyTrinhCongNgheForm")
);
const BOM = asyncComponent(() => import("./BOM/BOM"));
const BOMForm = asyncComponent(() => import("./BOM/BOMForm"));
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Quy trình công nghệ */}
      <Route
        path={`${match.url}/quy-trinh-cong-nghe`}
        exact
        component={Auth(QuyTrinhCongNghe, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-cong-nghe/them-moi`}
        exact
        component={Auth(QuyTrinhCongNgheForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-cong-nghe/:id/chinh-sua`}
        exact
        component={Auth(QuyTrinhCongNgheForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom`}
        exact
        component={Auth(BOM, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom/them-moi`}
        exact
        component={Auth(BOMForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom/:id/chinh-sua`}
        exact
        component={Auth(BOMForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
