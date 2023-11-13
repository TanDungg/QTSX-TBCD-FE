import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col, DatePicker } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
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
  exportPDF,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function DonHang({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  const [SelectedDonHang, setSelectedDonHang] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [TinhTrang, setTinhTrang] = useState(null);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(FromDate, ToDate, TinhTrang, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (tuNgay, denNgay, tinhTrang, keyword, page) => {
    const param = convertObjectToUrlParams({
      tuNgay,
      denNgay,
      tinhTrang,
      keyword,
      page,
      donVi_Id: INFO.donVi_Id,
    });
    dispatch(fetchStart(`DonHang?${param}`, "GET", null, "LIST"));
  };

  const onSearchDonHang = () => {
    getListData(FromDate, ToDate, TinhTrang, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(FromDate, ToDate, TinhTrang, val.target.value, page);
    }
  };

  const actionContent = (item) => {
    const detailItem =
      permission && permission.cof && item.tinhTrang === "Chưa xác nhận" ? (
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
      permission &&
      permission.edit &&
      !item.fileXacNhan &&
      item.userYeuCau_Id === INFO.user_Id ? (
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
      !item.fileXacNhan &&
      item.userYeuCau_Id === INFO.user_Id
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
    ModalDeleteConfirm(deleteItemAction, item, item.maDonHang, "đơn hàng");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `DonHang?id=${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(FromDate, ToDate, TinhTrang, keyword, page);
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
    getListData(FromDate, ToDate, TinhTrang, keyword, pagination);
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

  const handlePrint = () => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonHang/${SelectedDonHang[0].id}?${params}`,
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
          const newData = {
            ...res.data,
            lstpdncvtct: JSON.parse(res.data.chiTietVatTu),
          };
          new Promise((resolve, reject) => {
            dispatch(
              fetchStart(
                `DonHang/export-pdf`,
                "POST",
                newData,
                "",
                "",
                resolve,
                reject
              )
            );
          }).then((res) => {
            exportPDF("DonHang", res.data.datapdf);
            setSelectedDonHang([]);
            setSelectedKeys([]);
          });
        }
      })
      .catch((error) => console.error(error));
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
        <Button
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handlePrint}
          disabled={SelectedDonHang.length === 0}
        >
          In phiếu
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
          {val.maDonHang}
        </Link>
      ) : (
        <span disabled>{val.maDonHang}</span>
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
      title: "Mã đơn hàng",
      key: "maDonHang",
      align: "center",
      render: (val) => renderDetail(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maDonHang,
            value: d.maDonHang,
          };
        })
      ),
      onFilter: (value, record) => record.maDonHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên đơn hàng",
      dataIndex: "tenDonHang",
      key: "tenDonHang",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonHang,
            value: d.tenDonHang,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Bên mua",
      dataIndex: "benMua",
      key: "benMua",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.benMua,
            value: d.benMua,
          };
        })
      ),
      onFilter: (value, record) => record.benMua.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị cung cấp",
      dataIndex: "donViCungCap",
      key: "donViCungCap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.donViCungCap,
            value: d.donViCungCap,
          };
        })
      ),
      onFilter: (value, record) => record.donViCungCap.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày đề nghị",
      dataIndex: "ngayDeNghi",
      key: "ngayDeNghi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayDeNghi,
            value: d.ngayDeNghi,
          };
        })
      ),
      onFilter: (value, record) => record.ngayDeNghi.includes(value),
      filterSearch: true,
    },
    {
      title: "Người tạo",
      dataIndex: "nguoiTao",
      key: "nguoiTao",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.nguoiTao,
            value: d.nguoiTao,
          };
        })
      ),
      onFilter: (value, record) => record.nguoiTao.includes(value),
      filterSearch: true,
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "center",
    },
    {
      title: "Tình trạng",
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

  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    getListData(dateString[0], dateString[1], TinhTrang, keyword, 1);
  };

  const handleOnSelectTinhTrang = (val) => {
    setTinhTrang(val);
    setPage(1);
    getListData(FromDate, ToDate, val, keyword, 1);
  };
  const handleClearTinhTrang = () => {
    setTinhTrang(null);
    setPage(1);
    getListData(FromDate, ToDate, null, keyword, 1);
  };

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: SelectedDonHang,

    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        SelectedDonHang.length > 0
          ? selectedRows.filter((d) => d.key !== SelectedDonHang[0].key)
          : [...selectedRows];

      const key =
        selectedKeys.length > 0
          ? selectedRowKeys.filter((d) => d !== selectedKeys[0])
          : [...selectedRowKeys];

      setSelectedDonHang(row);
      setSelectedKeys(key);
    },
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Đơn hàng"
        description="Danh sách đơn hàng"
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
            <h5>Tình trạng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                { value: "Đang giao" },
                { value: "Đã giao" },
                { value: "Đã từ chối" },
              ]}
              placeholder="Chọn tình trạng"
              optionsvalue={["value", "value"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectTinhTrang}
              value={TinhTrang}
              allowClear
              onClear={handleClearTinhTrang}
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
                onPressEnter: onSearchDonHang,
                onSearch: onSearchDonHang,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
        <Table
          bordered
          scroll={{ x: 1300, y: "55vh" }}
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
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: false,
            selectedRowKeys: selectedKeys,
          }}
        />
      </Card>
    </div>
  );
}

export default DonHang;
