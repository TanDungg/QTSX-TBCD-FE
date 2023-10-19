import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
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
  Radio,
} from "antd";
import { includes, map } from "lodash";
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
import { DEFAULT_FORM_DENGHI_CVT } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import AddVatTuModal from "./AddVatTuModal";
import ModalTuChoi from "./ModalTuChoi";

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

const PhieuDeNghiCapVatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListXuong, setListXuong] = useState([]);
  const [Xuong, setXuong] = useState([]);
  const [ListSoLot, setListSoLot] = useState([]);
  const [listVatTu, setListVatTu] = useState([]);
  const [ListVatTuKhac, setListVatTuKhac] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [value, setValue] = useState(1);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModal, setActiveModal] = useState(false);
  const [NgaySanXuat, setNgaySanXuat] = useState(
    moment(getDateNow(-1), "DD/MM/YYYY")
  );

  const { validateFields, resetFields, setFieldsValue, getFieldValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getData();
          setFieldsValue({
            capvattusanxuat: {
              ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
              ngaySanXuat: moment(getDateNow(-1), "DD/MM/YYYY"),
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
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.edit) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = () => {
    getUserKy(INFO);
    getUserLap(INFO, null, value);
    getXuong();
  };

  const getXuong = () => {
    const params = convertObjectToUrlParams({
      page: -1,
      donviid: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?${params}`,
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

  const getListLot = (phongBan_Id, ngaySanXuat) => {
    const ngay = ngaySanXuat.split("/");
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      phongBan_Id,
      ngay: ngay[0],
      thang: ngay[1],
      nam: ngay[2],
      loaiKeHoach_Id: "27267ddf-652a-49a8-9570-73bb176d2e65",
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/list-san-pham-by-lot-in-ke-hoach?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data.length > 0) {
        setListSoLot(res.data);
      } else {
        setListSoLot([]);
      }
    });
  };

  const getListVatTu = (PhongBan_Id, Lot_Id) => {
    const params = convertObjectToUrlParams({
      PhongBan_Id,
      Lot_Id,
      LoaiKeHoach_Id: "27267ddf-652a-49a8-9570-73bb176d2e65",
      Ngay: getFieldValue("capvattusanxuat").ngaySanXuat._i,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/list-san-pham-kh-theo-bom?${params}`,
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
        const newData = [];
        res.data.list_ChiTiet &&
          res.data.list_ChiTiet.map((data) => {
            data.list_VatTu &&
              data.list_VatTu.map((vattu) => {
                newData.push({
                  tenSanPham: res.data.tenSanPham,
                  lkn_ChiTiet_Id: data.chiTiet_Id,
                  tenChiTiet: data.tenChiTiet,
                  soLuongKH: res.data.soLuongKH,
                  soLuongChiTiet: data.soLuongChiTiet,
                  lkn_DinhMucVatTu_Id: vattu.lkn_DinhMucVatTu_Id,
                  vatTu_Id: vattu.vatTu_Id,
                  maVatTu: vattu.maVatTu,
                  tenVatTu: vattu.tenVatTu,
                  soLuong:
                    res.data.soLuongKH * data.soLuongChiTiet * vattu.dinhMuc,
                  dinhMuc: vattu.dinhMuc,
                  tenDonViTinh: vattu.tenDonViTinh,
                  tenNhomVatTu: vattu.tenNhomVatTu,
                  ghiChu: vattu.ghiChu,
                });
              });
          });
        setListVatTu(newData);
      } else {
        setListVatTu([]);
      }
    });
  };

  const getUserLap = (info, nguoiLap_Id, value) => {
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
        if (value === 1) {
          setFieldsValue({
            capvattusanxuat: {
              userLapPhieu_Id: res.data.Id,
              tenPhongBan: res.data.tenPhongBan,
            },
          });
        } else {
          setFieldsValue({
            capvattukhac: {
              userLapPhieu_Id: res.data.Id,
              tenPhongBan: res.data.tenPhongBan,
            },
          });
        }
      } else {
      }
    });
  };

  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
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
        setListUserKy(res.data.datalist);
      } else {
        setListUserKy([]);
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
          `lkn_PhieuDeNghiCapVatTu/${id}?${params}`,
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
          getXuong();
          if (res.data.isLoaiPhieu === true) {
            setValue(1);
            getUserLap(INFO, res.data.userLapPhieu_Id, 1);
            setFieldsValue({
              capvattusanxuat: {
                xuongSanXuat_Id: res.data.xuongSanXuat_Id,
                lot_Id: res.data.lot_Id,
                ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
                ngaySanXuat: moment(res.data.ngaySanXuat, "DD/MM/YYYY"),
                userDuyet_Id: res.data.userDuyet_Id,
                userKhoVatTu_Id: res.data.userKhoVatTu_Id,
                userKiemTra_Id: res.data.userKiemTra_Id,
              },
            });
            getListLot(res.data.xuongSanXuat_Id, res.data.ngaySanXuat);
            const chiTiet =
              res.data.lst_ChiTietPhieuDeNghiCapVatTu &&
              JSON.parse(res.data.lst_ChiTietPhieuDeNghiCapVatTu);
            const newData =
              chiTiet &&
              chiTiet.map((data) => {
                return {
                  ...data,
                  soLuongKH: data.soLuongKeHoach,
                  dinhMuc: data.soLuongChiTiet,
                };
              });
            setListVatTu(newData);
          } else {
            setValue(2);
            getUserLap(INFO, res.data.userLapPhieu_Id, 2);
            setFieldsValue({
              capvattukhac: {
                xuongSanXuat_Id: res.data.xuongSanXuat_Id,
                ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
                userDuyet_Id: res.data.userDuyet_Id,
                userKhoVatTu_Id: res.data.userKhoVatTu_Id,
                userKiemTra_Id: res.data.userKiemTra_Id,
              },
            });
            const chiTiet =
              res.data.lst_ChiTietPhieuDeNghiCapVatTu &&
              JSON.parse(res.data.lst_ChiTietPhieuDeNghiCapVatTu);
            const newData =
              chiTiet &&
              chiTiet.map((data) => {
                return {
                  ...data,
                  soLuongKH: data.soLuongKeHoach,
                  dinhMuc: data.soLuongChiTiet,
                };
              });
            setListVatTuKhac(newData);
          }
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
    const newData = listVatTu.filter((d) => d.maVatTu !== item.maVatTu);
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
    },
    {
      title: "Chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
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
      title: "Số lượng kế hoạch",
      dataIndex: "soLuongKH",
      key: "soLuongKH",
      align: "center",
    },
    {
      title: "Số lượng chi tiết",
      dataIndex: "soLuongChiTiet",
      key: "soLuongChiTiet",
      align: "center",
    },
    {
      title: "Định mức",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
    },
    {
      title: "Số lượng vật tư",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];
  let colValuesCapVatTuKhac = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },

    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Nhóm vật tư",
      dataIndex: "tenNhomVatTu",
      key: "tenNhomVatTu",
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
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      editable:
        type === "new" || type === "edit" || type === "xacnhan" ? true : false,
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
      editable:
        type === "new" || type === "edit" || type === "xacnhan" ? true : false,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
      editable:
        type === "new" || type === "edit" || type === "xacnhan" ? true : false,
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

  const columns = map(
    value === 1 ? colValues : colValuesCapVatTuKhac,
    (col) => {
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
    }
  );

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    if (value === 1) {
      saveData(values.capvattusanxuat);
    }
    if (value === 2) {
      saveData(values.capvattukhac);
    }
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        if (value === 1) {
          if (listVatTu.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveData(values.capvattusanxuat, true);
          }
        }
        if (value === 2) {
          if (ListVatTuKhac.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveData(values.capvattukhac, true);
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new") {
      const newData =
        value === 1
          ? {
              ...data,
              ngaySanXuat: data.ngaySanXuat._i,
              ngayYeuCau: data.ngayYeuCau._i,
              isLoaiPhieu: true,
              chiTiet_PhieuDeNghiCapVatTus: listVatTu,
            }
          : {
              ...data,
              ngayYeuCau: data.ngayYeuCau._i,
              isLoaiPhieu: false,
              chiTiet_PhieuDeNghiCapVatTus: ListVatTuKhac,
            };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiCapVatTu`,
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
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData =
        value === 1
          ? {
              ...data,
              id: id,
              ngaySanXuat: data.ngaySanXuat._i,
              ngayYeuCau: data.ngayYeuCau._i,
              isLoaiPhieu: true,
              chiTiet_PhieuDeNghiCapVatTus: listVatTu,
            }
          : {
              ...data,
              id: id,
              ngayYeuCau: data.ngayYeuCau._i,
              isLoaiPhieu: false,
              chiTiet_PhieuDeNghiCapVatTus: ListVatTuKhac,
            };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDeNghiCapVatTu/${id}`,
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

  const handleXacNhan = () => {
    const newData = {
      id: id,
      isXacNhan: true,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiCapVatTu/xac-nhan/${id}`,
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
    title: "Xác nhận phiếu đề nghị cấp vật tư",
    onOk: handleXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const hanldeTuChoi = () => {
    setActiveModalTuChoi(true);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu đề nghị cấp vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu đề nghị cấp vật tư"
    ) : (
      <span>
        Chi tiết phiếu đề nghị cấp vật tư -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieuDeNghiCapVatTu}
        </Tag>
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.tinhTrang}
        </Tag>
      </span>
    );

  const handleRefeshModal = () => {
    goBack();
  };

  const onChange = (e) => {
    setValue(e.target.value);
    const data = getFieldValue("capvattusanxuat");
    setFieldsValue({
      capvattukhac: {
        ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
        userLapPhieu_Id: data.userLapPhieu_Id,
        tenPhongBan: data.tenPhongBan,
      },
    });
  };

  const addVatTu = (data) => {
    let check = false;
    ListVatTuKhac.forEach((listvattukhac) => {
      if (listvattukhac.vatTu_Id.toLowerCase() === data.vatTu_Id) {
        check = true;
        Helpers.alertError(`Vật tư đã được thêm`);
      }
    });
    !check &&
      ListVatTuKhac.length > 0 &&
      setListVatTuKhac([...ListVatTuKhac, data]);
    !check && ListVatTuKhac.length === 0 && setListVatTuKhac([data]);
    !check && setFieldTouch(true);
  };

  const handleSelectXuong = (val) => {
    setXuong(val);
    setFieldsValue({
      capvattusanxuat: {
        lot_Id: null,
      },
    });
    setListVatTu([]);
    getListLot(val, NgaySanXuat._i);
  };

  const handleSelectSoLot = (val) => {
    getListVatTu(Xuong, val);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Row style={{ marginBottom: 15 }} justify={"center"}>
          <Radio.Group
            onChange={onChange}
            value={value}
            style={{ width: "100%", display: "flex" }}
          >
            <Col span={12} align="center">
              <Radio value={1} disabled={value === 2 && type !== "new"}>
                Phiếu đề nghị cấp vật tư sản xuất
              </Radio>
            </Col>
            <Col span={12} align="center">
              <Radio value={2} disabled={value === 1 && type !== "new"}>
                Yêu cầu cấp vật tư khác
              </Radio>
            </Col>
          </Radio.Group>
        </Row>
        <Divider style={{ marginBottom: 10 }} />
        {value === 1 ? (
          <>
            <Form
              {...DEFAULT_FORM_DENGHI_CVT}
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
                    name={["capvattusanxuat", "userLapPhieu_Id"]}
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
                    name={["capvattusanxuat", "tenPhongBan"]}
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
                    label="Xưởng sản xuất"
                    name={["capvattusanxuat", "xuongSanXuat_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      placeholder="Xưởng sản xuất"
                      className="heading-select slt-search th-select-heading"
                      data={ListXuong ? ListXuong : []}
                      optionsvalue={["id", "tenPhongBan"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp={"name"}
                      onSelect={handleSelectXuong}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
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
                    label="Số Lot"
                    name={["capvattusanxuat", "lot_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      data={ListSoLot ? ListSoLot : []}
                      optionsvalue={["lot_Id", "soLot"]}
                      style={{ width: "100%" }}
                      placeholder="Nhập số Lot"
                      showSearch
                      optionFilterProp={"name"}
                      onSelect={handleSelectSoLot}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
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
                    name={["capvattusanxuat", "ngayYeuCau"]}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <DatePicker
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      format={"DD/MM/YYYY"}
                      allowClear={false}
                      onChange={(date, dateString) => {
                        setFieldsValue({
                          capvattusanxuat: {
                            ngayYeuCau: moment(dateString, "DD/MM/YYYY"),
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
                    label="Ngày sản xuất"
                    name={["capvattusanxuat", "ngaySanXuat"]}
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
                        getListLot(Xuong, dateString);
                        setNgaySanXuat(moment(dateString, "DD/MM/YYYY"));
                        setFieldsValue({
                          capvattusanxuat: {
                            lot_Id: null,
                            ngaySanXuat: moment(dateString, "DD/MM/YYYY"),
                          },
                        });
                      }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
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
                    name={["capvattusanxuat", "userDuyet_Id"]}
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
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
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
                    label="Bộ phận KVT"
                    name={["capvattusanxuat", "userKhoVatTu_Id"]}
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
                      placeholder="Chọn bộ phận kho vật tư"
                      optionsvalue={["user_Id", "fullName"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="name"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
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
                    label="Kiểm tra"
                    name={["capvattusanxuat", "userKiemTra_Id"]}
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
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
                  </FormItem>
                </Col>
                {info.lyDoHuy ? (
                  <Col
                    xxl={12}
                    xl={12}
                    lg={24}
                    md={24}
                    sm={24}
                    xs={24}
                    style={{ marginBottom: 8 }}
                  >
                    <FormItem label="Lý do hủy">
                      <Input
                        className="input-item"
                        disabled={true}
                        value={info.lyDoHuy}
                      />
                    </FormItem>
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
          </>
        ) : (
          <>
            <Form
              {...DEFAULT_FORM_DENGHI_CVT}
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
                    name={["capvattukhac", "userLapPhieu_Id"]}
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
                    name={["capvattukhac", "tenPhongBan"]}
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
                    label="Xưởng sản xuất"
                    name={["capvattukhac", "xuongSanXuat_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      placeholder="Xưởng sản xuất"
                      className="heading-select slt-search th-select-heading"
                      data={ListXuong ? ListXuong : []}
                      optionsvalue={["id", "tenPhongBan"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp={"name"}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
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
                    name={["capvattukhac", "ngayYeuCau"]}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <DatePicker
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      format={"DD/MM/YYYY"}
                      allowClear={false}
                      onChange={(date, dateString) => {
                        setFieldsValue({
                          capvattukhac: {
                            ngayYeuCau: moment(dateString, "DD/MM/YYYY"),
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
                    label="Người duyệt"
                    name={["capvattukhac", "userDuyet_Id"]}
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
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
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
                    label="Bộ phận KVT"
                    name={["capvattukhac", "userKhoVatTu_Id"]}
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
                      placeholder="Chọn bộ phận kho vật tư"
                      optionsvalue={["user_Id", "fullName"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="name"
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
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
                    name={["capvattukhac", "userKiemTra_Id"]}
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
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                    />
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
                    style={{ marginBottom: 8 }}
                    align="center"
                  >
                    <Button
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={() => setActiveModal(true)}
                    >
                      Thêm vật tư
                    </Button>
                  </Col>
                ) : null}
                {info.lyDoHuy ? (
                  <Col
                    xxl={12}
                    xl={12}
                    lg={24}
                    md={24}
                    sm={24}
                    xs={24}
                    style={{ marginBottom: 8 }}
                  >
                    <FormItem label="Lý do hủy">
                      <Input
                        className="input-item"
                        disabled={true}
                        value={info.lyDoHuy}
                      />
                    </FormItem>
                  </Col>
                ) : null}
              </Row>
            </Form>
            <Table
              bordered
              columns={columns}
              scroll={{ x: 1200, y: "55vh" }}
              components={components}
              className="gx-table-responsive"
              dataSource={reDataForTable(ListVatTuKhac)}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
              // loading={loading}
            />
          </>
        )}
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={onFinish}
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
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        itemData={info}
        refesh={handleRefeshModal}
      />
    </div>
  );
};

export default PhieuDeNghiCapVatTuForm;
