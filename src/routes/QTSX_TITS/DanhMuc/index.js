import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const TapDoan = asyncComponent(() => import("./TapDoan/TapDoan"));
const TapDoanForm = asyncComponent(() => import("./TapDoan/TapDoanForm"));

const DonVi = asyncComponent(() => import("./DonVi/DonVi"));
const DonViForm = asyncComponent(() => import("./DonVi/DonViForm"));

const BoPhan = asyncComponent(() => import("./BoPhan/BoPhan"));
const BoPhanForm = asyncComponent(() => import("./BoPhan/BoPhanForm"));

const PhongBan = asyncComponent(() => import("./PhongBan/PhongBan"));
const PhongBanForm = asyncComponent(() => import("./PhongBan/PhongBanForm"));

const DonViTinh = asyncComponent(() => import("./DonViTinh/DonViTinh"));
const DonViTinhForm = asyncComponent(() => import("./DonViTinh/DonViTinhForm"));

const ChucVu = asyncComponent(() => import("./ChucVu/ChucVu"));
const ChucVuForm = asyncComponent(() => import("./ChucVu/ChucVuForm"));

const LoaiSanPham = asyncComponent(() => import("./LoaiSanPham/LoaiSanPham"));
const LoaiSanPhamForm = asyncComponent(() =>
  import("./LoaiSanPham/LoaiSanPhamForm")
);
const LoaiKhachHang = asyncComponent(() =>
  import("./LoaiKhachHang/LoaiKhachHang")
);
const LoaiKhachHangForm = asyncComponent(() =>
  import("./LoaiKhachHang/LoaiKhachHangForm")
);
const LoaiDinhMucTonKho = asyncComponent(() =>
  import("./LoaiDinhMucTonKho/LoaiDinhMucTonKho")
);
const LoaiDinhMucTonKhoForm = asyncComponent(() =>
  import("./LoaiDinhMucTonKho/LoaiDinhMucTonKhoForm")
);
const SanPham = asyncComponent(() => import("./SanPham/SanPham"));

const SanPhamForm = asyncComponent(() => import("./SanPham/SanPhamForm"));
const VatTu = asyncComponent(() => import("./VatTu/VatTu"));
const VatTuForm = asyncComponent(() => import("./VatTu/VatTuForm"));
const KhachHang = asyncComponent(() => import("./KhachHang/KhachHang"));
const KhachHangForm = asyncComponent(() => import("./KhachHang/KhachHangForm"));
const CauTrucKhoVatTu = asyncComponent(() =>
  import("./CauTrucKhoVatTu/CauTrucKhoVatTu")
);
const CauTrucKhoVatTuForm = asyncComponent(() =>
  import("./CauTrucKhoVatTu/CauTrucKhoVatTuForm")
);
const CauTrucKhoThanhPham = asyncComponent(() =>
  import("./CauTrucKhoThanhPham/CauTrucKhoThanhPham")
);
const CauTrucKhoThanhPhamForm = asyncComponent(() =>
  import("./CauTrucKhoThanhPham/CauTrucKhoThanhPhamForm")
);
const LoaiKeHoach = asyncComponent(() => import("./LoaiKeHoach/LoaiKeHoach"));
const LoaiKeHoachForm = asyncComponent(() =>
  import("./LoaiKeHoach/LoaiKeHoachForm")
);
const NhaCungCap = asyncComponent(() => import("./NhaCungCap/NhaCungCap"));
const NhaCungCapForm = asyncComponent(() =>
  import("./NhaCungCap/NhaCungCapForm")
);
const LoaiNhaCungCap = asyncComponent(() =>
  import("./LoaiNhaCungCap/LoaiNhaCungCap")
);
const LoaiNhaCungCapForm = asyncComponent(() =>
  import("./LoaiNhaCungCap/LoaiNhaCungCapForm")
);
const ThuocTinhSanPham = asyncComponent(() =>
  import("./ThuocTinhSanPham/ThuocTinhSanPham")
);
const ThuocTinhSanPhamForm = asyncComponent(() =>
  import("./ThuocTinhSanPham/ThuocTinhSanPhamForm")
);
const MauSac = asyncComponent(() => import("./MauSac/MauSac"));
const MauSacForm = asyncComponent(() => import("./MauSac/MauSacForm"));
const ThietBi = asyncComponent(() => import("./ThietBi/ThietBi"));
const ThietBiForm = asyncComponent(() => import("./ThietBi/ThietBiForm"));
const SoLot = asyncComponent(() => import("./SoLot/SoLot"));
const SoLotForm = asyncComponent(() => import("./SoLot/SoLotForm"));
const Ke = asyncComponent(() => import("./Ke/Ke"));
const KeForm = asyncComponent(() => import("./Ke/KeForm"));
const QuyTrinhSanPham = asyncComponent(() =>
  import("./QuyTrinhSanPham/QuyTrinhSanPham")
);
const QuyTrinhSanPhamForm = asyncComponent(() =>
  import("./QuyTrinhSanPham/QuyTrinhSanPhamForm")
);

