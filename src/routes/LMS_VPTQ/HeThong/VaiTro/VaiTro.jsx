import React, { useEffect, useState } from "react";
import { Button, Card, Divider, Tag } from "antd";
import {
  AuditOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ModalDeleteConfirm, Table } from "src/components/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  reDataForTable,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

function VaiTro({ match, history, permission }) {
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);

  useEffect(() => {
    getListData();
    return () => {
      dispatch(fetchReset());
    };
  }, [dispatch]);

  const getListData = () => {
    const param = convertObjectToUrlParams({
      PhanMem_Id: INFO.phanMem_Id,
      DonVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Role?${param}`, "GET", null, "DETAIL", "", resolve, reject)
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

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const actionContent = (itemVal) => {
    const phanQuyenItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${itemVal.id}/phan-quyen`,
            state: { itemData: itemVal },
          }}
          title="Phân quyền"
        >
          <AuditOutlined />
        </Link>
      ) : (
        <span disabled title="Phân quyền">
          <AuditOutlined />
        </span>
      );

    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${itemVal.id}/chinh-sua`,
            state: { itemData: itemVal },
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
        ? { onClick: () => deleteItemFunc(itemVal) }
        : { disabled: true };

    return (
      <div>
        {phanQuyenItem}
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const deleteItemFunc = async (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.name, "quyền");
  };

  const deleteItemAction = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Role/${item.id}`,
          "DELETE",
          null,
          "DELETE",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        getListData();
      })
      .catch((error) => console.error(error));
  };

  const renderHead = [
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 130,
      render: (value) => actionContent(value),
    },
    { title: "STT", dataIndex: "key", key: "key", align: "center", width: 50 },
    {
      title: "Mã quyền",
      key: "name",
      dataIndex: "name",
      width: 200,
      render: (value) => {
        let color = value === "ADMINISTRATOR_DAOTAO_VPTQ" ? "volcano" : "blue";
        return (
          <span>
            <Tag color={color} key={value}>
              {value.toUpperCase()}
            </Tag>
          </span>
        );
      },
    },
    {
      title: "Tên quyền",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (value) => {
        return <span>{value.toUpperCase()}</span>;
      },
    },
  ];

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Vai trò"
        description="Vai trò"
        buttons={
          <Button
            icon={<PlusOutlined />}
            className="th-margin-bottom-0 btn-margin-bottom-0"
            type="primary"
            onClick={handleRedirect}
            disabled={permission && !permission.add}
          >
            Thêm mới
          </Button>
        }
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={renderHead}
          scroll={{
            x: 700,
            y: "60vh",
          }}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data)}
          size="small"
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default VaiTro;
