import { Modal as AntModal, Row, Col } from "antd";
import React, { useEffect, useState } from "react";

import { reDataForTable } from "src/util/Common";
import { Table, EditableTableRow } from "src/components/Common";
import { map } from "lodash";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalChiTietKho({
  openModalFS,
  openModal,
  loading,
  ListChiTietVatTu,
}) {
  const [ListVatTu, setListVatTu] = useState([]);
  useEffect(() => {
    if (openModal) {
      setListVatTu(ListChiTietVatTu);
    }
  }, [openModal]);
  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Vị trí lưu",
      key: "viTriLuu",
      align: "center",
      render: (val) => {
        return (
          <span>
            {val.tenKe && val.tenKe}
            {val.tenTang && ` - ${val.tenTang}`}
            {val.tenNgan && ` - ${val.tenNgan}`}
          </span>
        );
      },
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "thoiGianSuDung",
      key: "thoiGianSuDung",
      align: "center",
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
  return (
    <AntModal
      title="Tồn kho theo vị trí"
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={() => openModalFS(false)}
      footer={null}
    >
      <div className="gx-main-content">
        <Row justify={"center"}>
          <Col span={24}>
            <h5 style={{ fontWeight: "bold" }}>Tồn kho theo vị trí</h5>
          </Col>
          <Table
            bordered
            scroll={{ x: 500, y: "70vh" }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListVatTu)}
            size="small"
            pagination={false}
          />
        </Row>
      </div>
    </AntModal>
  );
}

export default ModalChiTietKho;
