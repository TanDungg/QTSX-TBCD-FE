import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QrcodeOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider } from "antd";
import find from "lodash/find";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  // getLocalStorage,
  reDataForTable,
  setLocalStorage,
} from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates } from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import QRCode from "qrcode.react";
import { remove } from "lodash";
import ImportBarcodeVatTu from "./ImportBarcodeVatTu";

const { EditableRow, EditableCell } = EditableTableRow;

function VatTu({ match, permission, history }) {
  // document.title = `Kho linh kiện nhựa | ${APP_NAME}`;
  const dispatch = useDispatch();
  // const INFO = getLocalStorage("menu");
  const { width, data, loading } = useSelector(({ common }) => common).toJS();
  const [keyword, setKeyword] = useState("");
  const { totalRow } = data;
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ActiveModal, setActiveModal] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get menu list
   *
   */
  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListData = (keyword) => {
    let param = convertObjectToUrlParams({ keyword });
    dispatch(fetchStart(`lkn_QRCodeVatTu?${param}`, "GET", null, "LIST"));
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
    getListData(keyword);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value);
    }
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "mã barcode";
    ModalDeleteConfirm(deleteItemAction, item, item.maVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `lkn_QRCodeVatTu/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(keyword);
      })
      .catch((error) => console.error(error));
  };

  /**
   * ActionContent: Action in table
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
            state: { itemData: item, permission },
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
    const deleteItemVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let dataList = reDataForTable(data);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
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
      title: "Hạn sử dụng",
      dataIndex: "hanSuDung",
      key: "hanSuDung",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.hanSuDung,
            value: d.hanSuDung,
          };
        })
      ),
      onFilter: (value, record) => record.hanSuDung.includes(value),
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
      title: "Ngày tạo",
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

  const columns = map(colValues, (col) => {
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

  /**
   * Redirect to create new organization
   *
   * @memberof ChucNang
   */
  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };
  const handlePrint = () => {
    // history.push({
    //   pathname: `${match.url}/inMa`,
    //   state: { VatTu: selectedDevice },
    // });
    setLocalStorage("inMa", selectedDevice);
    window.open(`${match.url}/inMa`, "_blank");
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<UpCircleOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={() => setActiveModal(true)}
          disabled={permission && !permission.add}
        >
          Import
        </Button>
        <Button
          icon={<QrcodeOutlined />}
          className="th-margin-bottom-0"
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
        title={"Mã Barcode vật tư"}
        description="Mã Barcode vật tư"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
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
              width: "80px",
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
                onPressEnter: onSearchNguoiDung,
                onSearch: onSearchNguoiDung,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </div>
        </Col>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            pageSize: 20,
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
        />
      </Card>
      <ImportBarcodeVatTu
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        loading={loading}
        refesh={() => getListData(keyword)}
      />
    </div>
  );
}

export default VatTu;
