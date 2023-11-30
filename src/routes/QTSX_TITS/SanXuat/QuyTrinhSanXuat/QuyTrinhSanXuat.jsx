import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col, Row, Checkbox, Tag, Switch } from "antd";
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
  removeDuplicates,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function QuyTrinhSanXuat({ match, history, permission }) {
  const { width, loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [page, setPage] = useState(1);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getSanPham();
      getListData(keyword, SanPham, page);
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
  const getListData = (keyword, tits_qtsx_SanPham_Id, page) => {
    const param = convertObjectToUrlParams({
      keyword,
      tits_qtsx_SanPham_Id,
      page,
    });
    dispatch(
      fetchStart(`tits_qtsx_QuyTrinhSanXuat?${param}`, "GET", null, "LIST")
    );
  };

  const getSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_SanPham?page=-1",
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchQuyTrinhSanXuat = () => {
    getListData(keyword, SanPham, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, SanPham, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const xacnhan =
      item.nguoiDuyet_Id === INFO.user_Id && item.tinhTrang === "Chưa duyệt" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_QuyTrinhSanXuat_Id}/xac-nhan`,
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
      permission && permission.edit && item.tinhTrang === "Chưa duyệt" ? (
        <Link
          to={{
            pathname: `${match.url}/${item.tits_qtsx_QuyTrinhSanXuat_Id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa quy trình sản xuất"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa quy trình sản xuất">
          <EditOutlined />
        </span>
      );

    const deleteVal =
      permission && permission.del && item.tinhTrang === "Chưa duyệt"
        ? { onClick: () => deleteItemFunc(item, "quy trình sản xuất") }
        : { disabled: true };

    return (
      <div>
        {xacnhan}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa quy trình sản xuất">
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
    ModalDeleteConfirm(deleteItemAction, item, item.maQuyTrinhSanXuat, title);
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_QuyTrinhSanXuat/${item.tits_qtsx_QuyTrinhSanXuat_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(keyword, SanPham, page);
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
    getListData(keyword, SanPham, pagination);
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
            pathname: `${match.url}/${val.tits_qtsx_QuyTrinhSanXuat_Id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maQuyTrinhSanXuat}
        </Link>
      ) : (
        <span disabled>{val.maQuyTrinhSanXuat}</span>
      );
    return <div>{detail}</div>;
  };

  const handleChangeSuDung = (record) => {
    const newData = {
      id: record.tits_qtsx_QuyTrinhSanXuat_Id,
      isSuDung: !record.isSuDung,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/set-su-dung/${record.tits_qtsx_QuyTrinhSanXuat_Id}`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(keyword, SanPham, page);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleChangeDefault = (record) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/set-default/${record.tits_qtsx_QuyTrinhSanXuat_Id}`,
          "PUT",
          null,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(keyword, SanPham, page);
        }
      })
      .catch((error) => console.error(error));
  };

  const renderSuDung = (record) => {
    return (
      <Checkbox
        checked={record.isSuDung}
        onChange={() => handleChangeSuDung(record)}
        disabled={record.tinhTrang === "Đã từ chối"}
      />
    );
  };

  const renderDefault = (record) => {
    return (
      <Switch
        checked={record.isDefault}
        onChange={() => handleChangeDefault(record)}
        disabled={record.tinhTrang !== "Đã duyệt"}
      />
    );
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Sử dụng",
      key: "isSuDung",
      align: "center",
      width: 100,
      render: (record) => renderSuDung(record),
    },
    {
      title: "Mặc định",
      key: "isDefault",
      align: "center",
      width: 100,
      render: (record) => renderDefault(record),
    },
    {
      title: "Mã quy trình",
      key: "maQuyTrinhSanXuat",
      align: "center",
      render: (val) => renderDetail(val),
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maQuyTrinhSanXuat,
            value: d.maQuyTrinhSanXuat,
          };
        })
      ),
      onFilter: (value, record) => record.maQuyTrinhSanXuat.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên quy trình",
      dataIndex: "tenQuyTrinhSanXuat",
      key: "tenQuyTrinhSanXuat",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenQuyTrinhSanXuat,
            value: d.tenQuyTrinhSanXuat,
          };
        })
      ),
      onFilter: (value, record) => record.tenQuyTrinhSanXuat.includes(value),
      filterSearch: true,
    },
    {
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày lập",
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
      title: "Ngày áp dụng",
      dataIndex: "ngayApDung",
      key: "ngayApDung",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayApDung,
            value: d.ngayApDung,
          };
        })
      ),
      onFilter: (value, record) => record.ngayApDung.includes(value),
      filterSearch: true,
    },
    {
      title: "BOM",
      dataIndex: "maBOM",
      key: "maBOM",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maBOM,
            value: d.maBOM,
          };
        })
      ),
      onFilter: (value, record) => record.maBOM.includes(value),
      filterSearch: true,
    },
    {
      title: "OEM",
      dataIndex: "maOEM",
      key: "maOEM",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maOEM,
            value: d.maOEM,
          };
        })
      ),
      onFilter: (value, record) => record.maOEM.includes(value),
      filterSearch: true,
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
      render: (value) => (
        <div>
          {value && (
            <Tag
              color={
                value === "Chưa duyệt"
                  ? "orange"
                  : value === "Đã duyệt"
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

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    setPage(1);
    getListData(keyword, value, 1);
  };

  const handleClearSanPham = (value) => {
    setSanPham(null);
    setPage(1);
    getListData(keyword, null, 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Quy trình kiểm soát sản xuất"
        description="Danh sách quy trình kiểm soát sản xuất"
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
            <span style={{ width: "90px" }}>Sản phẩm:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "calc(100% - 90px)" }}
              showSearch
              onSelect={handleOnSelectSanPham}
              optionFilterProp="name"
              allowClear
              onClear={handleClearSanPham}
              value={SanPham}
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
                width: "90px",
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
                  onPressEnter: onSearchQuyTrinhSanXuat,
                  onSearch: onSearchQuyTrinhSanXuat,
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
          scroll={{ x: 1500, y: "70vh" }}
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

export default QuyTrinhSanXuat;
