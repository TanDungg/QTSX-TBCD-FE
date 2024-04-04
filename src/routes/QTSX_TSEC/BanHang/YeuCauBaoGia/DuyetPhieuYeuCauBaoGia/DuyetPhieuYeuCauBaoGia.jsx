import { Button, Card, Col, Modal as AntModal, Row, Tag, Form } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  Modal,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import ModalTuChoi from "./ModalTuChoi";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function DuyetPhieuYeuCauBaoGia({ history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [ListKhachHang, setListKhachHang] = useState([]);
  const [KhachHang, setKhachHang] = useState(null);
  const [SelectedPhieuYeuCau, setSelectedPhieuYeuCau] = useState([]);
  const [SelectedKeyPhieus, setSelectedKeyPhieus] = useState([]);
  const [DataChiTietPhieu, setDataChiTietPhieu] = useState(null);
  const [ActiveModalChiTietPhieu, setActiveModalChiTietPhieu] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListKhachHang();
      getListData(KhachHang, keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = (tsec_qtsx_KhachHang_Id, keyword) => {
    let param = convertObjectToUrlParams({
      tsec_qtsx_KhachHang_Id,
      keyword,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_PhieuYeuCauBaoGia/chua-kiem-tra-hoac-duyet?${param}`,
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
        setData(res.data);
      } else {
        setData([]);
      }
    });
  };

  const getListKhachHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_KhachHang?page=-1`,
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
        setListKhachHang(res.data);
      } else {
        setListKhachHang([]);
      }
    });
  };

  const onSearchPhieuYeuCauBaoGia = () => {
    getListData(KhachHang, keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(KhachHang, val.target.value);
    }
  };

  const handleXemChiTiet = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_PhieuYeuCauBaoGia/${item.id}`,
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
        const newData = {
          ...res.data,
          list_ChiTiets:
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets),
        };
        setDataChiTietPhieu(newData);
        setActiveModalChiTietPhieu(true);
      } else {
        setDataChiTietPhieu(null);
      }
    });
  };

  let dataList = reDataForTable(Data);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã phiếu yêu cầu",
      dataIndex: "maPhieuYeuCauBaoGia",
      key: "maPhieuYeuCauBaoGia",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuYeuCauBaoGia,
            value: d.maPhieuYeuCauBaoGia,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maPhieuYeuCauBaoGia &&
        record.maPhieuYeuCauBaoGia.includes(value),
      filterSearch: true,
      render: (value, record) => {
        return (
          <div
            style={{ color: "#0469b9", cursor: "pointer" }}
            onClick={() => {
              handleXemChiTiet(record);
            }}
          >
            {value}
          </div>
        );
      },
    },
    {
      title: "Tên phiếu yêu cầu",
      dataIndex: "tenPhieuYeuCauBaoGia",
      key: "tenPhieuYeuCauBaoGia",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenPhieuYeuCauBaoGia,
            value: d.tenPhieuYeuCauBaoGia,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenPhieuYeuCauBaoGia &&
        record.tenPhieuYeuCauBaoGia.includes(value),
      filterSearch: true,
    },
    {
      title: "Khách hàng",
      dataIndex: "tenKhachHang",
      key: "tenKhachHang",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhachHang,
            value: d.tenKhachHang,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenKhachHang && record.tenKhachHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "tenLoaiSanPham",
      key: "tenLoaiSanPham",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLoaiSanPham,
            value: d.tenLoaiSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenLoaiSanPham && record.tenLoaiSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          đặt hàng
        </div>
      ),
      dataIndex: "soLuongDatHang",
      key: "soLuongDatHang",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.soLuongDatHang,
            value: d.soLuongDatHang,
          };
        })
      ),
      onFilter: (value, record) =>
        record.soLuongDatHang && record.soLuongDatHang.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Đơn vị
          <br />
          tính
        </div>
      ),
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonViTinh,
            value: d.tenDonViTinh,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenDonViTinh && record.tenDonViTinh.includes(value),
      filterSearch: true,
    },
    {
      title: "Nội dung thực hiện",
      dataIndex: "noiDungThucHien",
      key: "noiDungThucHien",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.noiDungThucHien,
            value: d.noiDungThucHien,
          };
        })
      ),
      onFilter: (value, record) =>
        record.noiDungThucHien && record.noiDungThucHien.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          hoàn thành
        </div>
      ),
      dataIndex: "thoiGianHoanThanh",
      key: "thoiGianHoanThanh",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianHoanThanh,
            value: d.thoiGianHoanThanh,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiGianHoanThanh && record.thoiGianHoanThanh.includes(value),
      filterSearch: true,
    },
    {
      title: "Người tạo phiếu",
      dataIndex: "tenNguoiTao",
      key: "tenNguoiTao",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiTao,
            value: d.tenNguoiTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenNguoiTao && record.tenNguoiTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.moTa,
            value: d.moTa,
          };
        })
      ),
      onFilter: (value, record) => record.moTa && record.moTa.includes(value),
      filterSearch: true,
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 150,
      fixed: width >= 1600 && "right",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tinhTrang,
            value: d.tinhTrang,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tinhTrang && record.tinhTrang.includes(value),
      filterSearch: true,
      render: (value, record) => (
        <div title={record.lyDoTuChoi && `Lý do từ chối: ${record.lyDoTuChoi}`}>
          {value && (
            <Tag
              color={
                value === "Chưa kiểm tra"
                  ? "orange"
                  : value === "Đã duyệt"
                  ? "green"
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

  let columnChiTiet = [
    {
      title: "Thứ tự",
      dataIndex: "thuTu",
      key: "thuTu",
      width: 100,
      align: "center",
    },
    {
      title: "Mã công việc",
      dataIndex: "maCongViec",
      key: "maCongViec",
      align: "center",
      width: 150,
    },
    {
      title: "Nội dung công việc",
      dataIndex: "noiDungCongViec",
      key: "noiDungCongViec",
      align: "left",
      width: 250,
    },
    {
      title: "Loại thông tin",
      dataIndex: "tenLoaiThongTin",
      key: "tenLoaiThongTin",
      align: "center",
      width: 150,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 150,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const handleXacNhan = () => {
    const newData = SelectedPhieuYeuCau.map((phieu) => {
      return phieu.id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_PhieuYeuCauBaoGia/kiem-tra-hoac-duyet`,
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
          setSelectedPhieuYeuCau([]);
          setSelectedKeyPhieus([]);
          getListData(KhachHang, keyword);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận kiểm tra (duyệt) phiếu yêu cầu báo giá",
    onOk: handleXacNhan,
  };

  const ModalXacNhan = () => {
    Modal(prop);
  };

  const handleTuChoi = (data) => {
    const newData = SelectedPhieuYeuCau.map((phieu) => {
      return phieu.id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_PhieuYeuCauBaoGia/kiem-tra-hoac-duyet?lyDoTuChoi=${data}`,
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
        setSelectedPhieuYeuCau([]);
        setSelectedKeyPhieus([]);
        getListData(KhachHang, keyword);
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
          disabled={SelectedPhieuYeuCau.length === 0}
        >
          Kiểm tra (Duyệt)
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="danger"
          onClick={() => setActiveModalTuChoi(true)}
          disabled={SelectedPhieuYeuCau.length === 0}
        >
          Từ chối
        </Button>
      </>
    );
  };

  const handleOnSelectKhachHang = (value) => {
    setKhachHang(value);
    getListData(value, keyword);
  };

  const handleClearKhachHang = () => {
    setKhachHang(null);
    getListData(null, keyword);
  };

  const rowSelection = {
    selectedRows: SelectedPhieuYeuCau,
    selectedRowKeys: SelectedKeyPhieus,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedPhieuYeuCau = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedPhieuYeuCau(newSelectedPhieuYeuCau);
      setSelectedKeyPhieus(newSelectedKeys);
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Duyệt phiếu yêu cầu báo giá"}
        description="Danh sách phiếu yêu cầu báo giá chưa duyệt"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
        <Row>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: "10px" }}
          >
            <span>Khách hàng:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKhachHang ? ListKhachHang : []}
              placeholder="Chọn khách hàng"
              optionsvalue={["id", "tenKhachHang"]}
              style={{ width: "100%" }}
              value={KhachHang}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKhachHang}
              allowClear
              onClear={handleClearKhachHang}
            />
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: "10px" }}
          >
            <span style={{ whiteSpace: "nowrap" }}>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchPhieuYeuCauBaoGia,
                onSearch: onSearchPhieuYeuCauBaoGia,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1800, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: SelectedKeyPhieus,
          }}
        />
      </Card>
      <AntModal
        title={"Chi tiết phiếu yêu cầu báo giá"}
        className="th-card-reset-margin"
        open={ActiveModalChiTietPhieu}
        width={width >= 1800 ? `75%` : width >= 1600 ? `85%` : "100%"}
        closable={true}
        onCancel={() => {
          setActiveModalChiTietPhieu(false);
        }}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Form>
            <fieldset className="form-fieldset-custom">
              <legend className="form-legend-custom">
                Thông tin triển khai
              </legend>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Tên phiếu yêu cầu:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenPhieuYeuCauBaoGia}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Nội dung thực hiện:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.noiDungThucHien}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Người yêu cầu:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenNguoiTao}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Phòng ban thực hiện:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenPhongBanNguoiTao}</span>
                  )}
                </Col>
              </Row>
            </fieldset>
          </Form>
          <Form>
            <fieldset className="form-fieldset-custom">
              <legend className="form-legend-custom">
                Thông tin đơn hàng báo giá
              </legend>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Khách hàng:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenKhachHang}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Đơn hàng:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenDonHang}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Người gửi:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenNguoiGui}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Phòng ban:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenPhongBan}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Thời gian hoàn thành:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.thoiGianHoanThanh}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Số lượng đặt hàng:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.soLuongDatHang}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Loại sản phẩm:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenLoaiSanPham}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Điều kiện giao hàng:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenDieuKienGiaoHang}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Ghi chú:
                  </span>
                  {DataChiTietPhieu && <span>{DataChiTietPhieu.moTa}</span>}
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Tài liệu báo giá:
                  </span>
                  {DataChiTietPhieu && (
                    <span
                      style={{
                        whiteSpace: "break-spaces",
                        wordBreak: "break-all",
                      }}
                    >
                      {DataChiTietPhieu.fileTaiLieuBaoGia ? (
                        <a
                          target="_blank"
                          href={
                            BASE_URL_API + DataChiTietPhieu.fileTaiLieuBaoGia
                          }
                          rel="noopener noreferrer"
                        >
                          {DataChiTietPhieu.fileTaiLieuBaoGia.split("/")[5]}
                        </a>
                      ) : null}
                    </span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Tóm tắt dự án:
                  </span>
                  {DataChiTietPhieu && (
                    <span
                      style={{
                        whiteSpace: "break-spaces",
                        wordBreak: "break-all",
                      }}
                    >
                      {DataChiTietPhieu.fileTomTatDuAn ? (
                        <a
                          target="_blank"
                          href={BASE_URL_API + DataChiTietPhieu.fileTomTatDuAn}
                          rel="noopener noreferrer"
                        >
                          {DataChiTietPhieu.fileTomTatDuAn.split("/")[5]}
                        </a>
                      ) : null}
                    </span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Người kiểm tra:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenNguoiKiemTra}</span>
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
                  <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                    Người duyệt:
                  </span>
                  {DataChiTietPhieu && (
                    <span>{DataChiTietPhieu.tenNguoiDuyet}</span>
                  )}
                </Col>
              </Row>
            </fieldset>
          </Form>
          <Form>
            <fieldset className="form-fieldset-custom">
              <legend className="form-legend-custom">
                Danh sách nội dung yêu cầu
              </legend>
              <Table
                bordered
                scroll={{ x: 800, y: "35vh" }}
                columns={columnChiTiet}
                className="gx-table-responsive th-table"
                dataSource={DataChiTietPhieu && DataChiTietPhieu.list_ChiTiets}
                size="small"
                pagination={false}
              />
            </fieldset>
          </Form>
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

export default DuyetPhieuYeuCauBaoGia;
