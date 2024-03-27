import { Button, Card, Col, Divider, Row, Modal as AntModal, Tag } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset } from "src/appRedux/actions/Common";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
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
    maCongViec: "YC-QTCN-01",
    noiDungYeuCau: "Định mức vật tư/Material norms",
    ngayBatDau: "20/2/2024",
    ngayHoanThanh: "29/2/2024 14:00",
    tenNhanSuThucHien: "Mr. B",
    ngayThucHien: "22/2/2024",
    tienDo: "100%",
    trangThai: "Hoàn thành",
    moTa: "ghiChu",
    list_ChiTiets: [
      {
        maCongViec: "YC-QTCN-01.1",
        noiDungYeuCau: "Lập định mức cụm A1 - A4",
        ngayBatDau: "20/2/2024",
        ngayHoanThanh: "28/2/2024 14:00",
        tenNhanSuThucHien: "Mr. D",
        ngayThucHien: "22/2/2024",
        tienDo: "100%",
        trangThai: "Hoàn thành",
        moTa: "ghiChu",
      },
      {
        maCongViec: "YC-QTCN-01.2",
        noiDungYeuCau: "Lập định mức cụm A5 -A9",
        ngayBatDau: "20/2/2024",
        ngayHoanThanh: "28/2/2024 14:00",
        tenNhanSuThucHien: "Mr. E",
        ngayThucHien: "22/2/2024",
        tienDo: "100%",
        trangThai: "Hoàn thành",
        moTa: "ghiChu",
      },
    ],
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
  const [ActiveModalChiTietBaoGia, setActiveModalChiTietBaoGia] =
    useState(false);
  const [ActiveModalLichSuBaoGia, setActiveModalLichSuBaoGia] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      setData(DataTest);
      setDataChiTietPhieu(NoiDungYeuCau);
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

  const actionContent = (item) => {
    const detailItem = { onClick: () => setActiveModalChiTietBaoGia(true) };

    const history = { onClick: () => setActiveModalLichSuBaoGia(true) };

    const download = { onClick: () => setActiveModalChiTietBaoGia(true) };

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
      render: (value) =>
        value ? (
          <Tag
            color={
              value === "Đang triển khai"
                ? "blue"
                : value === "Hoàn thành"
                ? "green"
                : value === "Trễ tiến độ"
                ? "orange"
                : "red"
            }
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ) : null,
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
      render: (value) =>
        value ? (
          <Tag
            color={
              value === "Đang triển khai"
                ? "blue"
                : value === "Hoàn thành"
                ? "green"
                : value === "Trễ tiến độ"
                ? "orange"
                : "red"
            }
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ) : null,
    },
  ];

  let columnchitietbaogia = [
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
      align: "centẻ",
      width: 150,
    },
    {
      title: "Nội dung yêu cầu",
      dataIndex: "noiDungYeuCau",
      key: "noiDungYeuCau",
      align: "left",
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
      dataIndex: "tenNhanSuThucHien",
      key: "tenNhanSuThucHien",
      align: "center",
      width: 180,
    },
    {
      title: "Ngày thực hiện",
      dataIndex: "ngayThucHien",
      key: "ngayThucHien",
      align: "center",
      width: 120,
    },
    {
      title: "Tiến độ",
      dataIndex: "tienDo",
      key: "tienDo",
      align: "center",
      width: 100,
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "center",
      width: 150,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 130,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 150,
      fixed: width >= 1200 && "right",
      render: (value, record) =>
        value ? (
          <Tag
            color={
              value === "Đang triển khai"
                ? "blue"
                : value === "Hoàn thành"
                ? "green"
                : value === "Trễ tiến độ"
                ? "orange"
                : "red"
            }
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ) : null,
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
        title={"Chi tiết báo giá"}
        className="th-card-reset-margin"
        open={ActiveModalChiTietBaoGia}
        width={width >= 1600 ? `85%` : "100%"}
        closable={true}
        onCancel={() => {
          setActiveModalChiTietBaoGia(false);
        }}
        footer={null}
      >
        <Table
          bordered
          scroll={{ x: 1500, y: "35vh" }}
          columns={columnchitietbaogia}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(DataChiTietPhieu)}
          size="small"
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                style={{ padding: "5px 10px" }}
                bordered
                columns={columnchitietbaogia}
                scroll={{ x: 1200 }}
                components={components}
                className="gx-table-responsive th-table"
                dataSource={reDataForTable(record.list_ChiTiets)}
                size="small"
                rowClassName={"editable-row"}
                pagination={false}
              />
            ),
          }}
        />
      </AntModal>
      <AntModal
        title={"Lịch sử báo giá"}
        className="th-card-reset-margin"
        open={ActiveModalLichSuBaoGia}
        width={width >= 1600 ? `85%` : "100%"}
        closable={true}
        onCancel={() => {
          setActiveModalLichSuBaoGia(false);
        }}
        footer={null}
      >
        <Table
          bordered
          scroll={{ x: 1500, y: "35vh" }}
          columns={columnchitietbaogia}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(DataChiTietPhieu)}
          size="small"
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                style={{ padding: "5px 10px" }}
                bordered
                columns={columnchitietbaogia}
                scroll={{ x: 1200 }}
                components={components}
                className="gx-table-responsive th-table"
                dataSource={reDataForTable(record.list_ChiTiets)}
                size="small"
                rowClassName={"editable-row"}
                pagination={false}
              />
            ),
          }}
        />
      </AntModal>
    </div>
  );
}

export default PhanCongCongViec;
