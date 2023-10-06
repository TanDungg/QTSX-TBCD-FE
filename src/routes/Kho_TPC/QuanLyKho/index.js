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
const NhapKhoVatTuForm = asyncComponent(() =>
  import("./NhapKho/VatTu/VatTuForm")
);

const NhapKhoCKD = asyncComponent(() => import("./NhapKho/CKD/CKD"));
const NhapKhoCKDForm = asyncComponent(() => import("./NhapKho/CKD/CKDForm"));

const NhapKhoThanhPham = asyncComponent(() =>
  import("./NhapKho/ThanhPham/ThanhPham")
);
const NhapKhoThanhPhamForm = asyncComponent(() =>
  import("./NhapKho/ThanhPham/ThanhPhamForm")
);
const XuatKhoVatTu = asyncComponent(() => import("./XuatKho/VatTu/VatTu"));
const XuatKhoThanhPham = asyncComponent(() =>
  import("./XuatKho/ThanhPham/ThanhPham")
);
const DieuChuyen = asyncComponent(() => import("./DieuChuyen/DieuChuyen"));
const ThanhLy = asyncComponent(() => import("./ThanhLy/ThanhLy"));
const TheKho = asyncComponent(() => import("./TheKho/TheKho"));
const TheKhoForm = asyncComponent(() => import("./TheKho/TheKhoForm"));
const SoDuDauKy = asyncComponent(() => import("./SoDuDauKy/SoDuDauKy"));
const SoDuDauKyForm = asyncComponent(() => import("./SoDuDauKy/SoDuDauKyForm"));
const LayoutKho = asyncComponent(() => import("./LayoutKho/LayoutKho"));
const ViTriLuu = asyncComponent(() => import("./ViTriLuu/ViTriLuu"));

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
        path={`${match.url}/nhap-kho/vat-tu/them-moi`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/vat-tu/:id/chinh-sua`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/vat-tu/:id/chi-tiet`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/thanh-pham`}
        exact
        component={Auth(NhapKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/thanh-pham/them-moi`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/ckd`}
        exact
        component={Auth(NhapKhoCKD, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/ckd/them-moi`}
        exact
        component={Auth(NhapKhoCKDForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/ckd/:id/chinh-sua`}
        exact
        component={Auth(NhapKhoCKDForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/ckd/:id/chi-tiet`}
        exact
        component={Auth(NhapKhoCKDForm, menus, pathname, permission)}
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
      <Route
        path={`${match.url}/dieu-chuyen`}
        exact
        component={Auth(DieuChuyen, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly`}
        exact
        component={Auth(ThanhLy, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/the-kho`}
        exact
        component={Auth(TheKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/the-kho/them-moi`}
        exact
        component={Auth(TheKhoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/the-kho/:id/chinh-sua`}
        exact
        component={Auth(TheKhoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky`}
        exact
        component={Auth(SoDuDauKy, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/them-moi`}
        exact
        component={Auth(SoDuDauKyForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/:id/chinh-sua`}
        exact
        component={Auth(SoDuDauKyForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/layout-kho`}
        exact
        component={Auth(LayoutKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vi-tri-luu`}
        exact
        component={Auth(ViTriLuu, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;