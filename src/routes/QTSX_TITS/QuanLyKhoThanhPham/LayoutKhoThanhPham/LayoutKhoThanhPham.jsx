import React, { useEffect, useState } from "react";
import { Card, Empty, Row, Col, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {  Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import ModalChiTietKho from "./ModalChiTietKho";
import ContainerHeader from "src/components/ContainerHeader";

function LayoutKhoThanhPham({ history, permission }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListKho, setListKho] = useState([]);
  const [ListCauTrucKho, setListCauTrucKho] = useState([]);
  const [Kho, setKho] = useState(null);
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [soTangMax, setSoTangMax] = useState(1);
  const [focusKe, setFocusKe] = useState(null);
  const [focusNgan, setFocusNgan] = useState(null);
  const [ActiveModal, setActiveModal] = useState(null);

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
        setKho(res.data[0].id);
        getChiTietKho(res.data[0].id);
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
        setListCauTrucKho(res.data);
      } else {
        setListCauTrucKho([]);
      }
    });
  };

  const handleOnSelectKho = (val) => {
    setListChiTiet([]);
    setFocusNgan(null);
    setFocusKe(null);
    setKho(val);
    getChiTietKho(val);
  };

  const handleViewThongTin = (tt) => {
    if (tt) {
      setListChiTiet(JSON.parse(tt));
    } else {
      setListChiTiet([]);
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
          <Card style={{ width: "100%" }}>
            <Row style={{ marginLeft: 0 }}>
              <div
                style={{
                  width: "120px",
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Chú thích:</span>
              </div>
              <div
                style={{
                  width: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "#ff4d4f",
                    display: "inline-block",
                  }}
                />
                <span style={{ width: "calc(100% - 40px)" }}>
                  Đang chứa thành phẩm
                </span>
              </div>
              <div
                style={{
                  width: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#ccc",
                    display: "inline-block",
                  }}
                />
                <span style={{ width: "calc(100% - 40px)" }}>Trống</span>
              </div>
              <div
                style={{
                  width: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "#5cdbd3",
                    display: "inline-block",
                  }}
                />
                <span style={{ width: "calc(100% - 40px)" }}>
                  Vị trí đang chọn
                </span>
              </div>
            </Row>
            <Divider
              orientation="left"
              backgroundColor="none"
              style={{
                background: "none",
                fontWeight: "bold",
                marginBottom: "30px",
              }}
            >
              CẤU TRÚC KHO THÀNH PHẨM
            </Divider>
            {ListCauTrucKho.length > 0 ? (
              <Row>
                {ListCauTrucKho.map((ke) => {
                  return (
                    <Col
                      xxl={4}
                      xl={6}
                      lg={8}
                      md={8}
                      sm={12}
                      xs={24}
                      style={{
                        height: soTangMax * 40,
                        marginBottom: 50,
                      }}
                    >
                      <h5>{ke.tenCauTrucKho}</h5>
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          padding: "0 14px",
                          cursor: "pointer",
                          border:
                            ke.children_tits_qtsx_ViTriLuuKhoThanhPhams
                              .length === 0 && "1px solid #333",
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
                            setFocusNgan(null);
                            handleViewThongTin(ke.chiTietThanhPham);
                            setActiveModal(true);
                          }
                        }}
                      >
                        {ke.children_tits_qtsx_ViTriLuuKhoThanhPhams.length > 0
                          ? [
                              ...Array.from(
                                {
                                  length:
                                    soTangMax -
                                    ke.children_tits_qtsx_ViTriLuuKhoThanhPhams
                                      .length,
                                },
                                (_, i) => (
                                  <Row
                                    style={{
                                      height: 40,
                                      backgroundColor: "#fff",
                                    }}
                                  />
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
                                                  setActiveModal(true);
                                                  handleViewThongTin(
                                                    ngan.chiTietThanhPham
                                                  );
                                                  setFocusNgan(ngan.id);
                                                  setFocusKe(null);
                                                }}
                                              />
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
        </Row>
      </Card>
      <ModalChiTietKho
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        ListChiTiet={ListChiTiet}
      />
    </div>
  );
}

export default LayoutKhoThanhPham;