const NhomThietBi = asyncComponent(() => import("./NhomThietBi/NhomThietBi"));
const NhomThietBiForm = asyncComponent(() =>
  import("./NhomThietBi/NhomThietBiForm")
);

// const Home = asyncComponent(() => import("../Home"));
const ChungTu = asyncComponent(() => import("./ChungTu/ChungTu"));
const ChungTuForm = asyncComponent(() => import("./ChungTu/ChungTuForm"));
const ThongTinKiemSoat = asyncComponent(() =>
  import("./ThongTinKiemSoat/ThongTinKiemSoat")
);
const ThongTinKiemSoatForm = asyncComponent(() =>
  import("./ThongTinKiemSoat/ThongTinKiemSoatForm")
);

const NhomLoi = asyncComponent(() => import("./NhomLoi/NhomLoi"));
const NhomLoiForm = asyncComponent(() => import("./NhomLoi/NhomLoiForm"));

const Loi = asyncComponent(() => import("./Loi/Loi"));
const LoiForm = asyncComponent(() => import("./Loi/LoiForm"));

const LoaiVatTu = asyncComponent(() => import("./LoaiVatTu/LoaiVatTu"));
const LoaiVatTuForm = asyncComponent(() => import("./LoaiVatTu/LoaiVatTuForm"));

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
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
      <Route
        path={`${match.url}/ban-phong`}
        exact
        component={Auth(PhongBan, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ban-phong/them-moi`}
        exact
        component={Auth(PhongBanForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ban-phong/:id/chinh-sua`}
        exact
        component={Auth(PhongBanForm, menus, pathname, permission)}
      />
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
      <Route
        path={`${match.url}/loai-dinh-muc-ton-kho`}
        exact
        component={Auth(LoaiDinhMucTonKho, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-dinh-muc-ton-kho/them-moi`}
        exact
        component={Auth(LoaiDinhMucTonKhoForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-dinh-muc-ton-kho/:id/chinh-sua`}
        exact
        component={Auth(LoaiDinhMucTonKhoForm, menus, pathname, permission)}
      />
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
      <Route
        path={`${match.url}/vat-tu`}
        exact
        component={Auth(VatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vat-tu/them-moi`}
        exact
        component={Auth(VatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/vat-tu/:id/chinh-sua`}
        exact
        component={Auth(VatTuForm, menus, pathname, permission)}
      />
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
      <Route
        path={`${match.url}/cau-truc-kho-vat-tu`}
        exact
        component={Auth(CauTrucKhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cau-truc-kho-vat-tu/them-moi`}
        exact
        component={Auth(CauTrucKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cau-truc-kho-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(CauTrucKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cau-truc-kho-thanh-pham`}
        exact
        component={Auth(CauTrucKhoThanhPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cau-truc-kho-thanh-pham/them-moi`}
        exact
        component={Auth(CauTrucKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/cau-truc-kho-thanh-pham/:id/chinh-sua`}
        exact
        component={Auth(CauTrucKhoThanhPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thuoc-tinh-san-pham`}
        exact
        component={Auth(ThuocTinhSanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thuoc-tinh-san-pham/them-moi`}
        exact
        component={Auth(ThuocTinhSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thuoc-tinh-san-pham/:id/chinh-sua`}
        exact
        component={Auth(ThuocTinhSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/mau-sac`}
        exact
        component={Auth(MauSac, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/mau-sac/them-moi`}
        exact
        component={Auth(MauSacForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/mau-sac/:id/chinh-sua`}
        exact
        component={Auth(MauSacForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thiet-bi`}
        exact
        component={Auth(ThietBi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thiet-bi/them-moi`}
        exact
        component={Auth(ThietBiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thiet-bi/:id/chinh-sua`}
        exact
        component={Auth(ThietBiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-lot`}
        exact
        component={Auth(SoLot, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-lot/them-moi`}
        exact
        component={Auth(SoLotForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/so-lot/:id/chinh-sua`}
        exact
        component={Auth(SoLotForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-ke-hoach`}
        exact
        component={Auth(LoaiKeHoach, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-ke-hoach/them-moi`}
        exact
        component={Auth(LoaiKeHoachForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-ke-hoach/:id/chinh-sua`}
        exact
        component={Auth(LoaiKeHoachForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-nha-cung-cap`}
        exact
        component={Auth(LoaiNhaCungCap, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-nha-cung-cap/them-moi`}
        exact
        component={Auth(LoaiNhaCungCapForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-nha-cung-cap/:id/chinh-sua`}
        exact
        component={Auth(LoaiNhaCungCapForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nha-cung-cap`}
        exact
        component={Auth(NhaCungCap, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nha-cung-cap/them-moi`}
        exact
        component={Auth(NhaCungCapForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nha-cung-cap/:id/chinh-sua`}
        exact
        component={Auth(NhaCungCapForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat`}
        exact
        component={Auth(QuyTrinhSanPham, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/them-moi`}
        exact
        component={Auth(QuyTrinhSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/quy-trinh-san-xuat/:id/chinh-sua`}
        exact
        component={Auth(QuyTrinhSanPhamForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke`}
        exact
        component={Auth(Ke, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke/them-moi`}
        exact
        component={Auth(KeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/ke/:id/chinh-sua`}
        exact
        component={Auth(KeForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhom-thiet-bi`}
        exact
        component={Auth(NhomThietBi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhom-thiet-bi/them-moi`}
        exact
        component={Auth(NhomThietBiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhom-thiet-bi/:id/chinh-sua`}
        exact
        component={Auth(NhomThietBiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chung-tu`}
        exact
        component={Auth(ChungTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chung-tu/them-moi`}
        exact
        component={Auth(ChungTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/chung-tu/:id/chinh-sua`}
        exact
        component={Auth(ChungTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhom-loi`}
        exact
        component={Auth(NhomLoi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhom-loi/them-moi`}
        exact
        component={Auth(NhomLoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/nhom-loi/:id/chinh-sua`}
        exact
        component={Auth(NhomLoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loi`}
        exact
        component={Auth(Loi, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loi/them-moi`}
        exact
        component={Auth(LoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loi/:id/chinh-sua`}
        exact
        component={Auth(LoiForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thong-tin-kiem-soat`}
        exact
        component={Auth(ThongTinKiemSoat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thong-tin-kiem-soat/them-moi`}
        exact
        component={Auth(ThongTinKiemSoatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/thong-tin-kiem-soat/:id/chinh-sua`}
        exact
        component={Auth(ThongTinKiemSoatForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-vat-tu`}
        exact
        component={Auth(LoaiVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-vat-tu/them-moi`}
        exact
        component={Auth(LoaiVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/loai-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(LoaiVatTuForm, menus, pathname, permission)}
      />
      {/* <Route path="*" component={Auth(Home, menus, pathname, permission)} /> */}
    </Switch>
  );
};

export default App;
