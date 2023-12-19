import React, { useEffect, useState } from "react";
import { Card, Empty, Row, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalChiTietKho from "./ModalChiTietKho";

const { EditableRow, EditableCell } = EditableTableRow;
function LayoutKhoThanhPham({ history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListKho, setListKho] = useState([]);
  const [ListChiTietKho, setListChiTietKho] = useState([]);
  const [ListChiTietVatTu, setListChiTietVatTu] = useState([]);
  const [focusKe, setFocusKe] = useState("");
  const [focusNgan, setFocusNgan] = useState("");
  const [soTangMax, setSoTangMax] = useState(1);
  const [ActiveModal, setActiveModal] = useState("");
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
          `CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=101&&isThanhPham=true`,
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
          // `lkn_ViTriLuuKho/vi-tri-luu-kho-thanh-pham-tree?kho_Id=${val}`,
          `lkn_mobile/vi-tri-luu-kho-tree?kho_Id=${val}&IsThanhPham=true`,
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
        let soTangMax = 1;
        res.data.forEach((ke, index) => {
          if (ke.children) {
            res.data[index].children = ke.children.reverse();
            soTangMax =
              ke.children.length > soTangMax ? ke.children.length : soTangMax;
          }
        });
        res.data.sort((a, b) => a.viTri - b.viTri);
        setSoTangMax(soTangMax);
        setListChiTietKho(res.data);
      } else {
        setListChiTietKho([]);
      }
    });
  };
  const getChiTietViTri = (val) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          // `lkn_ViTriLuuKho/vi-tri-luu-kho-tree?kho_Id=${val}`,
          `lkn_mobile/chi-tiet-vi-tri-luu-kho-vat-tu?ke_ngan_Id=${val}&IsThanhPham=true`,
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
        setListChiTietVatTu(res.data);
      } else {
        setListChiTietVatTu([]);
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
      title: "Mã sản phẩm",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
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
        return <span>{val.tenNgan ? val.tenNgan : val.tenKe}</span>;
      },
    },
    // {
    //   title: "Hạn sử dụng",
    //   dataIndex: "thoiGianSuDung",
    //   key: "thoiGianSuDung",
    //   align: "center",
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
    if (Kho !== val) {
      setListChiTietVatTu([]);
      setFocusNgan("");
      setFocusKe("");
      setKho(val);
      getChiTietKho(val);
    }
  };
  const handleViewThongTin = (id) => {
    if (id) {
      getChiTietViTri(id);
    }
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="LAYOUT KHO THÀNH PHẨM"
        description="LAYOUT KHO THÀNH PHẨM"
      />
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
          <Col xxl={12} xl={12} xs={24}>
            <Card style={{ width: "95%" }}>
              {ListChiTietKho.length > 0 ? (
                <Row>
                  {ListChiTietKho.map((ke) => {
                    return (
                      <Col
                        xxl={8}
                        xl={12}
                        lg={12}
                        style={{
                          height:
                            // ke.children.length === 0
                            // ?
                            soTangMax * 40,
                          // :
                          // ke.children.length * 40,
                          marginBottom: 50,
                        }}
                      >
                        <h5>{ke.tenCauTrucKho}</h5>
                        <div
                          style={{
                            border:
                              ke.children.length === 0 && "1px solid #333",
                            width: "90%",
                            height: "100%",
                            padding: "0 14px",
                            cursor: "pointer",
                            backgroundColor:
                              focusKe === ke.id
                                ? "#5cdbd3"
                                : ke.children.length === 0 && ke.chiTietVatTu
                                ? "#ff4d4f"
                                : "#ccc",
                          }}
                          onClick={() => {
                            if (ke.children.length === 0) {
                              setFocusKe(ke.id);
                              setFocusNgan("");
                              handleViewThongTin(ke.id);
                              // setActiveModal(true)
                            }
                          }}
                        >
                          {ke.children.length > 0
                            ? [
                                ...Array.from(
                                  { length: soTangMax - ke.children.length },
                                  (_, i) => (
                                    <Row
                                      style={{
                                        height: 40,
                                        backgroundColor: "#fff",
                                      }}
                                    ></Row>
                                  )
                                ),
                                ,
                                ...ke.children.map((tang, index) => {
                                  return (
                                    <Row
                                      style={{
                                        marginRight: -16,
                                        border:
                                          tang.children.length === 0 &&
                                          "1px solid #333",
                                        height: 40,
                                        backgroundColor:
                                          tang.children.length === 0 && "#ccc",
                                      }}
                                    >
                                      {tang.children.length > 0 &&
                                        tang.children.map((ngan, index) => {
                                          return (
                                            <div
                                              // span={
                                              //   (tang.children.length === 5 ||
                                              //     tang.children.length === 7 ||
                                              //     tang.children.length === 9 ||
                                              //     tang.children.length === 10 ||
                                              //     tang.children.length === 11 ||
                                              //     tang.children.length ===
                                              //       13) &&
                                              //   index + 1 ===
                                              //     tang.children.length
                                              //     ? Math.floor(
                                              //         24 / tang.children.length
                                              //       ) * 2
                                              //     : Math.floor(
                                              //         24 / tang.children.length
                                              //       )
                                              // }
                                              style={{
                                                height: 40,
                                                margin: 0,
                                                width: `${
                                                  100 / tang.children.length
                                                }%`,
                                                padding: 0,
                                                backgroundColor:
                                                  focusNgan === ngan.id
                                                    ? "#5cdbd3"
                                                    : ngan.chiTietVatTu
                                                    ? "#ff4d4f"
                                                    : "#ccc",
                                                border: "1px solid #333",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => {
                                                handleViewThongTin(ngan.id);
                                                setFocusNgan(ngan.id);
                                                // setActiveModal(true)
                                                setFocusKe("");
                                              }}
                                            ></div>
                                          );
                                        })}
                                    </Row>
                                  );
                                }),
                              ]
                            : null}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <Empty description={false} />
              )}
            </Card>
          </Col>
          <Col xxl={12} xl={12} xs={24}>
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
                        backgroundColor: "#ff4d4f",
                        display: "inline-block",
                        marginRight: 5,
                      }}
                    ></span>
                    <span>Đang chứa sản phẩm</span>
                  </Col>
                  <Col
                    span={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#5cdbd3",
                        display: "inline-block",
                        marginRight: 5,
                      }}
                    ></span>
                    <span>Vị trí đang chọn</span>
                  </Col>
                </Row>
                <Row style={{ marginTop: 20 }}>
                  <Col span={24}>
                    <h5 style={{ fontWeight: "bold" }}>Tồn kho theo vị trí</h5>
                  </Col>
                </Row>
                <Table
                  bordered
                  scroll={{ x: 500, y: "70vh" }}
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
      <ModalChiTietKho
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        ListChiTietVatTu={ListChiTietVatTu}
      />
    </div>
  );
}

export default LayoutKhoThanhPham;
