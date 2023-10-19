import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
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
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function KiemKe({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [ListBanPhong, setListBanPhong] = useState([]);
  const [BanPhong, setBanPhong] = useState("");
  const [FromDate, setFromDate] = useState(getDateNow(7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getBanPhong();
      getListData(keyword, BanPhong, FromDate, ToDate, page);
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
  const getListData = (keyword, phongBanId, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      phongBanId,
      donVi_Id: INFO.donVi_Id,
      tuNgay,
      denNgay,
      keyword,
      page,
    });
    dispatch(fetchStart(`lkn_PhieuKiemKe?${param}`, "GET", null, "LIST"));
  };

  const getBanPhong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?page=-1&&donviid=${INFO.donVi_Id}`,
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
          setListBanPhong(res.data);
        } else {
          setListBanPhong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearchDeNghiMuaHang = () => {
    getListData(keyword, BanPhong, FromDate, ToDate, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, BanPhong, FromDate, ToDate, page);
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
      permission && permission.cof && item.tinhTrang !== "Hoàn thành" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/xac-nhan`,
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
      permission && permission.edit && item.tinhTrang === "Chưa xác nhận" ? (
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
      !item.isUsed &&
      item.tinhTrang === "Chưa xác nhận"
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
      item.maPhieuKiemKe,
      "phiếu kiểm kê vật tư"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_PhieuKiemKe?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(keyword, BanPhong, FromDate, ToDate, page);
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
    getListData(keyword, BanPhong, FromDate, ToDate, pagination);
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

  let dataList = reDataForTable(
    data.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );

  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maPhieuKiemKe}
        </Link>
      ) : (
        <span disabled>{val.maPhieuKiemKe}</span>
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
      key: "maPhieuKiemKe",
      align: "center",
      render: (val) => renderDetail(val),
    },
    {
      title: "Ngày kiểm kê",
      dataIndex: "ngayKiemKe",
      key: "ngayKiemKe",
      align: "center",
    },
    {
      title: "Ban/Phòng",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
    },
    {
      title: "Người lập phiếu",
      dataIndex: "tenNguoiLap",
      key: "tenNguoiLap",
      align: "center",
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
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

  const handleOnSelectBanPhong = (val) => {
    setBanPhong(val);
    setPage(1);
    getListData(keyword, val, FromDate, ToDate, 1);
  };

  const handleClearBanPhong = (val) => {
    setBanPhong("");
    setPage(1);
    getListData(keyword, "", FromDate, ToDate, 1);
  };

  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    getListData(keyword, BanPhong, dateString[0], dateString[1], 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu kiểm kê vật tư"
        description="Danh sách phiếu kiểm kê vật tư"
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
            <h5>Ban/Phòng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListBanPhong ? ListBanPhong : []}
              placeholder="Chọn Ban/Phòng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectBanPhong}
              value={BanPhong}
              onChange={(value) => setBanPhong(value)}
              allowClear
              onClear={handleClearBanPhong}
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
          scroll={{ x: 800, y: "70vh" }}
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

export default KiemKe;
