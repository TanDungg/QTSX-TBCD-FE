import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker, Tag } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
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
  Modal,
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
import ModalTuChoi from "./ModalTuChoi";
const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function ThanhLySanPham({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [ListKho, setListKho] = useState([]);
  const [Kho, setKho] = useState(null);
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [IdTuChoi, setIdTuChoi] = useState("");

  const [ActiveModal, setActiveModal] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getKho();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    keyword,
    tits_qtsx_CauTrucKho_Id,
    ngayBatDau,
    ngayKetThuc,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      ngayBatDau,
      ngayKetThuc,
      keyword,
      page,
      isVatTu: false,
    });
    dispatch(
      fetchStart(`tits_qtsx_PhieuThanhLy?${param}`, "GET", null, "LIST")
    );
  };

  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=1&&isThanhPham=true`,
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
          setListKho(res.data);
          setKho(res.data[0].id);
          getListData(keyword, res.data[0].id, FromDate, ToDate, page);
        } else {
          setListKho([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearchDeNghiMuaHang = () => {
    getListData(keyword, Kho, FromDate, ToDate, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, Kho, FromDate, ToDate, page);
    }
  };

  const actionContent = (item) => {
    const tuChoiItem =
      permission &&
      permission.cof &&
      item.nguoiDuyet_Id === INFO.user_Id &&
      item.tinhTrang === "Chưa xác nhận" ? (
        <a
          title="Từ chối"
          onClick={() => {
            setIdTuChoi(item.id);
            setActiveModal(true);
          }}
        >
          <CloseCircleOutlined />
        </a>
      ) : (
        <span disabled title="Từ chối">
          <CloseCircleOutlined />
        </span>
      );
    const xacNhanItem =
      permission &&
      permission.cof &&
      item.nguoiDuyet_Id === INFO.user_Id &&
      item.tinhTrang === "Chưa xác nhận" ? (
        <a title="Xác nhận" onClick={() => modalXK(item.id)}>
          <CheckCircleOutlined />
        </a>
      ) : (
        <span disabled title="Xác nhận">
          <CheckCircleOutlined />
        </span>
      );
    const editItem =
      permission &&
      permission.edit &&
      item.nguoiTaoPhieu_Id === INFO.user_Id &&
      item.tinhTrang === "Chưa xác nhận" ? (
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
      item.nguoiTaoPhieu_Id === INFO.user_Id &&
      item.tinhTrang === "Chưa xác nhận"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {xacNhanItem}
        <Divider type="vertical" />
        {tuChoiItem}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.maPhieu, "phiếu thanh lý");
  };

  const deleteItemAction = (item) => {
    let url = `tits_qtsx_PhieuThanhLy/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(keyword, Kho, FromDate, ToDate, page);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(keyword, Kho, FromDate, ToDate, pagination);
  };

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
          {val.maPhieu}
        </Link>
      ) : (
        <span disabled>{val.maPhieu}</span>
      );
    return <div>{detail}</div>;
  };

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 120,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã phiếu thanh lý",
      key: "maPhieu",
      align: "center",
      render: (val) => renderDetail(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieu,
            value: d.maPhieu,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Kho thanh lý",
      dataIndex: "tenCauTrucKho",
      key: "tenCauTrucKho",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenCauTrucKho,
            value: d.tenCauTrucKho,
          };
        })
      ),
      onFilter: (value, record) => record.tenCauTrucKho.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày thanh lý",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngay,
            value: d.ngay,
          };
        })
      ),
      onFilter: (value, record) => record.ngay.includes(value),
      filterSearch: true,
    },
    {
      title: "Người lập",
      dataIndex: "tenNguoiTaoPhieu",
      key: "tenNguoiTaoPhieu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiTaoPhieu,
            value: d.tenNguoiTaoPhieu,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiTaoPhieu.includes(value),
      filterSearch: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      render: (val) => {
        return (
          <Tag
            color={
              val === "Đã xác nhận"
                ? "blue"
                : val === "Đã từ chối"
                ? "red"
                : "green"
            }
          >
            {val}
          </Tag>
        );
      },
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tinhTrang,
            value: d.tinhTrang,
          };
        })
      ),
      onFilter: (value, record) => record.tinhTrang.includes(value),
      filterSearch: true,
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

  const handleOnSelectKho = (val) => {
    setKho(val);
    setPage(1);
    getListData(keyword, val, FromDate, ToDate, 1);
  };

  const handleClearKho = (val) => {
    setKho("");
    setPage(1);
    getListData(keyword, "", FromDate, ToDate, 1);
  };

  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    getListData(keyword, Kho, dateString[0], dateString[1], 1);
  };
  const saveTuChoi = (lyDoNguoiTruongBoPhanTuChoi) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuThanhLy/xac-nhan/${IdTuChoi}`,
          "PUT",
          {
            id: IdTuChoi,
            isNguoiTruongBoPhanDuyet: false,
            lyDoNguoiTruongBoPhanTuChoi,
          },
          "TUCHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          setPage(1);
          getListData(keyword, Kho, FromDate, ToDate, 1);
        }
      })
      .catch((error) => console.error(error));
  };
  const hanldeXacNhan = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuThanhLy/xac-nhan/${id}`,
          "PUT",
          { id: id, isNguoiTruongBoPhanDuyet: true },
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          setPage(1);
          getListData(keyword, Kho, FromDate, ToDate, 1);
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu thanh lý thành phẩm",
  };
  const modalXK = (id) => {
    Modal({ ...prop, onOk: () => hanldeXacNhan(id) });
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu thanh lý thành phầm"
        description="Danh sách phiếu thanh lý thành phầm"
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
            <h5>Kho:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho ? ListKho : []}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKho}
              value={Kho}
              onChange={(value) => setKho(value)}
              allowClear
              onClear={handleClearKho}
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
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 700, y: "54vh" }}
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
      <ModalTuChoi
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
}

export default ThanhLySanPham;
