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
    </Switch>
  );
};

export default App;
