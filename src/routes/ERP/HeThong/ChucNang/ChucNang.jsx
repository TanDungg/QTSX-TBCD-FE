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
  reDataSelectedTable,
  treeToFlatlist,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;

function ChucNang({ history, permission }) {
  const { loading, data } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [PhanMemSelect, setPhanMemSelect] = useState([]);
  const [PhanMem, setPhanMem] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getPhanMem();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  /**
   * Lấy dữ liệu về
   *
   */
  const loadData = (params) => {
    if (params) {
      const exp = params.split("_");
      let param = {};
      if (exp.length === 2) {
        param = convertObjectToUrlParams({
          PhanMem_Id: exp[0],
          TapDoan_Id: exp[1],
        });
      } else if (exp.length === 3) {
        param = convertObjectToUrlParams({
          PhanMem_Id: exp[0],
          TapDoan_Id: exp[1],
          DonVi_id: exp[2],
        });
      } else if (exp.length === 4) {
        param = convertObjectToUrlParams({
          PhanMem_Id: exp[0],
          TapDoan_Id: exp[1],
          DonVi_id: exp[2],
          PhongBan_id: exp[3],
        });
      }
      dispatch(fetchStart(`Menu/menu-tree?${param}`, "GET", null, "LIST"));
    } else {
      dispatch(fetchStart(`Menu/menu-tree`, "GET", null, "LIST"));
    }
  };
  /**
   * Lấy list phần mềm
   *
   */
  const getPhanMem = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/phan-mem-for-menu`,
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
          const newData = res.data.map((dt) => {
            return {
              name:
                dt.tenPhanMem +
                " - " +
                dt.maTapDoan +
                (dt.maDonVi ? " - " + dt.maDonVi : "") +
                (dt.maPhongBan ? " - " + dt.maPhongBan : ""),
              phanMem_Id: dt.phanMem_Id,
              donVi_Id: dt.donVi_Id,
              tapDoan_Id: dt.TapDoan_Id,
              phongBan_Id: dt.PhongBan_Id,
              tenPhanMem: dt.tenPhanMem,
              name_Id:
                dt.phanMem_Id +
                "_" +
                dt.TapDoan_Id +
                (dt.donVi_Id ? `_${dt.donVi_Id}` : "") +
                (dt.PhongBan_Id ? `_${dt.PhongBan_Id}` : ""),
            };
          });
          loadData(newData[0].name_Id);
          setPhanMem(newData[0].name_Id);
          setPhanMemSelect(newData);
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
            pathname: `/he-thong-erp/chuc-nang/${item.id}/chinh-sua`,
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
        loadData(PhanMem);
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
      pathname: "/he-thong-erp/chuc-nang/them-moi",
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
              id: item.id,
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
            loadData(PhanMem);
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
  const handleOnSelectPhanMem = (val) => {
    loadData(val);
    setPhanMem(val);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Menu"
        description="Danh sách menu"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ paddingBottom: 8 }}>
          <Col
            xxl={2}
            xl={3}
            lg={4}
            md={4}
            sm={5}
            xs={6}
            align={"center"}
            style={{ marginTop: 8 }}
          >
            Phần mềm:
          </Col>
          <Col
            xxl={10}
            xl={10}
            lg={20}
            md={20}
            sm={19}
            xs={18}
            style={{ marginBottom: 8 }}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={PhanMemSelect ? PhanMemSelect : []}
              placeholder="Chọn phần mềm"
              optionsvalue={["name_Id", "name"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectPhanMem}
              value={PhanMem}
              optionFilterProp={"name"}
              showSearch
            />
          </Col>
        </Row>
        <Table
          bordered
          scroll={{ x: 700, y: "64vh" }}
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
