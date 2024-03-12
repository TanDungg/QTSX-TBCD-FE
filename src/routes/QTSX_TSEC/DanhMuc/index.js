import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

/* Tập đoàn */
const TapDoan = asyncComponent(() => import("./TapDoan/TapDoan"));
const TapDoanForm = asyncComponent(() => import("./TapDoan/TapDoanForm"));

/* Đơn vị */
const DonVi = asyncComponent(() => import("./DonVi/DonVi"));
const DonViForm = asyncComponent(() => import("./DonVi/DonViForm"));

/* Phòng ban */
const PhongBan = asyncComponent(() => import("./PhongBan/PhongBan"));
const PhongBanForm = asyncComponent(() => import("./PhongBan/PhongBanForm"));

/* Bộ phận */
const BoPhan = asyncComponent(() => import("./BoPhan/BoPhan"));
const BoPhanForm = asyncComponent(() => import("./BoPhan/BoPhanForm"));

/* Chức vụ */
const ChucVu = asyncComponent(() => import("./ChucVu/ChucVu"));
const ChucVuForm = asyncComponent(() => import("./ChucVu/ChucVuForm"));

/* Đơn vị tính */
const DonViTinh = asyncComponent(() => import("./DonViTinh/DonViTinh"));
const DonViTinhForm = asyncComponent(() => import("./DonViTinh/DonViTinhForm"));

/* Loại sản phẩm */
const LoaiSanPham = asyncComponent(() => import("./LoaiSanPham/LoaiSanPham"));
const LoaiSanPhamForm = asyncComponent(() =>
  import("./LoaiSanPham/LoaiSanPhamForm")
);

/* Sản phẩm */
const SanPham = asyncComponent(() => import("./SanPham/SanPham"));
const SanPhamForm = asyncComponent(() => import("./SanPham/SanPhamForm"));

/* Công đoạn */
const CongDoan = asyncComponent(() => import("./CongDoan/CongDoan"));
const CongDoanForm = asyncComponent(() => import("./CongDoan/CongDoanForm"));



/* Chuyền */
const Chuyen = asyncComponent(() => import("./Chuyen/Chuyen"));
const ChuyenForm = asyncComponent(() => import("./Chuyen/ChuyenForm"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Tập đoàn */}
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

      {/* Đơn vị */}
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

      {/* Phòng ban */}
      <Route
        path={`${match.url}/phong-ban`}
        exact
        component={Auth(PhongBan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phong-ban/them-moi`}
        exact
        component={Auth(PhongBanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phong-ban/:id/chinh-sua`}
        exact
        component={Auth(PhongBanForm, menus, pathname, permission)}
      />

      {/* Bộ phận */}
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

       {/* Chức vụ */}
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

      {/* Đơn vị tính */}
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

      {/* Loại sản phẩm */}
      <Route
        path={`${match.url}/loai-san-pham`}
        exact
        component={Auth(LoaiSanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-san-pham/them-moi`}
        exact
        component={Auth(LoaiSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-san-pham/:id/chinh-sua`}
        exact
        component={Auth(LoaiSanPhamForm, menus, pathname, permission)}
      />

      {/* Sản phẩm */}
      <Route
        path={`${match.url}/san-pham`}
        exact
        component={Auth(SanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/san-pham/them-moi`}
        exact
        component={Auth(SanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/san-pham/:id/chinh-sua`}
        exact
        component={Auth(SanPhamForm, menus, pathname, permission)}
      />

      {/* Công đoạn */}
      <Route
        path={`${match.url}/cong-doan`}
        exact
        component={Auth(CongDoan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cong-doan/them-moi`}
        exact
        component={Auth(CongDoanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cong-doan/:id/chinh-sua`}
        exact
        component={Auth(CongDoanForm, menus, pathname, permission)}
      />

      {/* Chuyền */}
      <Route
        path={`${match.url}/chuyen`}
        exact
        component={Auth(Chuyen, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen/them-moi`}
        exact
        component={Auth(ChuyenForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chuyen/:id/chinh-sua`}
        exact
        component={Auth(ChuyenForm, menus, pathname, permission)}
      />

      
    </Switch>
  );
};

export default App;
