import React, { useEffect, useState } from "react";
import { Card, Button, Divider, Row, Col } from "antd";
import { Icon } from "@ant-design/compatible";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { map, find, isEmpty, repeat } from "lodash";

import {
  ModalDeleteConfirm,
  Table,
  EditableTableRow,
  Select,
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
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [PhanMemSelect, setPhanMemSelect] = useState([]);
  const [PhanMem, setPhanMem] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getPhanMem(INFO.phanMem_Id);
      loadData(INFO);
    } else if (permission && !permission.view) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  /**
   * Lấy dữ liệu về
   *
   */
  const loadData = (info) => {
    const param = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
      phanMem_Id: info.phanMem_Id,
    });
    dispatch(fetchStart(`Menu/menu-tree?${param}`, "GET", null, "LIST"));
  };
  /**
   * Lấy list phần mềm
   *
   */
  const getPhanMem = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`PhanMem/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setPhanMem(res.data.id);
          setPhanMemSelect([res.data]);
        } else {
          setPhanMemSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Thêm dấu để phân cấp tiêu đề dựa theo tree (flatlist)
   *
   * @param {*} value
   * @param {*} record
   * @returns
   * @memberof ChucNang
   */
  const renderTenMenu = (value, record) => {
    let string = repeat("- ", record.level);
    string = `${string} ${value}`;
    return <div>{string}</div>;
  };

  /**
   * ActionContent: Hành động trên bảng
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
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

  /**
   * deleteItemFunc: Xoá item theo item
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenMenu, "Menu");
  };

  /**
   * Xóa item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `Menu/${item.id}`;
    if (item.isRemove) url = `Menu/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        // Reload lại danh sách
        loadData(INFO);
      })
      .catch((error) => console.error(error));
  };

  /**
   * Render Icon trên bảng
   *
   * @param {*} icon
   * @param {*} record
   * @returns
   * @memberof ChucNang
   */
  const renderIcon = (icon, record) => {
    // if (record.isParent) return null;
    return <Icon type={icon} />;
  };

  /**
   * Chuyển tới trang thêm mới chức năng
   *
   * @memberof ChucNang
   */
  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  /**
   * Lưu thứ tự từ bảng
   * @param {object} row dữ liệu một hàng
   * @memberof ChucNang
   */
  const handleSave = async (row) => {
    const dataValue = treeToFlatlist(data);
    // Check data not change
    const item = find(dataValue, (item) => item.id === row.id);
    if (!isEmpty(item)) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Menu/ThuTu/${item.id}`,
            "PUT",
            {
              ...item,
              thuTu: row.thuTu,
            },
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status === 200) {
            loadData(INFO);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const addButtonRender = () => {
    return (
      <Button
        icon={<PlusOutlined />}
        className="th-margin-bottom-0"
        type="primary"
        onClick={handleRedirect}
        disabled={permission && !permission.add}
      >
        Thêm mới
      </Button>
    );
  };

  let renderHead = [
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
      width: 50,
      render: (icon, record) => renderIcon(icon, record),
    },
    { title: "URL", dataIndex: "url", key: "url" },
    {
      title: "Thứ tự",
      dataIndex: "thuTu",
      key: "thuTu",
      align: "center",
      editable: permission && permission.edit,
      width: 100,
      info: { type: "number", required: true },
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];
  let dataList = treeToFlatlist(data);
  dataList = reDataSelectedTable(dataList);

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
        handleSave: handleSave,
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
          scroll={{ x: 700, y: "55vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
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
