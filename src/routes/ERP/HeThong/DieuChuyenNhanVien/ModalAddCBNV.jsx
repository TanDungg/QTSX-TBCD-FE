import { Modal as AntModal, Button, Divider, Row } from "antd";
import React, { useEffect, useState } from "react";
import { find, remove } from "lodash";

import map from "lodash/map";
import { useDispatch } from "react-redux";
import { EditableTableRow, Table } from "src/components/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
const { EditableRow, EditableCell } = EditableTableRow;

function ModalAddCBNV({
  openModalFS,
  openModal,
  openModalData,
  boPhan_Id,
  loading,
}) {
  const dispatch = useDispatch();
  const [selectCBNV, setSelectCBNV] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [CBNV, setCBNV] = useState([]);
  useEffect(() => {
    const load = () => {
      if (boPhan_Id.trim() !== "") {
        const ID = boPhan_Id.split("_");
        if (ID.length === 3) {
          getCBNV(ID[2], true);
        } else if (ID.length === 4) {
          getCBNV(ID[3]);
        }
      }
    };
    if (openModal) {
      load();
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);
  useEffect(() => {
    setSelectCBNV([]);
    setSelectedKeys([]);
  }, [boPhan_Id]);
  const getCBNV = (boPhanId, check) => {
    let param = "";
    if (check) {
      param = convertObjectToUrlParams({ phongbanId: boPhanId, key: 1 });
    } else {
      param = convertObjectToUrlParams({ boPhanId, key: 1 });
    }
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${param}`,
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
          setCBNV(reDataForTable(res.data));
        } else {
          setCBNV([]);
        }
      })
      .catch((error) => console.error(error));
  };

  function hanldeRemoveSelected(device) {
    const newDevice = remove(selectCBNV, (d) => {
      return d.key !== device.key;
    });
    const newKeys = remove(selectedKeys, (d) => {
      return d !== device.key;
    });
    setSelectCBNV(newDevice);
    setSelectedKeys(newKeys);
  }
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: "5%",
      align: "center",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
    },
    {
      title: "Chức vụ",
      dataIndex: "tenChucVu",
      key: "tenChucVu",
      align: "center",
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

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectCBNV,
    onChange: (selectedRowKeys, selectedRows) => {
      const newselectCBNV = [...selectedRows];
      const newSelectedKey = [...selectedRowKeys];
      setSelectCBNV(newselectCBNV);
      setSelectedKeys(newSelectedKey);
    },
  };

  const handleCancel = () => {
    openModalFS(false);
  };
  const handleAdd = () => {
    openModalFS(false);
    openModalData(selectCBNV);
    setCBNV([]);
  };

  return (
    <AntModal
      title="Thêm cán bộ nhân viên điều chuyển"
      open={openModal}
      width={`70%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 400, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={CBNV}
          size="small"
          rowClassName={"editable-row"}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedKeys,
          }}
          loading={loading}
          onRow={(record, rowIndex) => {
            return {
              onClick: (e) => {
                const found = find(selectedKeys, (k) => k === record.key);
                if (found === undefined) {
                  setSelectCBNV([...selectCBNV, record]);
                  setSelectedKeys([...selectedKeys, record.key]);
                } else {
                  hanldeRemoveSelected(record);
                }
              },
            };
          }}
          pagination={false}
        />
        <Divider />
        <Row justify={"end"}>
          <Button
            className="th-margin-bottom-0"
            type="primary"
            style={{ marginBottom: -5, marginRight: 15 }}
            onClick={handleAdd}
          >
            Thêm
          </Button>
        </Row>
      </div>
    </AntModal>
  );
}

export default ModalAddCBNV;
