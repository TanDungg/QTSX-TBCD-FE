import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Input } from "antd";
import { Icon } from "@ant-design/compatible";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, repeat } from "lodash";
import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  reDataSelectedTable,
  treeToFlatlist,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;

function ChucNang({ match, history, permission }) {
  const INFO = getLocalStorage("menu");
  const { loading } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [Data, setData] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListData();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const getListData = () => {
    const param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      phanMem_Id: INFO.phanMem_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Menu/menu-tree?${param}`,
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
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const renderTenMenu = (value, record) => {
    let string = repeat("- ", record.level);
    string = `${string} ${value}`;
    return <div>{string}</div>;
  };

  const actionContent = (item) => {
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
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenMenu, "Menu");
  };

  const deleteItemAction = (item) => {
    let url = `Menu/${item.id}`;
    if (item.isRemove) url = `Menu/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        getListData();
      })
      .catch((error) => console.error(error));
  };

  const renderIcon = (icon, record) => {
    return <Icon type={icon} />;
  };

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const addButtonRender = () => {
    return (
      <Button
        icon={<PlusOutlined />}
        className="th-margin-bottom-0 btn-margin-bottom-0"
        type="primary"
        onClick={handleRedirect}
        disabled={permission && !permission.add}
      >
        Thêm mới
      </Button>
    );
  };

  const changeThuTu = (val, item) => {
    const ThuTu = val.target.value;

    if (!ThuTu || Number(ThuTu) <= 0) {
      setEditingRecord([
        ...editingRecord,
        { ...item, message: "Thứ tự phải là số lớn hơn 0 và bắt buộc" },
      ]);
    } else {
      const newData = editingRecord.filter((d) => d.id !== item.id);
      setEditingRecord(newData);
    }

    const newData = treeToFlatlist(Data).map((dt) => {
      if (dt.id === item.id) {
        return {
          ...dt,
          thuTu: ThuTu,
        };
      }
      return dt;
    });

    setData(newData);
  };

  const saveThuTu = (val, item) => {
    const newData = {
      ...item,
      thuTu: val.target.value,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Menu/ThuTu/${item.id}`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          getListData();
        }
      })
      .catch((error) => console.error(error));
  };

  const renderThuTu = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.id === item.id) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.thuTu}
          onBlur={(val) => !isEditing && saveThuTu(val, item)}
          onChange={(val) => changeThuTu(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

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
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: 70,
    },
    {
      title: "Tên menu",
      dataIndex: "tenMenu",
      key: "tenMenu",
      render: (value, record) => renderTenMenu(value, record),
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      align: "center",
      width: 60,
      render: (icon, record) => renderIcon(icon, record),
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      align: "center",
      render: (value) => renderThuTu(value),
      width: 120,
      info: { type: "number", required: true },
    },
    { title: "URL", dataIndex: "url", key: "url" },
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

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Menu"
        description="Danh sách menu"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 700, y: "68vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={reDataSelectedTable(treeToFlatlist(Data))}
          size="small"
          rowClassName={(record) => {
            return record.isParent ? "editable-row" : "editable-row";
          }}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default ChucNang;
