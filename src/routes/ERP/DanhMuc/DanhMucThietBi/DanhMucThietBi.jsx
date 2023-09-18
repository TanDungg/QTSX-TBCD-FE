import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider } from "antd";
import find from "lodash/find";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { treeToFlatlist } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import ImportDanhMucThietBi from "./ImportDanhMucThietBi";
const { EditableRow, EditableCell } = EditableTableRow;

function DanhMucThietBi({ permission, history }) {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(({ common }) => common).toJS();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const { totalRow, totalPage, pageSize } = data;
  const [ActiveModal, setActiveModal] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {
    dispatch(fetchStart("DanhMucThietBi", "GET", null, "LIST"));
  };

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
  const getListData = (keyword, page) => {
    let param = convertObjectToUrlParams({ page, keyword });
    dispatch(fetchStart(`DanhMucThietBi?${param}`, "GET", null, "LIST"));
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
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
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
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "thiết bị";
    ModalDeleteConfirm(deleteItemAction, item, item.tenThietBi, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `DanhMucThietBi/${item.id}`;
    if (item.isRemove) url = `DanhMucThietBi/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(keyword, page);
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
            pathname: `/danh-muc/thiet-bi/${item.id}/chinh-sua`,
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
      permission && permission.del && !item.isUsed
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

  /**
   * Save item from table
   * @param {object} row
   * @memberof ChucNang
   */
  const handleSave = async (row) => {
    const dataValue = treeToFlatlist(data);
    // Check data not change
    const item = find(dataValue, (item) => item.id === row.id);
    if (!isEmpty(item)) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `DanhMucThietBi/${item.id}`,
            "PUT",
            {
              ...item,
              thuTu: row.thuTu,
            },
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status === 204) {
            loadData();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const dataList = reDataForTable(
    data.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Mã thiết bị",
      dataIndex: "maThietBi",
      key: "maThietBi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maThietBi,
            value: d.maThietBi,
          };
        })
      ),
      onFilter: (value, record) => record.maThietBi.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "tenThietBi",
      key: "tenThietBi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenThietBi,
            value: d.tenThietBi,
          };
        })
      ),
      onFilter: (value, record) => record.tenThietBi.includes(value),
      filterSearch: true,
    },
    {
      title: "Hãng thiết bị",
      dataIndex: "tenHang",
      key: "tenHang",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenHang,
            value: d.tenHang,
          };
        })
      ),
      onFilter: (value, record) => record.tenHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Loại thiết bị",
      dataIndex: "tenLoaiThietBi",
      key: "tenLoaiThietBi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLoaiThietBi,
            value: d.tenLoaiThietBi,
          };
        })
      ),
      onFilter: (value, record) => record.tenLoaiThietBi.includes(value),
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
        handleSave: handleSave,
      }),
    };
  });

  /**
   * Redirect to create new organization
   *
   * @memberof ChucNang
   */
  const handleClearSearch = () => {
    getListData(null, 1);
  };
  const handleRedirect = () => {
    history.push({
      pathname: "/danh-muc/thiet-bi/them-moi",
    });
  };
  const handleImport = () => {
    setActiveModal(true);
  };
  const refeshData = () => {
    getListData(keyword, page);
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<UploadOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleImport}
          disabled={permission && !permission.add}
        >
          Import
        </Button>
        <Button
          icon={<PlusOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục thiết bị"}
        description="Danh mục thiết bị"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
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
            onClear: { handleClearSearch },
          }}
        />
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1000, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) =>
              totalRow <= total
                ? `Hiển thị ${dataList.length} trong tổng ${totalRow}`
                : `Tổng ${totalPage}`,
          }}
          loading={loading}
        />
        <ImportDanhMucThietBi
          openModal={ActiveModal}
          refesh={refeshData}
          openModalFS={setActiveModal}
        />
      </Card>
    </div>
  );
}

export default DanhMucThietBi;
