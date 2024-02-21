import {
  CloseOutlined,
  DeleteOutlined,
  RollbackOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
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
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTimeNow,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalThemKe from "./ModalThemKe";
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

const ThanhPhamForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListUser, setListUser] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [Kho, setKho] = useState("");

  const [ListSanPham, setListSanPham] = useState([]);
  const [ListSoLuong, setListSoLuong] = useState([]);

  const [ActiveModal, setActiveModal] = useState(false);
  const [DisableThemSanPham, setDisableThemSanPham] = useState(true);

  const [editingRecord, setEditingRecord] = useState([]);

  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getUserLap(INFO);
          setType("new");
          getXuong();
          setFieldsValue({
            phieunhapkho: {
              ngayXuatKho: moment(
                `${getDateNow()} ${getTimeNow()}`,
                "DD/MM/YYYY HH:mm"
              ),
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
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.cof) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
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
          phieunhapkho: {
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
          if (
            x.tenPhongBan.toLowerCase().includes("xưởng") ||
            x.tenPhongBan.toLowerCase().includes("kho")
          ) {
            xuong.push(x);
          }
        });
        setListXuong(xuong);
      } else {
        setListXuong([]);
      }
    });
  };
  const getKho = (phongBan_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-phong-ban?thuTu=101&&phongBan_Id=${phongBan_Id}&&isThanhPham=true`,
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
          `lkn_PhieuXuatKhoThanhPham/${id}?${params}`,
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
          setListSanPham(JSON.parse(res.data.chiTietThanhPham));
          getUserLap(INFO, res.data.userLap_Id);
          setInfo(res.data);
          getXuong();
          getKho(res.data.phongBan_Id);
          setListSoLuong(
            JSON.parse(res.data.chiTietThanhPham).map((sp) => {
              return {
                chiTietKho_Id: sp.chiTietKho_Id,
                soLuongXuat: sp.soLuong,
              };
            })
          );
          setFieldsValue({
            phieunhapkho: {
              ...res.data,
              ngayXuatKho: moment(res.data.ngayXuatKho, "DD/MM/YYYY HH:mm"),
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
    const title = "sản phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenSanPham, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    if (type === "edit" && info.isDuyet) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuXuatKhoThanhPham/sau-duyet/${item.id}`,
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
      const newData = ListSanPham.filter(
        (d) => d.chiTietKho_Id !== item.chiTietKho_Id
      );
      setFieldTouch(true);
      setListSanPham(newData);
    }
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission &&
      permission.del &&
      (type === "new" || type === "edit") &&
      ListSanPham.length > 1
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
  const handleInputChange = (val, item) => {
    const soLuongNhap = val.target.value;
    let soLuongXuatDefaut = 0;
    ListSoLuong.forEach((sl) => {
      if (sl.chiTietKho_Id === item.chiTietKho_Id) {
        soLuongXuatDefaut = Number(sl.soLuongXuat);
      }
    });
    if (isEmpty(soLuongNhap) || Number(soLuongNhap) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (Number(soLuongNhap) > soLuongXuatDefaut) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = `Số lượng xuất phải nhỏ hơn hoặc bằng ${soLuongXuatDefaut}`;
    } else {
      const newData = editingRecord.filter(
        (d) => d.chiTietKho_Id !== item.chiTietKho_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListSanPham];
    newData.forEach((ct, index) => {
      if (ct.chiTietKho_Id === item.chiTietKho_Id) {
        ct.soLuongXuat = soLuongNhap;
      }
    });
    setListSanPham(newData);
  };
  const rendersoLuong = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.chiTietKho_Id === item.chiTietKho_Id) {
        isEditing = true;
        message = ct.message;
      }
    });
    const disable = type === "new" || type === "edit" ? false : true;
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.soLuongXuat}
          disabled={disable}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  const XacNhanEdit = (data) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuXuatKhoThanhPham/sau-duyet/${data.id}`,
          "PUT",
          {
            id: data.id,
            lkn_ChiTietKhoThanhPham_Id: data.lkn_ChiTietKhoThanhPham_Id,
            soLuongXuat: data.soLuongXuat,
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
        title: "Vị trí",
        // dataIndex: "tenKe",
        key: "tenKe",
        align: "center",
        render: (val) => (
          <span>
            {val.tenNgan ? val.tenNgan : val.tenKe ? val.tenKe : val.tenKho}
          </span>
        ),
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
        title: "Lot",
        dataIndex: "soLot",
        key: "soLot",
        align: "center",
      },
      {
        title: "Đơn vị tính",
        dataIndex: "tenDonViTinh",
        key: "tenDonViTinh",
        align: "center",
      },
      {
        title: "Màu sắc",
        dataIndex: "tenMauSac",
        key: "tenMauSac",
        align: "center",
      },
      {
        title: "Số lượng",
        key: "soLuongXuat",
        align: "center",
        render: (record) => rendersoLuong(record),
      },
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 80,
        render: (value) => actionContent(value),
      },
    ];
    if (type === "edit" && info.isDuyet) {
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
                disabled={
                  (val.ngan_Id && type === "edit") ||
                  (!val.ke_Id && type === "edit")
                    ? false
                    : true
                }
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
      }),
    };
  });

  const onFinish = (values) => {
    saveData(values.phieunhapkho);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListSanPham.length === 0) {
          Helpers.alertWarning("Danh sách sản phẩm rỗng");
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
        chiTiet_PhieuXuatKhoThanhPhams: ListSanPham,
        ngayXuatKho: nhapkho.ngayXuatKho._i,
        ngayYeuCau: nhapkho.ngayXuatKho._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuXuatKhoThanhPham`,
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
                  ngayHoaDon: moment(getDateNow(), "DD/MM/YYYY"),
                  userLap_Id: nhapkho.userLap_Id,
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
        ...info,
        ...nhapkho,
        chiTiet_PhieuXuatKhoThanhPhams: ListSanPham.map((sp) => {
          return {
            ...sp,
            lkn_PhieuNhapKhoThanhPham_Id: id,
          };
        }),
        ngayXuatKho: nhapkho.ngayXuatKho._i,
        ngayYeuCau: nhapkho.ngayXuatKho._i,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuXuatKhoThanhPham/${id}`,
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
      "Tạo phiếu xuất kho thành phẩm "
    ) : type === "edit" ? (
      <span>
        Chỉnh sửa phiếu xuất kho thành phẩm -{" "}
        <Tag
          color={
            info && info.tinhTrang === "Đã duyệt"
              ? "green"
              : info && info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : "red"
          }
        >
          {info.maPhieuXuatKhoThanhPham} - {info.tinhTrang}
        </Tag>
      </span>
    ) : type === "detail" ? (
      <span>
        Chi tiết phiếu xuất kho thành phẩm -{" "}
        <Tag
          color={
            info && info.tinhTrang === "Đã duyệt"
              ? "green"
              : info && info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : "red"
          }
        >
          {info.maPhieuXuatKhoThanhPham} - {info.tinhTrang}
        </Tag>
      </span>
    ) : (
      <span>
        Xác nhận phiếu xuất kho thành phẩm -{" "}
        <Tag
          color={
            info && info.tinhTrang === "Đã duyệt"
              ? "green"
              : info && info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : "red"
          }
        >
          {info.maPhieuXuatKhoThanhPham} - {info.tinhTrang}
        </Tag>
      </span>
    );
  const addSanPham = (vaL) => {
    let check = false;
    ListSanPham.forEach((sp) => {
      if (sp.chiTietKho_Id === vaL.chiTietKho_Id) check = true;
    });
    if (!check) {
      setListSoLuong([
        ...ListSoLuong,
        {
          chiTietKho_Id: vaL.chiTietKho_Id,
          soLuongXuat: vaL.soLuongXuat,
        },
      ]);
      setListSanPham([...ListSanPham, vaL]);
      setFieldTouch(true);
    } else {
      Helpers.alertWarning("Sản phẩm theo vị trí trên đã được thêm");
    }
  };

  const dataList = reDataForTable(ListSanPham);
  const hanldeSelectXuong = (val) => {
    setDisableThemSanPham(true);
    getKho(val);
    setFieldsValue({
      phieunhapkho: {
        cauTrucKho_Id: null,
      },
    });
  };
  const handleSelectKho = (val) => {
    setKho(val);
    setDisableThemSanPham(false);
  };
  const saveDuyetTuChoi = (isDuyet) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuXuatKhoThanhPham/duyet/${id}`,
          "PUT",
          {
            id: id,
            lyDoTuChoi: !isDuyet ? "Từ chối" : undefined,
          },
          !isDuyet ? "TUCHOI" : "XACNHAN",
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
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt phiếu xuất kho",
    onOk: () => {
      saveDuyetTuChoi(true);
    },
  };
  const modalDuyet = () => {
    Modal(prop);
  };
  const prop1 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận từ chối phiếu xuất kho",
    onOk: () => {
      saveDuyetTuChoi(false);
    },
  };
  const modalTuChoi = () => {
    Modal(prop1);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={formTitle}
        back={goBack}
        // buttons={addButtonRender()}
      />
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
                label="Người lập"
                name={["phieunhapkho", "userLap_Id"]}
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
            <Col span={12}>
              <FormItem
                label="Bộ phận"
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
                  placeholder="Chọn bộ phận"
                  optionsvalue={["id", "tenPhongBan"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" ? false : true}
                  onSelect={hanldeSelectXuong}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Kho"
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
                  onSelect={handleSelectKho}
                  disabled={type === "new" ? false : true}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Ngày xuất"
                name={["phieunhapkho", "ngayXuatKho"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY HH:mm"}
                  disabled={true}
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      phieunhapkho: {
                        ngayXuatKho: moment(dateString, "DD/MM/YYYY HH:mm"),
                      },
                    });
                  }}
                />
              </FormItem>
            </Col>
            {/* <Col span={12}>
              <FormItem
                label="Kệ"
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
                  data={ListKe}
                  placeholder="Chọn kệ"
                  optionsvalue={["ke_Id", "tenKe"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                  onSelect={handleSelectKe}
                />
              </FormItem>
            </Col> */}
            {type === "new" ? (
              <>
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
                    icon={<ShoppingCartOutlined />}
                    type="primary"
                    onClick={() => setActiveModal(true)}
                    disabled={DisableThemSanPham}
                  >
                    Chọn sản phẩm
                  </Button>
                </Col>
              </>
            ) : null}
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
        />
        {type === "new" ||
        (type === "edit" && info.tinhTrang === "Chưa duyệt") ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        ) : null}
        {type === "xacnhan" && info.tinhTrang === "Chưa duyệt" ? (
          <>
            <Divider />
            <Row style={{ marginTop: 20 }}>
              <Col style={{ marginBottom: 8, textAlign: "center" }} span={24}>
                <Button
                  className="th-margin-bottom-0"
                  icon={<RollbackOutlined />}
                  onClick={goBack}
                  style={{ marginTop: 10 }}
                >
                  Quay lại
                </Button>
                <Button
                  className="th-margin-bottom-0"
                  type="primary"
                  onClick={() => modalDuyet()}
                  icon={<SaveOutlined />}
                  style={{ marginTop: 10 }}
                >
                  Duyệt
                </Button>
                <Button
                  className="th-margin-bottom-0"
                  icon={<CloseOutlined />}
                  style={{ marginTop: 10 }}
                  onClick={() => modalTuChoi()}
                  type="danger"
                >
                  Từ chối
                </Button>
              </Col>
            </Row>
          </>
        ) : null}
        <ModalThemKe
          openModal={ActiveModal}
          openModalFS={setActiveModal}
          addKe={addSanPham}
          cauTrucKho_Id={Kho}
        />
      </Card>
    </div>
  );
};

export default ThanhPhamForm;
