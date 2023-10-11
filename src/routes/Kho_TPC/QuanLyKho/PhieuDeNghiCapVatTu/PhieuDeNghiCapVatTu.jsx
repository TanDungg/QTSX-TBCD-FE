import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PrinterOutlined,
  RetweetOutlined,
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
function PhieuDeNghiCapVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [ListXuongSanXuat, setListXuongSanXuat] = useState([]);
  const [XuongSanXuat, setXuongSanXuat] = useState(null);
  const [TuNgay, setTuNgay] = useState(getDateNow(7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [keyword, setKeyword] = useState("");
  const [SelectedDNCVT, setSelectedDNCVT] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(null);
  useEffect(() => {
    if (permission && permission.view) {
      getXuongSanXuat();
      getListData(XuongSanXuat, TuNgay, DenNgay, page);
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
  const getListData = (XuongSanXuat_Id, tuNgay, denNgay, page) => {
    const param = convertObjectToUrlParams({
      XuongSanXuat_Id,
      tuNgay,
      denNgay,
      page,
    });
    dispatch(
      fetchStart(`lkn_PhieuDeNghiCapVatTu?${param}`, "GET", null, "LIST")
    );
  };

  const getXuongSanXuat = () => {
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
          const xuongsx = [];
          res.data.forEach((x) => {
            if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
              xuongsx.push(x);
            }
          });
          setListXuongSanXuat(xuongsx);
        } else {
          setListXuongSanXuat([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const detailItem =
      (permission &&
        permission.cof &&
        item.userKiemTra_Id === INFO.user_Id &&
        item.tinhTrang === "Chưa duyệt") ||
      (permission &&
        permission.cof &&
        item.userKeToan_Id === INFO.user_Id &&
        item.tinhTrang === "Đã xác Nhận bởi kiểm tra") ||
      (permission &&
        permission.cof &&
        item.userDuyet_Id === INFO.user_Id &&
        item.tinhTrang === "Đã xác Nhận bởi kiểm tra, kế toán") ? (
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
      permission && permission.edit && item.tinhTrang === "Chưa duyệt" ? (
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
      permission && permission.del && item.tinhTrang === "Chưa duyệt"
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
      item.maPhieu,
      "phiếu đề nghị mua hàng"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_PhieuDeNghiCapVatTu?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(XuongSanXuat, TuNgay, DenNgay, page);
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
    getListData(keyword, XuongSanXuat, TuNgay, DenNgay, pagination);
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
  const handlePrint = () => {};
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
        <Button
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handlePrint}
          disabled={permission && !permission.print}
        >
          In phiếu
        </Button>
      </>
    );
  };
  const { totalRow, totalPage, pageSize } = data;

  let dataList = reDataForTable(
    data.datalist
    // page === 1 ? page : pageSize * (page - 1) + 2
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
          {val.maPhieu}
        </Link>
      ) : (
        <span disabled>{val.maPhieu}</span>
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
      title: "Mã phiếu đề nghị",
      key: "maPhieu",
      align: "center",
      render: (val) => renderDetail(val),
    },
    {
      title: "Xưởng sản xuất",
      dataIndex: "TenPhongBan",
      key: "TenPhongBan",
      align: "center",
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "ngaySanXuat",
      key: "ngaySanXuat",
      align: "center",
    },

    {
      title: "Ngày yêu cầu",
      dataIndex: "ngayYeuCau",
      key: "ngayYeuCau",
      align: "center",
    },
    {
      title: "Người lập",
      dataIndex: "userLapPhieuLapPhieu",
      key: "userLapPhieuLapPhieu",
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
      width: 120,
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
    getListData(value, TuNgay, DenNgay, 1);
  };

  const handleClearXuongSanXuat = () => {
    setXuongSanXuat(null);
    setPage(1);
    getListData(null, TuNgay, DenNgay, 1);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setPage(1);
    getListData(XuongSanXuat, dateString[0], dateString[1], 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu đề nghị cấp vật tư"
        description="Danh sách phiếu đề nghị cấp vật tư"
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
            <h5>Xưởng sản xuất:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuongSanXuat ? ListXuongSanXuat : []}
              placeholder="Chọn xưởng sản xuất"
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
                moment(TuNgay, "DD/MM/YYYY"),
                moment(DenNgay, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>
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

export default PhieuDeNghiCapVatTu;
