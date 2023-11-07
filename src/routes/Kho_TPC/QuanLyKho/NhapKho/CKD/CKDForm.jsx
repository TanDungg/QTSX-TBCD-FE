import { DeleteOutlined } from "@ant-design/icons";
import { Card, Form, Input, Row, Col, DatePicker, Tag, Divider } from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={
          title === "Số lượng"
            ? [
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Số lượng không hợp lệ!",
                },
                {
                  required: true,
                },
              ]
            : null
        }
      >
        <Input
          style={{
            margin: 0,
            width: "100%",
            textAlign: "center",
          }}
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
function createValidator(maxValue) {
  return (_, value) => {
    if (value && Number(value) > maxValue) {
      return Promise.reject(new Error(`Số phải nhỏ hơn ${maxValue}!`));
    }
    return Promise.resolve();
  };
}
const EditableRowChilder = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCellChilder = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={
          title === "Số lượng"
            ? [
                {
                  pattern: /^\d+$/,
                  message: "Số lượng không hợp lệ!",
                },
                {
                  validator: createValidator(record.soLuongNhap),
                },
                {
                  required: true,
                },
              ]
            : null
        }
      >
        <Input
          type={title === "Số lượng" && "number"}
          style={{
            margin: 0,
            width: "100%",
            textAlign: "center",
          }}
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
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
  const [editingRecord, setEditingRecord] = useState(null);
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
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
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
          `lkn_DinhMucVatTu/bom-by-lot?LotId=${id}`,
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
          const newData = res.data;
          newData.chiTiet_PhieuNhapKhoCKDs = newData.list_VatTus;
          newData.soLuongNhap = 1;
          newData.chiTiet_PhieuNhapKhoCKDs.forEach((vt, index) => {
            newData.chiTiet_PhieuNhapKhoCKDs[index].soLuongNhap =
              newData.soLuongNhap * vt.dinhMuc;
            newData.chiTiet_PhieuNhapKhoCKDs[index].ghiChu = "";
          });
          setListSanPham([res.data]);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getLot = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Lot?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    }).then((res) => {
      if (res && res.data) {
        setListSoLot(res.data);
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
          `lkn_PhieuNhapKhoVatTu/nhap-kho-ckd/${id}?${params}`,
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
          getLot();
          getKho();
          setListSanPham([
            {
              maSanPham: res.data.maSanPham,
              tenSanPham: res.data.tenSanPham,
              tenDonViTinh: res.data.tenDonViTinh,
              soLuongNhap: res.data.soLuongSanPham,
              sanPham_Id: res.data.sanPham_Id,
              chiTiet_PhieuNhapKhoCKDs: JSON.parse(res.data.chiTiet),
            },
          ]);
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
    const chiTiet_PhieuNhapKhoCKDs =
      ListSanPham[0].chiTiet_PhieuNhapKhoCKDs.filter(
        (d) => d.vatTu_Id !== item.vatTu_Id
      );
    setListSanPham([{ ...ListSanPham[0], chiTiet_PhieuNhapKhoCKDs }]);
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
  const changeSoLuongSP = (val, item) => {
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || soLuongNhap === "0") {
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
      setEditingRecord(item);
      setFieldTouch(false);
    } else {
      setEditingRecord(null);
      setFieldTouch(true);
    }
    const newData = [...ListSanPham];
    newData.forEach((sp, index) => {
      if (sp.sanPham_Id === item.sanPham_Id) {
        sp.soLuongNhap = soLuongNhap;
        sp.chiTiet_PhieuNhapKhoCKDs.forEach((ct) => {
          ct.soLuongNhap = sp.soLuongNhap * ct.dinhMuc;
        });
      }
    });
    setListSanPham(newData);
  };
  const renderSoLuong = (item) => {
    const isEditing =
      editingRecord && editingRecord.sanPham_Id === item.sanPham_Id;
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          disabled={type === "new" || type === "edit" ? false : true}
          value={item.soLuongNhap}
          onChange={(val) => changeSoLuongSP(val, item)}
        />
        {isEditing && (
          <div style={{ color: "red" }}>{editingRecord.message}</div>
        )}
      </>
    );
  };
  const changeSoLuongCT = (val, item) => {
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || soLuongNhap === "0") {
      setFieldTouch(false);
      setEditingRecordCT([...editingRecordCT, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (
      soLuongNhap >
      Number(ListSanPham[0].soLuongNhap) * Number(item.dinhMuc)
    ) {
      setFieldTouch(false);
      item.message = `Số lương phải nhỏ hơn hoặc bằng ${
        Number(ListSanPham[0].soLuongNhap) * Number(item.dinhMuc)
      }`;
      setEditingRecordCT([...editingRecordCT, item]);
    } else {
      const newData = editingRecordCT.filter(
        (d) => d.vatTu_Id !== item.vatTu_Id
      );
      setEditingRecordCT(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListSanPham];
    newData.forEach((sp, index) => {
      sp.chiTiet_PhieuNhapKhoCKDs.forEach((ct) => {
        if (ct.vatTu_Id === item.vatTu_Id) {
          ct.soLuongNhap = soLuongNhap;
        }
      });
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
    newData.forEach((sp, index) => {
      sp.chiTiet_PhieuNhapKhoCKDs.forEach((ct) => {
        if (ct.vatTu_Id === item.vatTu_Id) {
          ct.ghiChu = ghiChu;
        }
      });
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
          value={item.ghiChu}
          onChange={(val) => changeGhiChu(val, item)}
          disabled={type === "new" || type === "edit" ? false : true}
        />
      </>
    );
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
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
      // dataIndex: "soLuongNhap",
      key: "soLuongNhap",
      align: "center",
      render: (val) => renderSoLuong(val),
    },

    // {
    //   title: "Chức năng",
    //   key: "action",
    //   align: "center",
    //   width: 80,
    //   render: (value) => actionContent(value),
    // },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const handleSave = (row) => {
    const newData = [...ListSanPham];
    const index = newData.findIndex(
      (item) => row.sanPham_Id === item.sanPham_Id
    );
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    newData[0].chiTiet_PhieuNhapKhoCKDs.forEach((ct, index) => {
      newData[0].chiTiet_PhieuNhapKhoCKDs[index].soLuongNhap =
        ct.dinhMuc * newData[0].soLuongNhap;
    });
    setFieldTouch(true);
    setListSanPham(newData);
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
        handleSave: handleSave,
      }),
    };
  });
  const handleSaveChiTiet = (row) => {
    const newData = [...ListSanPham];
    const chiTiet_PhieuNhapKhoCKDs = newData[0].chiTiet_PhieuNhapKhoCKDs;
    const index = chiTiet_PhieuNhapKhoCKDs.findIndex(
      (item) => row.vatTu_Id === item.vatTu_Id
    );
    const item = chiTiet_PhieuNhapKhoCKDs[index];
    chiTiet_PhieuNhapKhoCKDs.splice(index, 1, {
      ...item,
      ...row,
    });
    setFieldTouch(true);
    setListSanPham([
      {
        ...newData[0],
        chiTiet_PhieuNhapKhoCKDs,
      },
    ]);
  };
  let renderChiTiet = [
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
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      render: (val) => renderGhiChu(val),
    },
    // {
    //   title: "Kích thước",
    //   dataIndex: "kichThuoc",
    //   key: "kichThuoc",
    //   align: "center",
    // },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContentChiTiet(value),
    },
  ];
  const columnChilden = map(renderChiTiet, (col) => {
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
        handleSave: handleSaveChiTiet,
      }),
    };
  });
  const componentsChilder = {
    body: {
      row: EditableRowChilder,
      cell: EditableCellChilder,
    },
  };
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
        chiTiet_PhieuNhapKhoCKDs: ListSanPham[0].chiTiet_PhieuNhapKhoCKDs,
        ngayNhan: nhapkho.ngayNhan._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoVatTu/nhap-kho-ckd`,
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
    if (type === "edit") {
      const newData = {
        id: id,
        ...nhapkho,
        chiTiet_PhieuNhapKhoCKDs: ListSanPham[0].chiTiet_PhieuNhapKhoCKDs.map(
          (vt) => {
            return {
              ...vt,
              lkn_PhieuNhapKhoVatTu_Id: id,
            };
          }
        ),
        ngayNhan: nhapkho.ngayNhan._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoVatTu/nhap-kho-ckd/${id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            getInfo(id);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
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
          {...DEFAULT_FORM_CUSTOM}
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
                    required: true,
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
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Số Lot"
                name={["phieunhapkho", "lot_Id"]}
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
                  optionsvalue={["id", "soLot"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                  onSelect={handleSelectSoLot}
                />
              </FormItem>
            </Col>
            {/* <Col span={12}>
              <FormItem
                label="Sản phẩm"
                name={["phieunhapkho", "tenSanPham"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input disabled={true} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Số lượng"
                name={["phieunhapkho", "soLuong"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  type="number"
                  disabled={
                    (type === "new" || type === "edit") && !activeSoLuong
                      ? false
                      : true
                  }
                  onBlur={(e) => hanldeBlurSoLuong(e.target.value)}
                />
              </FormItem>
            </Col> */}
            {/* <Col span={12}>
              <FormItem
                label="Nội dung nhập"
                name={["phieunhapkho", "noiDungNhanVatTu"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nội dụng nhập vật tư"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col> */}
          </Row>
          <Divider />
        </Form>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                style={{ marginLeft: "80px", width: "80%" }}
                bordered
                columns={columnChilden}
                scroll={{ x: 500, y: "35vh" }}
                components={componentsChilder}
                className="gx-table-responsive th-F1D065-head"
                dataSource={reDataForTable(record.chiTiet_PhieuNhapKhoCKDs)}
                size="small"
                rowClassName={"editable-row"}
                // loading={loading}
                pagination={false}
              />
            ),
            // rowExpandable: (record) => record.name !== "Not Expandable",
            defaultExpandedRowKeys: [1],
          }}
        />
        {type === "new" || type === "edit" ? (
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
