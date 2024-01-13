import { Modal as AntModal, Row, Card, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { reDataForTable } from "src/util/Common";
import { Table, EditableTableRow } from "src/components/Common";
import { map } from "lodash";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalChiTietKho({ openModalFS, openModal, ListChiTiet }) {
  const [ListVatTu, setListVatTu] = useState([]);
  useEffect(() => {
    if (openModal) {
      setListVatTu(ListChiTiet);
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
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
        const vitri = `${val.tenKe ? `${val.tenKe}` : ""}${
          val.tenTang ? ` - ${val.tenTang}` : ""
        }${val.tenNgan ? ` - ${val.tenNgan}` : ""}`;
        return (
          vitri && (
            <Tag
              color={"blue"}
              style={{
                marginBottom: 3,
                fontSize: 14,
                wordWrap: "break-word",
                whiteSpace: "normal",
              }}
            >
              {vitri}
            </Tag>
          )
        );
      },
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
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <div className="gx-main-content">
          <Row justify={"center"}>
            <Table
              bordered
              scroll={{ x: 800, y: "55vh" }}
              columns={columns}
              components={components}
              className="gx-table-responsive"
              dataSource={reDataForTable(ListVatTu)}
              size="small"
              pagination={false}
            />
          </Row>
        </div>
      </Card>
    </AntModal>
  );
}

export default ModalChiTietKho;
