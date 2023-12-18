import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const KhoThanhPham = asyncComponent(() =>
  import("./KhoThanhPham/KhoThanhPham")
);
const LayoutKhoThanhPham = asyncComponent(() =>
  import("./LayoutKhoThanhPham/LayoutKhoThanhPham")
);
/* Điều chuyển thành phẩm */
const DieuChuyenSanPham = asyncComponent(() =>
  import("./DieuChuyen/DieuChuyen")
);
const DieuChuyenSanPhamForm = asyncComponent(() =>
  import("./DieuChuyen/DieuChuyenForm")
);
const ThanhLySanPham = asyncComponent(() => import("./ThanhLy/ThanhLySanPham"));
const ThanhLySanPhamForm = asyncComponent(() =>
  import("./ThanhLy/ThanhLySanPhamForm")
);

/* Nhập kho thành phẩm */
const NhapKhoThanhPham = asyncComponent(() =>
  import("./NhapKhoThanhPham/NhapKhoThanhPham")
);
const NhapKhoThanhPhamForm = asyncComponent(() =>
  import("./NhapKhoThanhPham/NhapKhoThanhPhamForm")
);

/* Xuất kho thành phẩm */
const XuatKhoThanhPham = asyncComponent(() =>
  import("./XuatKhoThanhPham/XuatKhoThanhPham")
);
const XuatKhoThanhPhamForm = asyncComponent(() =>
  import("./XuatKhoThanhPham/XuatKhoThanhPhamForm")
);

/* Phiếu kiểm kê thành phẩm */
const PhieuKiemKe = asyncComponent(() => import("./PhieuKiemKe/PhieuKiemKe"));
const PhieuKiemKeForm = asyncComponent(() =>
  import("./PhieuKiemKe/PhieuKiemKeForm")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      <Route
        path={`${match.url}/kho-thanh-pham`}
        exact
        component={Auth(KhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/layout-kho-thanh-pham`}
        exact
        component={Auth(LayoutKhoThanhPham, menus, pathname, permission)}
      />
      {/* Điều chuyển thành phẩm */}
      <Route
        path={`${match.url}/dieu-chuyen`}
        exact
        component={Auth(DieuChuyenSanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/them-moi`}
        exact
        component={Auth(DieuChuyenSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/chinh-sua`}
        exact
        component={Auth(DieuChuyenSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/chi-tiet`}
        exact
        component={Auth(DieuChuyenSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/dieu-chuyen/:id/xac-nhan`}
        exact
        component={Auth(DieuChuyenSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly`}
        exact
        component={Auth(ThanhLySanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/them-moi`}
        exact
        component={Auth(ThanhLySanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/chinh-sua`}
        exact
        component={Auth(ThanhLySanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/chi-tiet`}
        exact
        component={Auth(ThanhLySanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thanh-ly/:id/xac-nhan`}
        exact
        component={Auth(ThanhLySanPhamForm, menus, pathname, permission)}
      />
      {/* Nhập kho thành phẩm */}
      <Route
        path={`${match.url}/nhap-kho`}
        exact
        component={Auth(NhapKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/them-moi`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/:id/chinh-sua`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/:id/chi-tiet`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhap-kho/:id/xac-nhan`}
        exact
        component={Auth(NhapKhoThanhPhamForm, menus, pathname, permission)}
      />

      {/* Xuất kho thành phẩm */}
      <Route
        path={`${match.url}/xuat-kho`}
        exact
        component={Auth(XuatKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/them-moi`}
        exact
        component={Auth(XuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/:id/chinh-sua`}
        exact
        component={Auth(XuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/:id/chi-tiet`}
        exact
        component={Auth(XuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/xuat-kho/:id/xac-nhan`}
        exact
        component={Auth(XuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      {/* Phiếu kiểm kê thành phẩm */}
      <Route
        path={`${match.url}/phieu-kiem-ke`}
        exact
        component={Auth(PhieuKiemKe, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke/them-moi`}
        exact
        component={Auth(PhieuKiemKeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke/:id/chinh-sua`}
        exact
        component={Auth(PhieuKiemKeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke/:id/chi-tiet`}
        exact
        component={Auth(PhieuKiemKeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke/:id/xac-nhan`}
        exact
        component={Auth(PhieuKiemKeForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
