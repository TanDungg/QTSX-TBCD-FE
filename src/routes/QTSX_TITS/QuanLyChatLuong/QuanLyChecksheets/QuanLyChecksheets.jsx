import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Col, Row, Checkbox, Image } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
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
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function QuanLyChecksheets({ match, history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [ListCongDoan, setListCongDoan] = useState([]);

  const [SanPham, setSanPham] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [LoaiSanPham, setLoaiSanPham] = useState("");
  const [CongDoan, setCongDoan] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getLoaiSanPham();
      getSanPham();
      getListCongDoan();
      getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
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
  const getListData = (
    tits_qtsx_LoaiSanPham_Id,
    tits_qtsx_SanPham_Id,
    tits_qtsx_CongDoan_Id,
    keyword,
    page
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_LoaiSanPham_Id,
      tits_qtsx_SanPham_Id,
      tits_qtsx_CongDoan_Id,
      keyword,
      page,
    });
    dispatch(fetchStart(`tits_qtsx_CheckSheet?${param}`, "GET", null, "LIST"));
  };

  const getLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_LoaiSanPham?page=-1",
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
          setListLoaiSanPham(res.data);
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getSanPham = (tits_qtsx_LoaiSanPham_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_LoaiSanPham_Id,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?${params}`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getListCongDoan = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CongDoan?page=-1`,
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
          setListCongDoan(
            res.data.map((sp) => {
              return {
                ...sp,
                name: sp.maCongDoan + " - " + sp.tenCongDoan,
              };
            })
          );
        } else {
          setListCongDoan([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchCheckSheets = () => {
    getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(LoaiSanPham, SanPham, CongDoan, val.target.value, page);
    }
  };
  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const confirmItem =
      permission && permission.cof ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chi-tiet`,
            state: { itemData: item, permission },
          }}
          title="Chi tiết"
        >
          <SearchOutlined />
        </Link>
      ) : (
        <span disabled title="Chi tiết">
          <SearchOutlined />
        </span>
      );
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="Sửa định mức vật tư thép"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa định mức vật tư thép">
          <EditOutlined />
        </span>
      );
    const deleteVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item, "BOM") }
        : { disabled: true };
    return (
      <div>
        {confirmItem}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa định mức vật tư thép">
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
    ModalDeleteConfirm(deleteItemAction, item, item.maCheckSheet, title);
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_CheckSheet/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData(LoaiSanPham, SanPham, CongDoan, keyword, page);
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
    getListData(LoaiSanPham, SanPham, CongDoan, keyword, pagination);
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
  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maSanPham,
            value: d.maSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.maSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
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
      title: "Mã hồ sơ chất lượng",
      dataIndex: "maCheckSheet",
      key: "maCheckSheet",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maCheckSheet,
            value: d.maCheckSheet,
          };
        })
      ),
      onFilter: (value, record) => record.maCheckSheet.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên hồ sơ chất lượng",
      dataIndex: "tenCheckSheet",
      key: "tenCheckSheet",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenCheckSheet,
            value: d.tenCheckSheet,
          };
        })
      ),
      onFilter: (value, record) => record.tenCheckSheet.includes(value),
      filterSearch: true,
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenCongDoan,
            value: d.tenCongDoan,
          };
        })
      ),
      onFilter: (value, record) => record.tenCongDoan.includes(value),
      filterSearch: true,
    },
    {
      title: "Bảng vẽ kỹ thuật",
      dataIndex: "file",
      key: "file",
      align: "center",
      render: (value) =>
        value && (
          <span>
            {value.endsWith(".png") ||
            value.endsWith(".jpg") ||
            value.endsWith(".jpeg") ? (
              <Image
                src={BASE_URL_API + value}
                alt="Hình ảnh"
                style={{ maxWidth: 50, maxHeight: 50 }}
              />
            ) : (
              <a
                target="_blank"
                href={BASE_URL_API + value}
                rel="noopener noreferrer"
              >
                {value.split("/")[5]}
              </a>
            )}
          </span>
        ),
    },
    {
      title: "Sử dụng",
      dataIndex: "isSuDung",
      key: "isSuDung",
      align: "center",
      width: 70,
      render: (val) => {
        return <Checkbox checked={val} disabled={true} />;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
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

  const handleOnSelectLoaiSanPham = (value) => {
    if (LoaiSanPham !== value) {
      setLoaiSanPham(value);
      setSanPham(null);
      setPage(1);
      getSanPham(value);
      getListData(value, null, CongDoan, keyword, 1);
    }
  };

  const handleClearLoaiSanPham = () => {
    setLoaiSanPham(null);
    setSanPham(null);
    setPage(1);
    getSanPham();
    getListData(null, null, CongDoan, keyword, 1);
  };

  const handleOnSelectSanPham = (value) => {
    if (SanPham !== value) {
      setSanPham(value);
      setPage(1);
      getListData(LoaiSanPham, value, CongDoan, keyword, 1);
    }
  };

  const handleClearSanPham = () => {
    setSanPham(null);
    setPage(1);
    getListData(LoaiSanPham, null, CongDoan, keyword, 1);
  };

  const handleOnSelectCongDoan = (value) => {
    if (CongDoan !== value) {
      setCongDoan(value);
      setPage(1);
      getListData(LoaiSanPham, SanPham, value, keyword, 1);
    }
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Quản lý Checksheets"
        description="Quản lý Checksheets"
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
            <h5>Loại sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiSanPham}
              placeholder="Chọn loại sản phẩm"
              optionsvalue={["id", "tenLoaiSanPham"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectLoaiSanPham}
              optionFilterProp="name"
              allowClear
              onClear={handleClearLoaiSanPham}
              value={LoaiSanPham}
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
            <h5>Sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectSanPham}
              optionFilterProp="name"
              allowClear
              onClear={handleClearSanPham}
              value={SanPham}
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
            <h5>Công đoạn:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListCongDoan}
              placeholder="Chọn công đoạn"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={handleOnSelectCongDoan}
              optionFilterProp="name"
              value={CongDoan}
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
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchCheckSheets,
                onSearch: onSearchCheckSheets,
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
          scroll={{ x: 1200, y: "70vh" }}
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

export default QuanLyChecksheets;
