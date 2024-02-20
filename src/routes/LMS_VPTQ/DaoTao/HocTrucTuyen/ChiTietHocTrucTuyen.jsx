import { Button, Card, Col, Image, Row, Tabs, Modal as AntModal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import TabsHoiDap from "./TabsHoiDap";
import TabsDanhGia from "./TabsDanhGia";
import moment from "moment";
import Helpers from "src/helpers";
import ModalThiKhaoSat from "./ModalThiKhaoSat";

function ChiTietHocTrucTuyen({ match, history, permission }) {
  const dispatch = useDispatch();
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [ChiTiet, setChiTiet] = useState(null);
  const [id, setId] = useState(null);
  const [isSeek, setIsSeek] = useState(false);
  const [ThoiGianXem, setThoiGianXem] = useState(0);
  const [ThoiGianDaXem, setThoiGianDaXem] = useState(0);
  // const [ThoiLuongVideo, setThoiLuongVideo] = useState(0);
  const [ActiveModalThiKhaoSat, setActiveModalThiKhaoSat] = useState(false);
  const [ThoiGianThongBao, setThoiGianThongBao] = useState(null);

  useEffect(() => {
    if (permission && permission.view) {
      const { id } = match.params;
      setId(id);
      getInfo(id);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/hoc/${id}`,
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
        setChiTiet(res.data);
        setThoiGianDaXem(res.data.thoiDiemVideo);
        // setThoiLuongVideo(res.data.thoiLuongVideo);
      } else {
        setChiTiet(null);
      }
    });
  };

  const tabLabels = [
    {
      label: "Thông tin khóa học",
      children: (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
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
                  width: "90px",
                  fontWeight: "bold",
                }}
              >
                Mã lớp học:
              </span>
              {ChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 90px)",
                  }}
                >
                  {ChiTiet.maLopHoc}
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
                Tên lớp học:
              </span>
              {ChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {ChiTiet.tenLopHoc}
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
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "150px",
                  fontWeight: "bold",
                }}
              >
                Thời lượng đào tạo:
              </span>
              {ChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 150px)",
                  }}
                >
                  {ChiTiet.thoiLuongDaoTao} phút
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
                Thời gian đào tạo:
              </span>
              {ChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {ChiTiet.thoiGianDaoTao}
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
                Thời gian kết thúc:
              </span>
              {ChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {ChiTiet.thoiGianKetThuc}
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
                Ghi chú:
              </span>
              {ChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 70px)",
                  }}
                >
                  {ChiTiet.ghiChu}
                </span>
              )}
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      label: "Mô tả",
      children: (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <span>{ChiTiet && ChiTiet.moTa}</span>
        </Card>
      ),
    },
    {
      label: "Tài liệu",
      children: (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          {ChiTiet &&
            (ChiTiet.fileTaiLieu ? (
              <span>
                Tài liệu {ChiTiet.tenChuyenDeDaoTao.toLowerCase()}:{" "}
                <a
                  target="_blank"
                  href={BASE_URL_API + ChiTiet.fileTaiLieu}
                  rel="noopener noreferrer"
                >
                  {ChiTiet.fileTaiLieu && ChiTiet.fileTaiLieu.split("/")[5]}
                </a>
              </span>
            ) : null)}
        </Card>
      ),
    },
    {
      label: "Hỏi đáp",
      children: <TabsHoiDap dataHoiDap={ChiTiet && ChiTiet} />,
    },
    {
      label: "Đánh giá",
      children: <TabsDanhGia dataDanhGia={ChiTiet && ChiTiet} />,
    },
  ];

  const handleProgress = (progress) => {
    setThoiGianXem(progress.playedSeconds);
  };

  const handlePlay = () => {
    if (playerRef.current) {
      if (ThoiGianDaXem && !isSeek && !ChiTiet.isDaXemVideo) {
        playerRef.current.seekTo(ThoiGianDaXem);
        setThoiGianXem(ThoiGianDaXem);
      }
      if (!ChiTiet.isDaXemVideo) {
        intervalRef.current = setInterval(() => {
          handleGuiThoiGianXem(playerRef.current.getCurrentTime());
        }, 5000);
      }
    }
  };

  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (!ChiTiet.isDaXemVideo && ThoiGianXem > ThoiGianDaXem) {
      handleGuiThoiGianXem(ThoiGianXem);
    }
  };

  const handleSeek = () => {
    if (playerRef.current) {
      setIsSeek(true);
      const currentTime = playerRef.current.getCurrentTime();
      const thoigian = 10000;

      if (currentTime > ThoiGianDaXem && !ChiTiet.isDaXemVideo) {
        if (!ThoiGianThongBao || Date.now() - ThoiGianThongBao > thoigian) {
          Helpers.alertError("Bạn không được tua video quá nhanh!");
          setThoiGianThongBao(Date.now());
        }
        playerRef.current.seekTo(ThoiGianDaXem);
      }
    }
  };

  const ModalThi = () => {
    AntModal.success({
      content:
        "Bạn đã học xong, vui lòng làm bài thi khảo sát để kết thúc khóa học!",
    });
  };

  const ModalKhongThi = () => {
    AntModal.warning({
      content: "Chúc mừng bạn đã hoàn thành khóa học!",
    });
  };

  const handleEnded = () => {
    if (!ChiTiet.isDaXemVideo) {
      handleGuiThoiGianXem(ThoiGianXem);
      getInfo(id);
      if (ChiTiet.isThi) {
        ModalThi();
      } else {
        ModalKhongThi();
      }
    }
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  const handleGuiThoiGianXem = (thoigian) => {
    if (thoigian > ThoiGianDaXem) {
      const newData = {
        vptq_lms_LopHocChiTiet_Id: ChiTiet.vptq_lms_LopHocChiTiet_Id,
        thoiDiemVideo: thoigian,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_HocTrucTuyen/thoi-diem-video/${ChiTiet.vptq_lms_LopHocChiTiet_Id}`,
            "PUT",
            newData,
            "",
            "",
            resolve,
            reject
          )
        );
      }).then((res) => {
        if (res && res.status !== 409) {
          setThoiGianDaXem(res.data);
        }
      });
    }
  };

  const handleRefesh = () => {
    getInfo(id);
  };

  const goBack = () => {
    history.push(`${match.url.replace(`/${match.params.id}/chi-tiet`, "")}`);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={`CHUYÊN ĐỀ ${
          ChiTiet && ChiTiet.tenChuyenDeDaoTao.toUpperCase()
        }`}
        back={goBack}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col xxl={17} xl={16} lg={24} xs={24} style={{ marginBottom: 8 }}>
            {ChiTiet && (
              <ReactPlayer
                url={
                  ChiTiet.fileVideo ? BASE_URL_API + ChiTiet.fileVideo : null
                }
                controls={
                  ChiTiet.hasLopHoc &&
                  moment(ChiTiet.thoiGianDaoTao, "DD/MM/YYYY HH:mm") < moment()
                }
                width="100%"
                height="100%"
                config={{
                  file: {
                    attributes: { controlsList: "nodownload nodrag" },
                  },
                }}
                ref={playerRef}
                onContextMenu={(e) => e.preventDefault()}
                onProgress={handleProgress}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
                onEnded={handleEnded}
              />
            )}
          </Col>
          <Col xxl={7} xl={8} lg={24} xs={24} style={{ marginBottom: 8 }}>
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              style={{
                border: "2px solid #c8c8c8",
                width: "100%",
                height: "100%",
              }}
            >
              <Row gutter={[0, 8]}>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#0469b9",
                    }}
                  >
                    Giới thiệu giảng viên
                  </span>
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  {ChiTiet && (
                    <Image
                      src={BASE_URL_API + ChiTiet.hinhAnhGiangVien}
                      alt="Hình ảnh giảng viên"
                      style={{ width: "100%", height: "150px" }}
                    />
                  )}
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      width: "90px",
                    }}
                  >
                    Giảng viên:
                  </span>
                  {ChiTiet && (
                    <span
                      style={{
                        width: "calc(100% - 90px)",
                        color: "#0469b9",
                      }}
                    >
                      {ChiTiet.tenGiangVien}
                    </span>
                  )}
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      width: "120px",
                    }}
                  >
                    Loại giảng viên:
                  </span>
                  {ChiTiet && (
                    <span
                      style={{
                        width: "calc(100% - 120px)",
                        color: "#0469b9",
                      }}
                    >
                      {ChiTiet.tenLoaiGiangVien}
                    </span>
                  )}
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      width: "60px",
                    }}
                  >
                    Đơn vị:
                  </span>
                  {ChiTiet && (
                    <span
                      style={{
                        width: "calc(100% - 60px)",
                        color: "#0469b9",
                      }}
                    >
                      {ChiTiet.tenDonViDaoTao}
                    </span>
                  )}
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      width: "80px",
                    }}
                  >
                    Giới thiệu:
                  </span>
                  {ChiTiet && (
                    <span
                      style={{
                        width: "calc(100% - 80px)",
                        color: "#0469b9",
                      }}
                    >
                      {ChiTiet.gioiThieu}
                    </span>
                  )}
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row
          gutter={[0, 8]}
          style={{
            marginBottom: "10px",
          }}
        >
          <Col
            xxl={17}
            xl={16}
            lg={24}
            xs={24}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {ChiTiet && (
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#0469b9",
                }}
              >
                {ChiTiet.tenChuyenDeDaoTao}
              </span>
            )}
          </Col>
          <Col xxl={17} xl={16} lg={24} xs={24}>
            <Row gutter={[0, 8]} style={{ alignItems: "center" }}>
              <Col xxl={20} xl={19} lg={18} md={18} sm={16} xs={16}>
                <Row gutter={[0, 8]}>
                  <Col
                    xxl={12}
                    xl={12}
                    lg={12}
                    md={12}
                    sm={24}
                    xs={24}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        width: "80px",
                      }}
                    >
                      Giảng viên:
                    </span>
                    {ChiTiet && (
                      <span
                        style={{
                          width: "calc(100% - 90px)",
                          color: "#0469b9",
                        }}
                      >
                        {ChiTiet.tenGiangVien}
                      </span>
                    )}
                  </Col>
                  <Col
                    xxl={12}
                    xl={12}
                    lg={12}
                    md={12}
                    sm={24}
                    xs={24}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        width: "130px",
                      }}
                    >
                      Thời lượng đào tạo:
                    </span>
                    {ChiTiet && (
                      <span
                        style={{
                          width: "calc(100% - 130px)",
                          color: "#0469b9",
                        }}
                      >
                        {ChiTiet.thoiLuongDaoTao} phút
                      </span>
                    )}
                  </Col>
                </Row>
              </Col>
              {ChiTiet &&
              ChiTiet.isDaXemVideo &&
              !ChiTiet.isDaThi &&
              ChiTiet.isThi ? (
                <Col
                  xxl={4}
                  xl={5}
                  lg={6}
                  md={6}
                  sm={8}
                  xs={8}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {ChiTiet && ChiTiet.isDangThi ? (
                    <Button
                      className="th-margin-bottom-0"
                      onClick={() => setActiveModalThiKhaoSat(true)}
                      type="danger"
                    >
                      Tiếp tục thi
                    </Button>
                  ) : (
                    <Button
                      className="th-margin-bottom-0"
                      onClick={() => setActiveModalThiKhaoSat(true)}
                      type="primary"
                    >
                      Thi khảo sát
                    </Button>
                  )}
                </Col>
              ) : null}
            </Row>
          </Col>
        </Row>
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Tabs
            defaultActiveKey="1"
            type="card"
            size={"middle"}
            items={tabLabels
              .filter((tab, index) => {
                return !(
                  ChiTiet &&
                  ChiTiet.hasLopHoc === false &&
                  tab.label === "Thông tin khóa học"
                );
              })
              .map((tab, i) => {
                const id = String(i + 1);
                return {
                  label: tab.label,
                  key: id,
                  children: tab.children,
                };
              })}
          />
        </Card>
      </Card>
      <ModalThiKhaoSat
        openModal={ActiveModalThiKhaoSat}
        openModalFS={setActiveModalThiKhaoSat}
        thongtin={ChiTiet && ChiTiet.vptq_lms_ThiTrucTuyen_Id}
        isDangThi={ChiTiet && ChiTiet.isDangThi}
        refesh={handleRefesh}
      />
    </div>
  );
}

export default ChiTietHocTrucTuyen;
