import { Modal as AntModal, Card, Input, Button } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";
import { ModalDeleteConfirm, Table } from "src/components/Common";
import { isEmpty } from "lodash";
import { DeleteOutlined } from "@ant-design/icons";
import Helpers from "src/helpers";

function ModalChonViTri({ openModalFS, openModal, itemData, ViTriLuuKho }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [DisabledSave, setDisabledSave] = useState(true);

  useEffect(() => {
    if (openModal) {
      const ViTri = itemData.ListViTri;
      setListViTriKho(
        ViTri.list_ViTriLuuKhos &&
          ViTri.list_ViTriLuuKhos.map((vt) => {
            return {
              ...vt,
              vitri: `(${vt.tenKe && vt.tenKe}${
                vt.tenTang && ` - ${vt.tenTang}`
              }${vt.tenNgan && ` - ${vt.tenNgan}`})`,
            };
          })
      );
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  //  else if (soLuongNhap > item.soLuongTonKho) {
  //   setDisabledSave(true);
  //   item.message = `Số lượng nhập không được lớn hơn ${item.soLuongTonKho}`;
  //   setEditingRecord([...editingRecord, item]);
  // }

  const handleInputChange = (val, item) => {
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || Number(soLuongNhap) <= 0) {
      setDisabledSave(true);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng nhập phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) =>
            d.tits_qtsx_PhieuNhapKhoVatTuChiTiet_ChiTietKhoVatTu_Id.toLowerCase() !==
            item.tits_qtsx_PhieuNhapKhoVatTuChiTiet_ChiTietKhoVatTu_Id.toLowerCase()
        );
      if (newData.length !== 0) {
        setDisabledSave(true);
      } else {
        setDisabledSave(false);
      }
      setEditingRecord(newData);
    }
    const newData = [...ListViTriKho];

    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_PhieuNhapKhoVatTuChiTiet_ChiTietKhoVatTu_Id.toLowerCase() ===
        item.tits_qtsx_PhieuNhapKhoVatTuChiTiet_ChiTietKhoVatTu_Id.toLowerCase()
      ) {
        ct.soLuong = soLuongNhap;
      }
    });
    setListViTriKho(newData);
  };

  const renderSoLuongNhap = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord &&
      editingRecord.forEach((ct) => {
        if (
          ct.tits_qtsx_PhieuNhapKhoVatTuChiTiet_ChiTietKhoVatTu_Id.toLowerCase() ===
          item.tits_qtsx_PhieuNhapKhoVatTuChiTiet_ChiTietKhoVatTu_Id.toLowerCase()
        ) {
          isEditing = true;
          message = ct.message;
        }
      });

    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
            borderColor: isEditing ? "red" : "",
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const deleteItemFunc = (item) => {
    const title = "vị trí ";
    ModalDeleteConfirm(deleteItemAction, item, item.vitri, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListViTriKho.filter(
      (d) =>
        d.tits_qtsx_PhieuNhapKhoVatTuChiTiet_ChiTietKhoVatTu_Id.toLowerCase() !==
        item.tits_qtsx_PhieuNhapKhoVatTuChiTiet_ChiTietKhoVatTu_Id.toLowerCase()
    );
    if (newData.length === 0) {
      Helpers.alertError("Vị trí lưu không được rỗng");
    } else {
      setListViTriKho(newData);
    }
  };

  const actionContent = (item) => {
    const deleteItemVal = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let colListViTri = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Tên kệ",
      dataIndex: "tenKe",
      key: "tenKe",
      align: "center",
    },
    {
      title: "Tên tầng",
      dataIndex: "tenTang",
      key: "tenTang",
      align: "center",
    },
    {
      title: "Tên ngăn",
      dataIndex: "tenNgan",
      key: "tenNgan",
      align: "center",
    },
    {
      title: "Số lượng nhập",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongNhap(record),
    },
  ];

  const XacNhanViTri = () => {
    const newData = {
      tits_qtsx_VatTu_Id: itemData.ListViTri.tits_qtsx_VatTu_Id,
      list_ViTriLuuKhos: ListViTriKho,
    };
    ViTriLuuKho(newData);
    openModalFS(false);
    setListViTriKho([]);
  };

  const handleCancel = () => {
    setListViTriKho([]);
    openModalFS(false);
  };

  const Title = (
    <span>
      Chọn vị trí lưu kho của vật tư - {itemData.ListViTri.tenVatTu} (Số lượng:{" "}
      {itemData.ListViTri.soLuongChuaNhap})
    </span>
  );

  return (
    <AntModal
      title={Title}
      open={openModal}
      width={width > 1000 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Table
            bordered
            columns={colListViTri}
            scroll={{ x: 800, y: "45vh" }}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListViTriKho)}
            size="small"
            pagination={false}
          />
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <Button
              className="th-margin-bottom-0"
              type="primary"
              onClick={XacNhanViTri}
              disabled={DisabledSave}
            >
              Xác nhận
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalChonViTri;
