import { Modal as AntModal } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchReset } from "src/appRedux/actions/Common";
import { map } from "lodash";
import { EditableTableRow, Table } from "src/components/Common";
import { reDataForTable } from "src/util/Common";
import { BASE_URL_APP } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalChiTietPhieu({ openModalFS, openModal, data, loai, info }) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (openModal) {
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);
  const renderDetail = (val) => {
    const detail = (
      <span
        style={{
          color: "#0469b9",
          cursor: "pointer",
        }}
        onClick={() => {
          let url = "";
          if (val.isNhap === undefined) {
            url =
              BASE_URL_APP +
              (loai && info.isNhap
                ? "/quan-ly-kho-tpc/nhap-kho/thanh-pham/"
                : loai && !info.isNhap
                ? "/quan-ly-kho-tpc/xuat-kho/thanh-pham/"
                : !loai && info.isNhap
                ? "/quan-ly-kho-tpc/nhap-kho/vat-tu/"
                : !loai &&
                  !info.isNhap &&
                  "/quan-ly-kho-tpc/xuat-kho/vat-tu/") +
              val.phieu_Id +
              "/chinh-sua";
          } else {
            url =
              BASE_URL_APP +
              (loai && val.isNhap
                ? "/quan-ly-kho-tpc/nhap-kho/thanh-pham/"
                : loai && !val.isNhap
                ? "/quan-ly-kho-tpc/xuat-kho/thanh-pham/"
                : !loai && val.isNhap
                ? "/quan-ly-kho-tpc/nhap-kho/vat-tu/"
                : !loai && !val.isNhap && "/quan-ly-kho-tpc/xuat-kho/vat-tu/") +
              val.phieu_Id +
              "/chinh-sua";
          }
          window.open(url, "_blank");
        }}
      >
        {val.maPhieu}
      </span>
    );
    return <div>{detail}</div>;
  };
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title:
        info.isNhap === undefined
          ? "Mã phiếu nhập/xuất"
          : info.isNhap
          ? "Mã phiếu nhập"
          : "Mã phiếu xuất",
      key: "maPhieu",
      align: "center",
      render: (record) => renderDetail(record),
    },
    {
      title:
        info.isNhap === undefined
          ? "Ngày nhập/xuất"
          : info.isNhap
          ? "Ngày nhập"
          : "Ngày xuất",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
    },
    {
      title:
        info.isNhap === undefined
          ? "Số lượng nhập/xuất"
          : info.isNhap
          ? "Số lượng nhập"
          : "Số lượng xuất",
      dataIndex: "soLuong",
      key: "soLuong",
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

  const handleCancel = () => {
    openModalFS(false);
    // refesh();
  };

  return (
    <AntModal
      title={`Chi tiết ${
        info.isNhap === undefined ? "nhập/xuất" : info.isNhap ? "nhập" : "xuất"
      } kho ${loai ? "sản phẩm" : "vật tư"} ${info.ten}`}
      open={openModal}
      width={"80%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Table
        bordered
        scroll={{ x: 1000, y: "70vh" }}
        columns={columns}
        components={components}
        className="gx-table-responsive"
        dataSource={reDataForTable(data)}
        size="small"
        pagination={{
          pageSize: 20,
          total: data.length,
          showSizeChanger: false,
          showQuickJumper: true,
        }}
      />
    </AntModal>
  );
}

export default ModalChiTietPhieu;
