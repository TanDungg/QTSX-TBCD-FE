import {
  ExclamationCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
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
import { getTokenInfo, getLocalStorage } from "src/util/Common";

const { Countdown } = Statistic;
const { confirm } = AntModal;

function ModalThiKhaoSat({
  openModalFS,
  openModal,
  thongtin,
  isDangThi,
  refesh,
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [ThongTinDeThi, setThongTinDeThi] = useState(null);
  const [DeThi, setDeThi] = useState(null);
  const [ListCauHoi, setListCauHoi] = useState([]);
  const [DapAn, setDapAn] = useState(null);
  const [CauHoi, setCauHoi] = useState(null);
  const [KetQuaThi, setKetQuaThi] = useState(null);
  const [ChiTietKetQua, setChiTietKetQua] = useState([]);

  useEffect(() => {
    if (openModal) {
      isDangThi ? getDeThiTrucTuyen() : getThongTinThiTrucTuyen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getThongTinThiTrucTuyen = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/thong-tin-ve-bai-thi/${thongtin}`,
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
          setThongTinDeThi(res.data);
        } else {
          setThongTinDeThi(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const getDeThiTrucTuyen = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/${thongtin}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          if (res.data.isDaThi === false) {
            setThongTinDeThi(res.data);
            setDeThi(res.data);
            setListCauHoi(res.data.list_ChiTiets);
            setCauHoi(
              res.data.list_ChiTiets &&
                res.data.list_ChiTiets[0].vptq_lms_ThiTrucTuyenChiTiet_Id
            );
            setKetQuaThi(null);
            setChiTietKetQua([]);
          } else {
            setThongTinDeThi(res.data);
            setKetQuaThi(res.data);
            res.data.ketQua === "Đạt" ? ModalThiDat() : ModalThiKhongDat();
            const chitiet =
              res.data.list_ChiTiets &&
              JSON.parse(res.data.list_ChiTiets).map((ct) => {
                return {
                  ...ct,
                  list_DapAns: ct.list_DapAns.map((ans) => {
                    return {
                      ...ans,
                      vptq_lms_ThiTrucTuyenChiTietDapAn_Id:
                        ans.vptq_lms_ThiTrucTuyenChiTietDapAn_Id.toLowerCase(),
                      isChon: ans.isChon === 1 ? true : false,
                    };
                  }),
                };
              });
            setChiTietKetQua(chitiet);
          }
        } else {
          setThongTinDeThi(null);
          setListCauHoi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const ModalThi = (item) => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: "Xác nhận thi khảo sát!",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        getDeThiTrucTuyen(item);
      },
    });
  };

  const ModalThiDat = () => {
    AntModal.success({
      content: "Chúc mừng bạn đã vượt qua bài thi khảo sát!",
    });
  };
  const ModalThiKhongDat = () => {
    AntModal.error({
      content: "Rất tiếc, bạn đã không vượt qua bài thi khảo sát!",
    });
  };

  const handleKetThucThi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/nop-bai?vptq_lms_ThiTrucTuyen_Id=${ThongTinDeThi.vptq_lms_ThiTrucTuyen_Id}`,
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
          getDeThiTrucTuyen();
          setDeThi(null);
          setListCauHoi([]);
          setCauHoi(null);
          refesh();
        } else if (res && res.data) {
          openModalFS(false);
          setThongTinDeThi(null);
          setListCauHoi([]);
          setCauHoi(null);
          setKetQuaThi(null);
          setChiTietKetQua([]);
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận nộp bài",
    onOk: handleKetThucThi,
  };

  const ModalXacNhanNopBai = () => {
    Modal(prop);
  };

  const handleChangeCauHoi = (e) => {
    setDapAn(null);
    setCauHoi(e.target.value);
  };

  const SelectedCauHoi =
    ListCauHoi &&
    ListCauHoi.find((item) => item.vptq_lms_ThiTrucTuyenChiTiet_Id === CauHoi);

  const selectedIndex =
    ListCauHoi &&
    ListCauHoi.findIndex(
      (item) => item.vptq_lms_ThiTrucTuyenChiTiet_Id === CauHoi
    );

  const handlePrev = () => {
    const prevIndex = selectedIndex - 1;
    if (prevIndex >= 0) {
      setDapAn(null);
      setCauHoi(ListCauHoi[prevIndex].vptq_lms_ThiTrucTuyenChiTiet_Id);
    }
  };

  const handleNext = () => {
    const nextIndex = selectedIndex + 1;
    if (nextIndex < ListCauHoi.length) {
      setDapAn(null);
      setCauHoi(ListCauHoi[nextIndex].vptq_lms_ThiTrucTuyenChiTiet_Id);
    }
  };

  const getDefaultDapAn = (list_DapAns) => {
    const dapan = list_DapAns.find((ans) => ans.isChon);
    return dapan ? dapan.vptq_lms_ThiTrucTuyenChiTietDapAn_Id : undefined;
  };

  const onChangeDapAn = (val) => {
    const dapAn_Id = val.target.value;
    setDapAn(dapAn_Id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/chon-dap-an?vptq_lms_ThiTrucTuyenChiTietDapAn_Id=${dapAn_Id}`,
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
              ch.vptq_lms_ThiTrucTuyenChiTiet_Id ===
              SelectedCauHoi.vptq_lms_ThiTrucTuyenChiTiet_Id
            ) {
              const listdapan = ch.list_DapAns.map((ans) => {
                if (ans.vptq_lms_ThiTrucTuyenChiTietDapAn_Id === dapAn_Id) {
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
        } else if (res && res.data) {
          openModalFS(false);
          setThongTinDeThi(null);
          setListCauHoi([]);
          setCauHoi(null);
          setKetQuaThi(null);
          setChiTietKetQua([]);
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = () => {
    Helpers.alertError("Hết thời gian thi!");
    handleKetThucThi();
  };

  const handleCancel = () => {
    if (ListCauHoi.length) {
      ModalXacNhanNopBai();
    } else {
      openModalFS(false);
      setThongTinDeThi(null);
      setListCauHoi([]);
      setCauHoi(null);
      setKetQuaThi(null);
      setChiTietKetQua([]);
      refesh();
    }
  };

  const title = (
    <span>
      ĐỀ THI {ThongTinDeThi && ThongTinDeThi.tenChuyenDeDaoTao.toUpperCase()}{" "}
    </span>
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
            xxl={8}
            xl={8}
            lg={12}
            md={24}
            sm={24}
            xs={24}
            className="title-span"
          >
            <span style={{ whiteSpace: "nowrap" }}>
              <strong>Tên đề thi:</strong>
            </span>
            {ThongTinDeThi && <span>{ThongTinDeThi.tenDeThi}</span>}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={24}
            sm={24}
            xs={24}
            className="title-span"
          >
            <span>
              <strong>Số lượng câu hỏi:</strong>
            </span>
            {ThongTinDeThi && ThongTinDeThi.soLuongCauHoi && (
              <span>{ThongTinDeThi.soLuongCauHoi} câu</span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={24}
            sm={24}
            xs={24}
            className="title-span"
          >
            <span>
              <strong>Thời gian làm bài:</strong>
            </span>
            {ThongTinDeThi && ThongTinDeThi.thoiGianLamBai && (
              <span>{ThongTinDeThi.thoiGianLamBai} phút</span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={24}
            sm={24}
            xs={24}
            className="title-span"
          >
            <span>
              <strong>Thang điểm:</strong>
            </span>
            {ThongTinDeThi && ThongTinDeThi.thangDiem && (
              <span>{ThongTinDeThi.thangDiem} điểm</span>
            )}
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={24}
            sm={24}
            xs={24}
            className="title-span"
          >
            <span>
              <strong>Tiêu chuẩn đạt:</strong>
            </span>
            {ThongTinDeThi && ThongTinDeThi.tieuChuanDat && (
              <span>{ThongTinDeThi.tieuChuanDat}%</span>
            )}
          </Col>
          {ListCauHoi.length && DeThi ? (
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span>
                <strong>Thời gian còn lại:</strong>
              </span>
              <span
                style={{
                  color: "red",
                  fontWeight: "bold",
                }}
              >
                <Countdown
                  value={moment(DeThi.gioiHanThoiGianThi, "DD/MM/YYYY HH:mm:ss")
                    .toDate()
                    .getTime()}
                  onFinish={onFinish}
                />
              </span>
            </Col>
          ) : null}
        </Row>
        <div align={"end"}>
          {DeThi ? (
            <Button
              className="th-margin-bottom-0"
              onClick={() => ModalXacNhanNopBai()}
              type="danger"
            >
              Nộp bài
            </Button>
          ) : KetQuaThi && KetQuaThi.isDaThi === 1 ? null : (
            <Button
              className="th-margin-bottom-0"
              onClick={() => ModalThi(thongtin)}
              type="primary"
            >
              Bắt đầu
            </Button>
          )}
        </div>
      </Card>
      {ListCauHoi.length !== 0 ? (
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách câu hỏi"}
        >
          <Row gutter={[0, 10]}>
            <Col
              span={24}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <Button
                className="th-margin-bottom-0"
                style={{ margin: "0px" }}
                icon={<StepBackwardOutlined />}
                type="primary"
                onClick={handlePrev}
                disabled={selectedIndex === 0}
              />

              <Radio.Group
                value={CauHoi}
                onChange={handleChangeCauHoi}
                buttonStyle="solid"
                style={{ display: "flex", justifyContent: "center" }}
              >
                {ListCauHoi.map((item, index) => {
                  const isSelected =
                    CauHoi === item.vptq_lms_ThiTrucTuyenChiTiet_Id;
                  const isChon = item.list_DapAns.some((ans) => ans.isChon);

                  return (
                    <Radio.Button
                      key={item.vptq_lms_ThiTrucTuyenChiTiet_Id}
                      value={item.vptq_lms_ThiTrucTuyenChiTiet_Id}
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
                style={{ margin: "0px" }}
                icon={<StepForwardOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                onClick={handleNext}
                disabled={selectedIndex === ListCauHoi.length - 1}
              />
            </Col>
            <Col>
              <Card
                className="th-card-margin-bottom th-card-reset-margin"
                style={{
                  height: "35vh",
                  width: "100%",
                  overflowY: "auto",
                }}
              >
                <Row
                  gutter={[0, 10]}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {SelectedCauHoi ? (
                    <Col span={24}>
                      <Row gutter={[0, 5]}>
                        <Col span={24}>
                          <span
                            style={{
                              fontWeight: "bold",
                            }}
                          >
                            Câu {selectedIndex + 1}. (
                            {ThongTinDeThi && ThongTinDeThi.soDiemMoiCau} điểm):{" "}
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
                            value={
                              DapAn ||
                              getDefaultDapAn(SelectedCauHoi.list_DapAns)
                            }
                          >
                            <Row gutter={[0, 10]}>
                              {SelectedCauHoi.list_DapAns &&
                                SelectedCauHoi.list_DapAns.map((ans, index) => {
                                  return (
                                    <Col span={24}>
                                      <Radio
                                        value={
                                          ans.vptq_lms_ThiTrucTuyenChiTietDapAn_Id
                                        }
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
                    </Col>
                  ) : null}
                </Row>
              </Card>
            </Col>
          </Row>
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
          title={"Kết quả thi khảo sát"}
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
              <span>{KetQuaThi.thoiGianBatDauThi}</span>
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
              <span>{KetQuaThi.thoiGianKetThucThi}</span>
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
                                            ans.vptq_lms_ThiTrucTuyenChiTietDapAn_Id
                                          }
                                          disabled
                                          className="title-span"
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

export default ModalThiKhaoSat;
