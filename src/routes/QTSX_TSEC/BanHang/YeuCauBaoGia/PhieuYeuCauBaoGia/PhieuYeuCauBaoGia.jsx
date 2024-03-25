import { Button, Card, Col, Divider, Row, Tag } from "antd";
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
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { EditableRow, EditableCell } = EditableTableRow;
const DataTest = {
  datalist: [
    {
      id: "123",
      maPhieuYeuCauBaoGia: "maPhieuYeuCauBaoGiaA",
      tenPhieuYeuCauBaoGia: "tenPhieuYeuCauBaoGiaA",
      tenKhachHang: "tenKhachHangA",
      tenDongSanPham: "tenDongSanPhamA",
      soLuongDatHang: "10",
      tenDonViTinh: "Cái",
      noiDungThucHien: "noiDungThucHienA",
      thoiGianHoanThanh: "26/03/2024",
      tenNguoiLap: "Phạm Tấn Dũng",
      moTa: "moTaA",
      trangThai: "Chưa duyệt",
    },
  ],
  totalRow: 1,
  pageSize: 20,
};
function PhieuYeuCauBaoGia({ history, permission, match }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  // const [page, setPage] = useState(1);
  const { totalRow, pageSize } = Data;

  useEffect(() => {
    if (permission && permission.view) {
      setData(DataTest);
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
  //         `tsec_qtsx_PhieuYeuCauBaoGia?${param}`,
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

  const onSearchPhieuYeuCauBaoGia = () => {
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
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.tenPhieuYeuCauBaoGia,
      title
    );
  };

  const deleteItemAction = (item) => {
    let url = `tsec_qtsx_PhieuYeuCauBaoGia/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // getListData(keyword, page);
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item, permission },
          }}
          title="Sửa"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );
    const deleteItemVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
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
        title={"Phiếu yêu cầu báo giá"}
        description="Danh sách phiếu yêu cầu báo giá"
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
            xl={12}
            lg={16}
            md={16}
            sm={20}
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
                onPressEnter: onSearchPhieuYeuCauBaoGia,
                onSearch: onSearchPhieuYeuCauBaoGia,
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
          className="gx-table-responsive"
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
        />
      </Card>
    </div>
  );
}

export default PhieuYeuCauBaoGia;
