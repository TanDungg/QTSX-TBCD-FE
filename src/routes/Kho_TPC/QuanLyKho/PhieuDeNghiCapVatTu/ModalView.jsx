import { Modal as AntModal } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { map } from "lodash";
import { EditableTableRow, Table } from "src/components/Common";
import {
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
  convertObjectToUrlParams,
} from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalView({ openModalFS, openModal, id, refesh }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [data, setData] = useState([]);
  useEffect(() => {
    if (openModal) {
      getData(id);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);
  const getData = (id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiCapVatTu/${id}?${params}`,
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
          const idMap = {};

          res.data.lst_ChiTietPhieuDeNghiCapVatTu &&
            JSON.parse(res.data.lst_ChiTietPhieuDeNghiCapVatTu).forEach(
              (ct) => {
                if (idMap[ct.vatTu_Id]) {
                  idMap[ct.vatTu_Id].soLuong = Number(
                    (idMap[ct.vatTu_Id].soLuong + ct.soLuong).toFixed(4)
                  );
                } else {
                  // Nếu id chưa tồn tại, thêm mới vào đối tượng
                  idMap[ct.vatTu_Id] = {
                    ...ct,
                    soLuong: Number(ct.soLuong.toFixed(4)),
                  };
                }
              }
            );
          const resultArray = Object.values(idMap);
          setData(resultArray);
        }
      })
      .catch((error) => console.error(error));
  };
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    // {
    //   title: "Sản phẩm",
    //   dataIndex: "tenSanPham",
    //   key: "tenSanPham",
    //   align: "center",
    // },
    // {
    //   title: "Số lượng kế hoạch",
    //   dataIndex: "soLuongKH",
    //   key: "soLuongKH",
    //   align: "center",
    // },
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
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },

    // {
    //   title: "Định mức",
    //   dataIndex: "dinhMuc",
    //   key: "dinhMuc",
    //   align: "center",
    // },
    // {
    //   title: "Định mức xả nhựa",
    //   dataIndex: "dinhMucXaNhua",
    //   key: "dinhMucXaNhua",
    //   align: "center",
    // },
    {
      title: "Số lượng vật tư",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    // {
    //   title: "Hạng mục sử dụng",
    //   dataIndex: "hanMucSuDung",
    //   key: "hanMucSuDung",
    //   align: "center",
    // },
    // {
    //   title: "Ghi chú",
    //   dataIndex: "ghiChu",
    //   key: "ghiChu",
    //   align: "center",
    // },
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

  return (
    <AntModal
      title={"Chi tiết vật tư phiếu đề nghị cập vật tư"}
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

export default ModalView;
