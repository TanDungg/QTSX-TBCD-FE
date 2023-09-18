import React, { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import URLSearchParams from "url-search-params";
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import { IntlProvider } from "react-intl";
import moment from "moment";
import { fetchStart } from "src/appRedux/actions/Common";
import "moment/locale/vi";

import AppLocale from "src/lngProvider";
import MainApp from "./MainApp";
import SignIn from "../SignIn";
import Helpers from "src/helpers";
import { setInitUrl } from "src/appRedux/actions/Auth";
import {
  onLayoutTypeChange,
  onNavStyleChange,
  setThemeType,
} from "src/appRedux/actions/Setting";
import { defaultValidateMessages } from "src/util/ValidatorMessage";

import {
  LAYOUT_TYPE_BOXED,
  LAYOUT_TYPE_FRAMED,
  LAYOUT_TYPE_FULL,
  NAV_STYLE_ABOVE_HEADER,
  NAV_STYLE_BELOW_HEADER,
  NAV_STYLE_DARK_HORIZONTAL,
  NAV_STYLE_DEFAULT_HORIZONTAL,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
  THEME_TYPE_DARK,
} from "src/constants/ThemeSetting";
import {
  getLocalStorage,
  getSessionStorage,
  getTokenInfo,
  removeCookieValue,
  removeSessionStorage,
} from "src/util/Common";

import { messaging } from "src/constants/firebase";
import { onMessage } from "firebase/messaging";
import { getToken } from "firebase/messaging";
import { thongBaoLoad } from "src/appRedux/actions";

const RestrictedRoute = ({
  component: Component,
  location,
  token,
  session,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (session) {
          if (token) {
            return <Component {...props} />;
          } else {
            sessionStorage.setItem("currentURL", window.location.href);
            return (
              <Redirect
                to={{
                  pathname: "/signin",
                  state: { from: location },
                }}
              />
            );
          }
        } else {
          return (
            <Redirect
              to={{
                pathname: "/signin",
                state: { from: location },
              }}
            />
          );
        }
      }}
    />
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { locale, themeType, navStyle, layoutType, themeColor } = useSelector(
    ({ settings }) => settings
  );
  const { initURL } = useSelector(({ auth }) => auth);
  const location = useLocation();
  const match = useRouteMatch();
  const info = getTokenInfo();
  const session = getSessionStorage("tokenInfo");
  // const menuInfo = getLocalStorage("menu");
  useEffect(() => {
    let link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = `/css/${themeColor}.css`; //This line is changed, this comment is for explaination purpose.

    link.className = "gx-style";
    document.body.appendChild(link);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function requestPermission() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Generate Token
      const token = await getToken(messaging, {
        vapidKey:
          "BGJz6YC8lH2J-rNLlHhzr1iY8wc1N_4mhLHi6tilbf8BrJ3NOYq63MNhxeUDSyoubtnnxt7NX2LAczGrBm8_Uac",
      });
      dispatch(
        fetchStart(
          `TokenGen/store-token`,
          "POST",
          { user_Id: info.id, token: token },
          "DETAIL",
          ""
        )
      );
      // Send this token  to server ( db)
    } else if (permission === "denied") {
      // alert("You denied for the notification");
    }
  }

  // useEffect(() => {
  //   function handleServiceWorkerMessage(event) {
  //     if (event.data.action === "deleteCookie") {
  //       removeCookieValue("tokenInfo");
  //       removeSessionStorage("tokenInfo");
  //     } else {
  //       dispatch(thongBaoLoad());
  //     }
  //   }
  //   navigator.serviceWorker.addEventListener(
  //     "message",
  //     handleServiceWorkerMessage
  //   );
  //   // Dọn dẹp listener khi component unmount
  //   return () => {
  //     navigator.serviceWorker.removeEventListener(
  //       "message",
  //       handleServiceWorkerMessage
  //     );
  //   };
  // }, []);

  // useEffect(() => {
  //   info && requestPermission();
  //   onMessage(messaging, (payload) => {
  //     if (payload.notification.title === "LogOut") {
  //       removeCookieValue("tonkenInfo");
  //       removeSessionStorage("tokenInfo");
  //     } else {
  //       dispatch(thongBaoLoad());
  //       Helpers.alertFireBase(
  //         payload.notification.body,
  //         payload.notification.title
  //       );
  //     }
  //   });
  // }, []);

  useEffect(() => {
    if (initURL === "") {
      dispatch(setInitUrl(location.pathname));
    }
    const params = new URLSearchParams(location.search);

    if (params.has("theme")) {
      dispatch(setThemeType(params.get("theme")));
    }

    if (params.has("nav-style")) {
      dispatch(onNavStyleChange(params.get("nav-style")));
    }
    if (params.has("layout-type")) {
      dispatch(onLayoutTypeChange(params.get("layout-type")));
    }
    setLayoutType(layoutType);
    setNavStyle(navStyle);
  });

  const setLayoutType = (layoutType) => {
    if (layoutType === LAYOUT_TYPE_FULL) {
      document.body.classList.remove("boxed-layout");
      document.body.classList.remove("framed-layout");
      document.body.classList.add("full-layout");
    } else if (layoutType === LAYOUT_TYPE_BOXED) {
      document.body.classList.remove("full-layout");
      document.body.classList.remove("framed-layout");
      document.body.classList.add("boxed-layout");
    } else if (layoutType === LAYOUT_TYPE_FRAMED) {
      document.body.classList.remove("boxed-layout");
      document.body.classList.remove("full-layout");
      document.body.classList.add("framed-layout");
    }
  };

  const setNavStyle = (navStyle) => {
    if (
      navStyle === NAV_STYLE_DEFAULT_HORIZONTAL ||
      navStyle === NAV_STYLE_DARK_HORIZONTAL ||
      navStyle === NAV_STYLE_INSIDE_HEADER_HORIZONTAL ||
      navStyle === NAV_STYLE_ABOVE_HEADER ||
      navStyle === NAV_STYLE_BELOW_HEADER
    ) {
      document.body.classList.add("full-scroll");
      document.body.classList.add("horizontal-layout");
    } else {
      document.body.classList.remove("full-scroll");
      document.body.classList.remove("horizontal-layout");
    }
  };

  useEffect(() => {
    if (themeType === THEME_TYPE_DARK) {
      console.log("adding dark class");
      document.body.classList.add("dark-theme");
      document.body.classList.add("dark-theme");
      let link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = "/css/dark_theme.css";
      link.className = "style_dark_theme";
      document.body.appendChild(link);
    }
  }, []);

  const currentAppLocale = AppLocale[locale.locale];
  const newLocal = moment.locale(currentAppLocale.antd, {
    week: { dow: 1 },
    months:
      "Tháng 1_Tháng 2_Tháng 3_Tháng 4_Tháng 5_Tháng 6_Tháng 7_Tháng 8_Tháng 9_Tháng 10_Tháng 11_Tháng 12".split(
        "_"
      ),
    monthsShort: "Th1_Th2_Th3_Th4_Th5_Th6_Th7_Th8_Th9_Th10_Th11_Th12".split(
      "_"
    ),
    monthsParseExact: true,
    weekdays: "Chủ nhật_Thứ 2_Thứ 3_Thứ 4_Thứ 5_Thứ 6_Thứ 7".split("_"),
    weekdaysShort: "CN_T2_T3_T4_T5_T6_T7".split("_"),
    weekdaysMin: "CN_2_3_4_5_6_7".split("_"),
    weekdaysParseExact: true,
    longDateFormat: {
      LT: "HH:mm",
      LTS: "HH:mm:ss",
      L: "DD/MM/YYYY",
      LL: "D MMMM YYYY",
      LLL: "D MMMM YYYY HH:mm",
      LLLL: "dddd D MMMM YYYY HH:mm",
    },
  });
  return (
    <ConfigProvider
      locale={newLocal}
      form={{ validateMessages: defaultValidateMessages }}
    >
      <IntlProvider
        locale={currentAppLocale.locale}
        messages={currentAppLocale.messages}
      >
        <Switch>
          <Route exact path="/signin" component={SignIn} />
          <RestrictedRoute
            path={`${match.url}`}
            token={info ? info.token : null}
            session={session ? session : null}
            location={location}
            component={MainApp}
          />
        </Switch>
      </IntlProvider>
    </ConfigProvider>
  );
};

export default memo(App);
