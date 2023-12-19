import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import Settings from "./Settings";
import Auth from "./Auth";
import Common from "./Common";
import Menu from "./Menu";
import Notification from "./Notification";
import ThongBao from "./ThongBao";
import DonVi from "./DonVi";
import History from "./History";

const createRootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    settings: Settings,
    auth: Auth,
    common: Common,
    menus: Menu,
    notification: Notification,
    thongbao: ThongBao,
    donvi: DonVi,
    History: History,
  });

export default createRootReducer;
