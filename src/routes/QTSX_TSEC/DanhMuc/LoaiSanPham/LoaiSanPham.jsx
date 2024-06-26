import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Divider } from "antd";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Table,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { Link } from "react-router-dom";

const { EditableRow, EditableCell } = EditableTableRow;

function LoaiSanPham({ history, permission, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListData();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_LoaiSanPham`,
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

  const deleteItemFunc = (item) => {
    const title = "loại sản phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenLoaiSanPham, title);
  };

  const deleteItemAction = (item) => {
    let url = `tsec_qtsx_LoaiSanPham/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData();
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
      title: "Mã loại sản phẩm",
      dataIndex: "maLoaiSanPham",
      key: "maLoaiSanPham",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maLoaiSanPham,
            value: d.maLoaiSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maLoaiSanPham && record.maLoaiSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên loại sản phẩm",
      dataIndex: "tenLoaiSanPham",
      key: "tenLoaiSanPham",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenLoaiSanPham,
            value: d.tenLoaiSanPham,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenLoaiSanPham && record.tenLoaiSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.moTa,
            value: d.moTa,
          };
        })
      ),
      onFilter: (value, record) => record.moTa && record.moTa.includes(value),
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

  const childrenTable = (record, level) => {
    const childData = record.list_ChiTiets;

    if (!childData || childData.length === 0) {
      return null;
    }
    return (
      <Table
        style={{ padding: "5px 10px" }}
        bordered
        columns={columns}
        scroll={{ x: 700, y: "30vh" }}
        components={components}
        className="gx-table-responsive th-table"
        dataSource={reDataForTable(record.list_ChiTiets)}
        size="small"
        rowClassName={"editable-row"}
        pagination={false}
        expandable={{
          expandedRowRender: (item) => childrenTable(item, level + 1),
        }}
      />
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục loại sản phẩm"}
        description="Danh sách loại sản phẩm"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 700, y: "70vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
          expandable={{
            expandedRowRender: (record) => childrenTable(record, 1),
          }}
        />
      </Card>
    </div>
  );
}

export default LoaiSanPham;
