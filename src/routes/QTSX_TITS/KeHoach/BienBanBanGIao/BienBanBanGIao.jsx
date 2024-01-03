import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Divider,
  Col,
  Row,
  Popover,
  Modal as AntModal,
  DatePicker,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty } from "lodash";
import QRCode from "qrcode.react";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Toolbar,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getDateNow,
  reDataForTable,
  removeDuplicates,
  setLocalStorage,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import moment from "moment";
const { RangePicker } = DatePicker;

const { EditableRow, EditableCell } = EditableTableRow;

function BienBanBanGIao({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedSoContainer, setSelectedSoContainer] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [DisabledModal, setDisabledModal] = useState(false);
  const [DataChiTiet, setDataChiTiet] = useState([]);
  const [ChiTiet, setChiTiet] = useState([]);
  const [FromDate, setFromDate] = useState(getDateNow(-7));
  const [ToDate, setToDate] = useState(getDateNow());
  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, FromDate, ToDate, page);
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
  const getListData = (keyword, ngayBatDau, ngayKetThuc, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      ngayBatDau,
      ngayKetThuc,
      page,
    });
    dispatch(
      fetchStart(`tits_qtsx_BienBanBanGiao?${param}`, "GET", null, "LIST")
    );
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchKhaiBaoSoContainer = () => {
    getListData(keyword, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa biên bản bàn giao"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa biên bản bàn giao">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item, "biên bản bàn giao") }
        : { disabled: true };
    return (
      <div>
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa biên bản bàn giao">
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
  const deleteItemFunc = (item, title) => {
    ModalDeleteConfirm(deleteItemAction, item, item.maBBBG, title);
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_BienBanBanGiao/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(keyword, FromDate, ToDate, page);
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
    getListData(keyword, pagination);
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
          Thêm mới
        </Button>
        <Button
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handlePrint}
          disabled={
            (permission && !permission.print) ||
            selectedSoContainer.length === 0
          }
        >
          Xuất excel
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(data.datalist, page, pageSize);

  const handlePrint = () => {
    setLocalStorage("maQrCodeSoContainer", selectedSoContainer);
    window.open(`${match.url}/in-ma-Qrcode-SoContainer`, "_blank");
  };

  const XemChiTiet = (record) => {
    setChiTiet(record);
    setDataChiTiet(
      reDataForTable(
        record.list_bbbgchitiets && JSON.parse(record.list_bbbgchitiets)
      )
    );
    setDisabledModal(true);
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
      title: "Mã BBBG",
      dataIndex: "maBBBG",
      key: "maBBBG",
      align: "center",
      width: 150,
    },
    {
      title: "Nơi nhận",
      dataIndex: "tenKhachHang",
      key: "tenKhachHang",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhachHang,
            value: d.tenKhachHang,
          };
        })
      ),
      onFilter: (value, record) => record.tenKhachHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày",
      dataIndex: "ngayTao",
      key: "ngayTao",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayTao,
            value: d.ngayTao,
          };
        })
      ),
      onFilter: (value, record) => record.ngayTao.includes(value),
      filterSearch: true,
    },

    {
      title: "Chi tiết",
      key: "list_bbbgchitiets",
      align: "center",
      render: (record) => (
        <Button
          type="primary"
          onClick={() => {
            XemChiTiet(record);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },

    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
    },
  ];

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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  let colChiTiet = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Số Booking",
      dataIndex: "soBooking",
      key: "soBooking",
      align: "center",
    },
    {
      title: "Số Cont",
      dataIndex: "soContainer",
      key: "soContainer",
      align: "center",
    },
    {
      title: "Đơn hàng",
      dataIndex: "tenDonHang",
      key: "tenDonHang",
      align: "center",
    },
    {
      title: "Số VIN",
      key: "list_chitiets",
      align: "center",
      render: (val) =>
        val.list_ChiTiets &&
        val.list_ChiTiets.map((ct) => {
          return <Tag color="green">{ct.maSoVin}</Tag>;
        }),
    },
    {
      title: "Số lượng",
      key: "soLuong",
      align: "center",
      render: (val) => (
        <span>{val.list_ChiTiets && val.list_ChiTiets.length}</span>
      ),
    },
    // {
    //   title: "Đơn vị tính",
    //   dataIndex: "tenDonViTinh",
    //   key: "tenDonViTinh",
    //   align: "center",
    // },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
    },
  ];

  const componentschitiet = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columnschitiet = map(colChiTiet, (col) => {
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

  // const rowSelection = {
  //   selectedRowKeys: selectedKeys,
  //   selectedRows: selectedSoContainer,
  //   onChange: (selectedRowKeys, selectedRows) => {
  //     const newSelectedSoContainer = [...selectedRows];
  //     const newSelectedKey = [...selectedRowKeys];
  //     setSelectedSoContainer(newSelectedSoContainer);
  //     setSelectedKeys(newSelectedKey);
  //   },
  // };
  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedSoContainer,

    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        selectedSoContainer.length > 0
          ? selectedRows.filter((d) => d.key !== selectedSoContainer[0].key)
          : [...selectedRows];

      const key =
        selectedKeys.length > 0
          ? selectedRowKeys.filter((d) => d !== selectedKeys[0])
          : [...selectedRowKeys];

      setSelectedSoContainer(row);
      setSelectedKeys(key);
    },
  };
  const handleChangeNgay = (dateString) => {
    setFromDate(dateString[0]);
    setToDate(dateString[1]);
    setPage(1);
    getListData(keyword, dateString[0], dateString[1], 1);
  };
  const title = <span>Chi tiết biên bản bàn giao</span>;

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Biên bản bàn giao"
        description="Biên bản bàn giao"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
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
            style={{
              alignItems: "center",
            }}
          >
            <h5
              style={{
                width: "80px",
              }}
            >
              Tìm kiếm:
            </h5>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchKhaiBaoSoContainer,
                onSearch: onSearchKhaiBaoSoContainer,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1000, y: "70vh" }}
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
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedKeys,
          }}
        />
      </Card>
      <AntModal
        title={title}
        className="th-card-reset-margin"
        open={DisabledModal}
        width={width > 1200 ? `80%` : "100%"}
        closable={true}
        onCancel={() => setDisabledModal(false)}
        footer={null}
      >
        <Table
          bordered
          columns={columnschitiet}
          components={componentschitiet}
          scroll={{ x: 1200, y: "55vh" }}
          className="gx-table-responsive"
          dataSource={DataChiTiet}
          size="small"
          loading={loading}
          pagination={false}
        />
      </AntModal>
    </div>
  );
}

export default BienBanBanGIao;
