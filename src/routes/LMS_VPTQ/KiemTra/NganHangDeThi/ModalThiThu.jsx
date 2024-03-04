import {
  ClockCircleOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import {
  Modal as AntModal,
  Card,
  Col,
  Image,
  Radio,
  Row,
  Statistic,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { Button, Modal } from "src/components/Common";
import { BASE_URL_API } from "src/constants/Config";
import Helpers from "src/helpers";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";

const { Countdown } = Statistic;

function ModalThiThu({ openModalFS, openModal, dethi, refesh }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DeThi, setDeThi] = useState(null);
  const [ListCauHoi, setListCauHoi] = useState([]);
  const [DapAn, setDapAn] = useState(null);
  const [CauHoi, setCauHoi] = useState(null);
  const [KetQuaThi, setKetQuaThi] = useState(null);
  const [XemDanhSach, setXemDanhSach] = useState(false);
  const [ChiTietKetQua, setChiTietKetQua] = useState([]);

  useEffect(() => {
    if (openModal && dethi.isDangThiThu && !DeThi) {
      getDeThiThu(dethi.id, dethi.isDangThiThu);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

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

  const handleCancel = () => {
    if (DeThi) {
      modalXK();
    } else {
      openModalFS(false);
      setDeThi(null);
      setListCauHoi([]);
      setCauHoi(null);
      setKetQuaThi(null);
      setChiTietKetQua([]);
      refesh();
    }
  };

  const title = (
    <span>ĐỀ THI {dethi && dethi.tenChuyenDeDaoTao.toUpperCase()} </span>
  );

  return (
    <AntModal
      title={title}
      open={openModal}
      width={width >= 1600 ? `70%` : width >= 1300 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
      style={{ height: "50vh" }}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row gutter={[0, 10]}>
          <Col lg={12} xs={24} className="title-span">
            <span style={{ whiteSpace: "nowrap" }}>
              <strong>Tên đề thi:</strong>
            </span>
            {dethi && (
              <span>
                {dethi.tenDeThi} ({dethi.maDeThi})
              </span>
            )}
          </Col>
          <Col lg={12} xs={24} className="title-span">
            <span>
              <strong>Số lượng câu hỏi:</strong>
            </span>
            {dethi && <span>{dethi.soLuongCauHoi} câu</span>}
          </Col>
          <Col lg={12} xs={24} className="title-span">
            <span>
              <strong>Thang điểm:</strong>
            </span>
            {dethi && <span>{dethi.thangDiem} điểm</span>}
          </Col>
          <Col lg={12} xs={24} className="title-span">
            <span>
              <strong>Thời gian làm bài:</strong>
            </span>
            {dethi && <span>{dethi.thoiGianLamBai} phút</span>}
          </Col>
          <Col lg={12} xs={24} className="title-span">
            <span>
              <strong>Tiêu chuẩn đạt:</strong>
            </span>
            {dethi && <span>{dethi.tieuChuanDat}%</span>}
          </Col>
        </Row>
        <div align={"end"}>
          {!DeThi ? (
            <Button
              className="th-margin-bottom-0"
              onClick={() => getDeThiThu(dethi.id, dethi.isDangThiThu)}
              type="primary"
            >
              {KetQuaThi ? "Thi lại" : "Bắt đầu"}
            </Button>
          ) : (
            <Button
              className="th-margin-bottom-0"
              onClick={() => modalXK()}
              type="danger"
            >
              Nộp bài
            </Button>
          )}
        </div>
      </Card>
      {ListCauHoi.length !== 0 ? (
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách câu hỏi"}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "15px",
                padding: "5px",
                flexWrap: "wrap",
              }}
            >
              {DeThi && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    border: "1px solid red",
                    borderRadius: "5px",
                    padding: "8px 5px",
                    justifyContent: "center",
                    width: "120px",
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
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "5px",
                  padding: "8px 5px",
                  justifyContent: "center",
                  width: "180px",
                  border: "1px solid #0469b9",
                  color: "#0469b9",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => setXemDanhSach(!XemDanhSach)}
              >
                {XemDanhSach ? "Ẩn danh sách câu hỏi" : "Xem danh sách câu hỏi"}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  flexWrap: "wrap",
                  width: "300px",
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
                    padding: "8px 5px",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "120px",
                    cursor: selectedIndex === 0 ? "not-allowed" : "pointer",
                    color: selectedIndex === 0 ? "#545454" : "#0469b9",
                  }}
                  onClick={handlePrev}
                  disabled={selectedIndex === 0}
                >
                  <DoubleLeftOutlined />
                  <span>Câu trước</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    width: "120px",
                    border:
                      selectedIndex === ListCauHoi.length - 1
                        ? "1px solid #c8c8c8"
                        : "1px solid #0469b9",
                    borderRadius: "5px",
                    padding: "8px 5px",
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
                  }}
                  onClick={handleNext}
                  disabled={selectedIndex === ListCauHoi.length - 1}
                >
                  <span>Câu kế tiếp</span>
                  <DoubleRightOutlined />
                </div>
              </div>
            </div>
            {XemDanhSach ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  padding: "5px",
                }}
              >
                {ListCauHoi.map((item, index) => {
                  const isSelected = CauHoi === item.vptq_lms_ThiThuChiTiet_Id;
                  const isChon = item.list_DapAns.some((ans) => ans.isChon);
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        border: isSelected
                          ? "1px solid #0469b9"
                          : isChon
                          ? "1px solid darkgray"
                          : "1px solid #c8c8c8",
                        borderRadius: "5px",
                        padding: "8px 5px",
                        justifyContent: "center",
                        width: "50px",
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
                        fontSize: "15px",
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
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            style={{
              height: "35vh",
              width: "100%",
              overflowY: "auto",
            }}
          >
            {SelectedCauHoi ? (
              <Row gutter={[0, 10]}>
                <Col span={24} className="title-span">
                  <span style={{ whiteSpace: "nowrap" }}>
                    <strong>
                      Câu {selectedIndex + 1}. ({dethi.soDiemMoiCau} điểm):
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
                    value={DapAn || getDefaultDapAn(SelectedCauHoi.list_DapAns)}
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
        </Card>
      ) : !KetQuaThi ? (
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Hướng dẫn thi trắc nghiệm"}
          align="center"
        >
          <Image
            src={require("public/images/HuongDanThiTracNghiem.jpg")}
            alt="Hình ảnh"
            style={{ height: "40vh" }}
          />
        </Card>
      ) : (
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Kết quả thi thử"}
          style={{ height: "100%", overflowY: "auto" }}
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
              maxHeight: "35vh",
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
                                                  ans.isChon && ketqua.isCorrect
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
                                                  ans.isChon && ketqua.isCorrect
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
    </AntModal>
  );
}

export default ModalThiThu;
