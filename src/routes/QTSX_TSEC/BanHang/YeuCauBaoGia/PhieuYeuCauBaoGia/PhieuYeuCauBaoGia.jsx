import { Button, Card, Col, Divider } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
// import { convertObjectToUrlParams } from "src/util/Common";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { EditableRow, EditableCell } = EditableTableRow;
const DataTest = {
  datalist: [
    {
      id: "123",
      maPhieuYeuCauBaoGia: "maPhieuYeuCauBaoGiaA",
      tenPhieuYeuCauBaoGia: "tenPhieuYeuCauBaoGiaA",
      tenTiengAnh: "tenTiengAnhA",
    },
  ],
  totalRow: 1,
  pageSize: 20,
};
function PhieuYeuCauBaoGia({ history, permission, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  // const [page, setPage] = useState(1);
  const { totalRow, pageSize } = Data;

  useEffect(() => {
    if (permission && permission.view) {
      setData(DataTest);
      // getListData(keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  // const getListData = (keyword, page) => {
  //   let param = convertObjectToUrlParams({ keyword, page });
  //   new Promise((resolve, reject) => {
  //     dispatch(
  //       fetchStart(
  //         `tsec_qtsx_PhieuYeuCauBaoGia?${param}`,
  //         "GET",
  //         null,
  //         "DETAIL",
  //         "",
  //         resolve,
  //         reject
  //       )
  //     );
  //   }).then((res) => {
  //     if (res && res.data) {
  //       setData(res.data);
  //     } else {
  //       setData([]);
  //     }
  //   });
  // };

  const handleTableChange = (pagination) => {
    // setPage(pagination);
    // getListData(keyword, pagination);
  };

  const onSearchPhieuYeuCauBaoGia = () => {
    // getListData(keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      // getListData(val.target.value, page);
    }
  };

  const handleClearSearch = () => {
    // getListData(null, 1);
  };

  const deleteItemFunc = (item) => {
    const title = "phiếu yêu cầu";
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.tenPhieuYeuCauBaoGia,
      title
    );
  };

  const deleteItemAction = (item) => {
    let url = `tsec_qtsx_PhieuYeuCauBaoGia/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // getListData(keyword, page);
      })
      .catch((error) => console.error(error));
  };

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

  let dataList = reDataForTable(Data.datalist);

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
      title: "Mã phiếu yêu cầu",
      dataIndex: "maPhieuYeuCauBaoGia",
      key: "maPhieuYeuCauBaoGia",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhieuYeuCauBaoGia,
            value: d.maPhieuYeuCauBaoGia,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maPhieuYeuCauBaoGia &&
        record.maPhieuYeuCauBaoGia.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên phiếu yêu cầu",
      dataIndex: "tenPhieuYeuCauBaoGia",
      key: "tenPhieuYeuCauBaoGia",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenPhieuYeuCauBaoGia,
            value: d.tenPhieuYeuCauBaoGia,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenPhieuYeuCauBaoGia &&
        record.tenPhieuYeuCauBaoGia.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên tiếng anh",
      dataIndex: "tenTiengAnh",
      key: "tenTiengAnh",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenTiengAnh,
            value: d.tenTiengAnh,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenTiengAnh && record.tenTiengAnh.includes(value),
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
          className="th-margin-bottom-0 btn-margin-bottom-0"
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
        title={"Phiếu yêu cầu báo giá"}
        description="Danh sách phiếu yêu cầu báo giá"
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
            gap: "15px",
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>Tìm kiếm:</span>
          <Toolbar
            count={1}
            search={{
              title: "Tìm kiếm",
              loading,
              value: keyword,
              onChange: onChangeKeyword,
              onPressEnter: onSearchPhieuYeuCauBaoGia,
              onSearch: onSearchPhieuYeuCauBaoGia,
              placeholder: "Nhập từ khóa",
              allowClear: true,
              onClear: { handleClearSearch },
            }}
          />
        </Col>
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
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default PhieuYeuCauBaoGia;
