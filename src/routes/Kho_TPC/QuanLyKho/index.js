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

const DieuChuyen = asyncComponent(() => import("./DieuChuyen/DieuChuyen"));
const DieuChuyenForm = asyncComponent(() =>
  import("./DieuChuyen/DieuChuyenForm")
);

const ThanhLy = asyncComponent(() => import("./ThanhLy/ThanhLy"));
const ThanhLyForm = asyncComponent(() => import("./ThanhLy/ThanhLyForm"));

const KiemKe = asyncComponent(() => import("./KiemKe/KiemKe"));
const KiemKeForm = asyncComponent(() => import("./KiemKe/KiemKeForm"));

const TheKho = asyncComponent(() => import("./TheKho/TheKho"));
const TheKhoForm = asyncComponent(() => import("./TheKho/TheKhoForm"));
const SoDuDauKy = asyncComponent(() => import("./SoDuDauKy/SoDuDauKy"));
const SoDuDauKyForm = asyncComponent(() => import("./SoDuDauKy/SoDuDauKyForm"));
const LayoutKho = asyncComponent(() => import("./LayoutKho/LayoutKho"));
const ViTriLuu = asyncComponent(() => import("./ViTriLuu/ViTriLuu"));
const ChuyenQuyTrinh = asyncComponent(() =>
  import("./ChuyenQuyTrinh/ChuyenQuyTrinh")
);
const ChuyenQuyTrinhForm = asyncComponent(() =>
  import("./ChuyenQuyTrinh/ChuyenQuyTrinhForm")
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
        path={`${match.url}/dieu-chuyen`}
        exact
        component={Auth(DieuChuyen, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/them-moi`}
        exact
        component={Auth(DieuChuyenForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/chinh-sua`}
        exact
        component={Auth(DieuChuyenForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/chi-tiet`}
        exact
        component={Auth(DieuChuyenForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly`}
        exact
        component={Auth(ThanhLy, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/them-moi`}
        exact
        component={Auth(ThanhLyForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/chinh-sua`}
        exact
        component={Auth(ThanhLyForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/chi-tiet`}
        exact
        component={Auth(ThanhLyForm, menus, pathname, permission)}
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
    </Switch>
  );
};

export default App;
