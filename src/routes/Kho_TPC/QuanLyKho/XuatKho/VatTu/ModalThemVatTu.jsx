import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select, Table } from "src/components/Common";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import { isEmpty } from "lodash";
const FormItem = Form.Item;

function ModalThemVatTu({
  openModalFS,
  openModal,
  addVatTu,
  cauTrucKho_Id,
  infoVatTu,
  listVatTu,
  type,
}) {
  const [fieldTouch, setFieldTouch] = useState(false);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListViTri, setListViTri] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [SelectedViTri, setSelectedViTri] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    if (openModal) {
      getVatTu(cauTrucKho_Id);
      if (infoVatTu) {
        getViTri(cauTrucKho_Id, infoVatTu.vatTu_Id.toLowerCase());
        setFieldsValue({
          addVatTu: {
            ...infoVatTu,
            vatTu_Id: infoVatTu.vatTu_Id.toLowerCase(),
          },
        });
      }
    }
  }, [openModal]);
  const getVatTu = (cauTrucKho_Id) => {
    const params = convertObjectToUrlParams({
      cauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/get-thong-tin-vat-tu-trong-kho?${params}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          if (listVatTu.length > 0 && !infoVatTu) {
            const newData = [];
            res.data.forEach((sp) => {
              let check = false;
              listVatTu.forEach((vt) => {
                if (sp.vatTu_Id === vt.vatTu_Id) {
                  check = true;
                }
              });
              if (!check) {
                newData.push({
                  ...sp,
                  name: sp.maVatTu + " - " + sp.tenVatTu,
                });
              }
            });
            setListVatTu(newData);
          } else {
            setListVatTu(
              res.data.map((sp) => {
                return {
                  ...sp,
                  name: sp.maVatTu + " - " + sp.tenVatTu,
                };
              })
            );
          }
        } else {
          setListVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getViTri = (cauTrucKho_Id, vatTu_Id) => {
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
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          if (infoVatTu) {
            const newData = [];
            const newDataViTri = [];
            const newDataKey = [];
            res.data.forEach((sp, index) => {
              let check = false;
              infoVatTu.list_ChiTietLuuKhos.forEach((info) => {
                if (
                  info.lkn_ChiTietKhoVatTu_Id.toLowerCase() ===
                  sp.lkn_ChiTietKhoVatTu_Id.toLowerCase()
                ) {
                  check = true;
                  newDataKey.push(index + 1);
                  newDataViTri.push({
                    ...sp,
                    ...info,
                    soLuong: sp.soLuong,
                    viTri: sp.tenNgan
                      ? sp.tenNgan
                      : sp.tenKe
                      ? sp.tenKe
                      : sp.tenKho,
                    soLuongThucXuat: info.SoLuong,
                  });
                  newData.push({
                    ...sp,
                    ...info,
                    soLuong: sp.soLuong,
                    viTri: sp.tenNgan
                      ? sp.tenNgan
                      : sp.tenKe
                      ? sp.tenKe
                      : sp.tenKho,
                    soLuongThucXuat: info.SoLuong,
                  });
                }
              });
              if (
                !check &&
                !newData.some(
                  (n) =>
                    n.lkn_ChiTietKhoVatTu_Id.toLowerCase() ===
                    sp.lkn_ChiTietKhoVatTu_Id.toLowerCase()
                )
              ) {
                newData.push({
                  ...sp,
                  viTri: sp.tenNgan
                    ? sp.tenNgan
                    : sp.tenKe
                    ? sp.tenKe
                    : sp.tenKho,
                  soLuongThucXuat: sp.soLuong,
                });
              }
            });
            if (type === "edit") {
              const dataNew = [];
              infoVatTu.list_ChiTietLuuKhos.forEach((vt) => {
                let check = false;
                newData.forEach((dt) => {
                  if (
                    vt.lkn_ChiTietKhoVatTu_Id.toLowerCase() ===
                    dt.lkn_ChiTietKhoVatTu_Id.toLowerCase()
                  ) {
                    dataNew.push({
                      ...dt,
                      soLuong: Number(dt.soLuong) + Number(vt.soLuongKho),
                    });
                    check = true;
                  }
                });
                if (!check) {
                  dataNew.push({
                    ...vt,
                    vatTu_Id: infoVatTu.vatTu_Id.toLowerCase(),
                    tenDonViTinh: infoVatTu.tenDonViTinh,
                    maVatTu: infoVatTu.maVatTu,
                    tenVatTu: infoVatTu.tenVatTu,
                    tenNhomVatTu: infoVatTu.tenNhomVatTu,
                    viTri: vt.tenNgan
                      ? vt.tenNgan
                      : vt.tenKe
                      ? vt.tenKe
                      : vt.tenKho,
                    soLuongThucXuat: vt.SoLuong,
                    soLuong: vt.SoLuong,
                  });
                }
              });
              setSelectedViTri(dataNew);
              setSelectedKeys(reDataForTable(dataNew).map((D) => D.key));
              setListViTri(dataNew);
            } else {
              setSelectedViTri(newDataViTri);
              setSelectedKeys(newDataKey);
              setListViTri(newData);
            }
          } else {
            const newData = res.data.map((sp) => {
              return {
                ...sp,
                viTri: sp.tenNgan
                  ? sp.tenNgan
                  : sp.tenKe
                  ? sp.tenKe
                  : sp.tenKho,
                soLuongThucXuat: sp.soLuong,
              };
            });
            setListViTri(newData);
          }
        } else {
          setListViTri([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const handleInputChange = (val, item) => {
    const soLuong = val.target.value;
    if (isEmpty(soLuong) || Number(soLuong) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (Number(soLuong) > item.soLuong) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng xuất không được lớn hơn số lượng trong kho";
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) => d.lkn_ChiTietKhoVatTu_Id !== item.lkn_ChiTietKhoVatTu_Id
        );
      if (newData.length !== 0) {
        setFieldTouch(false);
      } else {
        setFieldTouch(true);
      }
      setEditingRecord(newData);
    }
    const newData = [...ListViTri];
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
    setListViTri(newData);
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
  const handleInputGhiChu = (val, item) => {
    const ghiChu = val.target.value;

    const newData = [...ListViTri];
    const vitri = [...SelectedViTri];

    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
        ct.ghiChu = ghiChu;
      }
    });
    vitri.forEach((ct, index) => {
      if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
        ct.ghiChu = ghiChu;
      }
    });
    setListViTri(newData);
    setSelectedViTri(vitri);
  };

  const renderGhiChu = (item) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.ghiChu}
          onChange={(val) => handleInputGhiChu(val, item)}
        />
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
      title: "Vị trí",
      dataIndex: "viTri",
      key: "viTri",
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
    // {
    //   title: "Ghi chú",
    //   key: "ghiChu",
    //   align: "center",
    //   render: (record) => renderGhiChu(record),
    // },
  ];

  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        const tempArray = [];
        SelectedViTri.forEach((item) => {
          if (tempArray.length === 0) {
            tempArray.push({
              ...item,
              ghiChu: values.addVatTu.ghiChu,
              lkn_ChiTietPhieuXuatKhoVatTu_Id:
                infoVatTu && infoVatTu.lkn_ChiTietPhieuXuatKhoVatTu_Id,
              lkn_ChiTietKhoVatTu_Id:
                infoVatTu && infoVatTu.lkn_ChiTietKhoVatTu_Id,
              lkn_ChiTietPhieuXuatKhoVatTu_ChiTietKhoVatTu_Id:
                infoVatTu &&
                infoVatTu.lkn_ChiTietPhieuXuatKhoVatTu_ChiTietKhoVatTu_Id,
              lkn_ChiTietPhieuDeNghiCapVatTu_Id:
                infoVatTu && infoVatTu.lkn_ChiTietPhieuDeNghiCapVatTu_Id,
              soLuong:
                infoVatTu && infoVatTu.lkn_ChiTietPhieuDeNghiCapVatTu_Id
                  ? infoVatTu.soLuong
                  : null,
              SoLuong: item.soLuong,
              list_ChiTietLuuKhos: [
                {
                  ...item,
                  viTri: item.viTri,
                  soLuong: item.soLuongThucXuat,
                  SoLuong: item.soLuongThucXuat,
                  lkn_ChiTietKhoVatTu_Id: item.lkn_ChiTietKhoVatTu_Id,
                },
              ],
            });
          } else {
            let check = false;
            tempArray.forEach((ta) => {
              if (ta.vatTu_Id === item.vatTu_Id) {
                check = true;
                ta.soLuong =
                  infoVatTu && infoVatTu.lkn_ChiTietPhieuDeNghiCapVatTu_Id
                    ? infoVatTu.soLuong
                    : null;
                ta.ghiChu = values.addVatTu.ghiChu;
                ta.soLuongThucXuat =
                  Number(ta.soLuongThucXuat) + Number(item.soLuongThucXuat);
                ta.list_ChiTietLuuKhos.push({
                  ...item,
                  viTri: item.viTri,
                  SoLuong: item.soLuongThucXuat,
                  soLuong: item.soLuongThucXuat,
                  lkn_ChiTietKhoVatTu_Id: item.lkn_ChiTietKhoVatTu_Id,
                });
              }
            });
            if (!check) {
              tempArray.push({
                ...item,
                lkn_ChiTietPhieuXuatKhoVatTu_Id:
                  infoVatTu && infoVatTu.lkn_ChiTietPhieuXuatKhoVatTu_Id,
                lkn_ChiTietKhoVatTu_Id:
                  infoVatTu && infoVatTu.lkn_ChiTietKhoVatTu_Id,
                lkn_ChiTietPhieuXuatKhoVatTu_ChiTietKhoVatTu_Id:
                  infoVatTu &&
                  infoVatTu.lkn_ChiTietPhieuXuatKhoVatTu_ChiTietKhoVatTu_Id,
                lkn_ChiTietPhieuDeNghiCapVatTu_Id:
                  infoVatTu && infoVatTu.lkn_ChiTietPhieuDeNghiCapVatTu_Id,
                soLuong:
                  infoVatTu && infoVatTu.lkn_ChiTietPhieuDeNghiCapVatTu_Id
                    ? infoVatTu.soLuong
                    : null,
                SoLuong: item.soLuong,
                soLuongThucXuat: item.soLuongThucXuat,
                ghiChu: values.addVatTu.ghiChu,
                list_ChiTietLuuKhos: [
                  {
                    ...item,
                    viTri: item.viTri,
                    SoLuong: item.soLuongThucXuat,
                    soLuong: item.soLuongThucXuat,
                    lkn_ChiTietKhoVatTu_Id: item.lkn_ChiTietKhoVatTu_Id,
                  },
                ],
              });
            }
          }
        });
        addVatTu(tempArray, false);
        setSelectedKeys([]);
        setSelectedViTri([]);
        setListViTri([]);
        openModalFS(false);
        resetFields();
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleCancel = () => {
    openModalFS(false);
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    // saveData(values.bophan);
  };

  const handleSelectSanPham = (val) => {
    getViTri(cauTrucKho_Id, val);
  };
  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedViTri,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedViTri = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedViTri(newSelectedViTri);
      setSelectedKeys(newSelectedKeys);
      setFieldTouch(true);
    },
  };

  return (
    <AntModal
      title={infoVatTu ? "Chỉnh sửa thông tin vật tư" : "Thêm vật tư"}
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Vật tư"
            name={["addVatTu", "vatTu_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListVatTu}
              placeholder="Chọn vật tư"
              optionsvalue={["vatTu_Id", "name"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectSanPham}
              disabled={infoVatTu}
            />
          </FormItem>
          <FormItem label="Ghi chú" name={["addVatTu", "ghiChu"]}>
            <Input placeholder="Ghi chú"></Input>
          </FormItem>
          {/* <FormItem label="Số lượng trong kho" name={["addVatTu", "soLuong"]}>
            <Input placeholder="Số lượng" disabled={true}></Input>
          </FormItem>
          <FormItem
            label="Số lượng xuất"
            name={["addVatTu", "soLuongThucXuat"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^(0\.\d*[1-9]\d*|[1-9]\d*(\.\d+)?)$/,
                message: "Số lượng phải lớn hơn 0!",
              },
              // ({ getFieldValue }) => ({
              //   validator(_, value) {
              //     const soLuong = getFieldValue(["addVatTu", "soLuong"]);

              //     if (value <= soLuong) {
              //       return Promise.resolve();
              //     }

              //     return Promise.reject(
              //       new Error(
              //         "Số lượng xuất phải nhỏ hơn hoặc bằng số lượng trong kho!"
              //       )
              //     );
              //   },
              // }),
            ]}
          >
            <Input placeholder="Số lượng" type="number"></Input>
          </FormItem>
          <FormItem
            label="Vị trí"
            name={["addVatTu", "lkn_ChiTietKhoVatTu_Id"]}
            rules={[
              {
                type: "array",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListViTri}
              placeholder="Chọn vị trí"
              optionsvalue={["lkn_ChiTietKhoVatTu_Id", "viTri"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              mode={"multiple"}
              // onSelect={handleSelectSanPham}
            />
          </FormItem>
          <FormItem
            label="Ghi chú"
            name={["addVatTu", "ghiChu"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input placeholder="Ghi chú"></Input>
          </FormItem> */}
          <Table
            bordered
            columns={colListViTri}
            scroll={{ x: 800, y: "45vh" }}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListViTri)}
            size="small"
            pagination={false}
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
              preserveSelectedRowKeys: true,
              selectedRowKeys: SelectedKeys,
            }}
          />
        </Form>
        <Row justify={"center"}>
          <Button
            className="th-btn-margin-bottom-0"
            style={{ marginTop: 10, marginRight: 15 }}
            type="primary"
            onClick={handleSubmit}
            disabled={!fieldTouch}
          >
            {infoVatTu ? "Lưu" : "Thêm"}
          </Button>
        </Row>
      </div>
    </AntModal>
  );
}

export default ModalThemVatTu;
