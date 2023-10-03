import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, find, isEmpty, remove } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;
function LayoutKho({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListKho, setListKho] = useState([]);
  const [ListChiTietKho, setListChiTietKho] = useState([]);

  const [Kho, setKho] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      loadData();
      getKho();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=1`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setListKho(res.data);
      } else {
        setListKho([]);
      }
    });
  };
  const getChiTietKho = (val) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/get-lay-out-kho-vat-tu?cauTrucKho_Id=${val}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        console.log(res.data);
        setListChiTietKho(res.data);
      } else {
        setListChiTietKho([]);
      }
    });
  };
  /**
   * Lấy dữ liệu về
   *
   */
  const loadData = (cauTrucKho_Id) => {
    const param = convertObjectToUrlParams({
      cauTrucKho_Id,
      donVi_Id: INFO.donVi_Id,
    });
    dispatch(
      fetchStart(
        `lkn_ViTriLuuKho/get-lay-out-kho-vat-tu?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };
  const handleOnSelectKho = (val) => {
    setKho(val);
    getChiTietKho(val);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title="LAYOUT KHO" description="LAYOUT KHO" />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 15 }}>
          <Col span={6}>
            <h5>Kho</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKho}
              value={Kho}
            />
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <h5>Kệ 1</h5>
            <Row>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "blue",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "red",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
            </Row>
            <Row>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
              <Col
                span={6}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid #333",
                }}
              >
                a
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default LayoutKho;
