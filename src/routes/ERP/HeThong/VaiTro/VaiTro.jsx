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
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

function VaiTro({ history, permission }) {
  const dispatch = useDispatch();
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
  const getListData = (params) => {
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
      dispatch(fetchStart(`Role?${param}`, "GET", null, "LIST"));
    } else {
      dispatch(fetchStart(`Role`, "GET", null, "LIST"));
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
          getListData(newData[0].name_Id);
          setPhanMem(newData[0].name_Id);
          setPhanMemSelect(newData);
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
      pathname: "/he-thong-erp/vai-tro/them-moi",
    });
  };

  /**
   * ActionContent: Hành động trên bảng
   *
   * @param {*} item
   * @returns View
   */
  const actionContent = (itemVal) => {
    const phanQuyenItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `/he-thong-erp/vai-tro/${itemVal.id}/phan-quyen`,
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
            pathname: `/he-thong/vai-tro/${itemVal.id}/chinh-sua`,
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
  const handleOnSelectPhanMem = (val) => {
    getListData(val);
    setPhanMem(val);
  };
  const { totalRow, pageSize } = data;
  const dataList = reDataForTable(data ? data : []);
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phân quyền"
        description="Tại đây bạn có thể phân quyền"
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
