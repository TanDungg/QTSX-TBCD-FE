import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

//Quy trình sản xuất
const QuyTrinhSanXuat = asyncComponent(() =>
  import("./QuyTrinhSanXuat/QuyTrinhSanXuat")
);
const QuyTrinhSanXuatForm = asyncComponent(() =>
  import("./QuyTrinhSanXuat/QuyTrinhSanXuatForm")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Quy trình sản xuất */}
      <Route
        path={`${match.url}/quy-trinh-san-xuat`}
        exact
        component={Auth(QuyTrinhSanXuat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/them-moi`}
        exact
        component={Auth(QuyTrinhSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/:id/chinh-sua`}
        exact
        component={Auth(QuyTrinhSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/:id/chi-tiet`}
        exact
        component={Auth(QuyTrinhSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/:id/xac-nhan`}
        exact
        component={Auth(QuyTrinhSanXuatForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
