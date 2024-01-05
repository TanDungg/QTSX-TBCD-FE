import React, { useEffect, useState } from "react";
import { Button, Card, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import {
  Table,
  EditableTableRow,
  ModalDeleteConfirm,
} from "src/components/Common";
import { Link } from "react-router-dom";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { reDataForTable, removeDuplicates } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;

function DanhSachManHinh({ match, history, permission }) {
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [Data, setData] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListData();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ManHinh`,
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
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenManHinh, "màn hình");
  };

  const deleteItemAction = (item) => {
    let url = `tits_qtsx_ManHinh/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        if (res.status !== 409) {
          getListData();
        }
      })
      .catch((error) => console.error(error));
  };

  const handleXemChiTiet = (item) => {
    console.log(item);
    window.open(`${match.url}/${item.id}/chi-tiet-man-hinh`, "_blank");
  };

  const actionContent = (item) => {
    const viewItem =
      permission && permission.edit ? (
        <Link onClick={() => handleXemChiTiet(item)} title="Xem màn hình">
          <EyeOutlined />
        </Link>
      ) : (
        <span disabled title="Xem màn hình">
          <EyeOutlined />
        </span>
      );

    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
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

    const deleteVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {viewItem}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  let renderHead = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 110,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã màn hình",
      dataIndex: "maManHinh",
      key: "maManHinh",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maManHinh,
            value: d.maManHinh,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maManHinh && record.maManHinh.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên màn hình",
      dataIndex: "tenManHinh",
      key: "tenManHinh",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenManHinh,
            value: d.tenManHinh,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenManHinh && record.tenManHinh.includes(value),
      filterSearch: true,
    },
    {
      title: "Xưởng",
      dataIndex: "tenXuong",
      key: "tenXuong",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenXuong,
            value: d.tenXuong,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenXuong && record.tenXuong.includes(value),
      filterSearch: true,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
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

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Danh sách màn hình"
        description="Danh sách màn hình"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 800, y: "55vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default DanhSachManHinh;
