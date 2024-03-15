import { EditOutlined } from "@ant-design/icons";
import { Card, Col } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import { EditableTableRow, Table, Toolbar } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ChucVu({ history, permission, match }) {
  const dispatch = useDispatch();
  const { width, loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const { totalRow, totalPages, pageSize } = Data;

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = (keyword, page) => {
    let param = convertObjectToUrlParams({ page, keyword });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChucDanhChucVu?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setData(res.data);
      } else {
        setData([]);
      }
    });
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(keyword, pagination);
  };

  const onSearchNguoiDung = () => {
    getListData(keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, page);
    }
  };

  const handleClearSearch = () => {
    getListData(null, 1);
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.chucVu_Id}/chinh-sua`,
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

    return (
      <div>
        <React.Fragment>{editItem}</React.Fragment>
      </div>
    );
  };

  const dataList = reDataForTable(Data.datalist, page, pageSize);

  let colValues = [
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
      width: 50,
      align: "center",
    },
    {
      title: "Mã chức danh",
      dataIndex: "maChucVu",
      key: "maChucVu",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maChucVu,
            value: d.maChucVu,
          };
        })
      ),
      onFilter: (value, record) => record.maChucVu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên chức danh",
      dataIndex: "tenChucVu",
      key: "tenChucVu",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenChucVu,
            value: d.tenChucVu,
          };
        })
      ),
      onFilter: (value, record) => record.tenChucVu.includes(value),
      filterSearch: true,
    },
    {
      title: "Chức vụ",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenChucDanh,
            value: d.tenChucDanh,
          };
        })
      ),
      onFilter: (value, record) => record.tenChucDanh.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 200,
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

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục chức danh"}
        description="Danh sách chức danh"
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
          scroll={{ x: 700, y: "53vh" }}
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
                : `Tổng ${totalPages}`,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default ChucVu;
