import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getTokenInfo, setLocalStorage } from "src/util/Common";

import {
  hideMessage,
  showAuthLoader,
  userSignIn,
} from "../appRedux/actions/Auth";
import IntlMessages from "util/IntlMessages";
import InfoView from "src/components/InfoView";
import CircularProgress from "src/components/CircularProgress";
import { fetchStart } from "src/appRedux/actions/Common";
import { loadMenu, donViLoad } from "src/appRedux/actions";
import { BASE_URL_APP } from "src/constants/Config";

const { Option } = Select;

const SignIn = ({ history }) => {
  const [domain, setDomain] = useState("thaco.com.vn");
  const dispatch = useDispatch();
  const { authUser, loader, showMessage, alertMessage } = useSelector(
    ({ auth }) => auth
  );
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const onFinish = (values) => {
    dispatch(hideMessage());
    const signInValue = { ...values, domain };
    dispatch(showAuthLoader());
    dispatch(userSignIn(signInValue));
  };
  const getPhanMem = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/phan-mem-by-user-only?user_Id=${id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          if (res.data.length === 1) {
            const menu = {
              phanMem_Id: res.data[0].phanMem_Id,
              donVi_Id: res.data[0].donVi_Id.toUpperCase(),
              tenPhanMem: res.data[0].tenPhanMem,
              tapDoan_Id: res.data[0].tapDoan_Id,
              Url: res.data[0].url,
            };
            setLocalStorage("menu", menu);
            dispatch(donViLoad());
            dispatch(loadMenu());
            history.push(res.data[0].url);
          } else {
            setLocalStorage("menu", {});
            history.push("/home");
          }
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    const userInfo = getTokenInfo();
    if ((authUser && authUser.token) || (userInfo && userInfo.token)) {
      const url = sessionStorage.getItem("currentURL");
      const session = sessionStorage.getItem("tokenInfo");
      if (session) {
        if (url) {
          const hashPart = url.replace(BASE_URL_APP, "");
          history.push(hashPart);
          sessionStorage.removeItem("currentURL");
        } else {
          getPhanMem(userInfo.id);
        }
      }
    }
  }, [authUser, history]);

  const optionSignIn = () => {
    return (
      <Select defaultValue={domain} onChange={(e) => setDomain(e)}>
        <Option value="thaco.com.vn">@thaco.com.vn</Option>
        <Option value="">Cá nhân</Option>
      </Select>
    );
  };

  const placeHolderText = domain === "Email";

  return (
    <div className="gx-app-login-wrap">
      <div className="gx-app-login-container">
        <div className="gx-app-login-main-content">
          <div className="gx-app-logo-content">
            <div className="gx-app-logo-content-bg"></div>
            <div className="gx-app-logo-wid" style={{ textAlign: "center" }}>
              <h1>
                <IntlMessages id="app.userAuth.signIn" />
              </h1>
              <p style={{ fontSize: 15 }}>
                <IntlMessages id="app.userAuth.bySigning1" />
                <br />
                <IntlMessages id="app.userAuth.bySigning2" />
              </p>
              <p>
                <IntlMessages id="app.userAuth.getAccount" />
              </p>
            </div>
            <div className="gx-app-logo">
              <img
                alt="example"
                src={require("src/assets/images/logo-industries-white.png")}
              />
            </div>
          </div>
          <div className="gx-app-login-content">
            <Form
              initialValues={{ remember: true }}
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              className="gx-signin-form gx-form-row0"
            >
              <Form.Item
                initialValue=""
                rules={[{ required: true, message: "Hãy điền tài khoản" }]}
                name="username"
              >
                <Input
                  placeholder={placeHolderText}
                  type="text"
                  addonAfter={optionSignIn()}
                />
              </Form.Item>

              <Form.Item
                initialValue=""
                rules={[{ required: true, message: "Hãy nhập mật khẩu" }]}
                name="password"
              >
                <Input type="password" placeholder="Mật khẩu" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" className="gx-mb-0" htmlType="submit">
                  <IntlMessages id="app.userAuth.signIn" />
                </Button>
              </Form.Item>
            </Form>
          </div>
          {loader ? (
            <div className="gx-loader-view">
              <CircularProgress />
            </div>
          ) : null}
          {showMessage ? message.error(alertMessage.toString()) : null}
          <InfoView />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
