import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@ant-design/compatible";
import ContainerHeader from "src/components/ContainerHeader";

import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
  setLocalStorage,
} from "src/util/Common";
import { loadMenu, donViLoad } from "src/appRedux/actions";
function Home({ permission, history }) {
  const TOKENINFO = getTokenInfo();
  const MENUINFO = getLocalStorage("menu");

  const { data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  useEffect(() => {
    getInfo();
    return () => dispatch(fetchReset());
  }, []);
  const getInfo = () => {
    dispatch(
      fetchStart(
        `PhanMem/phan-mem-by-user?user_Id=${TOKENINFO.id}&&donVi_Id=${MENUINFO.donVi_Id}`,
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

    setLocalStorage("menu", menuInfo);
    dispatch(loadMenu());
  };
  return (
    <div className="gx-main-content">
      {/* <Card> */}
      <ContainerHeader
        title={"Ứng dụng"}
        description="Ứng dụngn"
        // buttons={addButtonRender()}
      />
      <Row>
        {data &&
          data.map((dt) => {
            return (
              <Col
                span={6}
                align="center"
                onClick={() => handleClick(dt)}
                style={{ cursor: "pointer" }}
              >
                <Card bodyStyle={{ paddingBottom: 0 }}>
                  <Icon
                    type={dt.icon}
                    style={{
                      fontSize: 100,
                      color: "#0469B9",
                      marginBottom: 10,
                    }}
                  />
                  <h4 style={{ color: "#0469B9" }}>{dt.tenPhanMem}</h4>
                </Card>
              </Col>
            );
          })}
      </Row>
      {/* </Card> */}
    </div>
  );
}

export default Home;
