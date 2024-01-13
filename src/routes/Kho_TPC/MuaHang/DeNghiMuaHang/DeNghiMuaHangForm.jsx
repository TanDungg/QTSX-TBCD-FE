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
  Divider,
  Tag,
  Upload,
  Image,
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { BASE_URL_API } from "src/constants/Config";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  removeDuplicates,
  renderPDF,
} from "src/util/Common";
import ModalTuChoi from "./ModalTuChoi";
import Helper from "src/helpers";
import dayjs from "dayjs";
import ModalAddVatTuKHSX from "./ModalAddVatTuKHSX";
import ModalAddVatTuSanPham from "./ModalAddVatTuSanPham";
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
          title === "SL cần mua"
            ? [
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Số lượng không hợp lệ!",
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

const FormItem = Form.Item;

const DeNghiMuaHangForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModalAddVatTuKHSX, setActiveModalAddVatTuKHSX] = useState(false);
  const [ActiveModalAddVatTuSanPham, setActiveModalAddVatTuSanPham] =
    useState(false);

  const [File, setFile] = useState("");
  const [disableUpload, setDisableUpload] = useState(false);
  const [FileChat, setFileChat] = useState("");
  const [openImage, setOpenImage] = useState(false);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          setType("new");
          getUserKy(INFO);
          setFieldsValue({
            deNghiMuaHang: {
              ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
              ngayHoanThanhDukien: moment(getDateNow(), "DD/MM/YYYY"),
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
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.view) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id, true);
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
          deNghiMuaHang: {
            userYeuCau_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };
  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
      key: 1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}`,
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

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id, check) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id.toLowerCase(),
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/${id}?${params}`,
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
          setInfo(res.data);
          const vattu =
            res.data.chiTietVatTu &&
            JSON.parse(res.data.chiTietVatTu).map((ct) => {
              return {
                ...ct,
                lkn_ChiTietBOM_Id: ct.chiTietPhieuMuaHang_Id,
              };
            });
          setListVatTu(vattu);
          getUserLap(INFO, res.data.userYeuCau_Id);
          res.data.userYeuCau_Id === INFO.user_Id &&
            check &&
            setType("UploadFile");
          if (res.data.fileXacNhan) {
            setFile(res.data.fileXacNhan);
            setDisableUpload(true);
          }
          setFieldsValue({
            deNghiMuaHang: {
              sanPham_Id: res.data.sanPham_Id,
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              ngayHoanThanhDukien: moment(
                res.data.ngayHoanThanhDukien,
                "DD/MM/YYYY"
              ),
              userDuyet_Id: res.data.userDuyet_Id,
              userKeToan_Id: res.data.userKeToan_Id,
              userKiemTra_Id: res.data.userKiemTra_Id,
              isCKD: res.data.isCKD ? "true" : "false",
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
          : type === "detail" || type === "UploadFile"
          ? `/${id}/chi-tiet`
          : `/${id}/xac-nhan`,
        ""
      )}`
    );
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
    const newData = listVatTu.filter(
      (d) => d.lkn_ChiTietBOM_Id !== item.lkn_ChiTietBOM_Id
    );
    setListVatTu(newData);
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

  // const renderSoLuong = (record) => {
  //   if (record) {
  //     const isEditing =
  //       editingRecord &&
  //       editingRecord.lkn_ChiTietBOM_Id === record.lkn_ChiTietBOM_Id;

  //     return type === "new" || type === "edit" ? (
  //       <div>
  //         <Input
  //           min={0}
  //           style={{
  //             textAlign: "center",
  //             width: "100%",
  //             borderColor: isEditing && hasError ? "red" : "",
  //           }}
  //           className={`input-item ${
  //             isEditing && hasError ? "input-error" : ""
  //           }`}
  //           value={record.soLuong}
  //           type="number"
  //           onChange={(val) => handleInputChange(val, record)}
  //         />
  //         {isEditing && hasError && (
  //           <div style={{ color: "red" }}>{errorMessage}</div>
  //         )}
  //       </div>
  //     ) : (
  //       record.soLuong
  //     );
  //   }
  //   return null;
  // };

  // const handleInputChange = (val, record) => {
  //   const sl = val.target.value;

  //   if (sl === null || sl === "") {
  //     setHasError(true);
  //     setErrorMessage("Vui lòng nhập số lượng");
  //     setFieldTouch(false);
  //   } else {
  //     if (sl <= 0) {
  //       setHasError(true);
  //       setErrorMessage("Số lượng xuất phải lớn hơn 0");
  //       setFieldTouch(false);
  //     } else {
  //       setHasError(false);
  //       setErrorMessage(null);
  //       setFieldTouch(true);
  //     }
  //   }
  //   setEditingRecord(record);

  //   setListVatTu((prevListVatTu) => {
  //     return prevListVatTu.map((item) => {
  //       if (record.lkn_ChiTietBOM_Id === item.lkn_ChiTietBOM_Id) {
  //         return {
  //           ...item,
  //           soLuong: sl ? parseFloat(sl) : 0,
  //         };
  //       }
  //       return item;
  //     });
  //   });
  // };

  const handleInputChange = (val, item) => {
    const soLuong = val.target.value;
    if (isEmpty(soLuong) || Number(soLuong) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) => d.lkn_ChiTietBOM_Id !== item.lkn_ChiTietBOM_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietBOM_Id === item.lkn_ChiTietBOM_Id) {
        ct.soLuong = soLuong;
      }
    });
    setListVatTu(newData);
  };

  const rendersoLuong = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.lkn_ChiTietBOM_Id === item.lkn_ChiTietBOM_Id) {
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
          value={item.soLuong}
          disabled={
            type === "new" || type === "edit" || type === "xacnhan"
              ? false
              : true
          }
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  const handleInputChangeHanMucSuDungGhiChu = (val, item, key) => {
    const text = val.target.value;
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietBOM_Id === item.lkn_ChiTietBOM_Id) {
        ct.hangMucSuDung = text;
      }
    });
    setListVatTu(newData);
    setFieldTouch(true);
  };
  const renderHanMucSuDungGhiChu = (item) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          value={item.hangMucSuDung}
          disabled={
            type === "new" || type === "edit" || type === "xacnhan"
              ? false
              : true
          }
          onChange={(val) => handleInputChangeHanMucSuDungGhiChu(val, item)}
        />
      </>
    );
  };
  const handleInputChangeGhiChu = (val, item, key) => {
    const text = val.target.value;
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietBOM_Id === item.lkn_ChiTietBOM_Id) {
        ct.ghiChu = text;
      }
    });
    setListVatTu(newData);
    setFieldTouch(true);
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
          disabled={
            type === "new" || type === "edit" || type === "xacnhan"
              ? false
              : true
          }
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
      title: "Sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      filters: removeDuplicates(
        map(listVatTu, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenSanPham.includes(value),
      filterSearch: true,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      filters: removeDuplicates(
        map(listVatTu, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      filters: removeDuplicates(
        map(listVatTu, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
      align: "center",
      filters: removeDuplicates(
        map(listVatTu, (d) => {
          return {
            text: d.tenNhomVatTu,
            value: d.tenNhomVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenNhomVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "SL theo định mức",
      dataIndex: "soLuongKeHoach",
      key: "soLuongKeHoach",
      align: "center",
    },
    {
      title: "Tồn kho",
      dataIndex: "soLuongTonKho",
      key: "soLuongTonKho",
      align: "center",
    },
    {
      title: "SL cần mua",
      key: "soLuong",
      align: "center",
      render: (record) => rendersoLuong(record),
    },
    {
      title: "Hạng mục sử dụng",
      key: "hangMucSuDung",
      align: "center",
      render: (record) => renderHanMucSuDungGhiChu(record),
    },
    {
      title: "Ghi chú",
      key: "ghiChu",
      align: "center",
      render: (record) => renderGhiChu(record),
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
    // setDisableSave(true);
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
        handleSave: handleSave,
      }),
    };
  });
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.deNghiMuaHang);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.deNghiMuaHang, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (deNghiMuaHang, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...deNghiMuaHang,
        ngayHoanThanhDukien: deNghiMuaHang.ngayHoanThanhDukien._i,
        ngayYeuCau: deNghiMuaHang.ngayYeuCau._i,
        chiTiet_phieumuahangs: listVatTu.filter((ct) => Number(ct.soLuong) > 0),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiMuaHang`,
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
              getUserLap(INFO);
              setFieldsValue({
                deNghiMuaHang: {
                  ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayHoanThanhDukien: moment(getDateNow(), "DD/MM/YYYY"),
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
      const newData = {
        id: id,
        ...deNghiMuaHang,
        ngayHoanThanhDukien: deNghiMuaHang.ngayHoanThanhDukien._i,
        ngayYeuCau: deNghiMuaHang.ngayYeuCau._i,
        chiTiet_phieumuahangs: listVatTu.filter((ct) => Number(ct.soLuong) > 0),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiMuaHang/${id}`,
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

  const hanldeXacNhan = () => {
    const newData = {
      id: id,
      isXacNhan: true,
      chiTiet_phieumuahangs: listVatTu.map((vt) => {
        return {
          ...vt,
          lkn_PhieuMuaHang_Id: id,
        };
      }),
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/xac-nhan/${id}`,
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
        if (res.status !== 409) {
          goBack();
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu đề nghị mua hàng",
    onOk: hanldeXacNhan,
  };
  const modalXK = () => {
    Modal(prop);
  };
  const hanldeXacNhanTaiFile = () => {
    const formData = new FormData();
    formData.append("file", File);
    const url = info.fileXacNhan
      ? `${BASE_URL_API}/api/Upload?stringPath=${info.fileXacNhan}`
      : `${BASE_URL_API}/api/Upload`;
    fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer ".concat(INFO.token),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `lkn_PhieuDeNghiMuaHang/tai-file-phieu-de-nghi/${id}`,
              "PUT",
              { id: id, file: data.path },
              "GUIPHIEU",
              "",
              resolve,
              reject
            )
          );
        })
          .then((res) => {
            if (res.status !== 409) getInfo(id, true);
          })
          .catch((error) => console.error(error));
      })
      .catch(() => {
        console.log("upload failed.");
      });
  };
  const prop1 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận tải file đã ký",
    onOk: hanldeXacNhanTaiFile,
  };
  const modalUploadFile = () => {
    Modal(prop1);
  };
  const hanldeTuChoi = () => {
    setActiveModalTuChoi(true);
  };
  const saveTuChoi = (val) => {
    const newData = {
      id: id,
      isXacNhan: false,
      lyDoTuChoi: val,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/xac-nhan/${id}`,
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
        if (res.status !== 409) getInfo(id);
      })
      .catch((error) => console.error(error));
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu đề nghị mua hàng "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu đề nghị mua hàng"
    ) : (
      <span>
        Chi tiết phiếu đề nghị mua hàng -{" "}
        <Tag
          color={
            info.isXacNhan === null
              ? "orange"
              : info.isXacNhan === true
              ? "blue"
              : "red"
          }
          style={{ fontSize: 14 }}
        >
          {info.maPhieuYeuCau}
        </Tag>
        <Tag
          color={
            info.isXacNhan === null
              ? "orange"
              : info.isXacNhan === true
              ? "blue"
              : "red"
          }
          style={{ fontSize: 14 }}
        >
          {info.isXacNhan === null
            ? "Chưa xác nhận"
            : info.isXacNhan === true
            ? "Đã xác nhận"
            : "Đã từ chối"}
        </Tag>
      </span>
    );

  const hanldeThemKHSX = (data) => {
    setListVatTu([...listVatTu, ...data]);
    setActiveModalAddVatTuKHSX(false);
  };
  const hanldeThem = (data) => {
    setListVatTu([...listVatTu, ...data]);
    setActiveModalAddVatTuSanPham(false);
  };

  const props = {
    accept: ".pdf, .png, .jpg, .jpeg",
    beforeUpload: (file) => {
      const isPNG =
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "application/pdf";
      if (!isPNG) {
        Helper.alertError(`${file.name} không phải hình ảnh hoặc file pdf`);
      } else {
        setFile(file);
        setDisableUpload(true);
        const reader = new FileReader();
        reader.onload = (e) => setFileChat(e.target.result);
        reader.readAsDataURL(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };
  const handleViewFile = (file) => {
    if (file.type === "application/pdf") {
      renderPDF(file);
    } else {
      setOpenImage(true);
    }
  };
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_TWO_COL}
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
                label="Người đề nghị"
                name={["deNghiMuaHang", "userYeuCau_Id"]}
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
                name={["deNghiMuaHang", "tenPhongBan"]}
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
                label="Dự kiến hoàn thành"
                name={["deNghiMuaHang", "ngayHoanThanhDukien"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  disabled={type === "new" || type === "edit" ? false : true}
                  disabledDate={disabledDate}
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      deNghiMuaHang: {
                        ngayHoanThanhDukien: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
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
                label="Ngày yêu cầu"
                name={["deNghiMuaHang", "ngayYeuCau"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      deNghiMuaHang: {
                        ngayYeuCau: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }}
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
                label="Người kiểm tra"
                name={["deNghiMuaHang", "userKiemTra_Id"]}
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
                  placeholder="Chọn người kiểm tra"
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
                label="Kế toán duyệt"
                name={["deNghiMuaHang", "userKeToan_Id"]}
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
                  placeholder="Chọn kế toán duyệt"
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
                label="Duyệt"
                name={["deNghiMuaHang", "userDuyet_Id"]}
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
                  placeholder="Chọn người duyệt"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {type === "new" && (
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
                align="center"
              >
                <Button
                  onClick={() => setActiveModalAddVatTuKHSX(true)}
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  Theo KHSX
                </Button>
                <Button
                  onClick={() => setActiveModalAddVatTuSanPham(true)}
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  Theo sản phẩm
                </Button>
              </Col>
            )}
          </Row>
          <Divider />
          {(type === "UploadFile" ||
            type === "xacnhan" ||
            type === "detail") && (
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
                  label="File đã ký"
                  name={["deNghiMuaHang", "fileXacNhan"]}
                >
                  {!disableUpload ? (
                    <Upload {...props}>
                      <Button
                        style={{
                          marginBottom: 0,
                          height: 25,
                          lineHeight: "25px",
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "xacnhan" || type === "detail"}
                      >
                        Tải file
                      </Button>
                    </Upload>
                  ) : File.name ? (
                    <span>
                      <span
                        style={{ color: "#0469B9", cursor: "pointer" }}
                        onClick={() => handleViewFile(File)}
                      >
                        {File.name.length > 20
                          ? File.name.substring(0, 20) + "..."
                          : File.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFile();
                          setDisableUpload(false);
                          setFieldsValue({
                            phieunhanhang: {
                              fileDinhKem: undefined,
                            },
                          });
                        }}
                      />
                      <Image
                        width={100}
                        src={FileChat}
                        alt="preview"
                        style={{
                          display: "none",
                        }}
                        preview={{
                          visible: openImage,
                          scaleStep: 0.5,
                          src: FileChat,
                          onVisibleChange: (value) => {
                            setOpenImage(value);
                          },
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + File}
                        rel="noopener noreferrer"
                      >
                        {File.split("/")[5]}{" "}
                      </a>
                      {type === "UploadFile" &&
                        (!info.isXacNhan || info.isXacNhan !== true) && (
                          <DeleteOutlined
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() => {
                              setFile();
                              setDisableUpload(false);
                            }}
                          />
                        )}
                    </span>
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          {/* {(type === "new" || type === "edit") && (
            <Row style={{ marginTop: 15 }}>
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
                  name={["sanPham", "phongBan_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListXuong ? ListXuong : []}
                    placeholder="Chọn xưởng"
                    optionsvalue={["id", "tenPhongBan"]}
                    style={{ width: "100%" }}
                    onSelect={hanleOnSelectXuong}
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
                  name={["sanPham", "sanPham_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListSanPham ? ListSanPham : []}
                    placeholder="Chọn sản phẩm"
                    optionsvalue={["sanPham_Id", "name"]}
                    style={{ width: "100%" }}
                    onSelect={hanldeSelectSanPham}
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
                <FormItem label="Số lượng" name={["sanPham", "soLuong"]}>
                  <div>
                    <Input
                      style={{
                        width: "100%",
                        borderColor: Message ? "red" : "",
                      }}
                      className={`input-item ${Message ? "input-error" : ""}`}
                      placeholder="Nhập số lượng"
                      type="number"
                      onChange={(e) => hanldeSoLuong(e.target.value)}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      value={SoLuong}
                    />
                    {Message && <div style={{ color: "red" }}>{Message}</div>}
                  </div>
                </FormItem>
              </Col>
              {type === "new" || type === "edit" ? (
                <Col
                  xxl={12}
                  xl={12}
                  lg={24}
                  md={24}
                  sm={24}
                  xs={24}
                  align="center"
                >
                  <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={hanldeThem}
                    disabled={!SanPham_Id || !Xuong || DisabledThem}
                  >
                    Thêm
                  </Button>
                </Col>
              ) : null}
            </Row>
          )} */}
        </Form>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
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
            disabled={fieldTouch && listVatTu.length !== 0}
          />
        ) : null}
        {type === "xacnhan" && info.isXacNhan === null && (
          <Row justify={"end"} style={{ marginTop: 15 }}>
            <Col style={{ marginRight: 15 }}>
              <Button
                type="primary"
                onClick={modalXK}
                disabled={info.fileXacNhan === null}
              >
                Xác nhận
              </Button>
            </Col>
            <Col style={{ marginRight: 15 }}>
              <Button
                danger
                onClick={hanldeTuChoi}
                disabled={info.fileXacNhan === null}
              >
                Từ chối
              </Button>
            </Col>
          </Row>
        )}
        {type === "UploadFile" &&
          (!info.isXacNhan || info.isXacNhan !== true) && (
            <Row justify={"end"} style={{ marginTop: 15 }}>
              <Col style={{ marginRight: 15 }}>
                <Button
                  type="primary"
                  onClick={modalUploadFile}
                  disabled={!disableUpload || !File.name}
                >
                  Hoàn thành
                </Button>
              </Col>
            </Row>
          )}
      </Card>
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
      <ModalAddVatTuKHSX
        openModal={ActiveModalAddVatTuKHSX}
        openModalFS={setActiveModalAddVatTuKHSX}
        hanldeThem={hanldeThemKHSX}
      />
      <ModalAddVatTuSanPham
        openModal={ActiveModalAddVatTuSanPham}
        openModalFS={setActiveModalAddVatTuSanPham}
        hanldeThem={hanldeThem}
      />
    </div>
  );
};

export default DeNghiMuaHangForm;
