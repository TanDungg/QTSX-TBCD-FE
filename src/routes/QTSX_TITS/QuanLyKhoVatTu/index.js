import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

const NotFound = asyncComponent(() => import("../../NotFound/NotFound"));
/* BOM xưởng */

const BOMXuong = asyncComponent(() => import("./BOMXuong/BOMXuong"));
const BOMXuongForm = asyncComponent(() => import("./BOMXuong/BOMXuongForm"));

/* Kho vật tư */
const KhoVatTu = asyncComponent(() => import("./KhoVatTu/KhoVatTu"));

/* Layout kho vật tư */
const LayoutKhoVatTu = asyncComponent(() =>
  import("./LayoutKhoVatTu/LayoutKhoVatTu")
);

/* Phiếu điều chuyển vật tư */
const PhieuDieuChuyenVatTu = asyncComponent(() =>
  import("./PhieuDieuChuyenVatTu/PhieuDieuChuyenVatTu")
);
const PhieuDieuChuyenVatTuForm = asyncComponent(() =>
  import("./PhieuDieuChuyenVatTu/PhieuDieuChuyenVatTuForm")
);

/* Phiếu kiểm kê vật tư */
const PhieuKiemKeVatTu = asyncComponent(() =>
  import("./PhieuKiemKeVatTu/PhieuKiemKeVatTu")
);
const PhieuKiemKeVatTuForm = asyncComponent(() =>
  import("./PhieuKiemKeVatTu/PhieuKiemKeVatTuForm")
);

/* Phiếu kiểm tra vật tư */
const PhieuKiemTraVatTu = asyncComponent(() =>
  import("./PhieuKiemTraVatTu/PhieuKiemTraVatTu")
);
const PhieuKiemTraVatTuForm = asyncComponent(() =>
  import("./PhieuKiemTraVatTu/PhieuKiemTraVatTuForm")
);

/* Phiếu nhập kho vật tư */
const PhieuNhapKhoVatTu = asyncComponent(() =>
  import("./PhieuNhapKhoVatTu/PhieuNhapKhoVatTu")
);
const PhieuNhapKhoVatTuForm = asyncComponent(() =>
  import("./PhieuNhapKhoVatTu/PhieuNhapKhoVatTuForm")
);

/* Phiếu thanh lý vật tư */
const PhieuThanhLyVatTu = asyncComponent(() =>
  import("./PhieuThanhLyVatTu/PhieuThanhLyVatTu")
);
const PhieuThanhLyVatTuForm = asyncComponent(() =>
  import("./PhieuThanhLyVatTu/PhieuThanhLyVatTuForm")
);

/* Phiếu xuất kho vật tư phụ */
const PhieuXuatKhoVatTuPhu = asyncComponent(() =>
  import("./PhieuXuatKhoVatTuPhu/PhieuXuatKhoVatTuPhu")
);
const PhieuXuatKhoVatTuPhuForm = asyncComponent(() =>
  import("./PhieuXuatKhoVatTuPhu/PhieuXuatKhoVatTuPhuForm")
);

/* Phiếu xuất kho vật tư sản xuất */
const PhieuXuatKhoVatTuSanXuat = asyncComponent(() =>
  import("./PhieuXuatKhoVatTuSanXuat/PhieuXuatKhoVatTuSanXuat")
);
const PhieuXuatKhoVatTuSanXuatForm = asyncComponent(() =>
  import("./PhieuXuatKhoVatTuSanXuat/PhieuXuatKhoVatTuSanXuatForm")
);

