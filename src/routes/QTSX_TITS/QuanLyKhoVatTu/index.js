import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Nhập kho vật tư */
const NhapKhoVatTu = asyncComponent(() =>
  import("./NhapKhoVatTu/NhapKhoVatTu")
);
const NhapKhoVatTuForm = asyncComponent(() =>
  import("./NhapKhoVatTu/NhapKhoVatTuForm")
);

/* Đề nghị cấp vật tư phụ */
const DeNghiCapVatTuPhu = asyncComponent(() =>
  import("./PhieuYeuCauCapVatTuPhu/PhieuYeuCauCapVatTuPhu")
);
const DeNghiCapVatTuPhuForm = asyncComponent(() =>
  import("./PhieuYeuCauCapVatTuPhu/PhieuYeuCauCapVatTuPhuForm")
);

/* Xuất kho vật tư phụ */
const XuatKhoVatTuPhu = asyncComponent(() =>
  import("./XuatKhoVatTuPhu/XuatKhoVatTuPhu")
);
const XuatKhoVatTuPhuForm = asyncComponent(() =>
  import("./XuatKhoVatTuPhu/XuatKhoVatTuPhuForm")
);

/* Điều chuyển vật tư */
const DieuChuyenVatTu = asyncComponent(() =>
  import("./DieuChuyenVatTu/DieuChuyenVatTu")
);
const DieuChuyenVatTuForm = asyncComponent(() =>
  import("./DieuChuyenVatTu/DieuChuyenVatTuForm")
);
const ThanhLyVatTu = asyncComponent(() => import("./ThanhLy/ThanhLyVatTu"));
const ThanhLyVatTuForm = asyncComponent(() =>
  import("./ThanhLy/ThanhLyVatTuForm")
);
const KhoVatTu = asyncComponent(() => import("./KhoVatTu/KhoVatTu"));
const LayoutKhoVatTu = asyncComponent(() =>
  import("./LayoutKhoVatTu/LayoutKhoVatTu")
);

/* Xuất kho vật tư sản xuất */
const XuatKhoVatTuSanXuat = asyncComponent(() =>
  import("./XuatKhoVatTuSanXuat/XuatKhoVatTuSanXuat")
);
const XuatKhoVatTuSanXuatForm = asyncComponent(() =>
  import("./XuatKhoVatTuSanXuat/XuatKhoVatTuSanXuatForm")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Nhập kho vật tư */}
      <Route
        path={`${match.url}/nhap-kho`}
        exact
        component={Auth(NhapKhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/them-moi`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/:id/chinh-sua`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/:id/chi-tiet`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/:id/xac-nhan`}
        exact
        component={Auth(NhapKhoVatTuForm, menus, pathname, permission)}
      />

      {/* Đề nghị cấp vật tư phụ */}
      <Route
        path={`${match.url}/de-nghi-cap-vat-tu-phu`}
        exact
        component={Auth(DeNghiCapVatTuPhu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/de-nghi-cap-vat-tu-phu/them-moi`}
        exact
        component={Auth(DeNghiCapVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/de-nghi-cap-vat-tu-phu/:id/chinh-sua`}
        exact
        component={Auth(DeNghiCapVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/de-nghi-cap-vat-tu-phu/:id/chi-tiet`}
        exact
        component={Auth(DeNghiCapVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/de-nghi-cap-vat-tu-phu/:id/xac-nhan`}
        exact
        component={Auth(DeNghiCapVatTuPhuForm, menus, pathname, permission)}
      />

      {/* Xuất kho vật tư phụ */}
      <Route
        path={`${match.url}/xuat-kho-vat-tu-phu`}
        exact
        component={Auth(XuatKhoVatTuPhu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho-vat-tu-phu/them-moi`}
        exact
        component={Auth(XuatKhoVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho-vat-tu-phu/:id/chinh-sua`}
        exact
        component={Auth(XuatKhoVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho-vat-tu-phu/:id/chi-tiet`}
        exact
        component={Auth(XuatKhoVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho-vat-tu-phu/:id/xac-nhan`}
        exact
        component={Auth(XuatKhoVatTuPhuForm, menus, pathname, permission)}
      />

      {/* Điều chuyển vật tư */}
      <Route
        path={`${match.url}/dieu-chuyen`}
        exact
        component={Auth(DieuChuyenVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/them-moi`}
        exact
        component={Auth(DieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/chinh-sua`}
        exact
        component={Auth(DieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/chi-tiet`}
        exact
        component={Auth(DieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/xac-nhan`}
        exact
        component={Auth(DieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly`}
        exact
        component={Auth(ThanhLyVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/them-moi`}
        exact
        component={Auth(ThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/chinh-sua`}
        exact
        component={Auth(ThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/chi-tiet`}
        exact
        component={Auth(ThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/xac-nhan`}
        exact
        component={Auth(ThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/kho-vat-tu`}
        exact
        component={Auth(KhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/layout-kho-vat-tu`}
        exact
        component={Auth(LayoutKhoVatTu, menus, pathname, permission)}
      />

      {/* Xuất kho vật tư sản xuất */}
      <Route
        path={`${match.url}/xuat-kho-vat-tu-san-xuat`}
        exact
        component={Auth(XuatKhoVatTuSanXuat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho-vat-tu-san-xuat/them-moi`}
        exact
        component={Auth(XuatKhoVatTuSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho-vat-tu-san-xuat/:id/chinh-sua`}
        exact
        component={Auth(XuatKhoVatTuSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho-vat-tu-san-xuat/:id/chi-tiet`}
        exact
        component={Auth(XuatKhoVatTuSanXuatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho-vat-tu-san-xuat/:id/xac-nhan`}
        exact
        component={Auth(XuatKhoVatTuSanXuatForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
