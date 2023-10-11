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
    getUserLap(INFO);
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

  const getListLot = (phongBan_Id) => {
    const dataForm = getFieldValue("capvattusanxuat").ngaySanXuat._i.split("/");
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      phongBan_Id,
      ngay: dataForm[0],
      thang: dataForm[1],
      nam: dataForm[2],
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

  const getListVatTu = (phongBan_Id, lot) => {
    const dataForm = getFieldValue("capvattusanxuat").ngaySanXuat._i.split("/");
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      phongBan_Id,
      lot,
      ngay: dataForm[0],
      thang: dataForm[1],
      nam: dataForm[2],
      loaiKeHoach_Id: "27267ddf-652a-49a8-9570-73bb176d2e65",
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
      if (res && res.data.length > 0) {
        const data = res.data[0].bom && JSON.parse(res.data[0].bom);
        const newData = [];
        data &&
          data.map((dt) => {
            console.log(dt);
            dt.chiTietBOM &&
              dt.chiTietBOM.map((bom) => {
                newData.push({
                  lkn_DinhMucVatTu_Id: dt.id,
                  tenSanPham: dt.tenSanPham,
                  lkn_ChiTiet_Id: dt.chiTiet_Id,
                  tenChiTiet: dt.tenChiTiet,
                  soLuongKH: dt.soLuongKH,
                  soLuongChiTiet: dt.soLuongChiTiet,
                  vatTu_Id: bom.vatTu_Id,
                  maVatTu: bom.maVatTu,
                  tenVatTu: bom.tenVatTu,
                  soLuong: dt.soLuongKH * dt.soLuongChiTiet * bom.dinhMuc,
                  dinhMuc: bom.dinhMuc,
                  tenDonViTinh: bom.tenDonViTinh,
                  tenNhomVatTu: bom.tenNhomVatTu,
                  ghiChu: bom.ghiChu,
                });
              });
          });
        setListVatTu(newData);
      } else {
        setListVatTu([]);
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
          `Account/cbnv/${info.user_Id}?${params}`,
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
          capvattusanxuat: {
            userLapPhieu_Id: res.data.Id,
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
          getUserLap(INFO, res.data.userLapPhieu_Id);
          setInfo(res.data);
          const chiTiet =
            res.data.lst_ChiTietPhieuDeNghiCapVatTu &&
            JSON.parse(res.data.lst_ChiTietPhieuDeNghiCapVatTu);
          setListVatTu(chiTiet ? chiTiet : []);
          setFieldsValue({
            capvattusanxuat: {
              sanPham_Id: res.data.sanPham_Id,
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              ngaySanXuat: moment(res.data.ngaySanXuat, "DD/MM/YYYY"),
              userDuyet_Id: res.data.userDuyet_Id,
              userKhoVatTu_Id: res.data.userKhoVatTu_Id,
              userKiemTra_Id: res.data.userKiemTra_Id,
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
      const newData = {
        id: id,
        ...data,
        chiTiet_phieumuahangs: listVatTu.map((vt) => {
          return {
            vatTu_Id: vt.vatTu_Id,
            lkn_PhieuMuaHang_Id: id,
            bom_Id: vt.bom_Id,
            soLuong: vt.soLuong,
            soLuongTonKho: 0,
            ghiChu: vt.ghiChu,
            hangMucSuDung: vt.hangMucSuDung,
          };
        }),
        ngaySanXuat: data.ngaySanXuat._i,
        ngayYeuCau: data.ngayYeuCau._i,
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
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/xac-nhan/${id}`,
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
        if (res.status !== 409) goBack();
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
          "EDIT",
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
      "Tạo phiếu đề nghị cấp vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu đề nghị cấp vật tư"
    ) : (
      <span>
        Chi tiết phiếu đề nghị cấp vật tư -{" "}
        <Tag
          color={
            info.isKiemTraXacNhan === null
              ? "processing"
              : info.isKeToanXacNhan === null
              ? "volcano"
              : info.isXacNhan === null
              ? "success"
              : "error"
          }
        >
          {info.maPhieuYeuCau}
        </Tag>
      </span>
    );

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
    getListLot(val);
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
                        setFieldsValue({
                          capvattusanxuat: {
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
    </div>
  );
};

export default PhieuDeNghiCapVatTuForm;
