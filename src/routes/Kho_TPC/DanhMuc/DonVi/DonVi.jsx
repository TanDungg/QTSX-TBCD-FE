import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Card, Divider } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function DonVi({ match, permission, history }) {
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const { data, loading } = useSelector(({ common }) => common).toJS();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const { totalRow, totalPage, pageSize } = data;

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
    let param = convertObjectToUrlParams({ keyword, donviid: INFO.donVi_Id });
    dispatch(fetchStart(`DonVi/don-vi-tree?${param}`, "GET", null, "LIST"));
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
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "đơn vị";
    ModalDeleteConfirm(deleteItemAction, item, item.tenDonVi, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `DonVi/${item.id}`;
    if (item.isRemove) url = `DonVi/${item.id}`;
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
    const editItem = (
      // permission && permission.edit ? (
      //   <Link
      //     to={{
      //       pathname: `${match.url}/${item.id}/chinh-sua`,
      //       state: { itemData: item, permission },
      //     }}
      //     title="Sửa"
      //   >
      //     <EditOutlined />
      //   </Link>
      // ) :
      <span disabled title="Sửa">
        <EditOutlined />
      </span>
    );
    const deleteItemVal =
      // permission && permission.del && !item.isUsed
      //   ? { onClick: () => deleteItemFunc(item) }
      //   :
      { disabled: true };
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

  let dataList = treeToFlatlist(data);
  dataList = reDataForTable(dataList);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      stt: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Mã đơn vị",
      dataIndex: "maDonVi",
      key: "maDonVi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maDonVi,
            value: d.maDonVi,
          };
        })
      ),
      onFilter: (value, record) => record.maDonVi.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonVi,
            value: d.tenDonVi,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonVi.includes(value),
      filterSearch: true,
    },
    {
      title: "Tập đoàn",
      dataIndex: "tenTapDoan",
      key: "tenTapDoan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenTapDoan,
            value: d.tenTapDoan,
          };
        })
      ),
      onFilter: (value, record) => record.tenTapDoan.includes(value),
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

  const onSearchDonVi = () => {
    getListData(keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, page);
    }
  };

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

  const handleClearSearch = () => {
    getListData(null, 1);
  };

  // const addButtonRender = () => {
  //   return (
  //     <>
  //       <Button
  //         icon={<PlusOutlined />}
  //         className="th-btn-margin-bottom-0"
  //         type="primary"
  //         onClick={handleRedirect}
  //         disabled={permission && !permission.add}
  //       >
  //         Thêm mới
  //       </Button>
  //     </>
  //   );
  // };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Đơn vị"}
        description="Danh sách đơn vị"
        // buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
        <Toolbar
          count={1}
          search={{
            title: "Tìm kiếm",
            loading,
            value: keyword,
            onChange: onChangeKeyword,
            onPressEnter: onSearchDonVi,
            onSearch: onSearchDonVi,
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
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize: 20,
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

export default DonVi;
