import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Kho thành phẩm */
const KhoThanhPham = asyncComponent(() =>
  import("./KhoThanhPham/KhoThanhPham")
);

/* Layout kho thành phẩm */
const LayoutKhoThanhPham = asyncComponent(() =>
  import("./LayoutKhoThanhPham/LayoutKhoThanhPham")
);

/* Điều chuyển thành phẩm */
const PhieuDieuChuyenThanhPham = asyncComponent(() =>
  import("./PhieuDieuChuyenThanhPham/PhieuDieuChuyenThanhPham")
);
const PhieuDieuChuyenThanhPhamForm = asyncComponent(() =>
  import("./PhieuDieuChuyenThanhPham/PhieuDieuChuyenThanhPhamForm")
);

/* Thanh lý thành phẩm */
const PhieuThanhLyThanhPham = asyncComponent(() =>
  import("./PhieuThanhLyThanhPham/PhieuThanhLyThanhPham")
);
const PhieuThanhLyThanhPhamForm = asyncComponent(() =>
  import("./PhieuThanhLyThanhPham/PhieuThanhLyThanhPhamForm")
);

/* Nhập kho thành phẩm */
const PhieuNhapKhoThanhPham = asyncComponent(() =>
  import("./PhieuNhapKhoThanhPham/PhieuNhapKhoThanhPham")
);
const PhieuNhapKhoThanhPhamForm = asyncComponent(() =>
  import("./PhieuNhapKhoThanhPham/PhieuNhapKhoThanhPhamForm")
);

/* Xuất kho thành phẩm */
const PhieuXuatKhoThanhPham = asyncComponent(() =>
  import("./PhieuXuatKhoThanhPham/PhieuXuatKhoThanhPham")
);
const PhieuXuatKhoThanhPhamForm = asyncComponent(() =>
  import("./PhieuXuatKhoThanhPham/PhieuXuatKhoThanhPhamForm")
);

/* Phiếu kiểm kê thành phẩm */
const PhieuKiemKeThanhPham = asyncComponent(() =>
  import("./PhieuKiemKeThanhPham/PhieuKiemKeThanhPham")
);
const PhieuKiemKeThanhPhamForm = asyncComponent(() =>
  import("./PhieuKiemKeThanhPham/PhieuKiemKeThanhPhamForm")
);

/* Biên bản giao xe*/
const BienBanGiaoXe = asyncComponent(() =>
  import("./BienBanGiaoXe/BienBanGiaoXe")
);
const BienBanGiaoXeForm = asyncComponent(() =>
  import("./BienBanGiaoXe/BienBanGiaoXeForm")
);
const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Kho thành phẩm */}
      <Route
        path={`${match.url}/kho-thanh-pham`}
        exact
        component={Auth(KhoThanhPham, menus, pathname, permission)}
      />

      {/* Layout kho thành phẩm */}
      <Route
        path={`${match.url}/layout-kho-thanh-pham`}
        exact
        component={Auth(LayoutKhoThanhPham, menus, pathname, permission)}
      />

      {/* Điều chuyển thành phẩm */}
      <Route
        path={`${match.url}/phieu-dieu-chuyen-thanh-pham`}
        exact
        component={Auth(PhieuDieuChuyenThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dieu-chuyen-thanh-pham/them-moi`}
        exact
        component={Auth(
          PhieuDieuChuyenThanhPhamForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-dieu-chuyen-thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(
          PhieuDieuChuyenThanhPhamForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-dieu-chuyen-thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(
          PhieuDieuChuyenThanhPhamForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-dieu-chuyen-thanh-pham/:id/xac-nhan`}
        exact
        component={Auth(
          PhieuDieuChuyenThanhPhamForm,
          menus,
          pathname,
          permission
        )}
      />

      {/* Thanh lý thành phẩm */}
      <Route
        path={`${match.url}/phieu-thanh-ly-thanh-pham`}
        exact
        component={Auth(PhieuThanhLyThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-thanh-ly-thanh-pham/them-moi`}
        exact
        component={Auth(PhieuThanhLyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-thanh-ly-thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(PhieuThanhLyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-thanh-ly-thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(PhieuThanhLyThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-thanh-ly-thanh-pham/:id/xac-nhan`}
        exact
        component={Auth(PhieuThanhLyThanhPhamForm, menus, pathname, permission)}
      />

      {/* Nhập kho thành phẩm */}
      <Route
        path={`${match.url}/phieu-nhap-kho-thanh-pham`}
        exact
        component={Auth(PhieuNhapKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhap-kho-thanh-pham/them-moi`}
        exact
        component={Auth(PhieuNhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhap-kho-thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(PhieuNhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhap-kho-thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(PhieuNhapKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhap-kho-thanh-pham/:id/xac-nhan`}
        exact
        component={Auth(PhieuNhapKhoThanhPhamForm, menus, pathname, permission)}
      />

      {/* Xuất kho thành phẩm */}
      <Route
        path={`${match.url}/phieu-xuat-kho-thanh-pham`}
        exact
        component={Auth(PhieuXuatKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-thanh-pham/them-moi`}
        exact
        component={Auth(PhieuXuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(PhieuXuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(PhieuXuatKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-thanh-pham/:id/xac-nhan`}
        exact
        component={Auth(PhieuXuatKhoThanhPhamForm, menus, pathname, permission)}
      />

      {/* Phiếu kiểm kê thành phẩm */}
      <Route
        path={`${match.url}/phieu-kiem-ke-thanh-pham`}
        exact
        component={Auth(PhieuKiemKeThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke-thanh-pham/them-moi`}
        exact
        component={Auth(PhieuKiemKeThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke-thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(PhieuKiemKeThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke-thanh-pham/:id/chi-tiet`}
        exact
        component={Auth(PhieuKiemKeThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke-thanh-pham/:id/duyet`}
        exact
        component={Auth(PhieuKiemKeThanhPhamForm, menus, pathname, permission)}
      />
      {/* Biên bản giao xe */}
      <Route
        path={`${match.url}/bien-ban-giao-xe`}
        exact
        component={Auth(BienBanGiaoXe, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bien-ban-giao-xe/them-moi`}
        exact
        component={Auth(BienBanGiaoXeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bien-ban-giao-xe/:id/chinh-sua`}
        exact
        component={Auth(BienBanGiaoXeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bien-ban-giao-xe/:id/chi-tiet`}
        exact
        component={Auth(BienBanGiaoXeForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
