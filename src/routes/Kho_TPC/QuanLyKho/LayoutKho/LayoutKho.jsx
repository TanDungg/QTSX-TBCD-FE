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
  const [ListChiTietVatTu, setListChiTietVatTu] = useState([]);

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
          `lkn_ViTriLuuKho/vi-tri-luu-kho-tree?kho_Id=${val}`,
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
        res.data.forEach((ke, index) => {
          if (ke.children) {
            res.data[index].children = ke.children.reverse();
          }
        });

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
  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Vị trí lưu",
      key: "viTriLuu",
      align: "center",
      render: (val) => {
        return (
          <span>
            {val.tenKe && val.tenKe}
            {val.tenTang && ` - ${val.tenTang}`}
            {val.tenNgan && ` - ${val.tenNgan}`}
          </span>
        );
      },
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "thoiGianSuDung",
      key: "thoiGianSuDung",
      align: "center",
    },
    // {
    //   title: "Chức năng",
    //   key: "action",
    //   align: "center",
    //   width: 110,
    //   render: (value) => actionContent(value),
    // },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = map(renderHead, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });
  const handleOnSelectKho = (val) => {
    ListKho.forEach((k) => {
      if (k.id === val) {
      }
    });
    setKho(val);
    getChiTietKho(val);
  };
  const handleViewThongTin = (tt) => {
    if (tt) {
      setListChiTietVatTu(JSON.parse(tt));
    } else {
      setListChiTietVatTu([]);
    }
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title="LAYOUT KHO" description="LAYOUT KHO" />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 15 }}>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
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
          <Col span={12}>
            <Card>
              <Row>
                {ListChiTietKho.map((ke) => {
                  return (
                    <Col
                      span={6}
                      style={{
                        height: 160,
                        // padding: 0,
                        marginBottom: 50,
                        // marginRight: 25,
                        // border: "1px solid #333",
                      }}
                    >
                      <h5>{ke.tenCauTrucKho}</h5>
                      <div
                        style={{
                          border: "1px solid #333",
                          width: "100%",
                          height: "100%",
                          padding: "0 16px",
                          backgroundColor: ke.children.length === 0 && "#ccc",
                        }}
                      >
                        {ke.children.length > 0 &&
                          ke.children.map((tang) => {
                            return (
                              <Row style={{ marginRight: -18 }}>
                                {tang.children.length > 0 &&
                                  tang.children.map((ngan) => {
                                    return (
                                      <Col
                                        span={6}
                                        style={{
                                          height: 40,
                                          backgroundColor: ngan.chiTietVatTu
                                            ? "#ffbb96"
                                            : "#ccc",
                                          border: "1px solid #333",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          handleViewThongTin(ngan.chiTietVatTu)
                                        }
                                      ></Col>
                                    );
                                  })}
                              </Row>
                            );
                          })}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <div>
                <h5>Chú thích</h5>
                <Row>
                  <Col
                    span={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#ccc",
                        display: "inline-block",
                        marginRight: 5,
                      }}
                    ></span>
                    <span>Trống</span>
                  </Col>
                  <Col
                    span={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#ffbb96",
                        display: "inline-block",
                        marginRight: 5,
                      }}
                    ></span>
                    <span>Đang chứa vật tư</span>
                  </Col>
                </Row>
                <Row style={{ marginTop: 20 }}>
                  <Col span={24}>
                    <h5 style={{ fontWeight: "bold" }}>Tồn kho theo vị trí</h5>
                  </Col>
                </Row>
                <Table
                  bordered
                  scroll={{ x: 700, y: "70vh" }}
                  columns={columns}
                  components={components}
                  className="gx-table-responsive"
                  dataSource={reDataForTable(ListChiTietVatTu)}
                  size="small"
                  pagination={false}
                  loading={loading}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default LayoutKho;
