import { DeleteOutlined } from "@ant-design/icons";
import { Card, Form, Input, Row, Col, DatePicker, Tag, Button } from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  EditableTableRow,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_STYLE } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

const FormItem = Form.Item;

const CKDForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListUser, setListUser] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [ListSoLot, setListSoLot] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  const [editingRecordCT, setEditingRecordCT] = useState([]);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          setType("new");
          getLot();
          getKho();
          setFieldsValue({
            phieunhapkho: {
              ngayNhan: moment(getDateNow(), "DD/MM/YYYY"),
              ngayHoaDon: moment(getDateNow(), "DD/MM/YYYY"),
            },
          });
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else if (includes(match.url, "chinh-sua")) {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.view) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.view) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLap = (info, nguoiLap_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiLap_Id ? nguoiLap_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiLap_Id ? nguoiLap_Id : info.user_Id}?${params}`,
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
        setListUser([res.data]);
        setFieldsValue({
          phieunhapkho: {
            userNhan_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };
  const getSanPhamByLot = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/get-list-dinh-muc-vat-tu-theo-lot-ckd?Lot_DinhMucVatTu_Id=${id}`,
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
          setListSanPham(
            res.data.map((sp) => {
              return {
                ...sp,
                lot_DinhMucVatTu_Id: id,
              };
            })
          );
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getLot = (data) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/get-list-lot-cho-phieu-nhap-kho-ckd`,
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
        if (data) {
          setListSoLot(
            [...res.data, data].map((dt) => {
              return {
                ...dt,
                name: dt.soLot + " - " + dt.phienBan,
              };
            })
          );
        } else {
          setListSoLot(
            res.data.map((dt) => {
              return {
                ...dt,
                name: dt.soLot + " - " + dt.phienBan,
              };
            })
          );
        }
      } else {
        setListSoLot([]);
      }
    });
  };
  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=1&&isThanhPham=false`,
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
        setListKho(res.data);
      } else {
        setListKho([]);
      }
    });
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/get-phieu-nhap-kho-ckd/${id}?${params}`,
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
          getUserLap(INFO, res.data.userNhan_Id);
          setInfo(res.data);
          getLot({ lot_Id: res.data.lot_Id, soLot: res.data.soLot });
          getKho();
          setListSanPham(JSON.parse(res.data.chiTietVatTu));
          setFieldsValue({
            phieunhapkho: {
              ...res.data,
              ngayNhan: moment(res.data.ngayNhan, "DD/MM/YYYY"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new"
          ? "/them-moi"
          : type === "edit"
          ? `/${id}/chinh-sua`
          : `/${id}/chi-tiet`,
        ""
      )}`
    );
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFuncChiTiet = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemActionChiTiet, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemActionChiTiet = (item) => {
    const chiTiet_PhieuNhapKhoCKDs = ListSanPham.filter(
      (d) => d.vatTu_Id !== item.vatTu_Id
    );
    setListSanPham(chiTiet_PhieuNhapKhoCKDs);
  };
  const actionContentChiTiet = (item) => {
    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFuncChiTiet(item) }
        : { disabled: true };
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
  const changeSoLuongCT = (val, item) => {
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || soLuongNhap === "0") {
      setFieldTouch(false);
      setEditingRecordCT([...editingRecordCT, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecordCT.filter(
        (d) => d.vatTu_Id !== item.vatTu_Id
      );
      setEditingRecordCT(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListSanPham];
    newData.forEach((ct, index) => {
      if (ct.vatTu_Id === item.vatTu_Id) {
        ct.soLuongNhap = soLuongNhap;
      }
    });
    setListSanPham(newData);
  };
  const renderSoLuongCT = (item) => {
    let isEditing = false;
    let message = "";
    editingRecordCT.forEach((ct) => {
      if (ct.vatTu_Id === item.vatTu_Id) {
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
          }}
          className={`input-item`}
          type="number"
          value={item.soLuongNhap}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => changeSoLuongCT(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  const changeGhiChu = (val, item) => {
    const ghiChu = val.target.value;
    const newData = [...ListSanPham];
    newData.forEach((sp) => {
      if (sp.vatTu_Id === item.vatTu_Id) {
        sp.ghiChu = ghiChu;
      }
    });
    setListSanPham(newData);
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
          value={item.ghiChu ? item.ghiChu : ""}
          onChange={(val) => changeGhiChu(val, item)}
          disabled={type === "new" || type === "edit" ? false : true}
        />
      </>
    );
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const XacNhanEdit = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/put-chi-tiet-phieu-nhap-kho-ckd/${item.chiTiet_Id}`,
          "PUT",
          {
            soLuongNhap: item.soLuongNhap,
            ghiChu: item.ghiChu,
          },
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(id);
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };
  const prop2 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận chỉnh sửa",
  };
  const modalEdit = (val) => {
    Modal({
      ...prop2,
      onOk: () => {
        XacNhanEdit(val);
      },
    });
  };
  let renderChiTiet = () => {
    const col = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        align: "center",
        width: 45,
      },
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
      {
        title: "Số lượng",
        key: "soLuongNhap",
        align: "center",
        render: (val) => renderSoLuongCT(val),
      },
      {
        title: "Ghi chú",
        key: "ghiChu",
        align: "center",
        render: (val) => renderGhiChu(val),
      },
    ];
    if (type === "new") {
      return [
        ...col,
        {
          title: "Chức năng",
          key: "action",
          align: "center",
          width: 100,
          render: (value) => actionContentChiTiet(value),
        },
      ];
    } else if (type === "edit") {
      return [
        {
          title: "Cập nhật",
          key: "action",
          align: "center",
          width: 100,
          render: (val) => {
            return (
              <Button
                style={{ margin: 0 }}
                disable={type !== "edit"}
                type="primary"
                onClick={() => modalEdit(val)}
              >
                Lưu
              </Button>
            );
          },
        },
        ...col,
      ];
    } else {
      return col;
    }
  };
  const columnChilden = map(renderChiTiet(), (col) => {
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

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.phieunhapkho);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListSanPham.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.phieunhapkho, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (nhapkho, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...nhapkho,
        chiTiet_PhieuNhapKhoCKDs: ListSanPham,
        ngayNhan: nhapkho.ngayNhan._i,
      };
      ListSoLot.forEach((l) => {
        if (
          l.lot_DinhMucVatTu_Id.toLowerCase() ===
          nhapkho.lot_DinhMucVatTu_Id.toLowerCase()
        ) {
          newData.lot_Id = l.lot_Id;
        }
      });
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoVatTu/post-nhap-kho-ckd`,
            "POST",
            newData,
            "ADD",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldsValue({
                phieunhapkho: {
                  ngayNhan: moment(getDateNow(), "DD/MM/YYYY"),
                  userNhan_Id: nhapkho.userNhan_Id,
                  tenPhongBan: nhapkho.tenPhongBan,
                },
              });
              setFieldTouch(false);
              setListSanPham([]);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    // if (type === "edit") {
    //   const newData = {
    //     id: id,
    //     ...nhapkho,
    //     chiTiet_PhieuNhapKhoCKDs: ListSanPham[0].chiTiet_PhieuNhapKhoCKDs.map(
    //       (vt) => {
    //         return {
    //           ...vt,
    //           lkn_PhieuNhapKhoVatTu_Id: id,
    //         };
    //       }
    //     ),
    //     ngayNhan: nhapkho.ngayNhan._i,
    //   };
    //   new Promise((resolve, reject) => {
    //     dispatch(
    //       fetchStart(
    //         `lkn_PhieuNhapKhoVatTu/nhap-kho-ckd/${id}`,
    //         "PUT",
    //         newData,
    //         "EDIT",
    //         "",
    //         resolve,
    //         reject
    //       )
    //     );
    //   })
    //     .then((res) => {
    //       if (saveQuit) {
    //         if (res.status !== 409) goBack();
    //       } else {
    //         getInfo(id);
    //         setFieldTouch(false);
    //       }
    //     })
    //     .catch((error) => console.error(error));
    // }
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu nhập kho CKD "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhập kho CKD"
    ) : (
      <span>
        Chi tiết phiếu nhập kho CKD -{" "}
        <Tag color={"success"}>{info.maPhieuNhapKhoVatTu}</Tag>
      </span>
    );

  const dataList = reDataForTable(ListSanPham);

  const handleSelectSoLot = (val) => {
    // setActiveSoLuong(false);
    // const { phongBan_Id } = getFieldValue("phieunhapkho");
    getSanPhamByLot(val);
    // ListSoLot.forEach((sl) => {
    //   if (sl.id === val) {
    //     setFieldsValue({
    //       phieunhapkho: {
    //         tenSanPham: sl.tenSanPham,
    //         soLuong: "1",
    //       },
    //     });
    //   }
    // });
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_STYLE}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row>
            <Col span={12}>
              <FormItem
                label="Người nhập"
                name={["phieunhapkho", "userNhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUser ? ListUser : []}
                  optionsvalue={["Id", "fullName"]}
                  style={{ width: "100%" }}
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ban/Phòng"
                name={["phieunhapkho", "tenPhongBan"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" disabled={true} />
              </FormItem>
            </Col>

            {/* <Col span={12}>
              <FormItem
                label="Xưởng"
                name={["phieunhapkho", "phongBan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListXuong}
                  placeholder="Chọn xưởng"
                  optionsvalue={["id", "tenPhongBan"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                  onSelect={handleSelectXuong}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Kho nhập"
                name={["phieunhapkho", "cauTrucKho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKho}
                  placeholder="Chọn kho nhập"
                  optionsvalue={["id", "tenCTKho"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col> */}
            <Col span={12}>
              <FormItem
                label="Ngày nhập"
                name={["phieunhapkho", "ngayNhan"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  disabled={true}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      phieunhapkho: {
                        ngayNhan: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Kho vật tư"
                name={["phieunhapkho", "cauTrucKho_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKho}
                  placeholder="Chọn kho"
                  optionsvalue={["id", "tenCTKho"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" ? false : true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Số Lot"
                name={["phieunhapkho", "lot_DinhMucVatTu_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSoLot}
                  placeholder="Chọn số Lot"
                  optionsvalue={["lot_DinhMucVatTu_Id", "name"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" ? false : true}
                  onSelect={handleSelectSoLot}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Table
          bordered
          columns={columnChilden}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
        />
        {type === "new" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        ) : null}
        {/* {type === "xacnhan" && (
          <Row justify={"end"} style={{ marginTop: 15 }}>
            <Col style={{ marginRight: 15 }}>
              <Button type="primary" onClick={modalXK}>
                Xác nhận
              </Button>
            </Col>
            <Col style={{ marginRight: 15 }}>
              <Button danger onClick={hanlde}>
                Từ chối
              </Button>
            </Col>
          </Row>
        )} */}
      </Card>
      {/* <Modal
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        save={save}
      /> */}
      {/* <AddVatTuModal openModal={ActiveModal} openModalFS={setActiveModal} /> */}
    </div>
  );
};

export default CKDForm;
