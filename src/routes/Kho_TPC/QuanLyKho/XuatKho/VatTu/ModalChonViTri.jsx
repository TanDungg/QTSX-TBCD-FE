import { Modal as AntModal, Card, Input, Button } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { Table } from "src/components/Common";

function ModalChonViTri({
  openModalFS,
  openModal,
  itemData,
  refesh,
  ThemViTri,
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [SoLuongXuat, setSoLuongXuat] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [DisabledSave, setDisabledSave] = useState(true);

  useEffect(() => {
    if (openModal) {
      getListViTriKho(itemData.cauTrucKhoId, itemData.vatTu_Id);
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
              (vitri) => data.chiTietKho_Id === vitri.chiTietKho_Id
            );
            if (vitri) {
              return {
                ...data,
                viTri: `${data.tenKe}${
                  data.tenTang ? ` - ${data.tenTang}` : ""
                }${data.tenNgan ? ` - ${data.tenNgan}` : ""} - (HSD: ${
                  data.thoiGianSuDung
                }) - (SL: ${data.soLuong})`,
                soLuongThucXuat: vitri.soLuongThucXuat,
              };
            }
          }

          return {
            ...data,
            viTri: `${data.tenKe}${data.tenTang ? ` - ${data.tenTang}` : ""}${
              data.tenNgan ? ` - ${data.tenNgan}` : ""
            } - (HSD: ${data.thoiGianSuDung}) - (SL: ${data.soLuong})`,
          };
        });

        setListViTriKho(newData);

        const newSoLuong = {};
        newData.forEach((data) => {
          if (itemData.isCheck === true) {
            const vitri = itemData.chiTiet_LuuVatTus.find(
              (vitri) => data.chiTietKho_Id === vitri.chiTietKho_Id
            );
            newSoLuong[data.chiTietKho_Id] = vitri ? vitri.soLuongThucXuat : 0;
          } else {
            newSoLuong[data.chiTietKho_Id] = 0;
          }
        });

        setSoLuongXuat(newSoLuong);
      } else {
        setListViTriKho([]);
      }
    });
  };

  const renderSoLuongXuat = (record) => {
    if (record) {
      const isEditing =
        editingRecord && editingRecord.chiTietKho_Id === record.chiTietKho_Id;
      return (
        <div>
          <Input
            min={0}
            style={{
              textAlign: "center",
              width: "100%",
              borderColor: isEditing && hasError ? "red" : "",
            }}
            className={`input-item ${
              isEditing && hasError ? "input-error" : ""
            }`}
            value={(SoLuongXuat && SoLuongXuat[record.chiTietKho_Id]) || 0}
            type="number"
            // onBlur={(val) => onChangeValue(val, record)}
            onChange={(val) => handleInputChange(val, record)}
          />
          {isEditing && hasError && (
            <div style={{ color: "red" }}>{errorMessage}</div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleInputChange = (val, record) => {
    const sl = val.target.value;
    if (sl > record.soLuong) {
      setHasError(true);
      setErrorMessage(
        "Số lượng xuất phải nhỏ hơn hoặc bằng số lượng trong kho"
      );
      setDisabledSave(true);
    } else {
      setDisabledSave(false);
      setHasError(false);
      setErrorMessage(null);
    }
    setEditingRecord(record);
    setSoLuongXuat((prevSoLuongXuat) => ({
      ...prevSoLuongXuat,
      [record.chiTietKho_Id]: sl,
    }));
    setListViTriKho((prevListViTriKho) => {
      return prevListViTriKho.map((item) => {
        if (record.chiTietKho_Id === item.chiTietKho_Id) {
          return {
            ...item,
            soLuongThucXuat: sl ? parseFloat(sl) : 0,
          };
        }
        return item;
      });
    });
  };

  // const onChangeValue = (val, record) => {
  //   setListViTriKho((prevListViTriKho) => {
  //     return prevListViTriKho.map((item) => {
  //       if (record.chiTietKho_Id === item.chiTietKho_Id) {
  //         return {
  //           ...item,
  //           soLuongThucXuat: val.target.value
  //             ? parseFloat(val.target.value)
  //             : 0,
  //         };
  //       }
  //       return item;
  //     });
  //   });
  //   setDisabledSave(hasError ? true : false);
  // };

  let colListViTri = [
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
    const ViTri = ListViTriKho.filter(
      (data) => data.soLuongThucXuat && data.soLuongThucXuat !== 0
    );

    const SoLuong = ViTri.reduce(
      (tong, vitri) => tong + vitri.soLuongThucXuat,
      0
    );

    const newData = {
      vatTu_Id: itemData.vatTu_Id,
      maVatTu: itemData.maVatTu,
      tenVatTu: itemData.tenVatTu,
      soLuongThucXuat: SoLuong,
      chiTiet_LuuVatTus: ViTri.map((vt) => ({
        ...vt,
        viTri: `${vt.tenKe}${vt.tenTang ? ` - ${vt.tenTang}` : ""}${
          vt.tenNgan ? ` - ${vt.tenNgan}` : ""
        }`,
      })),
    };

    ThemViTri(newData);
    openModalFS(false);
    setListViTriKho([]);
  };

  const handleCancel = () => {
    openModalFS(false);
    refesh();
  };

  const Title = (
    <span>Chọn vị trí xuất kho của vật tư - {itemData.tenVatTu}</span>
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
