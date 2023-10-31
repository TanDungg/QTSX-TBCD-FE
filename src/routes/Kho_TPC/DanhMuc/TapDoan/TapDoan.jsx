import { Card, Col } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  removeDuplicates,
  reDataForTable,
  getLocalStorage,
  treeToFlatlist,
} from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function TapDoan({ history, permission }) {
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const { width, data, loading } = useSelector(({ common }) => common).toJS();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const { totalRow, pageSize } = data;

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
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
    dispatch(fetchStart(`TapDoan/tap-doan-tree?${param}`, "GET", null, "LIST"));
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

  // /**
  //  * ActionContent: Action in table
  //  * @param {*} item
  //  * @returns View
  //  * @memberof ChucNang
  //  */
  // const actionContent = (item) => {
  //   const editItem =
  //     permission && permission.edit ? (
  //       <Link
  //         to={{
  //           pathname: `/danh-muc-erp/tap-doan/${item.id}/chinh-sua`,
  //           state: { itemData: item, permission },
  //         }}
  //         title="Sửa"
  //       >
  //         <EditOutlined />
  //       </Link>
  //     ) : (
  //       <span disabled title="Sửa">
  //         <EditOutlined />
  //       </span>
  //     );
  //   const deleteItemVal =
  //     permission && permission.del && !item.isUsed
  //       ? { onClick: () => deleteItemFunc(item) }
  //       : { disabled: true };
  //   return (
  //     <div>
  //       <React.Fragment>
  //         {editItem}
  //         <Divider type="vertical" />
  //         <a {...deleteItemVal} title="Xóa">
  //           <DeleteOutlined />
  //         </a>
  //       </React.Fragment>
  //     </div>
  //   );
  // };

  let dataList = treeToFlatlist(data);
  dataList = reDataForTable(dataList);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: "5%",
      align: "center",
    },
    {
      title: "Mã tập đoàn",
      dataIndex: "maTapDoan",
      key: "maTapDoan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maTapDoan,
            value: d.maTapDoan,
          };
        })
      ),
      onFilter: (value, record) => record.maTapDoan.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên tập đoàn",
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
    // {
    //   title: "Chức năng",
    //   key: "action",
    //   align: "center",
    //   width: 80,
    //   render: (value) => actionContent(value),
    // },
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
  const handleClearSearch = () => {
    getListData(null, 1);
  };
  const handleRedirect = () => {
    history.push({
      pathname: "/danh-muc-erp/tap-doan/them-moi",
    });
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
        title={"Danh mục tập đoàn"}
        description="Danh sách tập đoàn"
        // buttons={addButtonRender()}
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
                onClear: { handleClearSearch },
              }}
            />
          </div>
        </Col>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 600, y: "55vh" }}
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
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default TapDoan;
