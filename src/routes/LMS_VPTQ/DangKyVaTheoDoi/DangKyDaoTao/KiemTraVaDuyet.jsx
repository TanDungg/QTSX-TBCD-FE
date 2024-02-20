import React, { useState, useEffect } from "react";
import { Card, Divider, Tag, Modal as AntModal, Button, Row, Col } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import map from "lodash/map";
import { Modal, Table } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  reDataForTable,
  removeDuplicates,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalTuChoi from "./ModalTuChoi";

function KiemTraVaDuyet({ history, permission }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [PhieuDangKy, setPhieuDangKy] = useState(null);
  const [ListCBNV, setListCBNV] = useState(null);
  const [ActiveModalKiemTra, setActiveModalKiemTra] = useState(false);
  const [ActiveModalDuyet, setActiveModalDuyet] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListData();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/phieu-chua-kiem-tra-hoac-duyet`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListCBNV = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/${id}`,
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
          setListCBNV(
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets)
          );
        }
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const kiemtra =
      !item.isKiemTra && INFO.user_Id === item.nguoiKiemTra_Id
        ? {
            onClick: () => {
              setActiveModalKiemTra(true);
              setPhieuDangKy(item);
              getListCBNV(item.id);
            },
          }
        : { disabled: true };

    const duyet =
      item.isKiemTra && !item.duyet && INFO.user_Id === item.nguoiDuyet_Id
        ? {
            onClick: () => {
              setActiveModalDuyet(true);
              setPhieuDangKy(item);
              getListCBNV(item.id);
            },
          }
        : { disabled: true };

    return (
      <React.Fragment>
        <a {...kiemtra} title="Xóa">
          <SettingOutlined />
        </a>
        <Divider type="vertical" />
        <a {...duyet} title="Xóa">
          <CheckCircleOutlined />
        </a>
      </React.Fragment>
    );
  };

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      fixed: width > 1600 && "left",
    },
    {
      title: "Mã phiếu",
      dataIndex: "maPhieuDangKyDaoTao",
      key: "maPhieuDangKyDaoTao",
      align: "center",
      width: 130,
      fixed: width > 1600 && "left",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maPhieuDangKyDaoTao,
            value: d.maPhieuDangKyDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieuDangKyDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên phiếu",
      dataIndex: "tenPhieuDangKyDaoTao",
      key: "tenPhieuDangKyDaoTao",
      align: "left",
      width: 150,
      fixed: width > 1600 && "left",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenPhieuDangKyDaoTao,
            value: d.tenPhieuDangKyDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenPhieuDangKyDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 180,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenChuyenDeDaoTao,
            value: d.tenChuyenDeDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenChuyenDeDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          dự kiến đào tạo
        </div>
      ),
      dataIndex: "thoiGianDuKien",
      key: "thoiGianDuKien",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.thoiGianDuKien,
            value: d.thoiGianDuKien,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianDuKien.includes(value),
      filterSearch: true,
    },
    {
      title: "Người đăng ký",
      dataIndex: "tenNguoiTao",
      key: "tenNguoiTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenNguoiTao,
            value: d.tenNguoiTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenHinhThucDaoTao,
            value: d.tenHinhThucDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenHinhThucDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Mục tiêu đào tạo",
      dataIndex: "mucTieu",
      key: "mucTieu",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.mucTieu,
            value: d.mucTieu,
          };
        })
      ),
      onFilter: (value, record) => record.mucTieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 250,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenDonVi,
            value: d.tenDonVi,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonVi.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      width: 90,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.soLuong,
            value: d.soLuong,
          };
        })
      ),
      onFilter: (value, record) => record.soLuong.toString().includes(value),
      filterSearch: true,
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 130,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tinhTrang,
            value: d.tinhTrang,
          };
        })
      ),
      onFilter: (value, record) => record.tinhTrang.includes(value),
      filterSearch: true,
      render: (value) => (
        <div>
          {value && (
            <Tag
              color={
                value === "Chưa kiểm tra" || value === "Đã kiểm tra, Chưa duyệt"
                  ? "orange"
                  : value === "Đã duyệt"
                  ? "blue"
                  : "red"
              }
              style={{
                whiteSpace: "break-spaces",
                fontSize: 13,
              }}
            >
              {value}
            </Tag>
          )}
        </div>
      ),
    },
  ];

  let columnCBNV = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 100,
    },
    {
      title: "Họ & tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 180,
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      width: 100,
      align: "center",
    },
    {
      title: "Chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
      width: 120,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 180,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 200,
    },
  ];

  const handleXacNhan = () => {
    const newData = { id: PhieuDangKy.id };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/kiem-tra-hoac-duyet/${PhieuDangKy.id}`,
          "PUT",
          newData,
          "KIEMTRA",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setActiveModalKiemTra(false);
          setActiveModalDuyet(false);
          getListData();
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: ActiveModalKiemTra
      ? "Xác nhận đã kiểm tra"
      : "Xác nhận duyệt phiếu đăng ký đào tạo",
    onOk: handleXacNhan,
  };

  const XacNhan = () => {
    Modal(prop);
  };

  const handleTuChoi = (data) => {
    const newData = {
      id: PhieuDangKy.id,
      lyDoTuChoi: data,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/kiem-tra-hoac-duyet/${PhieuDangKy.id}`,
          "PUT",
          newData,
          "TUCHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        setActiveModalKiemTra(false);
        setActiveModalDuyet(false);
        getListData();
      })
      .catch((error) => console.error(error));
  };

  const title = ActiveModalKiemTra
    ? `KIỂM TRA ĐĂNG KÝ ĐÀO TẠO ${
        PhieuDangKy && PhieuDangKy.maPhieuDangKyDaoTao
      }`
    : `DUYỆT ĐĂNG KÝ ĐÀO TẠO ${PhieuDangKy && PhieuDangKy.maPhieuDangKyDaoTao}`;

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Kiểm tra và duyệt đăng ký đào tạo"
        description="Danh sách kiểm tra và duyệt đăng ký đào tạo"
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1650, y: "43vh" }}
          columns={renderHead}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(Data)}
          size="small"
          pagination={false}
          loading={loading}
        />
      </Card>
      <AntModal
        title={title}
        className="th-card-reset-margin"
        open={ActiveModalKiemTra ? ActiveModalKiemTra : ActiveModalDuyet}
        width={width >= 1600 ? `80%` : "100%"}
        closable={true}
        onCancel={() => {
          if (ActiveModalKiemTra) {
            setActiveModalKiemTra(false);
            setPhieuDangKy(null);
            setListCBNV([]);
          } else {
            setActiveModalDuyet(false);
            setPhieuDangKy(null);
            setListCBNV([]);
          }
        }}
        footer={null}
      >
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
                  width: "150px",
                  fontWeight: "bold",
                }}
              >
                Tên phiếu đăng ký:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 150px)",
                  }}
                >
                  {PhieuDangKy.tenPhieuDangKyDaoTao}
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
                Chuyên đề đào tạo:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 150px)",
                  }}
                >
                  {PhieuDangKy.tenChuyenDeDaoTao}
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
                Thời gian dự kiến:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {PhieuDangKy.thoiGianDuKien}
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
                Đơn vị:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 70px)",
                  }}
                >
                  {PhieuDangKy.tenDonVi}
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
                Mục tiêu đào tạo:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {PhieuDangKy.mucTieu}
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
                  width: "130px",
                  fontWeight: "bold",
                }}
              >
                Người tạo phiếu:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 130px)",
                  }}
                >
                  {PhieuDangKy.tenNguoiTao}
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
                Người kiểm tra:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {PhieuDangKy.tenNguoiKiemTra}
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
                  width: "120px",
                  fontWeight: "bold",
                }}
              >
                Người duyệt:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 120px)",
                  }}
                >
                  {PhieuDangKy.tenNguoiDuyet}
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
                  width: "120px",
                  fontWeight: "bold",
                }}
              >
                Ghi chú:
              </span>
              {PhieuDangKy && (
                <span
                  style={{
                    width: "calc(100% - 120px)",
                  }}
                >
                  {PhieuDangKy.moTa}
                </span>
              )}
            </Col>
          </Row>
        </Card>
        <Card
          className="th-card-margin-bottom"
          title={"Danh sách CBNV đăng ký đào tạo"}
        >
          <Table
            bordered
            scroll={{ x: 1000, y: "35vh" }}
            columns={columnCBNV}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(ListCBNV)}
            size="small"
            pagination={false}
            // loading={loading}
          />
        </Card>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <Button
              icon={<CheckCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={XacNhan}
            >
              Xác nhận
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              className="th-margin-bottom-0"
              type="danger"
              onClick={() => setActiveModalTuChoi(true)}
            >
              Hủy
            </Button>
          </div>
        </div>
      </AntModal>
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        handleTuChoi={handleTuChoi}
      />
    </div>
  );
}

export default KiemTraVaDuyet;
