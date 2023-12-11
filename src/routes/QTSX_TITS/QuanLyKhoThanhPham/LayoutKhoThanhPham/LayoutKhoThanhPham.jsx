import React, { useEffect, useState } from "react";
import { Card, Empty, Row, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import ModalChiTietKho from "./ModalChiTietKho";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;
function LayoutKhoThanhPham({ history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListKho, setListKho] = useState([]);
  const [ListChiTietKho, setListChiTietKho] = useState([]);
  const [ListchiTietThanhPham, setListchiTietThanhPham] = useState([]);
  const [focusKe, setFocusKe] = useState("");
  const [focusNgan, setFocusNgan] = useState("");
  const [soTangMax, setSoTangMax] = useState(1);
  const [Kho, setKho] = useState("");
  const [ActiveModal, setActiveModal] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
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
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=1&&isThanhPham=true`,
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
          `tits_qtsx_ViTriLuuKhoThanhPham/vi-tri-luu-kho-thanh-pham-tree?tits_qtsx_CauTrucKho_Id=${val}`,
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
          if (ke.children_tits_qtsx_ViTriLuuKhoThanhPhams) {
            res.data[index].children_tits_qtsx_ViTriLuuKhoThanhPhams =
              ke.children_tits_qtsx_ViTriLuuKhoThanhPhams.reverse();
            soTangMax =
              ke.children_tits_qtsx_ViTriLuuKhoThanhPhams.length > soTangMax
                ? ke.children_tits_qtsx_ViTriLuuKhoThanhPhams.length
                : soTangMax;
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
        `lkn_ViTriLuuKho/get-lay-out-kho-thanh-pham?${param}`,
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
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
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
    setListchiTietThanhPham([]);
    setFocusNgan("");
    setFocusKe("");
    setKho(val);
    getChiTietKho(val);
  };
  const handleViewThongTin = (tt) => {
    if (tt) {
      setListchiTietThanhPham(JSON.parse(tt));
    } else {
      setListchiTietThanhPham([]);
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
              optionsvalue={["id", "tenCauTrucKho"]}
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
                            // ke.children_tits_qtsx_ViTriLuuKhoThanhPhams.length === 0
                            //   ?
                            soTangMax * 40,
                          // : ke.children_tits_qtsx_ViTriLuuKhoThanhPhams.length * 40,
                          marginBottom: 50,
                        }}
                      >
                        <h5>{ke.tenCauTrucKho}</h5>
                        <div
                          style={{
                            border:
                              ke.children_tits_qtsx_ViTriLuuKhoThanhPhams
                                .length === 0 && "1px solid #333",
                            width: "90%",
                            height: "100%",
                            padding: "0 14px",
                            cursor: "pointer",
                            backgroundColor:
                              focusKe === ke.id
                                ? "#5cdbd3"
                                : ke.children_tits_qtsx_ViTriLuuKhoThanhPhams
                                    .length === 0 && ke.chiTietThanhPham
                                ? "#ff4d4f"
                                : "#ccc",
                          }}
                          onClick={() => {
                            if (
                              ke.children_tits_qtsx_ViTriLuuKhoThanhPhams
                                .length === 0
                            ) {
                              setFocusKe(ke.id);
                              setFocusNgan("");
                              handleViewThongTin(ke.chiTietThanhPham);
                              // setActiveModal(true);
                            }
                          }}
                        >
                          {ke.children_tits_qtsx_ViTriLuuKhoThanhPhams.length >
                          0
                            ? [
                                ...Array.from(
                                  {
                                    length:
                                      soTangMax -
                                      ke
                                        .children_tits_qtsx_ViTriLuuKhoThanhPhams
                                        .length,
                                  },
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
                                ...ke.children_tits_qtsx_ViTriLuuKhoThanhPhams.map(
                                  (tang, index) => {
                                    return (
                                      <Row
                                        style={{
                                          marginRight: -16,
                                          border:
                                            tang
                                              .children_tits_qtsx_ViTriLuuKhoThanhPhams
                                              .length === 0 && "1px solid #333",
                                          height: 40,
                                          backgroundColor:
                                            tang
                                              .children_tits_qtsx_ViTriLuuKhoThanhPhams
                                              .length === 0 && "#ccc",
                                        }}
                                      >
                                        {tang
                                          .children_tits_qtsx_ViTriLuuKhoThanhPhams
                                          .length > 0 &&
                                          tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.map(
                                            (ngan, index) => {
                                              return (
                                                <div
                                                  // span={
                                                  //   (tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length === 5 ||
                                                  //     tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length === 7 ||
                                                  //     tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length === 9 ||
                                                  //     tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length === 10 ||
                                                  //     tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length === 11 ||
                                                  //     tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length ===
                                                  //       13) &&
                                                  //   index + 1 ===
                                                  //     tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length
                                                  //     ? Math.floor(
                                                  //         24 / tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length
                                                  //       ) * 2
                                                  //     : Math.floor(
                                                  //         24 / tang.children_tits_qtsx_ViTriLuuKhoThanhPhams.length
                                                  //       )
                                                  // }
                                                  style={{
                                                    height: 40,
                                                    margin: 0,
                                                    width: `${
                                                      100 /
                                                      tang
                                                        .children_tits_qtsx_ViTriLuuKhoThanhPhams
                                                        .length
                                                    }%`,
                                                    padding: 0,
                                                    backgroundColor:
                                                      focusNgan === ngan.id
                                                        ? "#5cdbd3"
                                                        : ngan.chiTietThanhPham
                                                        ? "#ff4d4f"
                                                        : "#ccc",
                                                    border: "1px solid #333",
                                                    cursor: "pointer",
                                                  }}
                                                  onClick={() => {
                                                    // setActiveModal(true);
                                                    handleViewThongTin(
                                                      ngan.chiTietThanhPham
                                                    );
                                                    setFocusNgan(ngan.id);
                                                    setFocusKe("");
                                                  }}
                                                ></div>
                                              );
                                            }
                                          )}
                                      </Row>
                                    );
                                  }
                                ),
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
                    <span>Đang chứa thành phẩm</span>
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
                  dataSource={reDataForTable(ListchiTietThanhPham)}
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
        ListchiTietThanhPham={ListchiTietThanhPham}
      />
    </div>
  );
}

export default LayoutKhoThanhPham;
