import { Modal as AntModal, Card, Input, Button } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { Table } from "src/components/Common";
import { isEmpty } from "lodash";

function ModalChonViTri({ openModalFS, openModal, itemData, ThemViTri }) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [DisabledSave, setDisabledSave] = useState(true);
  const [SelectedViTri, setSelectedViTri] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (openModal) {
      const VatTu = itemData.ListVatTu;
      getListViTriKho(
        itemData.tits_qtsx_CauTrucKho_Id,
        VatTu.tits_qtsx_VatTu_Id
      );
      if (VatTu.isCheck === true) {
        setSelectedViTri(
          VatTu.list_ChiTietLuuKhos && VatTu.list_ChiTietLuuKhos
        );
        const lstKey =
          VatTu.list_ChiTietLuuKhos &&
          VatTu.list_ChiTietLuuKhos.map((data) => data.key);
        setSelectedKeys(lstKey && lstKey);
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListViTriKho = (tits_qtsx_CauTrucKho_Id, tits_qtsx_VatTu_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      tits_qtsx_VatTu_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/vat-tu-by-kho?${params}`,
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
        const newData = res.data.map((data) => {
          if (itemData.ListVatTu.isCheck === true) {
            const vitri = itemData.ListVatTu.list_ChiTietLuuKhos.find(
              (vitri) =>
                data.tits_qtsx_ChiTietKhoVatTu_Id.toLowerCase() ===
                vitri.tits_qtsx_ChiTietKhoVatTu_Id.toLowerCase()
            );
            if (vitri) {
              return {
                ...data,
                soLuong: vitri.soLuong,
              };
            } else {
              return {
                ...data,
                soLuong: data.soLuongTonKho,
              };
            }
          } else {
            const vitri = `${data.maKe ? `${data.maKe}` : ""}${
              data.maTang ? ` - ${data.maTang}` : ""
            }${data.maNgan ? ` - ${data.maNgan}` : ""}`;
            return {
              ...data,
              viTri: vitri ? vitri : null,
              soLuong: data.soLuongTonKho,
            };
          }
        });
        setListViTriKho(newData);
      } else {
        setListViTriKho([]);
      }
    });
  };

  const handleInputChange = (val, item) => {
    const soLuongXuat = val.target.value;
    if (isEmpty(soLuongXuat) || Number(soLuongXuat) <= 0) {
      setDisabledSave(true);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (soLuongXuat > item.soLuongTonKho) {
      setDisabledSave(true);
      item.message = `Số lượng xuất không được lớn hơn ${item.soLuongTonKho}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) =>
            d.tits_qtsx_ChiTietKhoVatTu_Id !== item.tits_qtsx_ChiTietKhoVatTu_Id
        );
      if (newData.length !== 0) {
        setDisabledSave(true);
      } else if (SelectedViTri.length === 0) {
        setDisabledSave(true);
      } else {
        setDisabledSave(false);
      }
      setEditingRecord(newData);
    }
    const newData = [...ListViTriKho];

    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.soLuong = soLuongXuat;
      }
    });
    setListViTriKho(newData);

    const newSelect = [...SelectedViTri];
    newSelect.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.soLuong = soLuongXuat;
      }
    });
    setSelectedViTri(newSelect);
  };

  const renderSoLuongXuat = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord &&
      editingRecord.forEach((ct) => {
        if (
          ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
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

  let colListViTri = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Tên kho",
      dataIndex: "tenKho",
      key: "tenKho",
      align: "center",
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
      title: "Số lượng tồn kho",
      dataIndex: "soLuongTonKho",
      key: "soLuongTonKho",
      align: "center",
    },
    {
      title: "Số lượng xuất",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongXuat(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
  ];

  const XacNhanViTri = () => {
    const TongSoLuong =
      SelectedViTri &&
      SelectedViTri.reduce(
        (tong, vitri) => tong + Number(vitri.soLuong || 0),
        0
      );

    const newData = {
      tits_qtsx_VatTu_Id: itemData.ListVatTu.tits_qtsx_VatTu_Id,
      soLuongThucXuat: TongSoLuong,
      list_ChiTietLuuKhos: SelectedViTri,
    };
    ThemViTri(newData);
    openModalFS(false);
    setSelectedViTri([]);
    setSelectedKeys([]);
    setListViTriKho([]);
  };

  const handleCancel = () => {
    setSelectedViTri([]);
    setSelectedKeys([]);
    openModalFS(false);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedViTri,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedViTri = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      if (newSelectedViTri.length === 0) {
        setDisabledSave(true);
      } else {
        setDisabledSave(false);
      }
      setSelectedViTri(newSelectedViTri);
      setSelectedKeys(newSelectedKeys);
    },
  };

  const Title = (
    <span>
      Chọn vị trí xuất kho của vật tư -{" "}
      {itemData.ListVatTu && itemData.ListVatTu.tenVatTu} (Số lượng:{" "}
      {itemData.ListVatTu && itemData.ListVatTu.soLuongYeuCau})
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
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
              preserveSelectedRowKeys: true,
              selectedRowKeys: SelectedKeys,
            }}
          />
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <Button
              className="th-btn-margin-bottom-0"
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
