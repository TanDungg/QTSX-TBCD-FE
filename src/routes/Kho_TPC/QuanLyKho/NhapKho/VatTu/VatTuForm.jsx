import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Tag,
  Divider,
  Button,
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
import { DEFAULT_FORM, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalThemVatTu from "./ModalThemVatTu";
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

const VatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListNhaCungCap, setListNhaCungCap] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [ListMaPhieu, setListMaPhieu] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [Kho, setKho] = useState("");
  const [InfoVatTu, setInfoVatTu] = useState();

  const [ListUserKy, setListUserKy] = useState([]);
  const [ActiveModal, setActiveModal] = useState(false);

  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          const datetime = moment();
          setType("new");
          getUserLap(INFO);
          getNhaCungCap();
          getUserKy(INFO);
          getKho();
          getMaPhieu();
          setFieldsValue({
            phieunhapkho: {
              ngayNhan: moment(
                datetime.format("DD/MM/YYYY HH:mm:ss"),
                "DD/MM/YYYY HH:mm:ss"
              ),
            },
          });
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.cof) {
          setType("duyet");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.cof) {
          history.push("/home");
        }
      } else if (includes(match.url, "chinh-sua")) {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.cof) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.view) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id, "chitiet");
        } else if (permission && !permission.view) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const getNhaCungCap = (id) => {
    if (id) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `NhaCungCap/${id}`,
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
          res.data.name =
            res.data.maNhaCungCap + " - " + res.data.tenNhaCungCap;
          setListNhaCungCap([res.data]);
        } else {
          setListNhaCungCap([]);
        }
      });
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `NhaCungCap?page=-1`,
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
          setListNhaCungCap(
            res.data.map((ncc) => {
              return {
                ...ncc,
                name: ncc.maNhaCungCap + " - " + ncc.tenNhaCungCap,
              };
            })
          );
        } else {
          setListNhaCungCap([]);
        }
      });
    }
  };

  const getMaPhieu = (id) => {
    if (!id) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhanHang/get-phieu-nhan-hang-chua-nhap `,
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
          setListMaPhieu(res.data);
        } else {
          setListMaPhieu([]);
        }
      });
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhanHang/${id}?donVi_Id=${INFO.donVi_Id}`,
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
          setListMaPhieu([
            {
              maPhieuNhanHang: res.data.maPhieuNhanHang,
              id: res.data.id,
            },
          ]);
        } else {
          setListMaPhieu([]);
        }
      });
    }
  };

  const getKho = (id) => {
    if (id) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `CauTrucKho/${id}`,
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
          setListKho([res.data]);
        } else {
          setListKho([]);
        }
      });
    } else {
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
    }
  };

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id, chitiet) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/${id}?${params}`,
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
          const newData =
            res.data.chiTietVatTu &&
            JSON.parse(res.data.chiTietVatTu).map((data) => {
              return {
                ...data,
                thoiGianSuDung: data.thoiGianSuDung
                  ? data.thoiGianSuDung
                  : null,
                soHoaDon: "",
              };
            });

          setListVatTu(newData ? newData : []);
          getUserLap(INFO, res.data.userNhan_Id);
          getUserKy(INFO);
          setInfo(res.data);
          getKho();
          getMaPhieu(res.data.phieuNhanHang_Id);
          getNhaCungCap();
          setFieldsValue({
            phieunhapkho: {
              ...res.data,
              ngayNhan: res.data.ngayNhan
                ? moment(res.data.ngayNhan, "DD/MM/YYYY HH:mm:ss")
                : null,
              ngayHoaDon: res.data.ngayHoaDon
                ? moment(res.data.ngayHoaDon, "DD/MM/YYYY")
                : null,
              userThongKe_Id: res.data.userThongKe_Id
                ? res.data.userThongKe_Id
                : !chitiet && INFO.user_Id,
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
          : type === "duyet"
          ? `/${id}/xac-nhan`
          : type === "detail"
          ? `/${id}/chi-tiet`
          : type === "edit" && `/${id}/chinh-sua`,
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
    if (type === "edit") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoVatTu/delete-chi-tiet-phieu-nhap-kho-vat-tu/${item.chiTiet_Id}`,
            "DELETE",
            null,
            "DELETE",
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
    } else {
      const newData = listVatTu.filter((d) => d.chiTiet_Id !== item.chiTiet_Id);
      setListVatTu(newData);
    }
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItemVal = {
      onClick: () => {
        setActiveModal(true);
        setInfoVatTu(item);
      },
    };

    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          {type === "new" && (
            <>
              <a {...editItemVal} title="Sửa">
                <EditOutlined />
              </a>
              <Divider type="vertical" />
            </>
          )}

          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };
  // const renderDatePicker = (val, record) => {
  //   return (
  //     <DatePicker
  //       format={"DD/MM/YYYY"}
  //       disabled={type === "new" || type === "edit" ? false : true}
  //       value={val ? moment(val, "DD/MM/YYYY") : null}
  //       onChange={(date, dateString) => {
  //         const newVatTu = [...listVatTu];
  //         newVatTu.forEach((vt, index) => {
  //           if (vt.chiTiet_Id === record.chiTiet_Id) {
  //             newVatTu[index].ngayHoaDon =
  //               dateString !== "" ? dateString : null;
  //           }
  //         });
  //         setListVatTu(newVatTu);
  //         setFieldTouch(true);
  //       }}
  //     />
  //   );
  // };

  const handleInputChange = (val, item) => {
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || Number(soLuongNhap) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (Number(soLuongNhap) > item.soLuongNhan) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = `Số lượng phải nhỏ hơn ${item.soLuongNhan}`;
    } else {
      const newData = editingRecord.filter(
        (d) => d.chiTiet_Id !== item.chiTiet_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.chiTiet_Id === item.chiTiet_Id) {
        ct.soLuongNhap = soLuongNhap;
      }
    });
    setListVatTu(newData);
  };

  const rendersoLuong = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.chiTiet_Id === item.chiTiet_Id) {
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
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  const changeGhiChu = (val, item, key) => {
    const ghiChu = val.target.value;
    const newData = [...listVatTu];
    newData.forEach((sp, index) => {
      if (sp.chiTiet_Id === item.chiTiet_Id) {
        sp[key] = ghiChu;
      }
    });
    setListVatTu(newData);
  };

  const renderGhiChu = (item, key) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          value={item[key]}
          onChange={(val) => changeGhiChu(val, item, key)}
          disabled={type === "new" || type === "edit" ? false : true}
        />
      </>
    );
  };
  const XacNhanEdit = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuNhapKhoVatTu/chinh-sua-chi-tiet-phieu-da-xac-nhan/${item.chiTiet_Id}`,
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
  let colValues = () => {
    const col = [
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
        title: "Thời gian sử dụng",
        dataIndex: "thoiGianSuDung",
        key: "thoiGianSuDung",
        align: "center",
      },
      {
        title: "Vị trí",
        key: "viTri",
        align: "center",
        render: (val) => {
          return (
            <span>
              {val.tenNgan ? val.tenNgan : val.tenKe && val.tenKe}
              {/* {val.tenTang && ` - ${val.tenTang}`} */}
              {/* {val.tenNgan && val.tenNgan} */}
            </span>
          );
        },
      },
      // {
      //   title: "Ngày hóa đơn",
      //   dataIndex: "ngayHoaDon",
      //   key: "ngayHoaDon",
      //   align: "center",
      //   render: (val, record) => renderDatePicker(val, record),
      // },
      // {
      //   title: "Số hóa đơn",
      //   dataIndex: "soHoaDon",
      //   key: "soHoaDon",
      //   align: "center",
      //   render: (record) => renderGhiChu(record, "soHoaDon"),
      // },

      {
        title: "Số lượng",
        render: (record) => rendersoLuong(record),

        key: "soLuongNhap",
        align: "center",
      },
      {
        title: "Ghi chú",
        key: "ghiChu",
        align: "center",
        render: (record) => renderGhiChu(record, "ghiChu"),
      },
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 80,
        render: (value) => actionContent(value),
      },
    ];
    if (type === "edit") {
      return [
        {
          title: "Chỉnh sửa",
          key: "edit",
          align: "center",
          width: 80,
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
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleSave = (row) => {
    const newData = [...listVatTu];
    const index = newData.findIndex(
      (item) => row.chiTiet_Id === item.chiTiet_Id
    );
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setFieldTouch(true);
    setListVatTu(newData);
  };
  const columns = map(colValues(), (col) => {
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
    saveData(values.phieunhapkho);
  };

  const saveAndClose = (val, isDuyet) => {
    if (isDuyet) {
      validateFields()
        .then((values) => {
          if (listVatTu.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveData(values.phieunhapkho, val, isDuyet);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    } else {
      saveData(form.getFieldValue("phieunhapkho"), val, isDuyet);
    }
  };

  const saveData = (nhapkho, saveQuit = false, isDuyet = true) => {
    // if (type === "new") {
    //   const newData = {
    //     ...nhapkho,
    //     chiTiet_PhieuNhapKhoVatTus: listVatTu,
    //     ngayHoaDon: nhapkho.ngayHoaDon && nhapkho.ngayHoaDon._i,
    //     ngayNhan: nhapkho.ngayNhan._i,
    //   };
    //   new Promise((resolve, reject) => {
    //     dispatch(
    //       fetchStart(
    //         `lkn_PhieuNhapKhoVatTu`,
    //         "POST",
    //         newData,
    //         "ADD",
    //         "",
    //         resolve,
    //         reject
    //       )
    //     );
    //   })
    //     .then((res) => {
    //       if (res.status !== 409) {
    //         if (saveQuit) {
    //           goBack();
    //         } else {
    //           resetFields();
    //           getUserLap(INFO);
    //           getNhaCungCap();
    //           getUserKy(INFO);
    //           getKho();
    //           getMaPhieu();
    //           setFieldsValue({
    //             phieunhapkho: {
    //               ngayNhan: moment(getDateNow(), "DD/MM/YYYY HH:mm:ss"),
    //               ngayHoaDon: moment(getDateNow(), "DD/MM/YYYY"),
    //             },
    //           });
    //           setFieldTouch(false);
    //           setListVatTu([]);
    //         }
    //       } else {
    //         setFieldTouch(false);
    //       }
    //     })
    //     .catch((error) => console.error(error));
    // }
    if (type === "duyet") {
      const newData = {
        id: id,
        ...nhapkho,
        chiTiet_PhieuNhapKhoVatTus: listVatTu.map((vt) => {
          return {
            ...vt,
            lkn_PhieuNhapKhoVatTu_Id: id,
            ngayHoaDon: vt.ngayHoaDon ? vt.ngayHoaDon : null,
          };
        }),
        ngayHoaDon: nhapkho.ngayHoaDon && nhapkho.ngayHoaDon._i,
        ngayNhan: nhapkho.ngayNhan._i,
        isDuyet: isDuyet,
        lyDoTuChoi: !isDuyet ? "Từ chối" : undefined,
      };

      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoVatTu/${id}`,
            "PUT",
            newData,
            !isDuyet ? "TUCHOI" : "XACNHAN",
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
  const saveAndCloseNew = (val) => {
    {
      validateFields()
        .then((values) => {
          if (listVatTu.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveDataNew(values.phieunhapkho, val);
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  };
  const saveDataNew = (nhapkho, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...nhapkho,
        chiTiet_PhieuNhapKhoVatTus: listVatTu,
        ngayHoaDon: nhapkho.ngayHoaDon && nhapkho.ngayHoaDon._i,
        ngayNhan: nhapkho.ngayNhan._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuNhapKhoVatTu`,
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
              getUserLap(INFO);
              getNhaCungCap();
              getUserKy(INFO);
              getKho();
              getMaPhieu();
              setFieldsValue({
                phieunhapkho: {
                  ngayNhan: moment(getDateNow(), "DD/MM/YYYY HH:mm:ss"),
                },
              });
              setFieldTouch(false);
              setListVatTu([]);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };
  const formTitle =
    type === "new" ? (
      "Tạo phiếu nhập kho vật tư "
    ) : type === "duyet" ? (
      "Duyệt phiếu nhập kho vật tư"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhập kho vật tư"
    ) : (
      <span>
        Chi tiết phiếu nhập kho vật tư -{" "}
        <Tag
          color={
            info.tinhTrang === "Chưa xử lý"
              ? "blue"
              : info.tinhTrang === "Phiếu đã bị từ chối"
              ? "red"
              : "success"
          }
        >
          {info.maPhieuNhapKhoVatTu} - {info.tinhTrang}
        </Tag>
      </span>
    );
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt phiếu nhập kho",
    onOk: () => {
      saveAndClose(false, true);
    },
  };
  const modalDuyet = () => {
    Modal(prop);
  };
  const prop1 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận từ chối phiếu nhập kho",
    onOk: () => {
      saveAndClose(false, false);
    },
  };
  const modalTuChoi = () => {
    Modal(prop1);
  };
  const addVatTu = (data, check) => {
    if (check) {
      setListVatTu([
        ...listVatTu.map((vt) => {
          if (vt.chiTiet_Id === data.chiTiet_Id) {
            return data;
          } else {
            return vt;
          }
        }),
      ]);
    } else {
      setListVatTu([...listVatTu, data]);
    }
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Row>
            <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
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
            <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
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
            <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
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
                  format={"DD/MM/YYYY HH:mm:ss"}
                  disabled={type === "new" || type === "duyet" ? false : true}
                  showTime
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      phieunhapkho: {
                        ngayNhan: moment(dateString, "DD/MM/YYYY HH:mm:ss"),
                      },
                    });
                  }}
                />
              </FormItem>
            </Col>
            {/* <Col   xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
             >
              <FormItem
                label="Phiếu nhận hàng"
                name={["phieunhapkho", "phieuNhanHang_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListMaPhieu}
                  placeholder="Chọn phiếu nhận hàng"
                  optionsvalue={["id", "maPhieuNhanHang"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" ? false : true}
                  onSelect={hanldeSelectMaPhieu}
                />
              </FormItem>
            </Col> */}
            <Col span={12}>
              <FormItem
                label="Số hóa đơn"
                name={["phieunhapkho", "soHoaDon"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Số hóa đơn"
                  disabled={type === "new" || type === "duyet" ? false : true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ngày hóa đơn"
                name={["phieunhapkho", "ngayHoaDon"]}
                rules={[]}
              >
                <DatePicker
                  disabled={type === "new" || type === "duyet" ? false : true}
                  format={"DD/MM/YYYY"}
                  onChange={(date, dateString) => {
                    if (dateString === "") {
                      setFieldsValue({
                        phieunhapkho: {
                          ngayHoaDon: null,
                        },
                      });
                    } else {
                      setFieldsValue({
                        phieunhapkho: {
                          ngayHoaDon: moment(dateString, "DD/MM/YYYY"),
                        },
                      });
                    }
                  }}
                />
              </FormItem>
            </Col>
            <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
              <FormItem
                label="Nhà cung cấp"
                name={["phieunhapkho", "nhaCungCap_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhaCungCap}
                  placeholder="Chọn nhà cung cấp"
                  optionsvalue={["id", "name"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "duyet" ? false : true}
                />
              </FormItem>
            </Col>
            <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
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
                  disabled={type === "new" || type === "duyet" ? false : true}
                />
              </FormItem>
            </Col>
            <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
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
                  disabled={type === "new" ? false : true}
                  onSelect={(val) => setKho(val)}
                />
              </FormItem>
            </Col>
            {/* <Col   xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
             >
              <FormItem
                label="BP.QC"
                name={["phieunhapkho", "userQC_Id"]}
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
                  placeholder="Chọn BP.QC"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col> */}
            <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
              <FormItem
                label="Thống kê"
                name={["phieunhapkho", "userThongKe_Id"]}
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
                  placeholder="Chọn thống kê"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "duyet" ? false : true}
                />
              </FormItem>
            </Col>
            {/* <Col   xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
             >
              <FormItem
                label="Phụ trách bộ phận"
                name={["phieunhapkho", "userPhuTrach_Id"]}
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
                  placeholder="Chọn phụ trách bộ phận"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col> */}
            {type === "new" && (
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
                  onClick={() => {
                    setInfoVatTu();
                    setActiveModal(true);
                  }}
                  disabled={Kho === ""}
                >
                  Thêm vật tư
                </Button>
              </Col>
            )}
          </Row>
        </Form>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(listVatTu && listVatTu)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
        {type === "new" && (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndCloseNew}
            saveAndClose={saveAndCloseNew}
            disabled={fieldTouch}
          />
        )}
        {type === "duyet" && info.tinhTrang === "Chưa xử lý" ? (
          <>
            <Divider />
            <Row style={{ marginTop: 20 }}>
              <Col style={{ marginBottom: 8, textAlign: "center" }} span={24}>
                <Button
                  className="th-btn-margin-bottom-0"
                  icon={<RollbackOutlined />}
                  onClick={goBack}
                  style={{ marginTop: 10 }}
                >
                  Quay lại
                </Button>
                <Button
                  disabled={!fieldTouch}
                  className="th-btn-margin-bottom-0"
                  type="primary"
                  onClick={() => modalDuyet()}
                  icon={<SaveOutlined />}
                  style={{ marginTop: 10 }}
                >
                  Duyệt
                </Button>
                <Button
                  // disabled={!fieldTouch}
                  className="th-btn-margin-bottom-0"
                  icon={<CloseOutlined />}
                  style={{ marginTop: 10 }}
                  onClick={() => modalTuChoi()}
                >
                  Từ chối
                </Button>
              </Col>
            </Row>
          </>
        ) : null}
      </Card>
      <ModalThemVatTu
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        cauTrucKho_Id={Kho}
        addVatTu={addVatTu}
        infoVatTu={InfoVatTu}
      />
    </div>
  );
};

export default VatTuForm;
