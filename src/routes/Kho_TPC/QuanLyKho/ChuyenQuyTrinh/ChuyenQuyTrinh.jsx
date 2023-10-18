import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Divider, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import {
  Table,
  EditableTableRow,
  Select,
  ModalDeleteConfirm,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { Link } from "react-router-dom";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
  getDateNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
const { RangePicker } = DatePicker;

const { EditableRow, EditableCell } = EditableTableRow;
function PhieuDeNghiCapVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListSoLot, setListSoLot] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [XuongSanXuat, setXuongSanXuat] = useState(null);
  const [SoLot, setSoLot] = useState();
  const [page, setPage] = useState(1);
  const [FromDate, setFromDate] = useState(getDateNow(7));
  const [ToDate, setToDate] = useState(getDateNow());
  useEffect(() => {
    if (permission && permission.view) {
      getXuongSanXuat();
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
  const getListData = (Lkn_QuyTrinhSX_Id, tuNgay, denNgay, isNhap, page) => {
    const param = convertObjectToUrlParams({
      Lkn_QuyTrinhSX_Id,
      tuNgay,
      denNgay,
      isNhap,
      page,
    });
    dispatch(
      fetchStart(
        `lkn_PhieuChuyenQuyTrinhSX/nhap-xuat-chi-tiet?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  const getXuongSanXuat = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`lkn_QuyTrinhSX`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListXuong(res.data);
          setXuongSanXuat(res.data[0].id);
          getListData(res.data[0].id, FromDate, ToDate, true, page);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getSoLot = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuChuyenQuyTrinhSX/list-lot-by-quy-trinh?Lkn_QuyTrinhSX_Id=${id}`,
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
          setListSoLot(res.data);
        } else {
          setListSoLot([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleChuyen = () => {
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
          onClick={handleChuyen}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  let dataList = reDataForTable(
    data.datalist
    // page === 1 ? page : pageSize * (page - 1) + 2
  );
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const detailItem =
      permission && permission.cof && !item.isXacNhan ? (
        <Link
          to={{
            pathname: `${match.url}/${item.maPhieuChuyenQuyTrinhSX}/xac-nhan`,
            state: { itemData: item, permission },
          }}
          title="Xác nhận"
        >
          <CheckCircleOutlined />
        </Link>
      ) : (
        <span disabled title="Xác nhận">
          <CheckCircleOutlined />
        </span>
      );
    const editItem =
      permission && permission.edit && !item.isXacNhan ? (
        <Link
          to={{
            pathname: `${match.url}/${item.maPhieuChuyenQuyTrinhSX}/chinh-sua`,
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
      permission && !item.isXacNhan
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
      item.maPhieuChuyenQuyTrinhSX,
      "phiếu chuyển công đoạn"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_PhieuChuyenQuyTrinhSX?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(XuongSanXuat, SoLot);
        }
      })
      .catch((error) => console.error(error));
  };
  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.maPhieuChuyenQuyTrinhSX}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maPhieuChuyenQuyTrinhSX}
        </Link>
      ) : (
        <span disabled>{val.maPhieuChuyenQuyTrinhSX}</span>
      );
    return <div>{detail}</div>;
  };
  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã phiếu",
      key: "maPhieuChuyenQuyTrinhSX",
      align: "center",
      render: (val) => renderDetail(val),
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Số Lot",
      dataIndex: "soLot",
      key: "soLot",
      align: "center",
    },
    {
      title: "Ngày chuyển",
      dataIndex: "ngayYeuCau",
      key: "ngayYeuCau",
      align: "center",
    },
    {
      title: "Xưởng chuyển",
      dataIndex: "lkn_TenQuyTrinhSXBegin",
      key: "lkn_TenQuyTrinhSXBegin",
      align: "center",
    },
    {
      title: "Xưởng đến",
      dataIndex: "lkn_TenQuyTrinhSXEnd",
      key: "lkn_TenQuyTrinhSXEnd",
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
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

  const handleOnSelectXuongSanXuat = (value) => {
    setXuongSanXuat(value);
    setPage(1);
    getListData(value, FromDate, ToDate, true, 1);
    getSoLot(value);
  };

  const handleClearXuongSanXuat = () => {
    setXuongSanXuat(null);
    setListSoLot([]);
    getListData(null, FromDate, ToDate, true, 1);
  };
  const handleOnSelectSoLot = (value) => {
    setSoLot(value);
    getListData(XuongSanXuat, value);
  };

  const handleClearSoLot = () => {
    setSoLot(null);
    getListData(XuongSanXuat, null);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    getListData(XuongSanXuat, dateString[0], dateString[1], true, 1);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Chuyển công đoạn sản xuất"
        description="Chuyển công đoạn sản xuất"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectXuongSanXuat}
              value={XuongSanXuat}
              onChange={(value) => setXuongSanXuat(value)}
              allowClear
              onClear={handleClearXuongSanXuat}
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
          {/* <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Lot:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSoLot ? ListSoLot : []}
              placeholder="Chọn Lot"
              optionsvalue={["id", "soLot"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectSoLot}
              value={SoLot}
              onChange={(value) => setSoLot(value)}
              allowClear
              onClear={handleClearSoLot}
            />
          </Col> */}
        </Row>
        <Table
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
            pageSize: 20,
            total: dataList.length,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default PhieuDeNghiCapVatTu;
