import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const ThongTinVatTu = asyncComponent(() =>
  import("./ThongTinVatTu/ThongTinVatTu")
);
const ThongTinVatTuForm = asyncComponent(() =>
  import("./ThongTinVatTu/ThongTinVatTuForm")
);
const PhieuDeNghiCapVatTu = asyncComponent(() =>
  import("./PhieuDeNghiCapVatTu/PhieuDeNghiCapVatTu")
);
const PhieuDeNghiCapVatTuForm = asyncComponent(() =>
  import("./PhieuDeNghiCapVatTu/PhieuDeNghiCapVatTuForm")
);
const NhapKhoVatTu = asyncComponent(() => import("./NhapKho/VatTu/VatTu"));
const NhapKhoThanhPham = asyncComponent(() =>
  import("./NhapKho/ThanhPham/ThanhPham")
);
const XuatKhoVatTu = asyncComponent(() => import("./XuatKho/VatTu/VatTu"));
const XuatKhoThanhPham = asyncComponent(() =>
  import("./XuatKho/ThanhPham/ThanhPham")
);
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/thong-tin-vat-tu`}
        exact
        component={Auth(ThongTinVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thong-tin-vat-tu/them-moi`}
        exact
        component={Auth(ThongTinVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thong-tin-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(ThongTinVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-cap-vat-tu`}
        exact
        component={Auth(PhieuDeNghiCapVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-cap-vat-tu/them-moi`}
        exact
        component={Auth(PhieuDeNghiCapVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-cap-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(PhieuDeNghiCapVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/vat-tu`}
        exact
        component={Auth(NhapKhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/thanh-pham`}
        exact
        component={Auth(NhapKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/vat-tu`}
        exact
        component={Auth(XuatKhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/thanh-pham`}
        exact
        component={Auth(XuatKhoThanhPham, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
