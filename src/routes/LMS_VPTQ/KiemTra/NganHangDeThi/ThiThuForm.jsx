import {
  ClockCircleOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Image, Radio, Statistic } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import { fetchStart } from "src/appRedux/actions/Common";
import { Modal } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import ReactPlayer from "react-player";
import Helpers from "src/helpers";
import moment from "moment";

const { Countdown } = Statistic;

function ThiThuForm({ history, match }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [ChiTietDeThi, setChiTietDeThi] = useState(null);
  const [DeThi, setDeThi] = useState(null);
  const [ListCauHoi, setListCauHoi] = useState([]);
  const [DapAn, setDapAn] = useState(null);
  const [CauHoi, setCauHoi] = useState(null);
  const [KetQuaThi, setKetQuaThi] = useState(null);
  const [ChiTietKetQua, setChiTietKetQua] = useState([]);
  const [IsClickedCauSau, setIsClickedCauSau] = useState(false);
  const [IsClickedCauTruoc, setIsClickedCauTruoc] = useState(false);

  useEffect(() => {
    const { id } = match.params;
    getChiTietDeThi(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getChiTietDeThi = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DeThi/${id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
        setChiTietDeThi(res.data);
        if (res.data.isDangThiThu) {
          getDeThiThu(res.data.id, res.data.isDangThiThu);
        }
      }
    });
  };

  const getDeThiThu = (vptq_lms_DeThi_Id, IsDangThiThu) => {
    new Promise((resolve, reject) => {
      const param = convertObjectToUrlParams({
        donViHienHanh_Id: INFO.donVi_Id,
        vptq_lms_DeThi_Id,
        IsDangThiThu,
      });
      dispatch(
        fetchStart(
          `vptq_lms_ThiThu?${param}`,
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
          setDeThi(res.data);
          res.data.list_ChiTiets && setListCauHoi(res.data.list_ChiTiets);
          setCauHoi(
            res.data.list_ChiTiets &&
              res.data.list_ChiTiets[0].vptq_lms_ThiThuChiTiet_Id
          );
          setKetQuaThi(null);
          setChiTietKetQua([]);
        } else {
          setDeThi(null);
          setListCauHoi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleKetQuaThiThu = (vptq_lms_ThiThu_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiThu/${vptq_lms_ThiThu_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          setKetQuaThi(res.data);
          const chitiet =
            res.data.list_ChiTiets &&
            JSON.parse(res.data.list_ChiTiets).map((ct) => {
              return {
                ...ct,
                list_DapAns: ct.list_DapAns.map((ans) => {
                  return {
                    ...ans,
                    vptq_lms_ThiThuChiTietDapAn_Id:
                      ans.vptq_lms_ThiThuChiTietDapAn_Id.toLowerCase(),
                    isChon: ans.isChon === 1 ? true : false,
                  };
                }),
              };
            });
          setChiTietKetQua(chitiet);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleKetThucThiThu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiThu/nop-bai?vptq_lms_ThiThu_Id=${DeThi.vptq_lms_ThiThu_Id}&donViHienHanh_Id=${INFO.donVi_Id}`,
          "PUT",
          null,
          "NOPBAI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          handleKetQuaThiThu(DeThi.vptq_lms_ThiThu_Id);
          setDeThi(null);
          setListCauHoi([]);
          setCauHoi(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận nộp bài",
    onOk: handleKetThucThiThu,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const handleChangeCauHoi = (value) => {
    setDapAn(null);
    setCauHoi(value);
  };

  const SelectedCauHoi =
    ListCauHoi &&
    ListCauHoi.find((item) => item.vptq_lms_ThiThuChiTiet_Id === CauHoi);

  const selectedIndex =
    ListCauHoi &&
    ListCauHoi.findIndex((item) => item.vptq_lms_ThiThuChiTiet_Id === CauHoi);

  const handlePrev = () => {
    const prevIndex = selectedIndex - 1;
    if (prevIndex >= 0) {
      setDapAn(null);
      setCauHoi(ListCauHoi[prevIndex].vptq_lms_ThiThuChiTiet_Id);
    }
  };

  const handleNext = () => {
    const nextIndex = selectedIndex + 1;
    if (nextIndex < ListCauHoi.length) {
      setDapAn(null);
      setCauHoi(ListCauHoi[nextIndex].vptq_lms_ThiThuChiTiet_Id);
    }
  };

  const getDefaultDapAn = (list_DapAns) => {
    const dapan = list_DapAns.find((ans) => ans.isChon);
    return dapan ? dapan.vptq_lms_ThiThuChiTietDapAn_Id : undefined;
  };

  const onChangeDapAn = (val) => {
    const dapAn_Id = val.target.value;
    setDapAn(dapAn_Id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiThu/chon-dap-an?vptq_lms_ThiThuChiTietDapAn_Id=${dapAn_Id}&donViHienHanh_Id=${INFO.donVi_Id}`,
          "PUT",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          const newlistcauhoi = ListCauHoi.map((ch) => {
            if (
              ch.vptq_lms_ThiThuChiTiet_Id ===
              SelectedCauHoi.vptq_lms_ThiThuChiTiet_Id
            ) {
              const listdapan = ch.list_DapAns.map((ans) => {
                if (ans.vptq_lms_ThiThuChiTietDapAn_Id === dapAn_Id) {
                  return {
                    ...ans,
                    isChon: true,
                  };
                } else {
                  return {
                    ...ans,
                    isChon: false,
                  };
                }
              });

              return {
                ...ch,
                list_DapAns: listdapan,
              };
            } else {
              return ch;
            }
          });
          setListCauHoi(newlistcauhoi);
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = () => {
    Helpers.alertError("Hết thời gian thi!");
    handleKetThucThiThu();
  };

  const goBack = () => {
    if (DeThi) {
      modalXK();
    } else {
      history.push(`${match.url.replace(`/${match.params.id}/thi-thu`, "")}`);
    }
  };

  const addButtonRender = () => {
    return !DeThi ? (
      <Button
        className="th-margin-bottom-0 btn-margin-bottom-0"
        onClick={() => getDeThiThu(ChiTietDeThi.id, ChiTietDeThi.isDangThiThu)}
        type="primary"
      >
        {KetQuaThi ? "Thi lại" : "Bắt đầu làm bài"}
      </Button>
    ) : (
      <Button
        className="th-margin-bottom-0 btn-margin-bottom-0"
        onClick={() => modalXK()}
        type="danger"
      >
        Nộp bài và kết thúc bài thi
      </Button>
    );
  };

  const title = (
    <span>
      THI THỬ ĐỀ THI{" "}
      {ChiTietDeThi && ChiTietDeThi.tenChuyenDeDaoTao.toUpperCase()}{" "}
    </span>
  );

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={title}
        buttons={addButtonRender()}
        back={goBack}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Thông tin đề thi"}
        >
          <Row gutter={[0, 10]}>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span style={{ whiteSpace: "nowrap" }}>
                <strong>Tên đề thi:</strong>
              </span>
              {ChiTietDeThi && (
                <span>
                  {ChiTietDeThi.tenDeThi} ({ChiTietDeThi.maDeThi})
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span>
                <strong>Số lượng câu hỏi:</strong>
              </span>
              {ChiTietDeThi && <span>{ChiTietDeThi.soLuongCauHoi} câu</span>}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span>
                <strong>Thang điểm:</strong>
              </span>
              {ChiTietDeThi && <span>{ChiTietDeThi.thangDiem} điểm</span>}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span>
                <strong>Thời gian làm bài:</strong>
              </span>
              {ChiTietDeThi && <span>{ChiTietDeThi.thoiGianLamBai} phút</span>}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span>
                <strong>Tiêu chuẩn đạt:</strong>
              </span>
              {ChiTietDeThi && <span>{ChiTietDeThi.tieuChuanDat}%</span>}
            </Col>
          </Row>
        </Card>
        {ListCauHoi.length !== 0 ? (
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Danh sách câu hỏi"}
            style={{ minHeight: "55vh" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                {DeThi && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      border: "1px solid red",
                      borderRadius: "5px",
                      padding: "8px 5px",
                      justifyContent: "center",
                      width: "100px",
                      cursor: "not-allowed",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{
                        color: "red",
                      }}
                    />
                    <span
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      <Countdown
                        value={moment(
                          DeThi.gioiHanThoiGian,
                          "DD/MM/YYYY HH:mm:ss"
                        )
                          .toDate()
                          .getTime()}
                        onFinish={onFinish}
                      />
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      border:
                        selectedIndex === 0
                          ? "1px solid #c8c8c8"
                          : "1px solid #0469b9",
                      borderRadius: "5px",
                      padding: "8px 2px",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100px",
                      cursor: selectedIndex === 0 ? "not-allowed" : "pointer",
                      color: selectedIndex === 0 ? "#545454" : "#0469b9",
                      transform: IsClickedCauTruoc ? "scale(0.95)" : "scale(1)",
                      transition: "transform 0.2s ease, color 0.2s ease",
                    }}
                    onClick={() => {
                      if (selectedIndex !== 0) {
                        setIsClickedCauTruoc(true);
                      }
                      setTimeout(() => {
                        setIsClickedCauTruoc(false);
                      }, 200);
                      handlePrev();
                    }}
                    disabled={selectedIndex === 0}
                  >
                    <DoubleLeftOutlined />
                    <span>Câu trước</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      width: "100px",
                      border:
                        selectedIndex === ListCauHoi.length - 1
                          ? "1px solid #c8c8c8"
                          : "1px solid #0469b9",
                      borderRadius: "5px",
                      padding: "8px 2px",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor:
                        selectedIndex === ListCauHoi.length - 1
                          ? "not-allowed"
                          : "pointer",
                      color:
                        selectedIndex === ListCauHoi.length - 1
                          ? "#545454"
                          : "#0469b9",
                      transform: IsClickedCauSau ? "scale(0.95)" : "scale(1)",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => {
                      if (selectedIndex !== ListCauHoi.length - 1) {
                        setIsClickedCauSau(true);
                      }
                      setTimeout(() => {
                        setIsClickedCauSau(false);
                      }, 200);
                      handleNext();
                    }}
                    disabled={selectedIndex === ListCauHoi.length - 1}
                  >
                    <span>Câu kế tiếp</span>
                    <DoubleRightOutlined />
                  </div>
                </div>
              </div>
              {width < 1600 ? (
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #c8c8c8",
                    borderRadius: "10px",
                    display: "flex",
                    alignContent: "flex-start",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {ListCauHoi.map((item, index) => {
                    const isSelected =
                      CauHoi === item.vptq_lms_ThiThuChiTiet_Id;
                    const isChon = item.list_DapAns.some((ans) => ans.isChon);
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: isSelected
                            ? "2px solid #0469b9"
                            : isChon
                            ? "1px solid darkgray"
                            : "1px solid #c8c8c8",
                          borderRadius: "5px",
                          padding: "8px 5px",
                          justifyContent: "center",
                          width: "40px",
                          height: "40px",
                          background: isChon
                            ? "#FFFFCC"
                            : isSelected
                            ? "#fff"
                            : "",
                          color: isChon
                            ? "#000"
                            : isSelected
                            ? "#0469b9"
                            : "#000",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                        onClick={() =>
                          handleChangeCauHoi(item.vptq_lms_ThiThuChiTiet_Id)
                        }
                      >
                        {index + 1}
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <div style={{ display: "flex", gap: "10px" }}>
                <Card
                  className="th-card-margin-bottom th-card-reset-margin"
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                >
                  {SelectedCauHoi ? (
                    <Row gutter={[0, 10]}>
                      <Col span={24} className="title-span">
                        <span style={{ whiteSpace: "nowrap" }}>
                          <strong>
                            Câu {selectedIndex + 1}. (
                            {ChiTietDeThi.soDiemMoiCau} điểm):
                          </strong>
                        </span>
                        <span style={{ whiteSpace: "pre-line" }}>
                          {SelectedCauHoi.noiDung}
                        </span>
                      </Col>
                      {SelectedCauHoi.hinhAnh || SelectedCauHoi.video ? (
                        <Col
                          span={24}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {SelectedCauHoi.hinhAnh && (
                            <div
                              style={{
                                flex: "1",
                                textAlign: "center",
                                padding: "0 10px",
                              }}
                            >
                              <Image
                                src={BASE_URL_API + SelectedCauHoi.hinhAnh}
                                alt="Hình ảnh"
                                style={{ height: "150px" }}
                              />
                            </div>
                          )}
                          {SelectedCauHoi.video && (
                            <div
                              style={{
                                flex: "1",
                                textAlign: "center",
                                padding: "0 10px",
                              }}
                            >
                              {SelectedCauHoi.video.endsWith(".mp4") ? (
                                <ReactPlayer
                                  style={{ cursor: "pointer" }}
                                  url={BASE_URL_API + SelectedCauHoi.video}
                                  width="240px"
                                  height="150px"
                                  playing={true}
                                  muted={true}
                                  controls={false}
                                  onClick={() => {
                                    window.open(
                                      BASE_URL_API + SelectedCauHoi.video,
                                      "_blank"
                                    );
                                  }}
                                />
                              ) : (
                                <a
                                  target="_blank"
                                  href={BASE_URL_API + SelectedCauHoi.video}
                                  rel="noopener noreferrer"
                                >
                                  {SelectedCauHoi.video.split("/")[5]}
                                </a>
                              )}
                            </div>
                          )}
                        </Col>
                      ) : null}
                      <Col
                        span={24}
                        style={{
                          width: "100%",
                        }}
                      >
                        <Radio.Group
                          onChange={onChangeDapAn}
                          value={
                            DapAn || getDefaultDapAn(SelectedCauHoi.list_DapAns)
                          }
                          style={{
                            width: "100%",
                          }}
                        >
                          <Row gutter={[0, 10]}>
                            {SelectedCauHoi.list_DapAns &&
                              SelectedCauHoi.list_DapAns.map((ans, index) => {
                                return (
                                  <Col span={24}>
                                    <Radio
                                      value={ans.vptq_lms_ThiThuChiTietDapAn_Id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "10px 0px 10px 5px",
                                        border: ans.isChon
                                          ? "1px solid #0469b9"
                                          : "1px solid #c8c8c8",
                                        borderRadius: "5px",
                                        color: ans.isChon ? "#0469b9" : "",
                                        fontWeight: ans.isChon ? "bold" : "",
                                      }}
                                    >
                                      <div className="title-span">
                                        <span
                                          style={{
                                            fontWeight: "bold",
                                          }}
                                        >
                                          <strong>
                                            {String.fromCharCode(65 + index)}.
                                          </strong>
                                        </span>
                                        <span
                                          style={{
                                            whiteSpace: "break-spaces",
                                          }}
                                        >
                                          {ans.dapAn}
                                        </span>
                                      </div>
                                    </Radio>
                                  </Col>
                                );
                              })}
                          </Row>
                        </Radio.Group>
                      </Col>
                    </Row>
                  ) : null}
                </Card>
                {width >= 1600 ? (
                  <div
                    style={{
                      width: "450px",
                      height: "100%",
                      padding: "15px 10px",
                      border: "1px solid #c8c8c8",
                      borderRadius: "10px",
                      display: "flex",
                      alignContent: "flex-start",
                      flexWrap: "wrap",
                      gap: width > 1600 ? "12px" : "10px",
                    }}
                  >
                    {ListCauHoi.map((item, index) => {
                      const isSelected =
                        CauHoi === item.vptq_lms_ThiThuChiTiet_Id;
                      const isChon = item.list_DapAns.some((ans) => ans.isChon);
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: isSelected
                              ? "2px solid #0469b9"
                              : isChon
                              ? "1px solid darkgray"
                              : "1px solid #c8c8c8",
                            borderRadius: "5px",
                            padding: "8px 5px",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            background: isChon
                              ? "#FFFFCC"
                              : isSelected
                              ? "#fff"
                              : "",
                            color: isChon
                              ? "#000"
                              : isSelected
                              ? "#0469b9"
                              : "#000",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                          onClick={() =>
                            handleChangeCauHoi(item.vptq_lms_ThiThuChiTiet_Id)
                          }
                        >
                          {index + 1}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        ) : !KetQuaThi ? (
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Hướng dẫn thi trắc nghiệm"}
            align="center"
            style={{ height: "55vh" }}
          >
            <Image
              src={require("public/images/HuongDanThiTracNghiem.jpg")}
              alt="Hình ảnh"
              style={{ height: "45vh" }}
            />
          </Card>
        ) : (
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Kết quả thi thử"}
            style={{ height: "100%" }}
          >
            <Row gutter={[0, 10]} style={{ marginBottom: "10px" }}>
              <Col
                xxl={8}
                xl={8}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                className="title-span"
              >
                <span>
                  <strong>Lần thi:</strong>
                </span>
                <span>{KetQuaThi.lanThiThu}</span>
              </Col>
              <Col
                xxl={8}
                xl={8}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                className="title-span"
              >
                <span>
                  <strong>Thời gian bắt đầu:</strong>
                </span>
                <span>{KetQuaThi.thoiGianBatDau}</span>
              </Col>
              <Col
                xxl={8}
                xl={8}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                className="title-span"
              >
                <span>
                  <strong>Thời gian kết thúc:</strong>
                </span>
                <span>{KetQuaThi.thoiGianKetThuc}</span>
              </Col>
              <Col
                xxl={8}
                xl={8}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                className="title-span"
              >
                <span>
                  <strong>Số câu đúng:</strong>
                </span>
                <span>{KetQuaThi.soCauTraLoiDung} câu</span>
              </Col>
              <Col
                xxl={8}
                xl={8}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                className="title-span"
              >
                <span>
                  <strong>Số điểm:</strong>
                </span>
                <span>{KetQuaThi.soDiem} điểm</span>
              </Col>
              <Col
                xxl={8}
                xl={8}
                lg={12}
                md={12}
                sm={24}
                xs={24}
                className="title-span"
              >
                <span>
                  <strong>Kết quả:</strong>
                </span>
                <span
                  style={{
                    color: KetQuaThi.ketQua === "Không đạt" ? "red" : "#0469b9",
                  }}
                >
                  {KetQuaThi.ketQua}
                </span>
              </Col>
            </Row>
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              style={{
                height: "40vh",
                overflowY: "auto",
                width: "100%",
              }}
            >
              <Row gutter={[0, 10]}>
                {ChiTietKetQua
                  ? ChiTietKetQua.map((ketqua, index) => {
                      return (
                        <Col span={24}>
                          <Row gutter={[0, 10]}>
                            <Col span={24} className="title-span">
                              <span style={{ whiteSpace: "pre-line" }}>
                                <strong>
                                  Câu {index + 1}. (
                                  {KetQuaThi && KetQuaThi.soDiemMoiCau} điểm):
                                </strong>
                                {ketqua.noiDung}
                              </span>
                            </Col>
                            {ketqua.hinhAnh || ketqua.video ? (
                              <Col
                                span={24}
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {ketqua.hinhAnh && (
                                  <div
                                    style={{
                                      flex: "1",
                                      textAlign: "center",
                                      padding: "0 10px",
                                    }}
                                  >
                                    <Image
                                      src={BASE_URL_API + ketqua.hinhAnh}
                                      alt="Hình ảnh"
                                      style={{ height: "150px" }}
                                    />
                                  </div>
                                )}
                                {ketqua.video && (
                                  <div
                                    style={{
                                      flex: "1",
                                      textAlign: "center",
                                      padding: "0 10px",
                                    }}
                                  >
                                    {ketqua.video.endsWith(".mp4") ? (
                                      <ReactPlayer
                                        style={{ cursor: "pointer" }}
                                        url={BASE_URL_API + ketqua.video}
                                        width="240px"
                                        height="150px"
                                        playing={true}
                                        muted={true}
                                        controls={false}
                                        onClick={() => {
                                          window.open(
                                            BASE_URL_API + ketqua.video,
                                            "_blank"
                                          );
                                        }}
                                      />
                                    ) : (
                                      <a
                                        target="_blank"
                                        href={BASE_URL_API + ketqua.video}
                                        rel="noopener noreferrer"
                                      >
                                        {ketqua.video.split("/")[5]}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </Col>
                            ) : null}
                            <Col span={24}>
                              <Radio.Group
                                value={getDefaultDapAn(ketqua.list_DapAns)}
                              >
                                <Row gutter={[0, 10]}>
                                  {ketqua.list_DapAns &&
                                    ketqua.list_DapAns.map((ans, index) => {
                                      return (
                                        <Col span={24}>
                                          <Radio
                                            value={
                                              ans.vptq_lms_ThiThuChiTietDapAn_Id
                                            }
                                            disabled
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <div className="title-span">
                                              <span
                                                style={{
                                                  color:
                                                    ans.isChon &&
                                                    ketqua.isCorrect
                                                      ? "#0469b9"
                                                      : ans.isChon &&
                                                        !ketqua.isCorrect
                                                      ? "red"
                                                      : "",
                                                }}
                                              >
                                                <strong>
                                                  {String.fromCharCode(
                                                    65 + index
                                                  )}
                                                  .
                                                </strong>
                                              </span>
                                              <span
                                                style={{
                                                  whiteSpace: "break-spaces",
                                                  fontWeight:
                                                    ans.isChon && "bold",
                                                  color:
                                                    ans.isChon &&
                                                    ketqua.isCorrect
                                                      ? "#0469b9"
                                                      : ans.isChon &&
                                                        !ketqua.isCorrect
                                                      ? "red"
                                                      : "",
                                                }}
                                              >
                                                {ans.dapAn}
                                              </span>
                                            </div>
                                          </Radio>
                                        </Col>
                                      );
                                    })}
                                </Row>
                              </Radio.Group>
                            </Col>
                          </Row>
                        </Col>
                      );
                    })
                  : null}
              </Row>
            </Card>
          </Card>
        )}
      </Card>
    </div>
  );
}

export default ThiThuForm;
