import {
  TrademarkCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Rate,
  Row,
  Modal as AntModal,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const { confirm } = AntModal;
const { TextArea } = Input;

const TabsDanhGia = ({ dataDanhGia }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [User, setUser] = useState(null);
  const [DanhGia, setDanhGia] = useState(null);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [NoiDungDanhGia, setNoiDungDanhGia] = useState(null);
  const [RateDanhGia, setRateDanhGia] = useState(0);
  const [IsHovered, setIsHovered] = useState(false);
  const [IsEdit, setIsEdit] = useState(null);

  useEffect(() => {
    getUser();
    getInfo(dataDanhGia && dataDanhGia.vptq_lms_ChuyenDeDaoTao_Id);
    return () => dispatch(fetchReset());
  }, [dataDanhGia]);

  const getUser = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/${INFO.user_Id}`,
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
        setUser(res.data);
      } else {
        setUser(null);
      }
    });
  };

  const getInfo = (vptq_lms_ChuyenDeDaoTao_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/danh-gia/${vptq_lms_ChuyenDeDaoTao_Id}`,
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
        setDanhGia(res.data);
      } else {
        setDanhGia(null);
      }
    });
  };

  const handleDanhGia = () => {
    const newData = {
      vptq_lms_ChuyenDeDaoTao_Id: dataDanhGia.vptq_lms_ChuyenDeDaoTao_Id,
      noiDung: NoiDungDanhGia,
      diem: RateDanhGia,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/danh-gia`,
          "POST",
          newData,
          "DANHGIA",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        getInfo(dataDanhGia && dataDanhGia.vptq_lms_ChuyenDeDaoTao_Id);
        setNoiDungDanhGia(null);
        setRateDanhGia(0);
        setFieldTouch(false);
      }
    });
  };

  const handleChangeDanhGia = (val) => {
    setNoiDungDanhGia(val.target.value);
    setFieldTouch(true);
  };

  const handleCapNhatDanhGia = (vptq_lms_DanhGia_Id) => {
    const newData = {
      vptq_lms_DanhGia_Id: vptq_lms_DanhGia_Id,
      noiDung: NoiDungDanhGia,
      diem: RateDanhGia,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/danh-gia/${vptq_lms_DanhGia_Id}`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(dataDanhGia.vptq_lms_ChuyenDeDaoTao_Id);
          setNoiDungDanhGia(null);
          setRateDanhGia(0);
          setFieldTouch(false);
          setIsEdit(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleXoaDanhGia = (vptq_lms_DanhGia_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/danh-gia/${vptq_lms_DanhGia_Id}`,
          "DELETE",
          null,
          "DELETE",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(dataDanhGia.vptq_lms_ChuyenDeDaoTao_Id);
        }
      })
      .catch((error) => console.error(error));
  };

  const ModalXoaDanhGia = (vptq_lms_DanhGia_Id) => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: "Xác nhận xóa đánh giá của bạn!",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        handleXoaDanhGia(vptq_lms_DanhGia_Id);
      },
    });
  };

  return (
    <Card className="th-card-margin-bottom th-card-reset-margin">
      <div className="rate">
        <span className="rate-span" style={{ fontSize: "25px" }}>
          {DanhGia && DanhGia.diemTrungBinh}
        </span>
        <Rate value={DanhGia && DanhGia.diemTrungBinh} disabled allowHalf />
        <span
          className="rate-number"
          style={{ fontSize: "13px", alignItems: "center" }}
        >
          <TrademarkCircleOutlined /> {DanhGia && DanhGia.soLuongDanhGia} đánh
          giá
        </span>
      </div>
      {DanhGia && DanhGia.isDuocPhepDanhGia && (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <span style={{ color: "#fa8c16" }}>
            <strong>{User && User.fullName}</strong> ơi, bạn cảm nhận thấy khóa
            học này như thế nào? Hãy để lại đánh giá của mình nhé. Những đánh
            giá của bạn sẽ giúp ích rất nhiều cho Đào Tạo cũng như giảng viên để
            hoàn thiện sản phẩm của mình hơn.
          </span>
          <Row style={{ marginTop: "10px" }}>
            <Col span={24} className="col-textarea">
              <TextArea
                rows={2}
                className="input-item"
                placeholder="Hãy nhập đánh giá của bạn..."
                value={NoiDungDanhGia}
                onChange={handleChangeDanhGia}
                autoFocus
              />
            </Col>
            <Col
              span={24}
              style={{
                display: "flex",
                marginBottom: "10px",
                alignItems: "end",
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Đánh giá của bạn:
              </span>
              <Rate
                onChange={(value) => {
                  setRateDanhGia(value);
                  setFieldTouch(true);
                }}
                value={RateDanhGia}
              />
            </Col>
            <Col span={24} className="col-button">
              <Divider />
              <Button
                icon={<SendOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                onClick={() => handleDanhGia()}
                disabled={!fieldTouch}
              >
                Gửi đánh giá
              </Button>
            </Col>
          </Row>
        </Card>
      )}
      {DanhGia && DanhGia.danhGias.length !== 0 && (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          {DanhGia.danhGias.map((danhgia, index) => {
            const editdanhgia = {
              onClick: () => {
                setIsEdit(index);
                setNoiDungDanhGia(danhgia.noiDung);
                setRateDanhGia(danhgia.diem);
              },
            };

            const deletedanhgia = {
              onClick: () =>
                ModalXoaDanhGia(danhgia && danhgia.vptq_lms_DanhGia_Id),
            };

            return IsEdit === index ? (
              <div className="rate-edit">
                <div className="avatar">
                  <img
                    src={danhgia.hinhAnhUrl}
                    alt="ảnh đại diện"
                    className="avatar"
                  />
                </div>
                <div className="title-edit">
                  <div className="user-info">
                    <span className="name">{danhgia.fullName}</span>
                  </div>
                  <Card className="th-card-margin-bottom th-card-reset-margin">
                    <span style={{ color: "#fa8c16" }}>
                      <strong>{User && User.fullName}</strong> ơi, bạn cảm nhận
                      thấy khóa học này như thế nào? Hãy để lại đánh giá của
                      mình nhé. Những đánh giá của bạn sẽ giúp ích rất nhiều cho
                      Đào Tạo cũng như giảng viên để hoàn thiện sản phẩm của
                      mình hơn.
                    </span>
                    <Row style={{ marginTop: "10px" }}>
                      <Col span={24} className="col-textarea">
                        <TextArea
                          rows={2}
                          className="input-item"
                          placeholder="Hãy nhập đánh giá của bạn..."
                          value={NoiDungDanhGia}
                          onChange={handleChangeDanhGia}
                          autoFocus
                        />
                      </Col>
                      <Col
                        span={24}
                        style={{
                          display: "flex",
                          marginBottom: "10px",
                          alignItems: "end",
                        }}
                      >
                        <span
                          style={{
                            width: "140px",
                            fontWeight: "bold",
                          }}
                        >
                          Đánh giá của bạn:
                        </span>
                        <Rate
                          onChange={(value) => {
                            setRateDanhGia(value);
                            setFieldTouch(true);
                          }}
                          value={RateDanhGia}
                        />
                      </Col>
                      <Col span={24} className="col-button">
                        <Divider />
                        <div style={{ display: "flex" }}>
                          <Button
                            icon={<CloseCircleOutlined />}
                            className="th-margin-bottom-0"
                            onClick={() => setIsEdit(null)}
                          >
                            Hủy
                          </Button>
                          <Button
                            icon={<SaveOutlined />}
                            className="th-margin-bottom-0"
                            type="primary"
                            onClick={() =>
                              handleCapNhatDanhGia(danhgia.vptq_lms_DanhGia_Id)
                            }
                            disabled={!fieldTouch}
                          >
                            Cập nhật
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="rate-container" key={index}>
                <div className="user-info">
                  <div className="avatar">
                    <img
                      src={danhgia.hinhAnhUrl}
                      alt="ảnh đại diện"
                      className="avatar"
                    />
                  </div>
                  <div className="title">
                    <div className="user-info">
                      <span className="name">{danhgia.fullName}</span>
                      {danhgia.isSuaXoa ? (
                        <a
                          {...editdanhgia}
                          style={{
                            fontSize: "13px",
                            transition: "color 0.3s",
                          }}
                          onMouseOver={(e) => (e.target.style.color = "orange")}
                          onMouseOut={(e) => (e.target.style.color = "")}
                          onMouseDown={(e) => (e.target.style.color = "orange")}
                          onMouseUp={(e) => (e.target.style.color = "")}
                          title="Chỉnh sửa đánh giá"
                        >
                          <EditOutlined />
                        </a>
                      ) : null}
                      {danhgia.isSuaXoa ? (
                        <a
                          {...deletedanhgia}
                          style={{
                            color: IsHovered ? "orange" : "red",
                            transition: "color 0.3s",
                            fontSize: "13px",
                          }}
                          onMouseOver={() => setIsHovered(true)}
                          onMouseOut={() => setIsHovered(false)}
                          onMouseDown={() => setIsHovered(true)}
                          onMouseUp={() => setIsHovered(true)}
                          title="Xóa đánh giá"
                        >
                          <DeleteOutlined />
                        </a>
                      ) : null}
                      {!danhgia.isDuyet && (
                        <Tag
                          color={!danhgia.isDuyet && "red"}
                          style={{
                            fontWeight: "normal",
                            fontSize: "13px",
                          }}
                        >
                          {danhgia.lyDoTuChoi
                            ? `Đã bị từ chối: ${danhgia.lyDoTuChoi}`
                            : "Chưa duyệt"}
                        </Tag>
                      )}
                    </div>
                    <div className="title-rate">
                      <Rate
                        className="rate-diem"
                        value={danhgia.diem}
                        disabled
                        allowHalf
                      />
                      <span className="date">{danhgia.ngayTao}</span>
                    </div>
                  </div>
                </div>
                <div className="title">
                  <span>{danhgia.noiDung}</span>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </Card>
  );
};

export default TabsDanhGia;
