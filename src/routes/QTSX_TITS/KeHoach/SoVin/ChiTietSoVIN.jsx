import { Modal as AntModal, Row, Col, Button } from "antd";
import React, { useEffect, useState } from "react";
import { map } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset } from "src/appRedux/actions/Common";
import {
  reDataForTable,
  removeDuplicates,
  setLocalStorage,
} from "src/util/Common";
import { EditableTableRow, Table } from "src/components/Common";
import { QrcodeOutlined } from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;

function ChiTietSoVIN({ openModalFS, openModal, data, refesh, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    if (openModal) {
    }

    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
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
      align: "center",
      key: "tenSanPham",
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "tenLoaiSanPham",
      align: "center",
      key: "tenLoaiSanPham",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      align: "center",
      key: "tenMauSac",
    },
    {
      title: "Mã số VIN",
      dataIndex: "maSoVin",
      align: "center",
      key: "maSoVin",
      filters: removeDuplicates(
        map(data, (d) => {
          return {
            text: d.maSoVin,
            value: d.maSoVin,
          };
        })
      ),
      onFilter: (value, record) => record.maSoVin.includes(value),
      filterSearch: true,
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
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
  const handleCancel = () => {
    openModalFS(false);
    refesh();
  };
  const formTitle = "Chi tiết số VIN";
  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedDevice,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedDevice = [...selectedRows];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedDevice(newSelectedDevice);
      setSelectedKeys(newSelectedKey);
    },
  };
  const handlePrint = () => {
    setLocalStorage("inMa", selectedDevice);
    window.open(`${match.url}/in-ma-Qrcode`, "_blank");
  };
  return (
    <div className="gx-main-content">
      <AntModal
        title={formTitle}
        open={openModal}
        width={`80%`}
        closable={true}
        onCancel={handleCancel}
        footer={null}
      >
        <Row>
          <Col span={24} align="end">
            <Button
              icon={<QrcodeOutlined />}
              onClick={handlePrint}
              type="primary"
            >
              In Barcode
            </Button>
          </Col>
        </Row>
        <Table
          style={{ marginTop: 10 }}
          bordered
          scroll={{ x: 900, y: "60vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(data)}
          size="small"
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedKeys,
            getCheckboxProps: (record) => ({}),
          }}
        />
      </AntModal>
    </div>
  );
}

export default ChiTietSoVIN;
