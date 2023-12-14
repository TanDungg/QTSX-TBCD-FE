import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Divider,
  Col,
  Row,
  Popover,
  Modal as AntModal,
  Image,
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
  reDataForTable,
  removeDuplicates,
  setLocalStorage,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function KhaiBaoSoContainer({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedSoContainer, setSelectedSoContainer] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [DisabledModal, setDisabledModal] = useState(false);
  const [DataChiTiet, setDataChiTiet] = useState([]);
  const [ChiTiet, setChiTiet] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, page);
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
  const getListData = (keyword, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      page,
    });
    dispatch(fetchStart(`tits_qtsx_SoContainer?${param}`, "GET", null, "LIST"));
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
          title="Sửa số container"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa số container">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item, "số container") }
        : { disabled: true };
    return (
      <div>
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa số container">
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
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.maKhaiBaoSoContainer,
      title
    );
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_SoContainer/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(keyword, page);
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
          In mã QrCode
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
      reDataForTable(record.list_ChiTiets && JSON.parse(record.list_ChiTiets))
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
      title: "Mã Qr Code",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 150,
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
      title: "Số Container",
      dataIndex: "soContainer",
      key: "soContainer",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.soContainer,
            value: d.soContainer,
          };
        })
      ),
      onFilter: (value, record) => record.soContainer.includes(value),
      filterSearch: true,
    },
    {
      title: "Số Seal",
      dataIndex: "soSeal",
      key: "soSeal",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.soSeal,
            value: d.soSeal,
          };
        })
      ),
      onFilter: (value, record) => record.soSeal.includes(value),
      filterSearch: true,
    },
    {
      title: "Dimensions",
      dataIndex: "dimensions",
      key: "dimensions",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.dimensions,
            value: d.dimensions,
          };
        })
      ),
      onFilter: (value, record) => record.dimensions.includes(value),
      filterSearch: true,
    },
    {
      title: "List số VIN",
      key: "list_ChiTiets",
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
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.moTa,
            value: d.moTa,
          };
        })
      ),
      onFilter: (value, record) => record.moTa.includes(value),
      filterSearch: true,
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
      align: "center",
      width: 45,
    },
    {
      title: "Mã chi tiết",
      dataIndex: "maChiTiet",
      key: "maChiTiet",
      align: "center",
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
    },
    {
      title: "Thông số",
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 50, maxHeight: 50 }}
            />
          </span>
        ),
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

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedSoContainer,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedSoContainer = [...selectedRows];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedSoContainer(newSelectedSoContainer);
      setSelectedKeys(newSelectedKey);
    },
  };

  const title = (
    <span>
      Danh sách số VIN của{" "}
      <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
        {ChiTiet && ChiTiet.tenChiTiet}
      </Tag>
    </span>
  );

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Khai báo số container"
        description="Danh sách khai báo số container"
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
              marginLeft: 10,
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
                  onPressEnter: onSearchKhaiBaoSoContainer,
                  onSearch: onSearchKhaiBaoSoContainer,
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

export default KhaiBaoSoContainer;
