import { Card } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reDataForTable } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates } from "src/util/Common";
import { EditableTableRow, Table, Toolbar } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function DonViHRM({ match, permission, history }) {
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
    dispatch(fetchStart(`DonViHRM?${param}`, "GET", null, "LIST"));
  };

  let dataList = reDataForTable(data);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      stt: "key",
      width: 100,
      align: "center",
    },
    {
      title: "Tên đơn vị HRM",
      dataIndex: "tenDonViHRM",
      key: "tenDonViHRM",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonViHRM,
            value: d.tenDonViHRM,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViHRM.includes(value),
      filterSearch: true,
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

  const onSearchNguoiDung = () => {
    getListData(keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value);
    }
  };

  const handleClearSearch = () => {
    getListData(null, 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Đơn vị HRM"}
        description="Danh sách đơn vị HRM"
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
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        bodyStyle={{ paddingBottom: 0 }}
      >
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

export default DonViHRM;
