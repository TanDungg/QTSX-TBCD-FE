import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty } from "lodash";
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
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function DieuChuyenVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListKhoDi, setListKhoDi] = useState([]);
  const [KhoDi, setKhoDi] = useState(null);
  const [ListKhoDen, setListKhoDen] = useState([]);
  const [KhoDen, setKhoDen] = useState(null);
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, KhoDi, KhoDen, FromDate, ToDate, page);
      getListKho();
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
  const getListData = (
    keyword,
    tits_qtsx_CauTrucKhoBegin_Id,
    tits_qtsx_CauTrucKhoEnd_Id,
    tuNgay,
    denNgay,
    page
  ) => {
    const param = convertObjectToUrlParams({
      keyword,
      tits_qtsx_CauTrucKhoBegin_Id,
      tits_qtsx_CauTrucKhoEnd_Id,
      tuNgay,
      denNgay,
      isVatTu: true,
      page,
    });
    dispatch(
      fetchStart(`tits_qtsx_PhieuDieuChuyen?${param}`, "GET", null, "LIST")
    );
  };

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu-tree`,
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
          setListKhoDi(res.data);
        } else {
          setListKhoDi([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchDeNghiMuaHang = () => {
    getListData(keyword, KhoDi, KhoDen, FromDate, ToDate, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, KhoDi, KhoDen, FromDate, ToDate, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    console.log(item);
    const editItem =
      permission &&
      permission.edit &&
      item.userLap_Id === INFO.user_Id &&
      moment(getDateNow(-1), "DD/MM/YYYY") <=
        moment(item.ngayYeuCau, "DD/MM/YYYY") ? (
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
      permission &&
      permission.del &&
      item.userLap_Id === INFO.user_Id &&
      moment(getDateNow(-1), "DD/MM/YYYY") <=
        moment(item.ngayYeuCau, "DD/MM/YYYY")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
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
      item.maPhieuDieuChuyen,
      "phiếu điều chuyển"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    console.log(item);
    let url = `tits_qtsx_PhieuDieuChuyen?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(keyword, KhoDi, KhoDen, FromDate, ToDate, page);
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
    getListData(keyword, KhoDi, KhoDen, FromDate, ToDate, pagination);
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
          Tạo phiếu
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);

  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maPhieuDieuChuyen}
        </Link>
      ) : (
        <span disabled>{val.maPhieuDieuChuyen}</span>
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
      title: "Mã phiếu điều chuyển",
      key: "maPhieuDieuChuyen",
      align: "center",
      render: (val) => renderDetail(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuDieuChuyen,
            value: d.maPhieuDieuChuyen,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieuDieuChuyen.includes(value),
      filterSearch: true,
    },
    {
      title: "Kho điều chuyển",
      dataIndex: "tenKhoDi",
      key: "tenKhoDi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhoDi,
            value: d.tenKhoDi,
          };
        })
      ),
      onFilter: (value, record) => record.tenKhoDi.includes(value),
      filterSearch: true,
    },
    {
      title: "Kho nhận",
      dataIndex: "tenKhoDen",
      key: "tenKhoDen",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhoDen,
            value: d.tenKhoDen,
          };
        })
      ),
      onFilter: (value, record) => record.tenKhoDen.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "ngayYeuCau",
      key: "ngayYeuCau",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayYeuCau,
            value: d.ngayYeuCau,
          };
        })
      ),
      onFilter: (value, record) => record.ngayYeuCau.includes(value),
      filterSearch: true,
    },
    {
      title: "Người lập",
      dataIndex: "tenNguoiLap",
      key: "tenNguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiLap,
            value: d.tenNguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiLap.includes(value),
      filterSearch: true,
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

  const handleOnSelectKhoDi = (val) => {
    setKhoDi(val);
    setPage(1);
    getListData(keyword, val, KhoDen, FromDate, ToDate, 1);
  };

  const handleClearKhoDi = () => {
    setKhoDi(null);
    setPage(1);
    getListData(keyword, null, KhoDen, FromDate, ToDate, 1);
  };

  const handleOnSelectKhoDen = (val) => {
    setKhoDen(val);
    setPage(1);
    getListData(keyword, KhoDi, val, FromDate, ToDate, 1);
  };

  const handleClearKhoDen = () => {
    setKhoDen(null);
    setPage(1);
    getListData(keyword, KhoDi, null, FromDate, ToDate, 1);
  };

  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    getListData(keyword, KhoDi, KhoDen, dateString[0], dateString[1], 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu điều chuyển vật tư"
        description="Phiếu điều chuyển vật tư"
        buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 8 }}>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Kho điều chuyển:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKhoDi ? ListKhoDi : []}
              placeholder="Chọn kho điều chuyển"
              optionsvalue={["id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKhoDi}
              value={KhoDi}
              allowClear
              onClear={handleClearKhoDi}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Kho nhận:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKhoDen ? ListKhoDen : []}
              placeholder="Chọn kho nhận"
              optionsvalue={["id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKhoDen}
              value={KhoDen}
              allowClear
              onClear={handleClearKhoDen}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
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
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
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
          bordered
          scroll={{ x: 700, y: "65vh" }}
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

export default DieuChuyenVatTu;
