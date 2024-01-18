import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const NotFound = asyncComponent(() => import("../../NotFound/NotFound"));

const DinhMucVatTu = asyncComponent(() =>
  import("./DinhMucVatTu/DinhMucVatTu")
);
const DinhMucVatTuForm = asyncComponent(() =>
  import("./DinhMucVatTu/DinhMucVatTuForm")
);
const NangLucSanXuat = asyncComponent(() =>
  import("./NangLucSanXuat/NangLucSanXuat")
);
const NangLucSanXuatForm = asyncComponent(() =>
  import("./NangLucSanXuat/NangLucSanXuatForm")
);
const SanPhamSanXuat = asyncComponent(() =>
  import("./SanPhamSanXuat/SanPhamSanXuat")
);

const KeHoach = asyncComponent(() => import("./KeHoach/KeHoach"));
const ImportKeHoach = asyncComponent(() => import("./KeHoach/ImportKeHoach"));
const ChuyenQuyTrinh = asyncComponent(() =>
  import("./ChuyenQuyTrinh/ChuyenQuyTrinh")
);
const ChuyenQuyTrinhForm = asyncComponent(() =>
  import("./ChuyenQuyTrinh/ChuyenQuyTrinhForm")
);
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
      <Route
        path={`${match.url}/dinh-muc-vat-tu/:id/chi-tiet`}
        exact
        component={Auth(DinhMucVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dinh-muc-vat-tu/:id/xac-nhan`}
        exact
        component={Auth(DinhMucVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke-hoach`}
        exact
        component={Auth(KeHoach, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke-hoach/import`}
        exact
        component={Auth(ImportKeHoach, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nang-luc-san-xuat`}
        exact
        component={Auth(NangLucSanXuat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nang-luc-san-xuat/them-moi`}
        exact
        component={Auth(NangLucSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nang-luc-san-xuat/:id/chinh-sua`}
        exact
        component={Auth(NangLucSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/san-pham-san-xuat`}
        exact
        component={Auth(SanPhamSanXuat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-cong-doan`}
        exact
        component={Auth(ChuyenQuyTrinh, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-cong-doan/them-moi`}
        exact
        component={Auth(ChuyenQuyTrinhForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-cong-doan/:id/chinh-sua`}
        exact
        component={Auth(ChuyenQuyTrinhForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-cong-doan/:id/chi-tiet`}
        exact
        component={Auth(ChuyenQuyTrinhForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen-cong-doan/:id/xac-nhan`}
        exact
        component={Auth(ChuyenQuyTrinhForm, menus, pathname, permission)}
      />
      <Route path="*" component={Auth(NotFound, menus, pathname)} />
    </Switch>
  );
};

export default App;
