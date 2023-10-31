import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Popover, Row, Col } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, find, isEmpty, remove } from "lodash";
import QRCode from "qrcode.react";
import ImportThongTinVatTu from "./ImportThongTinVatTu";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Toolbar,
  Select,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;

function ThongTinVatTu({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [NhomVatTu, setNhomVatTu] = useState("");
  const [ListNhomVatTu, setListNhomVatTu] = useState([]);

  const [ActiveModal, setActiveModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    if (permission && permission.view) {
      loadData(keyword, page, NhomVatTu);
      getListNhomVatTu();
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
  const loadData = (keyword, page, nhomVatTu_Id) => {
    const param = convertObjectToUrlParams({ keyword, page, nhomVatTu_Id });
    dispatch(
      fetchStart(`lkn_ThongTinVatTu_SanPham?${param}`, "GET", null, "LIST")
    );
  };
  const getListNhomVatTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `NhomVatTu?page=-1`,
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
  const onSearchThongTinVatTu = () => {
    loadData(keyword, page, NhomVatTu);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, page, NhomVatTu);
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
            pathname: `${match.url}/${item.thongTinVatTu_Id}/chinh-sua`,
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
      item.maVatTu,
      "thông tin vât tư"
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_ThongTinVatTu_SanPham/${item.thongTinVatTu_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, page, NhomVatTu);
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
    loadData(keyword, pagination, NhomVatTu);
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
  const handleImport = () => {
    setActiveModal(true);
  };
  const refeshData = () => {
    loadData(keyword, page, NhomVatTu);
  };
  const handlePrint = () => {
    history.push({
      pathname: `${match.url}/inMa`,
      state: { thongTinVatTu: selectedDevice },
    });
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<ImportOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleImport}
          disabled={permission && !permission.add}
        >
          Import
        </Button>
        <Button
          icon={<PrinterOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handlePrint}
          disabled={permission && !permission.print}
        >
          In Barcode
        </Button>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };
  const { totalRow, pageSize } = data;

  let dataList = reDataForTable(
    data.datalist
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
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "tenNhaCungCap",
      key: "tenNhaCungCap",
      align: "center",
    },
    {
      title: "Ngày nhận hàng",
      dataIndex: "ngayNhapVT_SP",
      key: "ngayNhapVT_SP",
      align: "center",
    },
    {
      title: "Thời gian sử dụng",
      dataIndex: "thoiGianSuDung",
      key: "thoiGianSuDung",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
    {
      title: "Mã Barcode",
      dataIndex: "thongTinVatTu_Id",
      key: "thongTinVatTu_Id",
      align: "center",
      render: (value) => (
        <div id="myqrcode">
          <Popover content={value}>
            <QRCode
              value={value}
              bordered={false}
              style={{ width: 50, height: 50 }}
            />
          </Popover>
        </div>
      ),
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
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

  const hanldeNhomVatTu = (val) => {
    setNhomVatTu(val);
    setPage(1);
    loadData(keyword, 1, val);
  };
  const handleClearNhomVatTu = () => {
    setNhomVatTu("");
    setPage(1);
    loadData(keyword, 1, "");
  };
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
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Thông tin vật tư"
        description="Danh sách thông tin vật tư"
        buttons={addButtonRender()}
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 15 }}>
          <Col span={12}>
            <h5>Nhóm vật tư:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListNhomVatTu ? ListNhomVatTu : []}
              placeholder="Nhóm vật tư"
              optionsvalue={["id", "tenNhomVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={hanldeNhomVatTu}
              allowClear
              onClear={handleClearNhomVatTu}
            />
          </Col>
          <Col span={12}>
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchThongTinVatTu,
                onSearch: onSearchThongTinVatTu,
                placeholder: "Nhập từ khóa",
                allowClear: true,
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
                  setSelectedDevice([...selectedDevice, record]);
                  setSelectedKeys([...selectedKeys, record.key]);
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
      <ImportThongTinVatTu
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        refesh={refeshData}
      />
    </div>
  );
}

export default ThongTinVatTu;
