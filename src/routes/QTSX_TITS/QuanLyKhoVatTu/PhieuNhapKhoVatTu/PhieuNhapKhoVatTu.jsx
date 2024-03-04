import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker, Tag } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
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
  removeDuplicates,
  exportExcel,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function NhapKhoVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ListKhoVatTu, setListKhoVatTu] = useState([]);
  const [Kho, setKho] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getKhoVatTu();
      loadData(keyword, Kho, FromDate, ToDate, page);
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
  const loadData = (
    keyword,
    tits_qtsx_CauTrucKho_Id,
    ngayBatDau,
    ngayKetThuc,
    page
  ) => {
    const param = convertObjectToUrlParams({
      keyword,
      tits_qtsx_CauTrucKho_Id,
      ngayBatDau,
      ngayKetThuc,
      page,
    });
    dispatch(
      fetchStart(`tits_qtsx_PhieuNhapKhoVatTu?${param}`, "GET", null, "LIST")
    );
  };

  const getKhoVatTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=false`,
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
          setListKhoVatTu(res.data);
        } else {
          setListKhoVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearchDeNghiMuaHang = () => {
    loadData(keyword, Kho, FromDate, ToDate, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, Kho, FromDate, ToDate, page);
    }
  };

  const actionContent = (item) => {
    const xacnhan =
      item.tinhTrang === "Chưa xác nhận" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/xac-nhan`,
            state: { itemData: item },
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
      permission && permission.del && item.tinhTrang === "Chưa xác nhận"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {xacnhan}
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
    ModalDeleteConfirm(deleteItemAction, item, item.maPhieu, "phiếu nhập kho");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_PhieuNhapKhoVatTu/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, Kho, FromDate, ToDate, page);
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
    loadData(keyword, Kho, FromDate, ToDate, pagination);
  };

  const handleXuatExcel = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhapKhoVatTu/${selectedDevice[0].id}`,
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
          const data = res.data;
          const newData = {
            ...data,
            tits_qtsx_PhieuNhapKhoVatTuChiTiets:
              data.tits_qtsx_PhieuNhapKhoVatTuChiTiets &&
              JSON.parse(data.tits_qtsx_PhieuNhapKhoVatTuChiTiets),
          };
          new Promise((resolve, reject) => {
            dispatch(
              fetchStart(
                `tits_qtsx_PhieuNhapKhoVatTu/export-file-phieu-nhap-kho-vat-tu`,
                "POST",
                newData,
                "",
                "",
                resolve,
                reject
              )
            );
          }).then((res) => {
            exportExcel("PhieuNhapKhoVatTu", res.data.dataexcel);
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const addButtonRender = () => {
    return (
      <>
        {/* <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Tạo phiếu
        </Button> */}
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleXuatExcel}
          disabled={selectedDevice.length === 0}
        >
          Xuất excel
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
      width: 110,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã phiếu nhập",
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
      title: "Kho nhập",
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
      title: "Ngày nhập kho",
      dataIndex: "ngayNhapKho",
      key: "ngayNhapKho",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayNhapKho,
            value: d.ngayNhapKho,
          };
        })
      ),
      onFilter: (value, record) => record.ngayNhapKho.includes(value),
      filterSearch: true,
    },
    {
      title: "Người lập phiếu",
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
      title: "Phiếu kiểm tra vật tư",
      dataIndex: "maPhieuKiemTraVatTu",
      key: "maPhieuKiemTraVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuKiemTraVatTu,
            value: d.maPhieuKiemTraVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieuKiemTraVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Phiếu nhận hàng",
      dataIndex: "maPhieuNhanHang",
      key: "maPhieuNhanHang",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuNhanHang,
            value: d.maPhieuNhanHang,
          };
        })
      ),
      onFilter: (value, record) => record.maPhieuNhanHang.includes(value),
      filterSearch: true,
    },
    {
      title: "In Voice",
      dataIndex: "inVoid",
      key: "inVoid",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.inVoid,
            value: d.inVoid,
          };
        })
      ),
      onFilter: (value, record) =>
        record.inVoid && record.inVoid.includes(value),
      filterSearch: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
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
      render: (value) => (
        <div>
          {value && (
            <Tag
              color={
                value === "Chưa xác nhận"
                  ? "orange"
                  : value === "Đã xác nhận"
                  ? "blue"
                  : "red"
              }
              style={{
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

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedDevice,

    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        selectedDevice.length > 0
          ? selectedRows.filter((d) => d.key !== selectedDevice[0].key)
          : [...selectedRows];

      const key =
        selectedKeys.length > 0
          ? selectedRowKeys.filter((d) => d !== selectedKeys[0])
          : [...selectedRowKeys];

      setSelectedDevice(row);
      setSelectedKeys(key);
    },
  };

  const handleOnSelectKho = (val) => {
    setKho(val);
    setPage(1);
    loadData(keyword, val, FromDate, ToDate, 1);
  };
  const handleClearKho = (val) => {
    setKho("");
    setPage(1);
    loadData(keyword, "", FromDate, ToDate, 1);
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    loadData(keyword, Kho, dateString[0], dateString[1], 1);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phiếu nhập kho vật tư"
        description="Danh sách phiếu nhập kho vật tư"
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
              data={ListKhoVatTu ? ListKhoVatTu : []}
              placeholder="Chọn Kho"
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
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: false,
            selectedRowKeys: selectedKeys,
          }}
          bordered
          scroll={{ x: 1200, y: "55vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
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

export default NhapKhoVatTu;
