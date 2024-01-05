import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "util/asyncComponent";
import Auth from "helpers/Auth";

//Báo cáo chất lượng theo tháng
const BaoCaoChatLuongTheoThang = asyncComponent(() =>
  import("./ChatLuongTheoThang/ChatLuongTheoThang")
);

//Tra cứu thông tin xe
const TraCuuThongTinXe = asyncComponent(() =>
  import("./TraCuuThongTinXe/TraCuuThongTinXe")
);

const BaoCaoChiTietSanXuatNgay = asyncComponent(() =>
  import("./BaoCaoChiTietSanXuatNgay/BaoCaoChiTietSanXuatNgay")
);

const App = ({ match, location, menus, permission }) => {
  const { pathname } = location;
  return (
    <Switch>
      {/* Báo cáo chất lượng theo tháng */}
      <Route
        path={`${match.url}/chat-luong-theo-thang`}
        exact
        component={Auth(BaoCaoChatLuongTheoThang, menus, pathname, permission)}
      />

      {/* Tra cứu thông tin xe */}
      <Route
        path={`${match.url}/tra-cuu-thong-tin-xe`}
        exact
        component={Auth(TraCuuThongTinXe, menus, pathname, permission)}
      />
    </Switch>
  );
};

export default App;
