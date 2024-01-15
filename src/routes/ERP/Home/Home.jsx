import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@ant-design/compatible";
import ContainerHeader from "src/components/ContainerHeader";

import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  getLocalStorage,
  getTokenInfo,
  setLocalStorage,
} from "src/util/Common";
import { loadMenu, donViLoad } from "src/appRedux/actions";
import { Select } from "src/components/Common";
import { BASE_URL_API } from "src/constants/Config";
function Home({ permission, history }) {
  const dispatch = useDispatch();
  const TOKENINFO = getTokenInfo();
  const MENUINFO = getLocalStorage("menu");
  const { donvi } = useSelector(({ donvi }) => donvi);
  const { data, width } = useSelector(({ common }) => common).toJS();
  const [DonVi, setDonVi] = useState("");

  useEffect(() => {
    getInfo();
    setDonVi(
      MENUINFO && MENUINFO.donVi_Id
        ? MENUINFO.donVi_Id
        : donvi.length > 0
        ? donvi[0].DonVi_Id
        : ""
    );
    return () => dispatch(fetchReset());
  }, [donvi]);
  const getInfo = () => {
    dispatch(
      fetchStart(
        `PhanMem/phan-mem-by-user?user_Id=${TOKENINFO.id}&&donVi_Id=${
          MENUINFO ? MENUINFO.donVi_Id : ""
        }`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  const handleClick = (dt) => {
    const menuInfo = getLocalStorage("menu");
    menuInfo.phanMem_Id = dt.phanMem_Id;
    menuInfo.tenPhanMem = dt.tenPhanMem;
    menuInfo.tapDoan_Id = dt.TapDoan_Id;
    menuInfo.Url = dt.Url;
    history.push(dt.Url);
    setLocalStorage("menu", menuInfo);
    dispatch(loadMenu());
  };
  const handleOnSelectDonVi = (val) => {
    setDonVi(val);
    const menu = getLocalStorage("menu");
    menu.donVi_Id = val;
    menu.phanMem_Id = null;
    menu.Url = null;
    menu.tenPhanMem = "QUẢN LÝ NGUỒN NHÂN LỰC DOANH NGHIỆP (ERP)";
    setLocalStorage("menu", menu);
    dispatch(loadMenu());
    dispatch(donViLoad());
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Ứng dụng"}
        description="Ứng dụng"
        // buttons={addButtonRender()}
      />
      <Card style={{ minHeight: "77vh" }}>
        {width < 1200 && (
          <Row style={{ marginBottom: 10 }}>
            <Col xl={12} xs={24}>
              <h5>Đơn vị:</h5>
              <Select
                className="heading-select slt-search th-select-heading"
                data={donvi}
                placeholder="Chọn đơn vị"
                optionsvalue={["DonVi_Id", "tenDonVi"]}
                style={{ width: "100%" }}
                onSelect={handleOnSelectDonVi}
                value={DonVi}
                defaultValue={donvi.length > 0 && donvi[0].DonVi_Id}
                optionFilterProp={"name"}
                showSearch
              />
            </Col>
          </Row>
        )}
        <Row>
          {data &&
            data.map((dt) => {
              return (
                <>
                  <Col
                    xxl={6}
                    xl={8}
                    lg={12}
                    md={12}
                    sm={20}
                    xs={24}
                    align="center"
                    onClick={() => handleClick(dt)}
                    style={{
                      cursor: "pointer",
                      paddingBottom: 10,
                    }}
                  >
                    <Card
                      style={{
                        height: "185px",
                        marginBottom: 10,
                        borderColor: "#0469B9",
                      }}
                      // bodyStyle={{
                      //   paddingBottom: 0,
                      // }}
                    >
                      {dt.hinhAnh ? (
                        <img
                          alt="example"
                          style={{
                            width: 100,
                            height: 100,
                            marginBottom: 10,
                          }}
                          src={BASE_URL_API + dt.hinhAnh}
                        />
                      ) : (
                        <Icon
                          type={dt.icon}
                          style={{
                            fontSize: 100,
                            color: "#0469B9",
                            marginBottom: 10,
                          }}
                        />
                      )}
                      <h4 style={{ color: "#0469B9" }}>{dt.tenPhanMem}</h4>
                    </Card>
                  </Col>
                </>
              );
            })}
        </Row>
      </Card>
    </div>
  );
}

export default Home;
