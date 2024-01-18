import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const NotFound = asyncComponent(() => import("../../NotFound/NotFound"));

const ThietBi = asyncComponent(() => import("./DanhMucThietBi/DanhMucThietBi"));
const ThietBiForm = asyncComponent(() =>
  import("./DanhMucThietBi/DanhMucThietBiForm")
);

const TapDoan = asyncComponent(() => import("./TapDoan/TapDoan"));
const TapDoanForm = asyncComponent(() => import("./TapDoan/TapDoanForm"));

const DonVi = asyncComponent(() => import("./DonVi/DonVi"));
const DonViForm = asyncComponent(() => import("./DonVi/DonViForm"));

const BoPhan = asyncComponent(() => import("./BoPhan/BoPhan"));
const BoPhanForm = asyncComponent(() => import("./BoPhan/BoPhanForm"));

const PhongBan = asyncComponent(() => import("./PhongBan/PhongBan"));
const PhongBanForm = asyncComponent(() => import("./PhongBan/PhongBanForm"));

const DonViTinh = asyncComponent(() => import("./DonViTinh/DonViTinh"));
const DonViTinhForm = asyncComponent(() => import("./DonViTinh/DonViTinhForm"));

const ChucVu = asyncComponent(() => import("./ChucVu/ChucVu"));
const ChucVuForm = asyncComponent(() => import("./ChucVu/ChucVuForm"));

const PhanMem = asyncComponent(() => import("./PhanMem/PhanMem"));
const PhanMemForm = asyncComponent(() => import("./PhanMem/PhanMemForm"));

// const Home = asyncComponent(() => import("../Home"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/thiet-bi`}
        exact
        component={Auth(ThietBi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thiet-bi/them-moi`}
        exact
        component={Auth(ThietBiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thiet-bi/:id/chinh-sua`}
        exact
        component={Auth(ThietBiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tap-doan`}
        exact
        component={Auth(TapDoan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tap-doan/them-moi`}
        exact
        component={Auth(TapDoanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tap-doan/:id/chinh-sua`}
        exact
        component={Auth(TapDoanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi`}
        exact
        component={Auth(DonVi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi/them-moi`}
        exact
        component={Auth(DonViForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi/:id/chinh-sua`}
        exact
        component={Auth(DonViForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ban-phong`}
        exact
        component={Auth(PhongBan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ban-phong/them-moi`}
        exact
        component={Auth(PhongBanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ban-phong/:id/chinh-sua`}
        exact
        component={Auth(PhongBanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bo-phan`}
        exact
        component={Auth(BoPhan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bo-phan/them-moi`}
        exact
        component={Auth(BoPhanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bo-phan/:id/chinh-sua`}
        exact
        component={Auth(BoPhanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-vu`}
        exact
        component={Auth(ChucVu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-vu/them-moi`}
        exact
        component={Auth(ChucVuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuc-vu/:id/chinh-sua`}
        exact
        component={Auth(ChucVuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phan-mem`}
        exact
        component={Auth(PhanMem, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phan-mem/them-moi`}
        exact
        component={Auth(PhanMemForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phan-mem/:id/chinh-sua`}
        exact
        component={Auth(PhanMemForm, menus, pathname, permission)}
      />

      <Route
        path={`${match.url}/don-vi-tinh`}
        exact
        component={Auth(DonViTinh, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi-tinh/them-moi`}
        exact
        component={Auth(DonViTinhForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/don-vi-tinh/:id/chinh-sua`}
        exact
        component={Auth(DonViTinhForm, menus, pathname, permission)}
      />
      <Route path="*" component={Auth(NotFound, menus, pathname)} />
    </Switch>
  );
};

export default App;
