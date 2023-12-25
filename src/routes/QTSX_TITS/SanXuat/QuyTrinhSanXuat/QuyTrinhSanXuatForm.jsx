import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Mentions,
  Row,
  Switch,
  Tag,
} from "antd";
import { useDispatch } from "react-redux";
import { includes, isEmpty, map } from "lodash";
import {
  Input,
  Select,
  FormSubmit,
  Table,
  EditableTableRow,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_QTSX } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import moment from "moment";
import ModalCongDoan from "./ModalCongDoan";
import Helpers from "src/helpers";
import ModalTram from "./ModalTram";
import ModalTuChoi from "./ModalTuChoi";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function QuyTrinhSanXuatForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const { setFieldsValue, validateFields, resetFields } = form;
  const [id, setId] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [BOM, setBOM] = useState(null);
  const [OEM, setOEM] = useState(null);
  const [ListNhanVien, setListNhanVien] = useState([]);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [ActiveModalCongDoan, setActiveModalCongDoan] = useState(false);
  const [ActiveModalTram, setActiveModalTram] = useState(false);
  const [Tram, setTram] = useState(null);
  const [info, setInfo] = useState({});
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getListSanPham();
        getUserKy(INFO.donVi_Id);
        setFieldsValue({
          quytrinhsanxuat: {
            ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
            ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
          },
        });
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
    } else if (includes(match.url, "xac-nhan")) {
      if (permission && permission.edit) {
        setType("xacnhan");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?page=-1`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListBOM = (tits_qtsx_SanPham_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_SanPham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/list-BOM-da-duyet?${params}`,
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
          setFieldsValue({
            quytrinhsanxuat: {
              maBOM: res.data.tenBOM,
            },
          });
          setBOM(res.data);
        } else {
          setFieldsValue({
            quytrinhsanxuat: {
              maBOM: null,
            },
          });
          setBOM(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListOEM = (tits_qtsx_SanPham_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_SanPham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/list-OEM-da-duyet?${params}`,
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
          setFieldsValue({
            quytrinhsanxuat: {
              maOEM: res.data.tenOEM,
            },
          });
          setOEM(res.data);
        } else {
          setFieldsValue({
            quytrinhsanxuat: {
              maOEM: null,
            },
          });
          setOEM(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}&key=1`,
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
        setListNhanVien(res.data);
      } else {
        setListNhanVien([]);
      }
    });
  };

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/${id}`,
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
          const data = res.data;
          getListSanPham();
          getUserKy(INFO.donVi_Id);
          setInfo(data);
          setFieldsValue({
            quytrinhsanxuat: {
              ...data,
              ngayBanHanh: moment(data.ngayBanHanh, "DD/MM/YYYY"),
              ngayApDung: moment(data.ngayApDung, "DD/MM/YYYY"),
            },
          });
          const congdoan =
            data.list_CongDoans &&
            JSON.parse(data.list_CongDoans).map((congdoan) => {
              return {
                ...congdoan,
                list_Trams:
                  congdoan.list_Trams &&
                  congdoan.list_Trams.map((tram) => {
                    return {
                      ...tram,
                      list_VatTus:
                        tram.list_VatTus && JSON.parse(tram.list_VatTus),
                    };
                  }),
              };
            });
          setSanPham(data.tits_qtsx_SanPham_Id);
          getListBOM(data.tits_qtsx_SanPham_Id);
          getListOEM(data.tits_qtsx_SanPham_Id);
          setListCongDoan(congdoan);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleModalTram = (item) => {
    setTram(item);
    setActiveModalTram(true);
  };

  const actionContent = (item) => {
    const addtram =
      OEM && (type === "new" || type === "edit")
        ? { onClick: () => handleModalTram(item) }
        : { disabled: true };

    const deleteVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFunc(item, "công đoạn") }
        : { disabled: true };

    return (
      <div>
        <a {...addtram} title="Thêm trạm">
          <PlusCircleOutlined />
        </a>
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa công đoạn">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenCongDoan, "công đoạn");
  };

  const deleteItemAction = (item) => {
    const newData = ListCongDoan.filter(
      (d) =>
        d.tits_qtsx_CongDoan_Id !== item.tits_qtsx_CongDoan_Id ||
        d.tits_qtsx_Xuong_Id !== item.tits_qtsx_Xuong_Id
    );
    setListCongDoan(newData);
  };

  const handleCheckboxChange = (record) => {
    const newData = ListCongDoan.map((congdoan) => {
      if (
        congdoan.tits_qtsx_CongDoan_Id === record.tits_qtsx_CongDoan_Id &&
        congdoan.tits_qtsx_Xuong_Id === record.tits_qtsx_Xuong_Id
      ) {
        return {
          ...congdoan,
          isChoPhepSCL: !congdoan.isChoPhepSCL,
        };
      }
      return congdoan;
    });
    setFieldTouch(true);
    setListCongDoan(newData);
  };

  const renderSCL = (record) => {
    return (
      <Checkbox
        checked={record.isChoPhepSCL}
        onChange={() => handleCheckboxChange(record)}
        disabled={type === "new" || type === "edit" ? false : true}
      />
    );
  };

  const handleInputChange = (val, item) => {
    const ThuTu = val.target.value;
    if (isEmpty(ThuTu) || Number(ThuTu) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Thứ tự phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) => d.tits_qtsx_CongDoan_Id !== item.tits_qtsx_CongDoan_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListCongDoan];
    newData.forEach((cd, index) => {
      if (
        cd.tits_qtsx_CongDoan_Id === item.tits_qtsx_CongDoan_Id &&
        cd.tits_qtsx_Xuong_Id === item.tits_qtsx_Xuong_Id
      ) {
        cd.thuTu = ThuTu;
      }
    });
    setListCongDoan(newData);
  };

  const onChangeValue = (val, record) => {
    const newData = {
      tits_qtsx_QuyTrinhSanXuatCongDoan_Id:
        record.tits_qtsx_QuyTrinhSanXuatCongDoan_Id,
      thuTu: val.target.value,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/doi-thu-tu-cong-doan`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status !== 409) {
        getInfo(id);
      }
    });
  };

  const renderThuTu = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_CongDoan_Id === item.tits_qtsx_CongDoan_Id &&
        ct.tits_qtsx_Xuong_Id === item.tits_qtsx_Xuong_Id
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
          }}
          className={`input-item`}
          type="number"
          value={item.thuTu}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item)}
          onBlur={(val) => type === "edit" && onChangeValue(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 120,
      render: (value) => actionContent(value),
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      align: "center",
      width: 120,
      render: (value) => renderThuTu(value),
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
    },
    {
      title: "Xưởng",
      dataIndex: "tenXuong",
      key: "tenXuong",
      align: "center",
    },
    {
      title: "Cho phép qua SCL",
      key: "isChoPhepSCL",
      align: "center",
      render: (record) => renderSCL(record),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
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
      }),
    };
  });

  const deleteItemFuncTram = (item, title) => {
    ModalDeleteConfirm(deleteItemActionTram, item, item.tenTram, title);
  };

  const deleteItemActionTram = (item) => {
    const newData = ListCongDoan.map((congDoan) => {
      if (congDoan.list_Trams) {
        const newListTram = congDoan.list_Trams.filter(
          (tram) =>
            tram.tits_qtsx_Tram_Id.toLowerCase() !==
            item.tits_qtsx_Tram_Id.toLowerCase()
        );
        return {
          ...congDoan,
          list_Trams: newListTram,
        };
      }
      return congDoan;
    });

    setListCongDoan(newData);
  };

  const actionContentTram = (item) => {
    const deleteVal =
      type === "new" || type === "edit"
        ? {
            onClick: () => deleteItemFuncTram(item, "trạm"),
          }
        : { disabled: true };

    return (
      <div>
        <a {...deleteVal} title="Xóa trạm">
          <DeleteOutlined />
        </a>
      </div>
    );
  };
  const handleInputChangeTram = (val, item) => {
    const ThuTu = val.target.value;
    if (isEmpty(ThuTu) || Number(ThuTu) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Thứ tự phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_QuyTrinhSanXuatTram_Id !==
          item.tits_qtsx_QuyTrinhSanXuatTram_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListCongDoan];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_QuyTrinhSanXuatCongDoan_Id ===
        item.tits_qtsx_QuyTrinhSanXuatCongDoan_Id
      ) {
        ct.list_Trams.forEach((tram, index) => {
          if (
            tram.tits_qtsx_Tram_Id.toLowerCase() ===
            item.tits_qtsx_Tram_Id.toLowerCase()
          ) {
            tram.thuTu = ThuTu;
          }
        });
      }
    });
    setListCongDoan(newData);
  };

  const onChangeValueTram = (val, record) => {
    const newData = {
      tits_qtsx_QuyTrinhSanXuatTram_Id: record.tits_qtsx_QuyTrinhSanXuatTram_Id,
      thuTu: val.target.value,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/doi-thu-tu-tram`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status !== 409) {
        getInfo(id);
      }
    });
  };

  const renderThuTuTram = (item) => {
    let isEditing = false;
    let message = "";

    editingRecord.forEach((ct) => {
      if (
        ct.tits_qtsx_QuyTrinhSanXuatCongDoan_Id ===
        item.tits_qtsx_QuyTrinhSanXuatCongDoan_Id
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
          }}
          className={`input-item`}
          type="number"
          value={item.thuTu}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChangeTram(val, item)}
          onBlur={(val) => type === "edit" && onChangeValueTram(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let colValuesTram = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 120,
      render: (value) => actionContentTram(value),
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      align: "center",
      width: 120,
      render: (value) => renderThuTuTram(value),
    },
    {
      title: "Mã trạm",
      dataIndex: "maTram",
      key: "maTram",
      align: "center",
    },
    {
      title: "Tên trạm",
      dataIndex: "tenTram",
      key: "tenTram",
      align: "center",
    },
    {
      title: "Thiết bị",
      dataIndex: "tenThietBi",
      key: "tenThietBi",
      align: "center",
    },
    {
      title: "List vật tư",
      dataIndex: "list_VatTus",
      key: "list_VatTus",
      align: "center",
      render: (_, { list_VatTus }) => (
        <>
          {list_VatTus &&
            list_VatTus.map((data) => {
              return (
                <Tag
                  color={"blue"}
                  style={{
                    fontSize: 13,
                    marginBottom: 3,
                    whiteSpace: "break-spaces",
                    // wordBreak: "break-all",
                  }}
                >
                  {data.tenVatTu}
                </Tag>
              );
            })}
        </>
      ),
    },
    {
      title: "Thông tin kiểm soát",
      dataIndex: "list_TramChiTiets",
      key: "list_TramChiTiets",
      align: "center",
      render: (value) => (
        <>
          {value &&
            value.map((thongtin) => (
              <Tag
                color={"blue"}
                style={{ fontSize: 13 }}
                key={thongtin.tits_qtsx_ThongTinKiemSoat_Id}
              >
                {thongtin.tenThongTinKiemSoat}
              </Tag>
            ))}
        </>
      ),
    },
  ];

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.quytrinhsanxuat);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.quytrinhsanxuat, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (quytrinhsanxuat, saveQuit = false) => {
    const newData = {
      ...quytrinhsanxuat,
      tits_qtsx_OEM_Id: OEM.id,
      tits_qtsx_BOM_Id: BOM.id,
      ngayBanHanh: quytrinhsanxuat.ngayBanHanh.format("DD/MM/YYYY"),
      ngayApDung: quytrinhsanxuat.ngayApDung.format("DD/MM/YYYY"),
      list_CongDoans: ListCongDoan,
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_QuyTrinhSanXuat`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              setListCongDoan([]);
              resetFields();
              setFieldTouch(false);
              setFieldsValue({
                quytrinhsanxuat: {
                  ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...quytrinhsanxuat,
        id: id,
        tits_qtsx_OEM_Id: OEM.id,
        tits_qtsx_BOM_Id: BOM.id,
        ngayBanHanh: quytrinhsanxuat.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: quytrinhsanxuat.ngayApDung.format("DD/MM/YYYY"),
        list_CongDoans: ListCongDoan,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_QuyTrinhSanXuat/${id}`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
              getInfo(id);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleXacNhan = () => {
    const newData = {
      id: id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/duyet/${id}`,
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
          getInfo(id);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận quy trình sản xuất",
    onOk: handleXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const saveTuChoi = (data) => {
    const newData = {
      id: id,
      lyDoTuChoi: data,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/duyet/${id}`,
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

  const DataThemCongDoan = (data) => {
    const congdoan =
      ListCongDoan &&
      ListCongDoan.filter(
        (d) =>
          (d.tits_qtsx_Tram_Id === data.tits_qtsx_Tram_Id &&
            d.tits_qtsx_Xuong_Id) === data.tits_qtsx_Xuong_Id
      );

    if (congdoan.length !== 0) {
      Helpers.alertError(
        `Công đoạn ${data.tenCongDoan} - ${data.tenXuong} đã được thêm`
      );
    } else {
      setFieldTouch(true);
      setListCongDoan([...ListCongDoan, data]);
    }
  };

  const DataThemTram = (data) => {
    console.log(data);
    const newData = ListCongDoan.map((list) => {
      if (
        list.tits_qtsx_CongDoan_Id === data.tits_qtsx_CongDoan_Id &&
        list.tits_qtsx_Xuong_Id === data.tits_qtsx_Xuong_Id
      ) {
        const tramExists = list.list_Trams.some(
          (d) => d.tits_qtsx_Tram_Id === data.tits_qtsx_Tram_Id
        );

        if (tramExists) {
          Helpers.alertError(`Trạm ${data.tenTram} đã được thêm`);
          return list;
        } else {
          return {
            ...list,
            list_Trams: [...list.list_Trams, data],
          };
        }
      }
      return list;
    });
    setFieldTouch(true);
    setListCongDoan(newData);
  };

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

  const handleOnSelectSanPham = (val) => {
    setFieldsValue({
      quytrinhsanxuat: {
        tits_qtsx_BOM_Id: null,
        tits_qtsx_OEM_Id: null,
      },
    });
    setOEM(null);
    setSanPham(val);
    getListBOM(val);
    getListOEM(val);
  };

  const formTitle =
    type === "new" ? (
      "Tạo quy trình kiểm soát sản xuất"
    ) : type === "edit" ? (
      "Chỉnh sửa quy trình kiểm soát sản xuất"
    ) : (
      <span>
        Chi tiết quy trình kiểm soát sản xuất -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maQuyTrinhSanXuat}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "orange"
              : info.tinhTrang === "Đã duyệt"
              ? "blue"
              : "red"
          }
          style={{
            fontSize: "14px",
          }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin quy trình kiểm soát sản xuất"}
      >
        <Form
          {...DEFAULT_FORM_QTSX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          {/* <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              background: "none",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            Sản phẩm
          </Divider> */}
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Sản phẩm"
                name={["quytrinhsanxuat", "tits_qtsx_SanPham_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPham ? ListSanPham : []}
                  placeholder="Chọn sản phẩm"
                  optionsvalue={["id", "tenSanPham"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  onSelect={handleOnSelectSanPham}
                  disabled={type === "new" ? false : true}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Loại sản phẩm"
                name={["quytrinhsanxuat", "tits_qtsx_SanPham_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPham ? ListSanPham : []}
                  placeholder="Chọn loại sản phẩm"
                  optionsvalue={["id", "tenLoaiSanPham"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="BOM"
                name={["quytrinhsanxuat", "maBOM"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="BOM của sản phẩm"
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="OEM"
                name={["quytrinhsanxuat", "maOEM"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="OEM của sản phẩm"
                  disabled={true}
                />
              </FormItem>
            </Col>
          </Row>
          <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              background: "none",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Thông tin quy trình kiểm soát sản xuất
          </Divider>
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Mã quy trình"
                name={["quytrinhsanxuat", "maQuyTrinhSanXuat"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập mã quy trình sản xuất"
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Tên quy trình"
                name={["quytrinhsanxuat", "tenQuyTrinhSanXuat"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập tên quy trình sản xuất"
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
                label="Người kiểm tra"
                name={["quytrinhsanxuat", "nguoiKiemTra_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhanVien}
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
                label="Người duyệt"
                name={["quytrinhsanxuat", "nguoiDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhanVien}
                  placeholder="Chọn người duyệt"
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Ngày ban hành"
                name={["quytrinhsanxuat", "ngayBanHanh"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Ngày áp dụng"
                name={["quytrinhsanxuat", "ngayApDung"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Sử dụng"
                name={["quytrinhsanxuat", "isSuDung"]}
                valuePropName="checked"
              >
                <Switch
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {info.tinhTrang === "Đã từ chối" && (
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
                  label="Lý do từ chối"
                  name={["quytrinhsanxuat", "lyDoTuChoi"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" disabled={true} />
                </FormItem>
              </Col>
            )}
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Mô tả"
                name={["quytrinhsanxuat", "moTa"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Mentions
                  className="input-item"
                  placeholder="Nhập mô tả"
                  rows={2}
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách công đoạn"}
      >
        {(type === "new" || type === "edit") && (
          <div align={"end"}>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => setActiveModalCongDoan(true)}
              type="primary"
              disabled={SanPham === null ? true : false}
            >
              Thêm công đoạn
            </Button>
          </div>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1000, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(
            ListCongDoan &&
              ListCongDoan.slice().sort((a, b) => a.thuTu - b.thuTu)
          )}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                key={record.tits_qtsx_QuyTrinhSanXuat_Id}
                style={{
                  marginBottom: "10px",
                  marginLeft: "50px",
                  width: "94%",
                }}
                bordered
                columns={colValuesTram}
                scroll={{ x: 500 }}
                components={components}
                className="gx-table-responsive th-F1D065-head"
                dataSource={reDataForTable(
                  record.list_Trams &&
                    record.list_Trams.slice().sort((a, b) => a.thuTu - b.thuTu)
                )}
                size="small"
                rowClassName={"editable-row"}
                pagination={false}
              />
            ),
          }}
        />
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          saveAndClose={saveAndClose}
          disabled={fieldTouch}
        />
      ) : null}
      {type === "xacnhan" &&
      info.tinhTrang === "Chưa duyệt" &&
      info.nguoiDuyet_Id === INFO.user_Id ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button icon={<RollbackOutlined />} type="default" onClick={goBack}>
            Quay lại
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            type="primary"
            onClick={modalXK}
          >
            Xác nhận
          </Button>
          <Button
            icon={<CloseCircleOutlined />}
            type="danger"
            onClick={() => setActiveModalTuChoi(true)}
          >
            Từ chối
          </Button>
        </div>
      ) : null}
      <ModalCongDoan
        openModal={ActiveModalCongDoan}
        openModalFS={setActiveModalCongDoan}
        itemData={ListCongDoan && ListCongDoan}
        DataThemCongDoan={DataThemCongDoan}
      />
      <ModalTram
        openModal={ActiveModalTram}
        openModalFS={setActiveModalTram}
        itemData={{ tram: Tram, oem: OEM }}
        DataThemTram={DataThemTram}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
}

export default QuyTrinhSanXuatForm;
