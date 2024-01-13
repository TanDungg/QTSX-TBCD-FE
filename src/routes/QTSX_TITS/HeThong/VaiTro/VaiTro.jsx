import React, { useEffect, useState } from "react";
import { Button, Card, Divider, Tag, Row, Col } from "antd";
import {
  AuditOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ModalDeleteConfirm, Table, Select } from "src/components/Common";
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
  const { data, loading } = useSelector(({ common }) => common).toJS();
  const [PhanMem, setPhanMem] = useState("");
  const [PhanMemSelect, setPhanMemSelect] = useState([]);
  useEffect(() => {
    getPhanMem();
    return () => {
      dispatch(fetchReset());
    };
  }, [dispatch]);

  /**
   * Load danh sách vai trò
   *
   */
  const getListData = (PhanMem_Id) => {
    const param = convertObjectToUrlParams({
      PhanMem_Id,
      DonVi_Id: INFO.donVi_Id,
    });
    dispatch(fetchStart(`Role?${param}`, "GET", null, "LIST"));
  };
  /**
   * Lấy list phần mềm
   *
   */
  const getPhanMem = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/${INFO.phanMem_Id}`,
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
          setPhanMemSelect([res.data]);
          setPhanMem(res.data.id);
          getListData(res.data.id);
        } else {
          setPhanMemSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Chuyển tới trang thêm mới vai trò
   *
   */
  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  /**
   * ActionContent: Hành động trên bảng
   *
   * @param {*} item
   * @returns View
   */
  const actionContent = (itemVal) => {
    let check = true;
    if (itemVal.name.toUpperCase().includes("ADMINISTRATOR")) {
      check = false;
    }
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
      permission && permission.edit && check ? (
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
      permission && permission.del && !itemVal.isUsed
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

  /**
   * deleteItem: Xoá item theo item
   *
   * @param {number} item
   * @returns
   */
  const deleteItemFunc = async (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.name, "quyền");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
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
        // Reload lại danh sách
        getListData(PhanMem);
      })
      .catch((error) => console.error(error));
  };

  const renderHead = [
    { title: "STT", dataIndex: "key", key: "key", align: "center", width: 45 },
    {
      title: "Mã quyền",
      key: "name",
      dataIndex: "name",
      render: (name) => {
        let color = name.length > 5 ? "geekblue" : "green";
        if (name === "Administrator") {
          color = "volcano";
        }
        return (
          <span>
            <Tag color={color} key={name}>
              {name.toUpperCase()}
            </Tag>
          </span>
        );
      },
    },
    { title: "Tên quyền", dataIndex: "description", key: "description" },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 150,
      render: (value) => actionContent(value),
    },
  ];

  const dataList = reDataForTable(data ? data : []);
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Vai trò"
        description="Vai trò"
        buttons={
          <Button
            icon={<PlusOutlined />}
            className="th-margin-bottom-0"
            type="primary"
            onClick={handleRedirect}
            disabled={permission && !permission.add}
          >
            Thêm mới
          </Button>
        }
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
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
              marginLeft: 10,
            }}
          >
            <span style={{ width: "100px" }}>Phần mềm:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={PhanMemSelect ? PhanMemSelect : []}
              placeholder="Chọn phần mềm"
              optionsvalue={["id", "tenPhanMem"]}
              style={{ width: "calc(100% - 100px)" }}
              value={PhanMem}
              optionFilterProp={"name"}
              showSearch
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={renderHead}
          scroll={{
            x: 500,
            y: "60vh",
          }}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default VaiTro;
