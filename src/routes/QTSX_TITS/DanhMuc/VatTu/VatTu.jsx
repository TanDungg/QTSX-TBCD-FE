import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col, Row } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEmpty } from "lodash";
import QRCode from "qrcode.react";
import ImportVatTu from "./ImportVatTu";
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
  removeDuplicates,
  setLocalStorage,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;

function VatTu({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [ActiveModal, setActiveModal] = useState(false);
  const [ListLoaiVatTu, setListLoaiVatTu] = useState([]);
  const [LoaiVatTu, setLoaiVatTu] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    if (permission && permission.view) {
      getLoaiVatTu();
      loadData(keyword, LoaiVatTu, page);
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
  const loadData = (keyword, tits_qtsx_LoaiVatTu_Id, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      tits_qtsx_LoaiVatTu_Id,
      page,
    });
    dispatch(fetchStart(`tits_qtsx_VatTu?${param}`, "GET", null, "LIST"));
  };

  const getLoaiVatTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_LoaiVatTu?page=-1",
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListLoaiVatTu(res.data);
        } else {
          setListLoaiVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm sản phẩm
   *
   */
  const onSearchVatTu = () => {
    loadData(keyword, LoaiVatTu, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      loadData(val.target.value, LoaiVatTu, page);
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
    ModalDeleteConfirm(deleteItemAction, item, item.maVatTu, "vật tư");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_VatTu/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          loadData(keyword, LoaiVatTu, page);
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
    loadData(keyword, LoaiVatTu, pagination);
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

  const handleOnSelectLoaiVatTu = (value) => {
    setLoaiVatTu(value);
    setPage(1);
    loadData(keyword, value, 1);
  };

  const handleClearLoaiVatTu = (value) => {
    setLoaiVatTu(null);
    setPage(1);
    loadData(keyword, null, 1);
  };

  const refeshData = () => {
    loadData(keyword, LoaiVatTu, page);
  };
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
  const handlePrint = () => {
    setLocalStorage("inMa", selectedDevice);
    window.open(`${match.url}/in-ma-Qrcode`, "_blank");
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
          icon={<QrcodeOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handlePrint}
          disabled={permission && !permission.add}
        >
          In mã
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

  let dataList = reDataForTable(data.datalist, page, pageSize);

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
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Loại vật tư",
      dataIndex: "tenLoaiVatTu",
      key: "tenLoaiVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLoaiVatTu,
            value: d.tenLoaiVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenLoaiVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Thông số kỹ thuật",
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thongSoKyThuat,
            value: d.thongSoKyThuat,
          };
        })
      ),
      onFilter: (value, record) => record.thongSoKyThuat.includes(value),
      filterSearch: true,
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenMauSac,
            value: d.tenMauSac,
          };
        })
      ),
      onFilter: (value, record) => record.tenMauSac.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonViTinh,
            value: d.tenDonViTinh,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViTinh.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị quy đổi",
      dataIndex: "tenDonViTinhQuyDoi",
      key: "tenDonViTinhQuyDoi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonViTinhQuyDoi,
            value: d.tenDonViTinhQuyDoi,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViTinhQuyDoi.includes(value),
      filterSearch: true,
    },
    {
      title: "Tỉ lệ quy đổi",
      dataIndex: "tiLeQuyDoi",
      key: "tiLeQuyDoi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tiLeQuyDoi,
            value: d.tiLeQuyDoi,
          };
        })
      ),
      onFilter: (value, record) => record.tiLeQuyDoi.includes(value),
      filterSearch: true,
    },
    {
      title: "Mã barcode",
      key: "hanSuDung",
      align: "center",
      render: (value) => (
        <div id="myqrcode">
          <QRCode
            value={value.id}
            bordered={false}
            style={{ width: 50, height: 50 }}
          />
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

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Vật tư"
        description="Danh sách vật tư"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
        <Row>
          <Col
            xxl={8}
            xl={12}
            lg={16}
            md={16}
            sm={20}
            xs={24}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ width: "100px" }}>Loại vật tư:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiVatTu ? ListLoaiVatTu : []}
              placeholder="Chọn loại vật tư"
              optionsvalue={["id", "tenLoaiVatTu"]}
              style={{ width: "calc(100% - 100px)" }}
              showSearch
              onSelect={handleOnSelectLoaiVatTu}
              optionFilterProp="name"
              allowClear
              onClear={handleClearLoaiVatTu}
              value={LoaiVatTu}
            />
          </Col>
          <Col
            xxl={8}
            xl={12}
            lg={16}
            md={16}
            sm={20}
            xs={24}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: "100px",
              }}
            >
              Tìm kiếm:
            </span>
            <div
              style={{
                flex: 1,
                alignItems: "center",
                marginTop: width < 576 ? 10 : 0,
              }}
            >
              <Toolbar
                count={1}
                search={{
                  title: "Tìm kiếm",
                  loading,
                  value: keyword,
                  onChange: onChangeKeyword,
                  onPressEnter: onSearchVatTu,
                  onSearch: onSearchVatTu,
                  placeholder: "Nhập từ khóa",
                  allowClear: true,
                }}
              />
            </div>
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 700, y: "50vh" }}
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
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedKeys,
            getCheckboxProps: (record) => ({}),
          }}
        />
      </Card>
      <ImportVatTu
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        refesh={refeshData}
      />
    </div>
  );
}

export default VatTu;
