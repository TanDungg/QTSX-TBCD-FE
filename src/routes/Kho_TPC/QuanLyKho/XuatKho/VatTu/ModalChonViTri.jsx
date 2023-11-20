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
      getListViTriKho(itemData.kho_Id, itemData.vatTu_Id);
      if (itemData.isCheck === true) {
        setSelectedViTri(
          itemData.chiTiet_LuuVatTus && itemData.chiTiet_LuuVatTus
        );
        const lstKey =
          itemData.chiTiet_LuuVatTus &&
          itemData.chiTiet_LuuVatTus.map((data) => data.key);
        setSelectedKeys(lstKey && lstKey);
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListViTriKho = (cauTrucKho_Id, vatTu_Id) => {
    const params = convertObjectToUrlParams({
      cauTrucKho_Id,
      vatTu_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/list-vi-tri-vat-tu-trong-kho?${params}`,
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
          if (itemData.isCheck === true) {
            const vitri = itemData.chiTiet_LuuVatTus.find(
              (vitri) =>
                data.lkn_ChiTietKhoVatTu_Id.toLowerCase() ===
                vitri.lkn_ChiTietKhoVatTu_Id.toLowerCase()
            );
            if (vitri) {
              return {
                ...data,
                tenCTKho: itemData.tenCTKho,
                soLuongThucXuat: vitri.soLuongThucXuat,
              };
            } else {
              return {
                ...data,
                tenCTKho: itemData.tenCTKho,
                soLuongThucXuat: data.soLuong,
              };
            }
          }
          return {
            ...data,
            tenCTKho: itemData.tenCTKho,
            soLuongThucXuat: data.soLuong,
          };
        });
        setDisabledSave(newData.length > 0 ? false : true);
        setListViTriKho(newData);
      } else {
        setListViTriKho([]);
      }
    });
  };

  const handleInputChange = (val, item) => {
    const soLuong = val.target.value;
    if (isEmpty(soLuong) || Number(soLuong) <= 0) {
      setDisabledSave(true);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (Number(soLuong) > item.soLuong) {
      setDisabledSave(true);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng xuất không được lớn hơn số lượng trong kho";
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) => d.lkn_ChiTietKhoVatTu_Id !== item.lkn_ChiTietKhoVatTu_Id
        );
      if (newData.length !== 0) {
        setDisabledSave(true);
      } else {
        setDisabledSave(false);
      }
      setEditingRecord(newData);
    }
    const newData = [...ListViTriKho];
    const vitri = [...SelectedViTri];

    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
        ct.soLuongThucXuat = soLuong;
      }
    });
    vitri.forEach((ct, index) => {
      if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
        ct.soLuongThucXuat = soLuong;
      }
    });
    setListViTriKho(newData);
    setSelectedViTri(vitri);
  };

  const renderSoLuongXuat = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord &&
      editingRecord.forEach((ct) => {
        if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
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
          value={item.soLuongThucXuat}
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
      dataIndex: "tenCTKho",
      key: "tenCTKho",
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
      title: "Số lượng trong kho",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Thời hạn sử dụng",
      dataIndex: "thoiGianSuDung",
      key: "thoiGianSuDung",
      align: "center",
    },
    {
      title: "Số lượng xuất",
      key: "soLuongThucXuat",
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
    const SoLuong = SelectedViTri.reduce(
      (tong, vitri) => tong + Number(vitri.soLuongThucXuat || 0),
      0
    );

    const newData = {
      vatTu_Id: itemData.vatTu_Id,
      maVatTu: itemData.maVatTu,
      tenVatTu: itemData.tenVatTu,
      soLuongThucXuat: SoLuong,
      chiTiet_LuuVatTus: SelectedViTri.map((vt) => ({
        ...vt,
        viTri:
          vt.tenKe !== null
            ? `${vt.tenKe ? `${vt.tenKe}` : ""}${
                vt.tenTang ? ` - ${vt.tenTang}` : ""
              }${vt.tenNgan ? ` - ${vt.tenNgan}, ` : ", "}`
            : itemData.tenCTKho,
      })),
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
      setSelectedViTri(newSelectedViTri);
      setSelectedKeys(newSelectedKeys);
    },
  };

  const Title = (
    <span>
      Chọn vị trí xuất kho của vật tư - {itemData.tenVatTu} (Số lượng:{" "}
      {itemData.soLuong})
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
              disabled={DisabledSave || SelectedViTri.length === 0}
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
