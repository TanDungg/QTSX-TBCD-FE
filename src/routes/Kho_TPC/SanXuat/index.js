import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const DinhMucVatTu = asyncComponent(() =>
  import("./DinhMucVatTu/DinhMucVatTu")
);
const DinhMucVatTuForm = asyncComponent(() =>
  import("./DinhMucVatTu/DinhMucVatTuForm")
);

// const DonVi = asyncComponent(() => import("./DonVi/DonVi"));
// const DonViForm = asyncComponent(() => import("./DonVi/DonViForm"));

// const BoPhan = asyncComponent(() => import("./BoPhan/BoPhan"));
// const BoPhanForm = asyncComponent(() => import("./BoPhan/BoPhanForm"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/dinh-muc-vat-tu`}
        exact
        component={Auth(DinhMucVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dinh-muc-vat-tu/them-moi`}
        exact
        component={Auth(DinhMucVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dinh-muc-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(DinhMucVatTuForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
