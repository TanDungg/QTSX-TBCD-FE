import { SaveOutlined } from "@ant-design/icons";
import { Modal as AntModal, Form, Row, Col, Button, Tag } from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table, EditableTableRow, Modal } from "src/components/Common";
import Helpers from "src/helpers";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalChuyenSuaLai({ openModalFS, openModal, info, refesh }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListLoiChuyenSuaChuaLai, setListLoiChuyenSuaChuaLai] = useState([]);
  const [selectedLoi, setSelectedLoi] = useState([]);
  const [selectedKey, setSelectedKey] = useState([]);
  useEffect(() => {
    if (openModal) {
      setSelectedKey([]);
      setSelectedLoi([]);
      getListLoiChuyenSuaChuaLai(info);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListLoiChuyenSuaChuaLai = (info) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_TienDoSanXuat_Id: info.tits_qtsx_TienDoSanXuat_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/chuyen-sua-chua-lai?${param}`,
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
        setListLoiChuyenSuaChuaLai(res.data);
      } else {
        setListLoiChuyenSuaChuaLai([]);
      }
    });
  };

  const onSave = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/put-chuyen-sua-chua-lai?tits_qtsx_TienDoSanXuat_Id=${selectedLoi[0].tits_qtsx_TienDoSanXuat_Id}`,
          "PUT",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status === 200) {
        Helpers.alertSuccessMessage("Đã chuyển sửa chữa lại thành công!!");
        resetFields();
        openModalFS(false);
        refesh();
      }
    });
  };
  const modalXacNhan = (ham, title) => {
    Modal({
      type: "confirm",
      okText: "Xác nhận",
      cancelText: "Hủy",
      title: `Xác nhận ${title}`,
      onOk: ham,
    });
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
    },
    {
      title: "Xưởng",
      dataIndex: "tenXuong",
      key: "tenXuong",
      align: "center",
    },
    {
      title: "Trạm",
      dataIndex: "tenTram",
      key: "tenTram",
      align: "center",
    },
    {
      title: "Lỗi",
      dataIndex: "list_Lois",
      key: "list_Lois",
      align: "center",
      render: (val) => val.map((l) => <Tag color={"red"}>{l.maLoi}</Tag>),
    },
  ];

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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleCancel = () => {
    openModalFS(false);
  };

  const rowSelection = {
    selectedRowKeys: selectedKey,
    selectedRows: selectedLoi,
    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        selectedLoi.length > 0
          ? selectedRows.filter((d) => d.key !== selectedLoi[0].key)
          : [...selectedRows];

      const key =
        selectedKey.length > 0
          ? selectedRowKeys.filter((d) => d !== selectedKey[0])
          : [...selectedRowKeys];
      setSelectedLoi(row);
      setSelectedKey(key);
    },
  };
  return (
    <AntModal
      title="Chuyển sửa chữa lại"
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Row justify={"center"} style={{ marginBottom: 10 }}>
        <Col span={1}></Col>
        <Col span={13}>
          Sản phẩm:{" "}
          <span style={{ fontWeight: "bold" }}> {info.tenSanPham}</span>
        </Col>
        <Col span={10}>
          Số khung nội bộ:{" "}
          <span style={{ fontWeight: "bold" }}> {info.maNoiBo}</span>
        </Col>
      </Row>
      <Table
        bordered
        scroll={{ x: 800, y: "70vh" }}
        columns={columns}
        components={components}
        className="gx-table-responsive"
        dataSource={reDataForTable(ListLoiChuyenSuaChuaLai)}
        size="small"
        pagination={false}
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
          hideSelectAll: true,
          preserveSelectedRowKeys: false,
          selectedRowKeys: selectedKey,
        }}
      />
      <Row style={{ marginTop: 10 }}>
        <Col span={24} align="center">
          <Button
            className="th-margin-bottom-0"
            style={{ margin: 0 }}
            icon={<SaveOutlined />}
            onClick={() => modalXacNhan(onSave, "Chuyển sửa chữa lại")}
            type="primary"
            disabled={selectedKey.length === 0}
          >
            Lưu
          </Button>
        </Col>
      </Row>
    </AntModal>
  );
}

export default ModalChuyenSuaLai;