/* Phiếu yêu cầu cấp vật tư phụ */
const PhieuYeuCauCapVatTuPhu = asyncComponent(() =>
  import("./PhieuYeuCauCapVatTuPhu/PhieuYeuCauCapVatTuPhu")
);
const PhieuYeuCauCapVatTuPhuForm = asyncComponent(() =>
  import("./PhieuYeuCauCapVatTuPhu/PhieuYeuCauCapVatTuPhuForm")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* BOM Xưởng */}
      <Route
        path={`${match.url}/bom-xuong`}
        exact
        component={Auth(BOMXuong, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom-xuong/them-moi`}
        exact
        component={Auth(BOMXuongForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom-xuong/:id/chinh-sua`}
        exact
        component={Auth(BOMXuongForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom-xuong/:id/xac-nhan`}
        exact
        component={Auth(BOMXuongForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/bom-xuong/:id/chi-tiet`}
        exact
        component={Auth(BOMXuongForm, menus, pathname, permission)}
      />

      {/* Kho vật tư */}
      <Route
        path={`${match.url}/kho-vat-tu`}
        exact
        component={Auth(KhoVatTu, menus, pathname, permission)}
      />

      {/* Layout kho vật tư */}
      <Route
        path={`${match.url}/layout-kho-vat-tu`}
        exact
        component={Auth(LayoutKhoVatTu, menus, pathname, permission)}
      />

      {/* Phiếu điều chuyển vật tư */}
      <Route
        path={`${match.url}/phieu-dieu-chuyen-vat-tu`}
        exact
        component={Auth(PhieuDieuChuyenVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dieu-chuyen-vat-tu/them-moi`}
        exact
        component={Auth(PhieuDieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dieu-chuyen-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(PhieuDieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dieu-chuyen-vat-tu/:id/chi-tiet`}
        exact
        component={Auth(PhieuDieuChuyenVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-dieu-chuyen-vat-tu/:id/xac-nhan`}
        exact
        component={Auth(PhieuDieuChuyenVatTuForm, menus, pathname, permission)}
      />

      {/* Phiếu kiểm kê vật tư */}
      <Route
        path={`${match.url}/phieu-kiem-ke-vat-tu`}
        exact
        component={Auth(PhieuKiemKeVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke-vat-tu/them-moi`}
        exact
        component={Auth(PhieuKiemKeVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(PhieuKiemKeVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke-vat-tu/:id/chi-tiet`}
        exact
        component={Auth(PhieuKiemKeVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-ke-vat-tu/:id/duyet`}
        exact
        component={Auth(PhieuKiemKeVatTuForm, menus, pathname, permission)}
      />

      {/* Phiếu kiểm tra vật tư */}
      <Route
        path={`${match.url}/phieu-kiem-tra-vat-tu`}
        exact
        component={Auth(PhieuKiemTraVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-tra-vat-tu/them-moi`}
        exact
        component={Auth(PhieuKiemTraVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-tra-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(PhieuKiemTraVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-kiem-tra-vat-tu/:id/chi-tiet`}
        exact
        component={Auth(PhieuKiemTraVatTuForm, menus, pathname, permission)}
      />

      {/* Phiếu nhập kho vật tư */}
      <Route
        path={`${match.url}/phieu-nhap-kho-vat-tu`}
        exact
        component={Auth(PhieuNhapKhoVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhap-kho-vat-tu/them-moi`}
        exact
        component={Auth(PhieuNhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhap-kho-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(PhieuNhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhap-kho-vat-tu/:id/chi-tiet`}
        exact
        component={Auth(PhieuNhapKhoVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-nhap-kho-vat-tu/:id/xac-nhan`}
        exact
        component={Auth(PhieuNhapKhoVatTuForm, menus, pathname, permission)}
      />

      {/* Phiếu thanh lý vật tư */}
      <Route
        path={`${match.url}/phieu-thanh-ly-vat-tu`}
        exact
        component={Auth(PhieuThanhLyVatTu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-thanh-ly-vat-tu/them-moi`}
        exact
        component={Auth(PhieuThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-thanh-ly-vat-tu/:id/chinh-sua`}
        exact
        component={Auth(PhieuThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-thanh-ly-vat-tu/:id/chi-tiet`}
        exact
        component={Auth(PhieuThanhLyVatTuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-thanh-ly-vat-tu/:id/xac-nhan`}
        exact
        component={Auth(PhieuThanhLyVatTuForm, menus, pathname, permission)}
      />

      {/* Phiếu xuất kho vật tư phụ */}
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-phu`}
        exact
        component={Auth(PhieuXuatKhoVatTuPhu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-phu/them-moi`}
        exact
        component={Auth(PhieuXuatKhoVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-phu/:id/chinh-sua`}
        exact
        component={Auth(PhieuXuatKhoVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-phu/:id/chi-tiet`}
        exact
        component={Auth(PhieuXuatKhoVatTuPhuForm, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-phu/:id/xac-nhan`}
        exact
        component={Auth(PhieuXuatKhoVatTuPhuForm, menus, pathname, permission)}
      />

      {/* Phiếu xuất kho vật tư sản xuất */}
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-san-xuat`}
        exact
        component={Auth(PhieuXuatKhoVatTuSanXuat, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-san-xuat/them-moi`}
        exact
        component={Auth(
          PhieuXuatKhoVatTuSanXuatForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-san-xuat/:id/chinh-sua`}
        exact
        component={Auth(
          PhieuXuatKhoVatTuSanXuatForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-san-xuat/:id/chi-tiet`}
        exact
        component={Auth(
          PhieuXuatKhoVatTuSanXuatForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-xuat-kho-vat-tu-san-xuat/:id/xac-nhan`}
        exact
        component={Auth(
          PhieuXuatKhoVatTuSanXuatForm,
          menus,
          pathname,
          permission
        )}
      />

      {/* Phiếu yêu cầu cấp vật tư phụ */}
      <Route
        path={`${match.url}/phieu-yeu-cau-cap-vat-tu-phu`}
        exact
        component={Auth(PhieuYeuCauCapVatTuPhu, menus, pathname, permission)}
      />
      <Route
        path={`${match.url}/phieu-yeu-cau-cap-vat-tu-phu/them-moi`}
        exact
        component={Auth(
          PhieuYeuCauCapVatTuPhuForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-yeu-cau-cap-vat-tu-phu/:id/chinh-sua`}
        exact
        component={Auth(
          PhieuYeuCauCapVatTuPhuForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-yeu-cau-cap-vat-tu-phu/:id/chi-tiet`}
        exact
        component={Auth(
          PhieuYeuCauCapVatTuPhuForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route
        path={`${match.url}/phieu-yeu-cau-cap-vat-tu-phu/:id/xac-nhan`}
        exact
        component={Auth(
          PhieuYeuCauCapVatTuPhuForm,
          menus,
          pathname,
          permission
        )}
      />
      <Route path="*" component={Auth(NotFound, menus, pathname)} />
    </Switch>
  );
};

export default App;
