import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const NotFound = asyncComponent(() => import("../../NotFound/NotFound"));

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
const XuatKhoVatTuForm = asyncComponent(() =>
  import("./XuatKho/VatTu/VatTuForm")
);
const XuatKhoThanhPham = asyncComponent(() =>
  import("./XuatKho/ThanhPham/ThanhPham")
);
const XuatKhoThanhPhamForm = asyncComponent(() =>
  import("./XuatKho/ThanhPham/ThanhPhamForm")
);

const DinhMucTonKho = asyncComponent(() =>
  import("./DinhMucTonKho/DinhMucTonKho")
);
const DinhMucTonKhoForm = asyncComponent(() =>
  import("./DinhMucTonKho/DinhMucTonKhoForm")
);

const DieuChuyenVatTu = asyncComponent(() =>
  import("./DieuChuyen/VatTu/DieuChuyenVatTu")
);
const DieuChuyenVatTuForm = asyncComponent(() =>
  import("./DieuChuyen/VatTu/DieuChuyenVatTuForm")
);
const DieuChuyenThanhPham = asyncComponent(() =>
  import("./DieuChuyen/ThanhPham/DieuChuyenThanhPham")
);
const DieuChuyenThanhPhamForm = asyncComponent(() =>
  import("./DieuChuyen/ThanhPham/DieuChuyenThanhPhamForm")
);
const ThanhLyVatTu = asyncComponent(() =>
  import("./ThanhLy/VatTu/ThanhLyVatTu")
);
const ThanhLyVatTuForm = asyncComponent(() =>
  import("./ThanhLy/VatTu/ThanhLyVatTuForm")
);
const ThanhLyThanhPham = asyncComponent(() =>
  import("./ThanhLy/ThanhPham/ThanhLyThanhPham")
);
const ThanhLyThanhPhamForm = asyncComponent(() =>
  import("./ThanhLy/ThanhPham/ThanhLyThanhPhamForm")
);
const KiemKe = asyncComponent(() => import("./KiemKe/KiemKe"));
const KiemKeForm = asyncComponent(() => import("./KiemKe/KiemKeForm"));

const SoDuDauKyVatTu = asyncComponent(() =>
  import("./SoDuDauKy/VatTu/SoDuDauKyVatTu")
);
const SoDuDauKyVatTuForm = asyncComponent(() =>
  import("./SoDuDauKy/VatTu/SoDuDauKyVatTuForm")
);
const SoDuDauKyThanhPham = asyncComponent(() =>
  import("./SoDuDauKy/ThanhPham/SoDuDauKyThanhPham")
);
const SoDuDauKyThanhPhamForm = asyncComponent(() =>
  import("./SoDuDauKy/ThanhPham/SoDuDauKyThanhPhamForm")
);
const LayoutKhoVatTu = asyncComponent(() =>
  import("./LayoutKhoVatTu/LayoutKhoVatTu")
);
const LayoutKhoThanhPham = asyncComponent(() =>
  import("./LayoutKhoThanhPham/LayoutKhoThanhPham")
);

const KhoVatTu = asyncComponent(() => import("./KhoVatTu/KhoVatTu"));
const KhoThanhPham = asyncComponent(() =>
  import("./KhoThanhPham/KhoThanhPham")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
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
        path={`${match.url}/phieu-de-nghi-cap-vat-tu/:id/chi-tiet`}
        exact
        component={Auth(PhieuDeNghiCapVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-de-nghi-cap-vat-tu/:id/xac-nhan`}
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
      />{" "}
      <Route
        path={`${match.url}/nhap-kho/vat-tu/:id/xac-nhan`}
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
        path={`${match.url}/nhap-kho/thanh-pham/:id/xac-nhan`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/thanh-pham/:id/chinh-sua`}
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
        path={`${match.url}/xuat-kho/vat-tu/them-moi`}
        exact
        component={Auth(XuatKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/vat-tu/:id/chinh-sua`}
        exact
        component={Auth(XuatKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/vat-tu/:id/xac-nhan`}
        exact
        component={Auth(XuatKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/vat-tu/:id/chi-tiet`}
        exact
        component={Auth(XuatKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/thanh-pham`}
        exact
        component={Auth(XuatKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/thanh-pham/them-moi`}
        exact
        component={Auth(XuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(XuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(XuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/thanh-pham/:id/xac-nhan`}
        exact
        component={Auth(XuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/vat-tu`}
        exact
        component={Auth(DieuChuyenVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/vat-tu/them-moi`}
        exact
        component={Auth(DieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/vat-tu/:id/chinh-sua`}
        exact
        component={Auth(DieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/vat-tu/:id/chi-tiet`}
        exact
        component={Auth(DieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/vat-tu/:id/xac-nhan`}
        exact
        component={Auth(DieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/thanh-pham`}
        exact
        component={Auth(DieuChuyenThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/thanh-pham/them-moi`}
        exact
        component={Auth(DieuChuyenThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(DieuChuyenThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(DieuChuyenThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/thanh-pham/:id/duyet`}
        exact
        component={Auth(DieuChuyenThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/vat-tu`}
        exact
        component={Auth(ThanhLyVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/vat-tu/them-moi`}
        exact
        component={Auth(ThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/vat-tu/:id/chinh-sua`}
        exact
        component={Auth(ThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/vat-tu/:id/chi-tiet`}
        exact
        component={Auth(ThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/thanh-pham`}
        exact
        component={Auth(ThanhLyThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/thanh-pham/them-moi`}
        exact
        component={Auth(ThanhLyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(ThanhLyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(ThanhLyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kiem-ke`}
        exact
        component={Auth(KiemKe, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kiem-ke/them-moi`}
        exact
        component={Auth(KiemKeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kiem-ke/:id/chinh-sua`}
        exact
        component={Auth(KiemKeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kiem-ke/:id/chi-tiet`}
        exact
        component={Auth(KiemKeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kiem-ke/:id/xac-nhan`}
        exact
        component={Auth(KiemKeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/vat-tu`}
        exact
        component={Auth(SoDuDauKyVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/vat-tu/them-moi`}
        exact
        component={Auth(SoDuDauKyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/vat-tu/:id/chinh-sua`}
        exact
        component={Auth(SoDuDauKyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/vat-tu/:id/chi-tiet`}
        exact
        component={Auth(SoDuDauKyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/thanh-pham`}
        exact
        component={Auth(SoDuDauKyThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/thanh-pham/them-moi`}
        exact
        component={Auth(SoDuDauKyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(SoDuDauKyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-du-dau-ky/thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(SoDuDauKyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/layout-kho-vat-tu`}
        exact
        component={Auth(LayoutKhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/layout-kho-thanh-pham`}
        exact
        component={Auth(LayoutKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dinh-muc-ton-kho`}
        exact
        component={Auth(DinhMucTonKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dinh-muc-ton-kho/them-moi`}
        exact
        component={Auth(DinhMucTonKhoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dinh-muc-ton-kho/:id/chinh-sua`}
        exact
        component={Auth(DinhMucTonKhoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kho-vat-tu`}
        exact
        component={Auth(KhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kho-thanh-pham`}
        exact
        component={Auth(KhoThanhPham, menus, pathname, permission)}
      />
      <Route path="*" component={Auth(NotFound, menus, pathname)} />
    </Switch>
  );
};

export default App;
