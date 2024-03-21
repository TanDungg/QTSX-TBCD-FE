import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";
import { EditableTableRow, Table, Toolbar } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { Card } from "antd";

const { EditableRow, EditableCell } = EditableTableRow;

function ChucDanh({ match, history, permission }) {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(({ common }) => common).toJS();
  const [keyword, setKeyword] = useState("");
  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword);
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
    let param = convertObjectToUrlParams({ keyword });
    dispatch(fetchStart(`ChucDanh?${param}`, "GET", null, "LIST"));
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
  const dataList = reDataForTable(data);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 100,
      align: "center",
    },
    {
      title: "Tên chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
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

  const handleClearSearch = () => {
    getListData(null);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục chức danh"}
        description="Danh sách chức danh"
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
            onClear: handleClearSearch,
          }}
        />
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
            pageSize: 30,
            total: dataList.length,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default ChucDanh;
