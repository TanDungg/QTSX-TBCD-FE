import React, { useState, useEffect } from "react";
import { Card, Tag, Modal as AntModal, Button, Row, Col } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import map from "lodash/map";
import { Modal, Table } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { reDataForTable, removeDuplicates } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import ModalTuChoi from "./ModalTuChoi";

function KiemTraVaDuyet({ history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [DataChiTiet, setDataChiTiet] = useState(null);
  const [SelectedChuyenDe, setSelectedChuyenDe] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  const [ActiveModalChiTiet, setActiveModalChiTiet] = useState(false);
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

  const getDataChiTiet = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/${id}`,
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
          setActiveModalChiTiet(true);
          setDataChiTiet(res.data);
        } else {
          setActiveModalChiTiet(true);
          setDataChiTiet(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const hanldeXemChiTiet = (item) => {
    getDataChiTiet(item.id);
  };
  let renderHead = [
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
      render: (value, record) => {
        return (
          <div
            style={{ color: "#0469b9", cursor: "pointer" }}
            onClick={() => {
              hanldeXemChiTiet(record);
            }}
          >
            {value}
          </div>
        );
      },
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
      dataIndex: "tenMucTieuDaoTao",
      key: "tenMucTieuDaoTao",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenMucTieuDaoTao,
            value: d.tenMucTieuDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenMucTieuDaoTao.includes(value),
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
    const newData = SelectedChuyenDe.map((chuyende) => {
      return chuyende.id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/kiem-tra-hoac-duyet`,
          "PUT",
          newData,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setSelectedChuyenDe([]);
          setSelectedKeys([]);
          getListData();
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận kiểm tra (duyệt) phiếu đăng ký đào tạo",
    onOk: handleXacNhan,
  };

  const ModalXacNhan = () => {
    Modal(prop);
  };

  const handleTuChoi = (data) => {
    const newData = SelectedChuyenDe.map((chuyende) => {
      return chuyende.id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_PhieuDangKyDaoTao/kiem-tra-hoac-duyet?lyDoTuChoi=${data}`,
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
        setSelectedChuyenDe([]);
        setSelectedKeys([]);
        getListData();
      })
      .catch((error) => console.error(error));
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<CheckCircleOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={ModalXacNhan}
          disabled={SelectedChuyenDe.length === 0}
        >
          Kiểm tra (Duyệt)
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="danger"
          onClick={() => setActiveModalTuChoi(true)}
          disabled={SelectedChuyenDe.length === 0}
        >
          Từ chối
        </Button>
      </>
    );
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedChuyenDe,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedChuyenDe = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedChuyenDe(newSelectedChuyenDe);
      setSelectedKeys(newSelectedKeys);
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Kiểm tra và duyệt đăng ký đào tạo"
        description="Danh sách kiểm tra và duyệt đăng ký đào tạo"
        buttons={addButtonRender()}
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
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: SelectedKeys,
          }}
        />
      </Card>
      <AntModal
        title={"Chi tiết phiếu đăng ký đào tạo"}
        className="th-card-reset-margin"
        open={ActiveModalChiTiet}
        width={width >= 1600 ? `80%` : "100%"}
        closable={true}
        onCancel={() => {
          setActiveModalChiTiet(false);
        }}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Tên phiếu đăng ký:</strong>{" "}
                  {DataChiTiet.tenPhieuDangKyDaoTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Chuyên đề đào tạo:</strong>{" "}
                  {DataChiTiet.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Thời gian dự kiến:</strong>{" "}
                  {DataChiTiet.thoiGianDuKien}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Đơn vị:</strong> {DataChiTiet.tenDonVi}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Mục tiêu đào tạo:</strong> {DataChiTiet.mucTieu}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Người tạo phiếu:</strong> {DataChiTiet.tenNguoiTao}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Người kiểm tra:</strong> {DataChiTiet.tenNguoiKiemTra}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Người duyệt:</strong> {DataChiTiet.tenNguoiDuyet}
                </span>
              )}
            </Col>
            <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
              {DataChiTiet && (
                <span>
                  <strong>Ghi chú:</strong> {DataChiTiet.moTa}
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
            dataSource={reDataForTable(
              DataChiTiet &&
                DataChiTiet.list_ChiTiets &&
                JSON.parse(DataChiTiet.list_ChiTiets)
            )}
            size="small"
            pagination={false}
          />
        </Card>
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
