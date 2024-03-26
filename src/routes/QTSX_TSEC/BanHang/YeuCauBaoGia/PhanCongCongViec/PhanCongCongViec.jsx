import {
  Button,
  Card,
  Col,
  Divider,
  Row,
  Modal as AntModal,
  Tag,
  Checkbox,
} from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
// import { convertObjectToUrlParams } from "src/util/Common";
import {
  DownloadOutlined,
  HistoryOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;
const DataTest = {
  datalist: [
    {
      id: "123",
      maPhieuYeuCauBaoGia: "60.30.01.24/YCBG-PHBH",
      tenPhieuYeuCauBaoGia: "Yêu cầu báo giá khách hàng Dieffenbacher",
      tenKhachHang: "Dieffenbacher",
      tenDongSanPham: "Linh kiện băng tải",
      soLuongDatHang: "10",
      tenDonViTinh: "Cụm",
      noiDungThucHien: "Triển khai bổ sung trục băng tải",
      thoiGianHoanThanh: "15/03/2024 15:30",
      tenNguoiLap: "Phạm Tấn Dũng",
      moTa: "Yêu cầu báo giá gấp",
      trangThai: "Trễ tiến độ",
      list_CongViecs: [
        {
          maCongViec: "YC-QTCN-01",
          noiDungCongViec: "Định mức vật tư/Material norms",
          ngayBatDau: "20/2/2024",
          ngayHoanThanh: "29/2/2024 14:00",
          tenNguoiThucHien: "Phạm Tấn Dũng",
          tienDo: "100%",
          moTa: "Yêu cầu làm gấp",
          trangThai: "Hoàn thành",
        },
      ],
    },
  ],
  totalRow: 1,
  pageSize: 20,
};

const NoiDungYeuCau = [
  {
    noiDungYeuCau: "noiDungYeuCau1",
    trangThai: true,
    tenLoaiThongTin: "tenLoaiThongTin1",
    moTa: "ghiChu",
  },
  {
    noiDungYeuCau: "noiDungYeuCau2",
    trangThai: false,
    tenLoaiThongTin: "tenLoaiThongTin2",
    moTa: "ghiChu",
  },
];

function PhanCongCongViec({ history, permission, match }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  // const [page, setPage] = useState(1);
  const { totalRow, pageSize } = Data;
  const [DataChiTietPhieu, setDataChiTietPhieu] = useState(null);
  const [ActiveModalChiTietPhieu, setActiveModalChiTietPhieu] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      setData(DataTest);
      setDataChiTietPhieu({
        ...DataTest.datalist[0],
        list_ChiTiets: NoiDungYeuCau,
      });
      // getListData(keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  // const getListData = (keyword, page) => {
  //   let param = convertObjectToUrlParams({ keyword, page });
  //   new Promise((resolve, reject) => {
  //     dispatch(
  //       fetchStart(
  //         `tsec_qtsx_PhanCongCongViec?${param}`,
  //         "GET",
  //         null,
  //         "DETAIL",
  //         "",
  //         resolve,
  //         reject
  //       )
  //     );
  //   }).then((res) => {
  //     if (res && res.data) {
  //       setData(res.data);
  //     } else {
  //       setData([]);
  //     }
  //   });
  // };

  const handleTableChange = (pagination) => {
    // setPage(pagination);
    // getListData(keyword, pagination);
  };

  const onSearchPhanCongCongViec = () => {
    // getListData(keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      // getListData(val.target.value, page);
    }
  };

  const handleClearSearch = () => {
    // getListData(null, 1);
  };

  const deleteItemFunc = (item) => {
    const title = "phiếu yêu cầu";
    ModalDeleteConfirm(deleteItemAction, item, item.tenPhanCongCongViec, title);
  };

  const deleteItemAction = (item) => {
    let url = `tsec_qtsx_PhanCongCongViec/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // getListData(keyword, page);
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const detailItem = { onClick: () => setActiveModalChiTietPhieu(true) };

    const history =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };

    const download =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };

    return (
      <div>
        <React.Fragment>
          <a {...detailItem} title="Xem chi tiết phân công công việc">
            <SearchOutlined />
          </a>
          <Divider type="vertical" />
          <a {...history} title="Xem lịch sử phân công công việc">
            <HistoryOutlined />
          </a>
          <Divider type="vertical" />
          <a {...download} title="Tải file phân công công việc">
            <DownloadOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let dataList = reDataForTable(Data.datalist);

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      fixed: width >= 1600 && "left",
      render: (value) => actionContent(value),
    },
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
    },
    {
      title: "Tên phiếu yêu cầu",
      dataIndex: "tenPhieuYeuCauBaoGia",
      key: "tenPhieuYeuCauBaoGia",
      align: "left",
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
      title: "Dòng sản phẩm",
      dataIndex: "tenDongSanPham",
      key: "tenDongSanPham",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDongSanPham,
            value: d.tenDongSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenDongSanPham && record.tenDongSanPham.includes(value),
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
      title: "Người lập phiếu",
      dataIndex: "tenNguoiLap",
      key: "tenNguoiLap",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiLap,
            value: d.tenNguoiLap,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenNguoiLap && record.tenNguoiLap.includes(value),
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
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 150,
      fixed: width >= 1600 && "right",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.trangThai,
            value: d.trangThai,
          };
        })
      ),
      onFilter: (value, record) =>
        record.trangThai && record.trangThai.includes(value),
      filterSearch: true,
      render: (value, record) => (
        <div title={record.lyDoTuChoi && `Lý do từ chối: ${record.lyDoTuChoi}`}>
          {value && (
            <Tag
              color={
                value === "Chưa duyệt"
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

  let columnDanhSachCongViec = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
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
      align: "center",
      width: 200,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      key: "ngayBatDau",
      align: "center",
      width: 100,
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "ngayHoanThanh",
      key: "ngayHoanThanh",
      align: "center",
      width: 120,
    },
    {
      title: "Nhân sự thực hiện",
      dataIndex: "tenNguoiThucHien",
      key: "tenNguoiThucHien",
      align: "center",
      width: 180,
    },
    {
      title: "Tiến độ",
      dataIndex: "tienDo",
      key: "tienDo",
      align: "center",
      width: 120,
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "left",
      width: 150,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 150,
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 150,
      render: (value, record) =>
        value && (
          <Tag
            color={
              value === "Chưa hoàn thành"
                ? "gray"
                : value === "Hoàn thành"
                ? "green"
                : value === "Hoàn thành trễ"
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
        ),
    },
  ];

  let columnNoiDung = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Nội dung yêu cầu",
      dataIndex: "noiDungYeuCau",
      key: "noiDungYeuCau",
      align: "left",
      width: 200,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 100,
      render: (value, record) => {
        return (
          <Checkbox
            checked={value}
            // onChange={() => handleThayDoiDapAnDung(value, record)}
            disabled
          />
        );
      },
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

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  const handleOnSelectKhachHang = (value) => {
    // setDonVi(value);
    // getListData(value, TuNgay, DenNgay, keyword, page);
  };

  const handleClearKhachHang = () => {
    // setDonVi(null);
    // getListData(null, TuNgay, DenNgay, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Phân công công việc"}
        description="Danh sách phân công công việc"
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
            style={{ marginBottom: 8 }}
          >
            <span>Khách hàng:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              // data={ListKhachHang ? ListKhachHang : []}
              data={[
                {
                  id: "1",
                  tenKhachHang: "TenKhachHangA",
                },
              ]}
              placeholder="Chọn khách hàng"
              optionsvalue={["id", "tenKhachHang"]}
              style={{ width: "100%" }}
              // value={KhachHang}
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
            style={{ marginBottom: 8 }}
          >
            <span style={{ whiteSpace: "nowrap" }}>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchPhanCongCongViec,
                onSearch: onSearchPhanCongCongViec,
                placeholder: "Nhập từ khóa",
                allowClear: true,
                onClear: { handleClearSearch },
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
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                style={{ padding: "5px 10px" }}
                bordered
                columns={columnDanhSachCongViec}
                scroll={{ x: 1200 }}
                components={components}
                className="gx-table-responsive th-table"
                dataSource={reDataForTable(record.list_CongViecs)}
                size="small"
                rowClassName={"editable-row"}
                pagination={false}
              />
            ),
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
        <Card className="th-card-margin-bottom">
          <Row gutter={[0, 10]}>
            <Col span={24} style={{ textAlign: "center" }}>
              <span
                style={{
                  color: "#0469b9",
                  fontSize: "18px",
                  textDecoration: "underline",
                  fontWeight: "bold",
                }}
              >
                Thông tin triển khai
              </span>
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
                Tên phiếu yêu cầu:
              </span>
              {DataChiTietPhieu && (
                <span>{DataChiTietPhieu.tenPhanCongCongViec}</span>
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
              md={12}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Người yêu cầu:
              </span>
              {DataChiTietPhieu && <span>{DataChiTietPhieu.tenNguoiLap}</span>}
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
                Phòng ban thực hiện:
              </span>
              {DataChiTietPhieu && (
                <span>{DataChiTietPhieu.tenPhongBanThucHien}</span>
              )}
            </Col>
          </Row>
        </Card>
        <Card className="th-card-margin-bottom">
          <Row gutter={[0, 10]}>
            <Col span={24} style={{ textAlign: "center" }}>
              <span
                style={{
                  color: "#0469b9",
                  fontSize: "18px",
                  textDecoration: "underline",
                  fontWeight: "bold",
                }}
              >
                Thông tin đơn hàng báo giá
              </span>
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
                Khách hàng:
              </span>
              {DataChiTietPhieu && <span>{DataChiTietPhieu.tenKhachHang}</span>}
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
                Đơn hàng:
              </span>
              {DataChiTietPhieu && <span>{DataChiTietPhieu.tenDonHang}</span>}
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
                Người gửi:
              </span>
              {DataChiTietPhieu && <span>{DataChiTietPhieu.tenNguoiGui}</span>}
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
                Phòng ban:
              </span>
              {DataChiTietPhieu && <span>{DataChiTietPhieu.tenPhongBan}</span>}
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
              md={12}
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
              md={12}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Dòng sản phẩm:
              </span>
              {DataChiTietPhieu && (
                <span>{DataChiTietPhieu.tenDongSanPham}</span>
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
              <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Điều kiện giao hàng:
              </span>
              {DataChiTietPhieu && (
                <span>{DataChiTietPhieu.dieuKienGiaoHang}</span>
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
              <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Ghi chú:
              </span>
              {DataChiTietPhieu && <span>{DataChiTietPhieu.moTa}</span>}
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
                Tài liệu báo giá:
              </span>
              {DataChiTietPhieu && (
                <span>
                  {DataChiTietPhieu.fileTaiLieuBaoGia ? (
                    <a
                      target="_blank"
                      href={BASE_URL_API + DataChiTietPhieu.fileTaiLieuBaoGia}
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
              md={12}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Tóm tắt dự án:
              </span>
              {DataChiTietPhieu && (
                <span>
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
              md={12}
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
              md={12}
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
        </Card>
        <Card className="th-card-margin-bottom">
          <Col span={24} style={{ textAlign: "center", marginBottom: "15px" }}>
            <span
              style={{
                color: "#0469b9",
                fontSize: "18px",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
            >
              Danh sách nội dung yêu cầu
            </span>
          </Col>
          <Table
            bordered
            scroll={{ x: 1000, y: "35vh" }}
            columns={columnNoiDung}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(
              DataChiTietPhieu && DataChiTietPhieu.list_ChiTiets
            )}
            size="small"
            pagination={false}
          />
        </Card>
      </AntModal>
    </div>
  );
}

export default PhanCongCongViec;
