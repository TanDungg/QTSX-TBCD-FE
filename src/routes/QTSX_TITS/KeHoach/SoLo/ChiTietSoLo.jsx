import { Modal as AntModal } from "antd";
import React, { useEffect } from "react";
import { map } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ChiTietSoLo({ openModalFS, openModal, data, refesh, type }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();

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
      title: "Mã sản phẩm nội bộ",
      dataIndex: "maNoiBo",
      align: "center",
      key: "maNoiBo",
    },
    {
      title: "Quy trình",
      dataIndex: "tenQuyTrinhSanXuat",
      align: "center",
      key: "tenQuyTrinhSanXuat",
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
  const formTitle = "Chi tiết mã sản phẩm nội bộ";

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
        />
      </AntModal>
    </div>
  );
}

export default ChiTietSoLo;
