import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Checkbox,
} from "antd";
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
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_DMVT } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import AddVatTuModal from "./AddVatTuModal";
import ModalTuChoi from "./ModalTuChoi";
import AddSanPhamModal from "./AddSanPhamModal";
import ImportDinhMucVatTu from "./ImportDinhMucVatTu";
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
          title === "Định mức"
            ? [
                {
                  pattern: /^(0\.\d*[1-9]\d*|[1-9]\d*(\.\d+)?)$/,
                  message: "Định mức phải là số và lớn hơn 0!",
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
        {title === "Định mức xả nhựa" && children === 0 ? null : children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const FormItem = Form.Item;

const DinhMucVatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [listVatTu, setListVatTu] = useState([]);

  const [ListXuong, setListXuong] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ActiveModal, setActiveModal] = useState(false);
  const [ActiveModalSanPham, setActiveModalSanPham] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModalImport, setActiveModalImport] = useState(false);
  const [editingRecord, setEditingRecord] = useState([]);

  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          getUserKy(INFO);
          setType("new");
          getXuong();
          getSanPham();
          setFieldsValue({
            dinhmucvattu: {
              ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
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
          getUserKy(INFO);
        } else if (permission && !permission.view) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.cof) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.cof) {
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
          dinhmucvattu: {
            userLap_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };
  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?page=-1&&donviid=${INFO.donVi_Id}`,
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
        const xuong = [];
        res.data.forEach((x) => {
          if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
            xuong.push(x);
          }
        });
        setListXuong(xuong);
      } else {
        setListXuong([]);
      }
    });
  };
  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      phanMem_Id: info.phanMem_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/list-user-ky-dinh-muc?${params}`,
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
        setListUserKy(res.data);
      } else {
        setListUserKy([]);
      }
    });
  };
  // const getLoaiSanPham = () => {
  //   new Promise((resolve, reject) => {
  //     dispatch(
  //       fetchStart(
  //         `LoaiSanPham?page=-1`,
  //         "GET",
  //         null,
  //         "DETAIL",
  //         "",
  //         resolve,
  //         reject
  //       )
  //     );
  //   }).then((res) => {
  //     if (res && res.data) {
  //       setListLoaiSanPham(res.data);
  //     } else {
  //       setListLoaiSanPham([]);
  //     }
  //   });
  // };
  const getSanPham = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          // `SanPham?page=-1&&loaiSanPham_Id=${id}`,
          `SanPham?page=-1`,
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
        const newData = res.data.map((dt) => {
          return {
            ...dt,
            name: dt.maSanPham + " - " + dt.tenSanPham,
          };
        });
        setListSanPham(newData);
      } else {
        setListSanPham([]);
      }
    });
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/${id}`,
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
          setListVatTu(JSON.parse(res.data.chiTietBOM));
          getUserKy(INFO);
          getUserLap(INFO, res.data.nguoiLap_Id);
          setInfo(res.data);
          getSanPham();
          getXuong();
          setFieldsValue({
            dinhmucvattu: {
              phongBan_Id: res.data.phongBan_Id,
              sanPham_Id: res.data.sanPham_Id,
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              nguoiKy_Id: res.data.nguoiKy_Id,
              ghiChu: res.data.ghiChu,
              phienBan: res.data.phienBan,
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
          : type === "detail"
          ? `/${id}/chi-tiet`
          : `/${id}/xac-nhan`,
        ""
      )}`
    );
  };
  const getDetailVatTu = (data) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `VatTu/${data.vatTu_Id}`,
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
          res.data.ghiChu = data.ghiChu;
          res.data.dinhMuc = data.dinhMuc;
          res.data.dinhMucXaNhua = data.dinhMucXaNhua ? data.dinhMucXaNhua : 0;
          res.data.vatTu_Id = res.data.id;
          if (listVatTu.length === 0) {
            res.data.isBatBuoc = true;
          } else {
            res.data.isBatBuoc = false;
          }
          console.log(res.data);
          setListVatTu([...listVatTu, res.data]);
          setFieldTouch(true);
        }
      })
      .catch((error) => console.error(error));
  };
  const getDetailSanPham = (data) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `SanPham/${data.vatTu_Id}`,
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
          res.data.ghiChu = data.ghiChu;
          res.data.dinhMuc = data.dinhMuc;
          res.data.dinhMucXaNhua = data.dinhMucXaNhua ? data.dinhMucXaNhua : 0;
          res.data.vatTu_Id = res.data.id;
          res.data.tenVatTu = res.data.tenSanPham;
          res.data.maVatTu = res.data.maSanPham;
          setListVatTu([...listVatTu, res.data]);
          setFieldTouch(true);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = listVatTu.filter((d) => d.vatTu_Id !== item.vatTu_Id);
    setListVatTu(newData);
    setFieldTouch(true);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFunc(item) }
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
  const hanldeCheckBox = (val, item) => {
    const newData = [...listVatTu];
    let count = 0;
    newData.forEach((vt) => {
      if (vt.isBatBuoc) {
        count += 1;
      }
    });
    if (count === 1 && val.target.checked === false) {
      Helpers.alertWarning("Trường bắt buộc phải có 1 chọn");
    } else {
      newData.forEach((vt) => {
        if (vt.vatTu_Id === item.vatTu_Id) {
          vt.isBatBuoc = val.target.checked;
        }
      });
      setListVatTu(newData);
      setFieldTouch(true);
    }
  };
  const renderBatBuoc = (item) => {
    return (
      <Checkbox
        checked={item.isBatBuoc}
        disabled={type === "new" || type === "edit" ? false : true}
        onChange={(val) => hanldeCheckBox(val, item)}
      />
    );
  };
  const handleInputChange = (val, item) => {
    const dinhMuc = val.target.value;
    const numberPattern = /^(0\.\d*[1-9]\d*|[1-9]\d*(\.\d+)?)$/;
    if (isEmpty(dinhMuc) || !numberPattern.test(dinhMuc)) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Định mức phải là số lớn hơn 0 và bắt buộc";
      item.dm = true;
    } else {
      const newData = editingRecord.filter((d) => d.vatTu_Id !== item.vatTu_Id);
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.vatTu_Id === item.vatTu_Id) {
        ct.dinhMuc = dinhMuc;
      }
    });
    setListVatTu(newData);
  };
  const renderDinhMuc = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.vatTu_Id === item.vatTu_Id && ct.dm) {
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
          // type="number"
          value={item.dinhMuc}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  const handleInputChangeXaNhua = (val, item) => {
    const dinhMucXaNhua = val.target.value;
    const numberPattern = /^(0\.\d*[1-9]\d*|[1-9]\d*(\.\d+)?)$/;
    if (!isEmpty(dinhMucXaNhua) && !numberPattern.test(dinhMucXaNhua)) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Định mức xả nhựa phải là số lớn hơn 0";
      item.dmxn = true;
    } else {
      const newData = editingRecord.filter((d) => d.vatTu_Id !== item.vatTu_Id);
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.vatTu_Id === item.vatTu_Id) {
        ct.dinhMucXaNhua = dinhMucXaNhua;
      }
    });
    setListVatTu(newData);
  };
  const renderDinhMucXaNhua = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.vatTu_Id === item.vatTu_Id && ct.dmxn) {
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
          // type="number"
          value={item.dinhMucXaNhua}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChangeXaNhua(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  const handleInputChangeGhiChu = (val, item) => {
    const ghiChu = val.target.value;
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.vatTu_Id === item.vatTu_Id) {
        ct.ghiChu = ghiChu;
      }
    });
    setListVatTu(newData);
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
          // type="number"
          value={item.ghiChu}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChangeGhiChu(val, item)}
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
      title: "Định mức",
      // dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
      render: (record) => renderDinhMuc(record),
    },
    {
      title: "Định mức xả nhựa",
      // dataIndex: "dinhMucXaNhua",
      key: "dinhMucXaNhua",
      align: "center",
      render: (record) => renderDinhMucXaNhua(record),
    },
    {
      title: "Ghi chú",
      // dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      render: (record) => renderGhiChu(record),
    },
    {
      title: "Bắt buộc",
      key: "isBatBuoc",
      align: "center",
      render: (val) => renderBatBuoc(val),
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleSave = (row) => {
    const newData = [...listVatTu];
    const index = newData.findIndex((item) => row.vatTu_Id === item.vatTu_Id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setListVatTu(newData);
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
        handleSave,
      }),
    };
  });

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.dinhmucvattu);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.dinhmucvattu, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (DinhMucVatTu, saveQuit = false) => {
    const newData = {
      ...DinhMucVatTu,
      ngayYeuCau:
        DinhMucVatTu.ngayYeuCau._i.split("/")[2] +
        "-" +
        DinhMucVatTu.ngayYeuCau._i.split("/")[1] +
        "-" +
        DinhMucVatTu.ngayYeuCau._i.split("/")[0],
      list_VatTu: listVatTu.map((vt) => {
        return {
          ...vt,
          dinhMucXaNhua: vt.dinhMucXaNhua ? vt.dinhMucXaNhua : 0,
        };
      }),
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_DinhMucVatTu`,
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
              setFieldTouch(false);
              setListVatTu([]);
              setFieldsValue({
                dinhmucvattu: {
                  userLap_Id: newData.userLap_Id,
                  tenPhongBan: newData.tenPhongBan,
                  ngayYeuCau: DinhMucVatTu.ngayYeuCau,
                },
              });
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      newData.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_DinhMucVatTu?id=${id}`,
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

  const addVatTu = (data) => {
    let check = false;
    listVatTu.forEach((dl) => {
      if (dl.vatTu_Id.toLowerCase() === data.vatTu_Id) {
        check = true;
        Helpers.alertError(`Vật tư đã được thêm`);
      }
    });
    !check && getDetailVatTu(data);
  };
  const addSanPham = (data) => {
    let check = false;
    listVatTu.forEach((dl) => {
      if (dl.vatTu_Id.toLowerCase() === data.vatTu_Id) {
        check = true;
        Helpers.alertError(`Sản phẩm đã được thêm`);
      }
    });
    !check && getDetailSanPham(data);
  };
  const addVatTuImport = (data) => {
    setListVatTu([...listVatTu, ...data]);
  };
  const hanldeXacNhan = () => {
    const newData = {
      id: id,
      xacNhan: true,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/xac-nhan/${id}`,
          "PUT",
          newData,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) goBack();
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu định mức vật tư",
    onOk: hanldeXacNhan,
  };
  const modalXK = () => {
    Modal(prop);
  };
  const hanldeTuChoi = () => {
    setActiveModalTuChoi(true);
  };
  const saveTuChoi = (val) => {
    const newData = {
      id: id,
      xacNhan: false,
      lyDoTuChoi: val,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/xac-nhan/${id}`,
          "PUT",
          newData,
          "TUCHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) goBack();
      })
      .catch((error) => console.error(error));
  };

  const formTitle =
    type === "new" ? (
      "Tạo định mức vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa định mức vật tư"
    ) : (
      <span>
        Chi tiết định mức vật tư -{" "}
        <Tag
          color={
            info.xacNhan === null
              ? "processing"
              : info.xacNhan
              ? "success"
              : "error"
          }
        >
          {info.xacNhanDinhMuc}
        </Tag>
      </span>
    );
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_DMVT}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Người lập"
                name={["dinhmucvattu", "userLap_Id"]}
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
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ban/Phòng"
                name={["dinhmucvattu", "tenPhongBan"]}
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
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Xưởng"
                name={["dinhmucvattu", "phongBan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListXuong ? ListXuong : []}
                  placeholder="Chọn xưởng"
                  optionsvalue={["id", "tenPhongBan"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Sản phẩm"
                name={["dinhmucvattu", "sanPham_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPham ? ListSanPham : []}
                  placeholder="Chọn sản phẩm"
                  optionsvalue={["id", "name"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ngày tạo"
                name={["dinhmucvattu", "ngayYeuCau"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Người ký"
                name={["dinhmucvattu", "nguoiKy_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn người ký"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Phiên bản"
                name={["dinhmucvattu", "phienBan"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập phiên bản"
                  disabled={type === "new" || type === "edit" ? false : true}
                ></Input>
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ghi chú"
                name={["dinhmucvattu", "ghiChu"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập ghi chú"
                  disabled={type === "new" || type === "edit" ? false : true}
                ></Input>
              </FormItem>
            </Col>
            {type === "new" || type === "edit" ? (
              <Col span={12} style={{ marginBottom: 8 }} align="center">
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => setActiveModal(true)}
                >
                  Chọn vật tư
                </Button>
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => setActiveModalSanPham(true)}
                >
                  Chọn sản phẩm
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  type="primary"
                  onClick={() => setActiveModalImport(true)}
                >
                  Import
                </Button>
              </Col>
            ) : null}
          </Row>
        </Form>

        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(listVatTu)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />

        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        ) : null}
        {type === "xacnhan" && (
          <Row justify={"end"} style={{ marginTop: 15 }}>
            <Col style={{ marginRight: 15 }}>
              <Button type="primary" onClick={modalXK}>
                Xác nhận
              </Button>
            </Col>
            <Col style={{ marginRight: 15 }}>
              <Button danger onClick={hanldeTuChoi}>
                Từ chối
              </Button>
            </Col>
          </Row>
        )}
      </Card>
      <AddVatTuModal
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        addVatTu={addVatTu}
      />
      <AddSanPhamModal
        openModal={ActiveModalSanPham}
        openModalFS={setActiveModalSanPham}
        addSanPham={addSanPham}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
      <ImportDinhMucVatTu
        openModal={ActiveModalImport}
        listVatTu={listVatTu}
        addVatTu={addVatTuImport}
        openModalFS={setActiveModalImport}
      />
    </div>
  );
};

export default DinhMucVatTuForm;
