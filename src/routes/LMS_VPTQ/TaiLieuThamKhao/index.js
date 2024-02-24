import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Tài liệu tham khảo */
const TaiLieuThamKhao = asyncComponent(() =>
  import("./TaiLieuThamKhao/TaiLieuThamKhao")
);
const TaiLieuThamKhaoForm = asyncComponent(() =>
  import("./TaiLieuThamKhao/TaiLieuThamKhaoForm")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Tài liệu tham khảo */}
      <Route
        path={`${match.url}`}
        exact
        component={Auth(TaiLieuThamKhao, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/them-moi`}
        exact
        component={Auth(TaiLieuThamKhaoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/:id/chinh-sua`}
        exact
        component={Auth(TaiLieuThamKhaoForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
