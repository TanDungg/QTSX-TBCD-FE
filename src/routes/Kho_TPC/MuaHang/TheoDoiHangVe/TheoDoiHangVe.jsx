import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, find, isEmpty, remove } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;
function TheoDoiHangVe({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow(7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ListNhomVatTu, setListNhomVatTu] = useState([]);
  const [NhomVatTu, setNhomVatTu] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getNhomVatTu();
      loadData(keyword, NhomVatTu, FromDate, ToDate, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy dữ liệu về
   *
   */
  const loadData = (keyword, nhomVatTu_Id, tuNgay, denNgay, page, vatTu_Id) => {
    const param = convertObjectToUrlParams({
      vatTu_Id,
      tuNgay,
      denNgay,
      keyword,
      nhomVatTu_Id,
      page,
    });
    dispatch(
      fetchStart(
        `lkn_PhieuNhanHang/list-thong-tin-hang-ve?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };
  const getNhomVatTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `NhomVatTu?page=-1&&donviid=${INFO.donVi_Id}`,
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
          setListNhomVatTu(res.data);
        } else {
          setListNhomVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchDeNghiMuaHang = () => {
    loadData(keyword, NhomVatTu, FromDate, ToDate, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, NhomVatTu, FromDate, ToDate, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const detailItem =
      permission && permission.cof ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/xac-nhan`,
            state: { itemData: item, permission },
          }}
          title="Xác nhận"
        >
          <EyeOutlined />
        </Link>
      ) : (
        <span disabled title="Xác nhận">
          <EyeInvisibleOutlined />
        </span>
      );
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
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
    const deleteVal =
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {detailItem}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  /**
   * deleteItemFunc: Xoá item theo item
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.maPhieuYeuCau,
      "phiếu trả hàng nhà cung cấp"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_PhieuTraHangNCC/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, NhomVatTu, FromDate, ToDate, page);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    loadData(keyword, NhomVatTu, FromDate, ToDate, pagination);
  };

  /**
   * Chuyển tới trang thêm mới chức năng
   *
   * @memberof ChucNang
   */
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
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Nhập kho
        </Button>
      </>
    );
  };
  const { totalRow, totalPage, pageSize } = data;

  let dataList = reDataForTable(
    data
    // page === 1 ? page : pageSize * (page - 1) + 2
  );

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Số lượng mua",
      dataIndex: "soLuongMua",
      key: "soLuongMua",
      align: "center",
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
    },
    {
      title: "Ngày xác nhận hàng về",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
    },
    {
      title: "CV Thu mua",
      dataIndex: "tenNguoiYeuCau",
      key: "tenNguoiYeuCau",
      align: "center",
    },
    {
      title: "Ngày nhận hàng",
      dataIndex: "tenNguoiYeuCau",
      key: "tenNguoiYeuCau",
      align: "center",
    },
    {
      title: "SL hàng nhận",
      dataIndex: "soLuongNhan",
      key: "soLuongNhan",
      align: "center",
    },
    {
      title: "SL còn thiếu",
      dataIndex: "soLuongConThieu",
      key: "soLuongConThieu",
      align: "center",
    },
    {
      title: "SL dư",
      dataIndex: "soLuongDu",
      key: "soLuongDu",
      align: "center",
    },
    {
      title: "Kết quả",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = map(renderHead, (col) => {
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

  function hanldeRemoveSelected(device) {
    const newDevice = remove(selectedDevice, (d) => {
      return d.key !== device.key;
    });
    const newKeys = remove(selectedKeys, (d) => {
      return d !== device.key;
    });
    setSelectedDevice(newDevice);
    setSelectedKeys(newKeys);
  }

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedDevice,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedDevice = [...selectedRows];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedDevice(newSelectedDevice);
      setSelectedKeys(newSelectedKey);
    },
  };
  const handleOnSelectNhomVatTu = (val) => {
    setNhomVatTu(val);
    setPage(1);
    loadData(keyword, val, FromDate, ToDate, 1);
  };
  const handleClearNhomVatTu = (val) => {
    setNhomVatTu("");
    setPage(1);
    loadData(keyword, "", FromDate, ToDate, 1);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, NhomVatTu, dateString[0], dateString[1], 1);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Theo dõi hàng về"
        description="Theo dõi hàng về"
        buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <h5>Nhóm vật tư:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNhomVatTu ? ListNhomVatTu : []}
              placeholder="Chọn nhóm vật tư"
              optionsvalue={["id", "tenNhomVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectNhomVatTu}
              value={NhomVatTu}
              onChange={(value) => setNhomVatTu(value)}
              allowClear
              onClear={handleClearNhomVatTu}
            />
          </Col>

          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <h5>Ngày:</h5>
            <RangePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(FromDate, "DD/MM/YYYY"),
                moment(ToDate, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>

          <Col xl={6} lg={24} md={24} xs={24}>
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchDeNghiMuaHang,
                onSearch: onSearchDeNghiMuaHang,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedKeys,
            getCheckboxProps: (record) => ({}),
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (e) => {
                const found = find(selectedKeys, (k) => k === record.key);
                if (found === undefined) {
                  setSelectedDevice([record]);
                  setSelectedKeys([record.key]);
                } else {
                  hanldeRemoveSelected(record);
                }
              },
            };
          }}
          bordered
          scroll={{ x: 700, y: "70vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={(record) => {
            return record.isParent ? "editable-row" : "editable-row";
          }}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
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

export default TheoDoiHangVe;
