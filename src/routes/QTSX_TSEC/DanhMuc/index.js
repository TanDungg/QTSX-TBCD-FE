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

/* Loại khách hàng */
const LoaiKhachHang = asyncComponent(() =>
  import("./LoaiKhachHang/LoaiKhachHang")
);
const LoaiKhachHangForm = asyncComponent(() =>
  import("./LoaiKhachHang/LoaiKhachHangForm")
);

/* Khách hàng */
const KhachHang = asyncComponent(() => import("./KhachHang/KhachHang"));
const KhachHangForm = asyncComponent(() => import("./KhachHang/KhachHangForm"));

/* Loại thông tin */
const LoaiThongTin = asyncComponent(() =>
  import("./LoaiThongTin/LoaiThongTin")
);
const LoaiThongTinForm = asyncComponent(() =>
  import("./LoaiThongTin/LoaiThongTinForm")
);

/* Hạng mục công việc */
const HangMucCongViec = asyncComponent(() =>
  import("./HangMucCongViec/HangMucCongViec")
);
const HangMucCongViecForm = asyncComponent(() =>
  import("./HangMucCongViec/HangMucCongViecForm")
);

/* Tiêu chí đánh giá */
const TieuChiDanhGia = asyncComponent(() =>
  import("./TieuChiDanhGia/TieuChiDanhGia")
);
const TieuChiDanhGiaForm = asyncComponent(() =>
  import("./TieuChiDanhGia/TieuChiDanhGiaForm")
);
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

      {/* Loại khách hàng */}
      <Route
        path={`${match.url}/loai-khach-hang`}
        exact
        component={Auth(LoaiKhachHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-khach-hang/them-moi`}
        exact
        component={Auth(LoaiKhachHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-khach-hang/:id/chinh-sua`}
        exact
        component={Auth(LoaiKhachHangForm, menus, pathname, permission)}
      />

      {/* Khách hàng */}
      <Route
        path={`${match.url}/khach-hang`}
        exact
        component={Auth(KhachHang, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/khach-hang/them-moi`}
        exact
        component={Auth(KhachHangForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/khach-hang/:id/chinh-sua`}
        exact
        component={Auth(KhachHangForm, menus, pathname, permission)}
      />

      {/* Loại thông tin */}
      <Route
        path={`${match.url}/loai-thong-tin`}
        exact
        component={Auth(LoaiThongTin, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-thong-tin/them-moi`}
        exact
        component={Auth(LoaiThongTinForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-thong-tin/:id/chinh-sua`}
        exact
        component={Auth(LoaiThongTinForm, menus, pathname, permission)}
      />

      {/* Hạng mục công việc */}
      <Route
        path={`${match.url}/hang-muc-cong-viec`}
        exact
        component={Auth(HangMucCongViec, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hang-muc-cong-viec/them-moi`}
        exact
        component={Auth(HangMucCongViecForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/hang-muc-cong-viec/:id/chinh-sua`}
        exact
        component={Auth(HangMucCongViecForm, menus, pathname, permission)}
      />

      {/* Tiêu chí đánh giá */}
      <Route
        path={`${match.url}/tieu-chi-danh-gia`}
        exact
        component={Auth(TieuChiDanhGia, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tieu-chi-danh-gia/them-moi`}
        exact
        component={Auth(TieuChiDanhGiaForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/tieu-chi-danh-gia/:id/chinh-sua`}
        exact
        component={Auth(TieuChiDanhGiaForm, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
