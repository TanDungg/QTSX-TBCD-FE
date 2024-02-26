import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import {
  Modal as AntModal,
  Card,
  Col,
  Image,
  Pagination,
  Radio,
  Row,
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

function ModalThiThu({ openModalFS, openModal, dethi, refesh }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DemNguoc, setDemNguoc] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [DeThi, setDeThi] = useState(null);
  const [ListCauHoi, setListCauHoi] = useState([]);
  const [DapAn, setDapAn] = useState(null);
  const [CauHoi, setCauHoi] = useState(null);
  const [page, setPage] = useState(1);
  const [KetQuaThi, setKetQuaThi] = useState(null);
  const [ChiTietKetQua, setChiTietKetQua] = useState([]);

  useEffect(() => {
    if (openModal && dethi.isDangThiThu && !DeThi) {
      getDeThiThu(dethi.id, dethi.isDangThiThu);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  useEffect(() => {
    if (DeThi && DeThi.gioiHanThoiGian) {
      const endTime = moment(DeThi.gioiHanThoiGian, "DD/MM/YYYY HH:mm:ss")
        .toDate()
        .getTime();

      const timer = setInterval(() => {
        const now = new Date().getTime();
        const total = endTime - now;

        if (total <= 0) {
          clearInterval(timer);
          Helpers.alertError("Hết thời gian thi!");
          handleKetThucThiThu();
        } else {
          const hours = String(
            Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          ).padStart(2, "0");
          const minutes = String(
            Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
          ).padStart(2, "0");
          const seconds = String(
            Math.floor((total % (1000 * 60)) / 1000)
          ).padStart(2, "0");

          setDemNguoc({ hours, minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [DeThi]);

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
          setListCauHoi(res.data.list_ChiTiets);
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
          setDemNguoc({
            hours: 0,
            minutes: 0,
            seconds: 0,
          });
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

  const handleChangeCauHoi = (e) => {
    setDapAn(null);
    setCauHoi(e.target.value);
  };

  const handleChangePage = (pagination) => {
    setPage(pagination);
  };

  const itemRender = (_, type, originalElement) => {
    if (type === "prev") {
      return <DoubleLeftOutlined />;
    }
    if (type === "next") {
      return <DoubleRightOutlined />;
    }
    return originalElement;
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
      setDemNguoc({
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
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
          <Col
            lg={12}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "90px",
                fontWeight: "bold",
              }}
            >
              Tên đề thi:
            </span>
            {dethi && (
              <span
                style={{
                  width: "calc(100% - 90px)",
                }}
              >
                {dethi.tenDeThi}({dethi.maDeThi})
              </span>
            )}
          </Col>
          <Col
            lg={12}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "130px",
                fontWeight: "bold",
              }}
            >
              Số lượng câu hỏi:
            </span>
            {dethi && (
              <span
                style={{
                  width: "calc(100% - 130px)",
                }}
              >
                {dethi.soLuongCauHoi} câu
              </span>
            )}
          </Col>
          <Col
            lg={12}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "100px",
                fontWeight: "bold",
              }}
            >
              Thang điểm:
            </span>
            {dethi && (
              <span
                style={{
                  width: "calc(100% - 100px)",
                }}
              >
                {dethi.thangDiem} điểm
              </span>
            )}
          </Col>
          <Col
            lg={12}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "140px",
                fontWeight: "bold",
              }}
            >
              Thời gian làm bài:
            </span>
            {dethi && (
              <span
                style={{
                  width: "calc(100% - 140px)",
                }}
              >
                {dethi.thoiGianLamBai} phút
              </span>
            )}
          </Col>
          <Col
            lg={12}
            xs={24}
            style={{
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: "120px",
                fontWeight: "bold",
              }}
            >
              Tiêu chuẩn đạt:
            </span>
            {dethi && (
              <span
                style={{
                  width: "calc(100% - 120px)",
                }}
              >
                {dethi.tieuChuanDat}%
              </span>
            )}
          </Col>
          {DeThi && (
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Thời gian còn lại:
              </span>
              {DeThi && DeThi.gioiHanThoiGian && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                    color: "red",
                    fontWeight: "bold",
                  }}
                >
                  {DemNguoc.hours} : {DemNguoc.minutes} : {DemNguoc.seconds}
                </span>
              )}
            </Col>
          )}
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
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <Button
              className="th-margin-bottom-0"
              style={{
                margin: "0px",
              }}
              icon={<StepBackwardOutlined />}
              type="primary"
              onClick={handlePrev}
              disabled={selectedIndex === 0}
            />
            <Radio.Group
              value={CauHoi}
              onChange={handleChangeCauHoi}
              buttonStyle="solid"
              style={{
                display: "flex",
                flexWrap: "wrap",
                maxWidth: "100%",
              }}
            >
              {ListCauHoi.map((item, index) => {
                const isSelected = CauHoi === item.vptq_lms_ThiThuChiTiet_Id;
                const isChon = item.list_DapAns.some((ans) => ans.isChon);

                return (
                  <Radio.Button
                    key={item.vptq_lms_ThiThuChiTiet_Id}
                    value={item.vptq_lms_ThiThuChiTiet_Id}
                    style={{
                      backgroundColor: isSelected
                        ? "green"
                        : isChon
                        ? "DarkGray"
                        : "",
                      color: isSelected || isChon ? "#fff" : "#000",
                    }}
                  >
                    {index + 1}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
            <Button
              style={{
                margin: "0px",
              }}
              icon={<StepForwardOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleNext}
              disabled={selectedIndex === ListCauHoi.length - 1}
            />
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
              <Row gutter={[0, 5]}>
                <Col span={24}>
                  <span
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Câu {selectedIndex + 1}. ({dethi.soDiemMoiCau} điểm):{" "}
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
                <Col span={24}>
                  <Radio.Group
                    onChange={onChangeDapAn}
                    value={DapAn || getDefaultDapAn(SelectedCauHoi.list_DapAns)}
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
                                  alignItems: "flex-start",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: "bold",
                                  }}
                                >
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                {"  "}
                                <span
                                  style={{
                                    whiteSpace: "break-spaces",
                                  }}
                                >
                                  {ans.dapAn}
                                </span>
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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "10px",
              borderTop: "1px solid #e8e8e8",
            }}
          >
            <Pagination
              total={30}
              current={page}
              pageSize={1}
              itemRender={itemRender}
              showSizeChanger={false}
              showQuickJumper
              onChange={(page) => handleChangePage(page)}
            />
          </div>
        </Card>
      ) : !KetQuaThi ? (
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Hướng dẫn thi trắc nghiệm"}
          align="center"
        >
          <Image
            src={require("public/HuongDanhThiTracNghiem.jpg")}
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
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "70px",
                  fontWeight: "bold",
                }}
              >
                Lần thi:
              </span>
              <span
                style={{
                  width: "calc(100% - 70px)",
                }}
              >
                Lần thứ {KetQuaThi.lanThiThu}
              </span>
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Thời gian bắt đầu:
              </span>
              <span
                style={{
                  width: "calc(100% - 140px)",
                }}
              >
                {KetQuaThi.thoiGianBatDau}
              </span>
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "145px",
                  fontWeight: "bold",
                }}
              >
                Thời gian kết thúc:
              </span>
              <span
                style={{
                  width: "calc(100% - 145px)",
                }}
              >
                {KetQuaThi.thoiGianKetThuc}
              </span>
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "100px",
                  fontWeight: "bold",
                }}
              >
                Số câu đúng:
              </span>
              <span
                style={{
                  width: "calc(100% - 100px)",
                }}
              >
                {KetQuaThi.soCauTraLoiDung} câu
              </span>
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "80px",
                  fontWeight: "bold",
                }}
              >
                Số điểm:
              </span>
              <span
                style={{
                  width: "calc(100% - 80px)",
                }}
              >
                {KetQuaThi.soDiem} điểm
              </span>
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "80px",
                  fontWeight: "bold",
                }}
              >
                Kết quả:
              </span>
              <span
                style={{
                  width: "calc(100% - 80px)",
                  color: KetQuaThi.ketQua === "Không đạt" ? "red" : "#0469b9",
                  fontWeight: "bold",
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
                          <Col span={24}>
                            <span
                              style={{
                                fontWeight: "bold",
                              }}
                            >
                              Câu {index + 1}. ({KetQuaThi.soDiemMoiCau} điểm):{" "}
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
                              <Row gutter={[0, 5]}>
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
                                            alignItems: "flex-start",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontWeight: "bold",
                                              color:
                                                ans.isChon && ketqua.isCorrect
                                                  ? "#0469b9"
                                                  : ans.isChon &&
                                                    !ketqua.isCorrect
                                                  ? "red"
                                                  : "",
                                            }}
                                          >
                                            {String.fromCharCode(65 + index)}.
                                          </span>
                                          {"  "}
                                          <span
                                            style={{
                                              whiteSpace: "break-spaces",
                                              fontWeight: ans.isChon && "bold",
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
