import { Button, Card, Col, Image, Row, Tabs, Modal as AntModal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import TabsHoiDap from "./TabsHoiDap";
import TabsDanhGia from "./TabsDanhGia";
import ModalThiKhaoSat from "./ModalThiKhaoSat";
import { Modal } from "src/components/Common";
import Hls from "hls.js";

function ChiTietHocTrucTuyen({ match, history, permission }) {
  const dispatch = useDispatch();
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [ChiTiet, setChiTiet] = useState(null);
  const [id, setId] = useState(null);
  const [isSeek, setIsSeek] = useState(false);
  const [ThoiGianXem, setThoiGianXem] = useState(0);
  const [ThoiGianDaXem, setThoiGianDaXem] = useState(0);
  const [ThoiLuongVideo, setThoiLuongVideo] = useState(null);
  const [ActiveModalThiKhaoSat, setActiveModalThiKhaoSat] = useState(false);

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
    // new Promise((resolve, reject) => {
    //   dispatch(
    //     fetchStart(
    //       `vptq_lms_HocTrucTuyen/hoc/${id}`,
    //       "GET",
    //       null,
    //       "DETAIL",
    //       "",
    //       resolve,
    //       reject
    //     )
    //   );
    // }).then((res) => {
    //   if (res && res.data) {
    //     setChiTiet(res.data);
    //     setThoiGianDaXem(res.data.thoiDiemVideo);
    //     setThoiLuongVideo(res.data.thoiLuongVideo);
    //   } else {
    //     setChiTiet(null);
    //   }
    // });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/hoc-video-chia-nho/${id}`,
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
        setThoiLuongVideo(res.data.thoiLuongVideo);
        res.data.fileVideo && setupVideo(res.data.fileVideo);
      } else {
        setChiTiet(null);
      }
    });
  };

  const setupVideo = (fileVideo) => {
    const video = playerRef.current;
    const videoSrc = BASE_URL_API + fileVideo;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
    }
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
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Mã lớp học:
              </span>
              {ChiTiet && <span>{ChiTiet.maLopHoc}</span>}
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
              <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Tên lớp học:
              </span>
              {ChiTiet && <span>{ChiTiet.tenLopHoc}</span>}
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
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Thời lượng đào tạo:
              </span>
              {ChiTiet && ChiTiet.thoiLuongDaoTao && (
                <span>{ChiTiet.thoiLuongDaoTao} phút</span>
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
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Thời gian đào tạo:
              </span>
              {ChiTiet && <span>{ChiTiet.thoiGianDaoTao}</span>}
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
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Thời gian kết thúc:
              </span>
              {ChiTiet && <span>{ChiTiet.thoiGianKetThuc}</span>}
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
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Ghi chú:
              </span>
              {ChiTiet && <span>{ChiTiet.ghiChu}</span>}
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      label: "Mô tả",
      children: (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <span style={{ whiteSpace: "pre-line" }}>
            {ChiTiet && ChiTiet.moTa}
          </span>
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

  const handleTimeUpdate = () => {
    const currentTime = playerRef.current.currentTime;
    setThoiGianXem(currentTime);
  };

  const handlePlay = () => {
    if (playerRef.current) {
      const videoPlayer = playerRef.current;
      if (ThoiGianDaXem && !isSeek && !ChiTiet.isDaXemVideo) {
        videoPlayer.currentTime = ThoiGianDaXem;
        setThoiGianXem(ThoiGianDaXem);
      }

      if (!ChiTiet.isDaXemVideo) {
        intervalRef.current = setInterval(() => {
          handleGuiThoiGianXem(videoPlayer.currentTime);
        }, 5000);
      }
    }
  };

  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (
      !ChiTiet.isDaXemVideo &&
      ThoiGianXem > ThoiGianDaXem &&
      parseFloat(ThoiGianXem.toFixed(0)) !==
        parseFloat(ThoiLuongVideo.toFixed(0))
    ) {
      handleGuiThoiGianXem(ThoiGianXem);
    }
  };

  const handleSeeked = () => {
    if (playerRef.current) {
      setIsSeek(true);
      const videoPlayer = playerRef.current;
      const currentTime = videoPlayer.currentTime;
      if (currentTime > ThoiGianDaXem && !ChiTiet.isDaXemVideo) {
        videoPlayer.currentTime = ThoiGianDaXem;
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
    handleGuiThoiGianXem(ThoiGianXem);
    getInfo(id);
    if (ChiTiet && ChiTiet.isDaXemVideo) {
      if (playerRef.current) {
        playerRef.current.currentTime = 0;
      }
    }
  };

  const handleGuiThoiGianXem = (thoigian) => {
    if (thoigian > ThoiGianDaXem && thoigian > 1) {
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
          if (
            parseFloat(thoigian.toFixed(0)) ===
            parseFloat(ThoiLuongVideo.toFixed(0))
          ) {
            if (ChiTiet && !ChiTiet.isDaXemVideo) {
              if (ChiTiet && ChiTiet.isThi) {
                ModalThi();
              } else {
                ModalKhongThi();
              }
            }
          }
        } else {
          playerRef.current.currentTime = ThoiGianDaXem;
        }
      });
    }
  };

  const handleTiepTucThi = () => {
    setActiveModalThiKhaoSat(true);
  };

  const proptieptucthi = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Tiếp tục thi khảo sát!",
    onOk: handleTiepTucThi,
  };

  const ModalTiepTucThi = () => {
    Modal(proptieptucthi);
  };

  const handleRefesh = () => {
    getInfo(id);
  };

  const goBack = () => {
    history.push(`${match.url.replace(`/${match.params.id}/chi-tiet`, "")}`);
  };
  const title = ChiTiet && ChiTiet.tenChuyenDeDaoTao && (
    <span>CHUYÊN ĐỀ {ChiTiet.tenChuyenDeDaoTao.toUpperCase()}</span>
  );
  return (
    <div className="gx-main-content">
      <ContainerHeader title={title} back={goBack} />
      {ChiTiet ? (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row>
            <Col
              xxl={17}
              xl={16}
              lg={24}
              xs={24}
              style={{
                marginBottom: 8,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {!ChiTiet.hasLopHoc || !ChiTiet.isDangHoc ? (
                <img
                  src={BASE_URL_API + ChiTiet.anhDaiDienChuyenDe}
                  alt={"Ảnh đại diện chuyên đề"}
                  style={{
                    width: "100%",
                    height: "550px",
                  }}
                />
              ) : (
                <video
                  ref={playerRef}
                  controls
                  style={{ width: "100%", height: "550px" }}
                  config={{
                    file: {
                      attributes: { controlsList: "nodownload nodrag" },
                    },
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onSeeked={handleSeeked}
                  onEnded={handleEnded}
                />
              )}
              {/* <ReactPlayer
                url={ChiTiet && BASE_URL_API + ChiTiet.fileVideo}
                controls={true}
                width="100%"
                height="500px"
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
                onSeeked={handleSeeked}
                onEnded={handleEnded}
              /> */}
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
                      GIỚI THIỆU GIẢNG VIÊN
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
                        style={{ width: "150px" }}
                      />
                    )}
                  </Col>
                  <Col span={24} className="title-span">
                    <span>
                      <strong>Giảng viên:</strong>
                    </span>
                    {ChiTiet && <span>{ChiTiet.tenGiangVien}</span>}
                  </Col>
                  <Col span={24} className="title-span">
                    <span>
                      <strong>Loại giảng viên:</strong>
                    </span>
                    {ChiTiet && <span>{ChiTiet.tenLoaiGiangVien}</span>}
                  </Col>
                  <Col span={24} className="title-span">
                    <span style={{ whiteSpace: "nowrap" }}>
                      <strong>Đơn vị:</strong>
                    </span>
                    {ChiTiet && <span>{ChiTiet.tenDonViDaoTao}</span>}
                  </Col>
                  <Col span={24} className="title-span">
                    <span style={{ whiteSpace: "nowrap" }}>
                      <strong>Giới thiệu:</strong>
                    </span>
                    {ChiTiet && (
                      <span style={{ whiteSpace: "pre-line" }}>
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
                      className="title-span"
                    >
                      <span>
                        <strong>Giảng viên:</strong>
                      </span>
                      {ChiTiet && <span>{ChiTiet.tenGiangVien}</span>}
                    </Col>
                    <Col
                      xxl={12}
                      xl={12}
                      lg={12}
                      md={12}
                      sm={24}
                      xs={24}
                      className="title-span"
                    >
                      <span>
                        <strong>Thời lượng đào tạo:</strong>
                      </span>
                      {ChiTiet && ChiTiet.thoiLuongDaoTao && (
                        <span>{ChiTiet.thoiLuongDaoTao} phút</span>
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
                        onClick={() => ModalTiepTucThi()}
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
                    (ChiTiet &&
                      ChiTiet.hasLopHoc === false &&
                      tab.label === "Thông tin khóa học") ||
                    (ChiTiet &&
                      ChiTiet.hasLopHoc === false &&
                      tab.label === "Tài liệu")
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
      ) : null}
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
