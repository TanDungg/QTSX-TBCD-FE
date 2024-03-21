import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Tag,
  Button,
  Upload,
  Divider,
} from "antd";
import { includes, map } from "lodash";
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
import { BASE_URL_API, DEFAULT_FORM_170PX } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  renderPDF,
} from "src/util/Common";
import ModalTuChoi from "./ModalTuChoi";
import ModalChonViTri from "./ModalChonViTri";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const NhapKhoVatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [ListPhieuKiemTra, setListPhieuKiemTra] = useState([]);
  const [ListPhieuNhanHang, setListPhieuNhanHang] = useState([]);
  const [ActiveModalChonViTri, setActiveModalChonViTri] = useState(false);
  const [ViTri, setViTri] = useState(false);
  const [ListUserKy, setListUserKy] = useState([]);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  const [FileChungTu, setFileChungTu] = useState();
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getUserLap(INFO);
          getUserKy(INFO);
          getListPhieuKiemTra();
          getPhieuNhanHang();
          getKho();
          setFieldsValue({
            phieunhapkhovattu: {
              ngayNhapKho: moment(
                moment().format("DD/MM/YYYY HH:mm:ss"),
                "DD/MM/YYYY HH:mm:ss"
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
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/user-by-dv-pb?${params}`,
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
            nguoiKiemTra: `${dt.maNhanVien} - ${dt.fullName}`,
          };
        });
        setListUserKy(newData);
      } else {
        setListUserKy([]);
      }
    });
  };

  const getUserLap = (info, nguoiTao_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiTao_Id ? nguoiTao_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiTao_Id ? nguoiTao_Id : info.user_Id}?${params}`,
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
          phieunhapkhovattu: {
            nguoiTao_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };

  const getKho = (cautruckho) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=false`,
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

  const getListPhieuKiemTra = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhapKhoVatTu/phieu-kiem-tra-vat-tu-chua-nhap`,
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
        setListPhieuKiemTra(res.data);
      } else {
        setListPhieuKiemTra([]);
      }
    });
  };

  const getPhieuNhanHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhanHang?page=-1`,
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
        setListPhieuNhanHang(res.data);
      } else {
        setListPhieuNhanHang([]);
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
          `tits_qtsx_PhieuNhapKhoVatTu/${id}`,
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
          const newData =
            res.data.tits_qtsx_PhieuNhapKhoVatTuChiTiets &&
            JSON.parse(res.data.tits_qtsx_PhieuNhapKhoVatTuChiTiets).map(
              (data) => {
                return {
                  ...data,
                  soLuongChuaNhap: data.soLuongChuaNhap
                    ? data.soLuongChuaNhap
                    : 0,
                };
              }
            );
          setListVatTu(newData);
          getUserLap(INFO, res.data.nguoiTao_Id);
          getUserKy(INFO);
          getListPhieuKiemTra();
          getPhieuNhanHang();
          getKho(res.data.tits_qtsx_CauTrucKho_Id);
          setFileChungTu(res.data.fileChungTu);
          setFieldsValue({
            phieunhapkhovattu: {
              ...res.data,
              fileChungTu:
                res.data.fileChungTu === "" ? null : res.data.fileChungTu,
              ngayNhapKho: res.data.ngayNhapKho
                ? moment(res.data.ngayNhapKho, "DD/MM/YYYY HH:mm:ss")
                : null,
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

  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter(
      (d) => d.tits_qtsx_PhieuNhanHang_Id !== item.tits_qtsx_PhieuNhanHang_Id
    );
    setListVatTu(newData);
  };

  const actionContent = (item) => {
    const deleteItemVal =
      permission &&
      permission.del &&
      type === "edit" &&
      info.tinhTrang === "Chưa xác nhận"
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

  const HandleChonViTri = (record, check) => {
    setActiveModalChonViTri(true);
    setViTri({
      ...record,
    });
  };

  const handleViTriLuuKho = (data) => {
    const newData = ListVatTu.map((vattu) => {
      if (
        vattu.tits_qtsx_VatTu_Id.toLowerCase() ===
        data.tits_qtsx_VatTu_Id.toLowerCase()
      ) {
        const tong =
          data.list_ViTriLuuKhos &&
          data.list_ViTriLuuKhos.reduce(
            (tong, vitri) => tong + Number(vitri.soLuong || 0),
            0
          );
        return {
          ...vattu,
          soLuong: tong,
          list_ViTriLuuKhos: data.list_ViTriLuuKhos,
        };
      }
      return vattu;
    });
    setListVatTu(newData);
    setFieldTouch(true);
  };

  const renderViTri = (record) => {
    return (
      <div>
        {record.list_ViTriLuuKhos.map((vt) => {
          const vitri = `${vt.tenKe && vt.tenKe}${
            vt.tenTang ? ` - ${vt.tenTang}` : ""
          }${vt.tenNgan ? ` - ${vt.tenNgan}` : ""}`;
          return (
            <Tag
              color="blue"
              style={{
                fontSize: 13,
                marginRight: 5,
                marginBottom: 3,
                wordWrap: "break-word",
                whiteSpace: "normal",
              }}
            >
              {vitri} (SL: {vt.soLuong})
            </Tag>
          );
        })}
        {type === "edit" && info.tinhTrang === "Chưa xác nhận" && (
          <EditOutlined
            style={{
              color: "#0469B9",
            }}
            onClick={() => {
              HandleChonViTri(record, true);
            }}
          />
        )}
      </div>
    );
  };

  const changeGhiChu = (val, item) => {
    const ghiChu = val.target.value;
    const newData = [...ListVatTu];
    newData.forEach((vt, index) => {
      if (
        vt.tits_qtsx_VatTu_Id.toLowerCase() ===
        item.tits_qtsx_VatTu_Id.toLowerCase()
      ) {
        vt.moTa = ghiChu;
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
          value={item.moTa}
          onChange={(val) => changeGhiChu(val, item)}
          disabled={
            type === "edit" && info.tinhTrang === "Chưa xác nhận" ? false : true
          }
        />
      </>
    );
  };
  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
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
      title: "Phiếu mua hàng",
      dataIndex: "maPhieuMuaHang",
      key: "maPhieuMuaHang",
      align: "center",
    },
    {
      title: "Số lượng còn lại",
      dataIndex: "soLuongChuaNhap",
      key: "soLuongChuaNhap",
      align: "center",
    },
    {
      title: "Số lượng nhập",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Vị trí nhập",
      key: "list_ViTriLuuKhos",
      align: "center",
      render: (record) => renderViTri(record),
    },
    {
      title: "Ghi chú",
      key: "moTa",
      align: "center",
      render: (record) => renderGhiChu(record),
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

  const onFinish = (values) => {
    uploadFile(values.phieunhapkhovattu);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          if (form.getFieldValue("phieunhapkhovattu").inVoid && !FileChungTu) {
            Helpers.alertError("File chứng từ chưa được thêm");
          } else {
            uploadFile(values.phieunhapkhovattu, val);
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (phieunhapkhovattu, saveQuit) => {
    if (type === "edit" && FileChungTu) {
      const formData = new FormData();
      formData.append("file", FileChungTu);
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Upload?stringPath=${
              FileChungTu.name ? (info.fileChungTu ? info.fileChungTu : "") : ""
            }`,
            "POST",
            formData,
            "UPLOAD",
            "",
            resolve,
            reject,
            true
          )
        );
      })
        .then((res) => {
          if (res && res.status === 200) {
            phieunhapkhovattu.fileChungTu = res.data.path;
            saveData(phieunhapkhovattu, saveQuit);
          }
        })
        .catch((error) => console.error(error));
    } else {
      if (info.fileChungTu) {
        dispatch(
          fetchStart(
            `Upload/delete-image?stringPath=${info.fileChungTu}`,
            "POST",
            null,
            "DELETEUPLOAD",
            ""
          )
        );
      }
      phieunhapkhovattu.fileChungTu = "";
      saveData(phieunhapkhovattu, saveQuit);
    }
  };

  const saveData = (phieunhapkhovattu, saveQuit = false) => {
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuNhapKhoVatTu`,
            "POST",
            phieunhapkhovattu,
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
              getUserKy(INFO);
              getListPhieuKiemTra();
              getPhieuNhanHang();
              getKho();
              setFileChungTu([]);
              setFieldsValue({
                phieunhapkhovattu: {
                  ngayNhapKho: moment(
                    moment().format("DD/MM/YYYY HH:mm:ss"),
                    "DD/MM/YYYY HH:mm:ss"
                  ),
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
    } else if (type === "edit" && info.tinhTrang === "Chưa xác nhận") {
      phieunhapkhovattu.id = id;
      phieunhapkhovattu.tits_qtsx_PhieuNhapKhoVatTuChiTiets = ListVatTu;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuNhapKhoVatTu/${id}`,
            "PUT",
            phieunhapkhovattu,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              if (res.status !== 409) {
                getInfo(id);
                setFieldTouch(false);
              } else {
                setFieldTouch(false);
              }
            }
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit" && info.tinhTrang === "Đã xác nhận") {
      phieunhapkhovattu.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuNhapKhoVatTu/put-file-chung-tu/${id}`,
            "PUT",
            phieunhapkhovattu,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              if (res.status !== 409) {
                getInfo(id);
                setFieldTouch(false);
              } else {
                setFieldTouch(false);
              }
            }
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const hanldeXacNhan = () => {
    const newData = {
      id: id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhapKhoVatTu/duyet/${id}`,
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
    title: "Xác nhận phiếu nhập kho vật tư",
    onOk: hanldeXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const saveTuChoi = (data) => {
    const newData = {
      id: id,
      isDuyet: false,
      lyDoDuyetTuChoi: data,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhapKhoVatTu/duyet/${id}`,
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
      "Tạo phiếu nhập kho vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhập kho vật tư"
    ) : (
      <span>
        Chi tiết phiếu nhập kho vật tư -{" "}
        <Tag color={"blue"} style={{ fontSize: 15 }}>
          {info.maPhieu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa xác nhận"
              ? "orange"
              : info.tinhTrang === "Đã xác nhận"
              ? "blue"
              : "red"
          }
          style={{ fontSize: 15 }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );

  const props = {
    beforeUpload: (file) => {
      setFileChungTu(file);
      return false;
    },
    showUploadList: false,
    maxCount: 1,
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu nhập kho vật tư"}
      >
        <Form
          {...DEFAULT_FORM_170PX}
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
                label="Người nhập"
                name={["phieunhapkhovattu", "nguoiTao_Id"]}
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
                name={["phieunhapkhovattu", "tenPhongBan"]}
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
              {type === "new" ? (
                <FormItem
                  label="Phiếu kiểm tra"
                  name={["phieunhapkhovattu", "tits_qtsx_PhieuKiemTraVatTu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListPhieuKiemTra}
                    placeholder="Chọn phiếu kiểm tra vật tư"
                    optionsvalue={[
                      "tits_qtsx_PhieuKiemTraVatTu_Id",
                      "maPhieuKiemTraVatTu",
                    ]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={true}
                  />
                </FormItem>
              ) : (
                <FormItem
                  label="Phiếu kiểm tra"
                  name={["phieunhapkhovattu", "maPhieuKiemTraVatTu"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input className="input-item" disabled={true} />
                </FormItem>
              )}
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
                label="Phiếu nhận hàng"
                name={["phieunhapkhovattu", "tits_qtsx_PhieuNhanHang_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListPhieuNhanHang}
                  placeholder="Phiếu nhận hàng"
                  optionsvalue={["id", "maPhieu"]}
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
                label="Kho nhập"
                name={["phieunhapkhovattu", "tits_qtsx_CauTrucKho_Id"]}
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
                  optionsvalue={["id", "tenCauTrucKho"]}
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
              style={{ marginBottom: 8 }}
            >
              <FormItem
                label="Ngày nhập kho"
                name={["phieunhapkhovattu", "ngayNhapKho"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY HH:mm:ss"}
                  showTime
                  disabled={
                    type === "edit" && info.tinhTrang === "Chưa xác nhận"
                      ? false
                      : true
                  }
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      phieunhapkhovattu: {
                        ngayNhapKho: moment(dateString, "DD/MM/YYYY HH:mm:ss"),
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
                label="In Voice"
                name={["phieunhapkhovattu", "inVoid"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="In Void"
                  disabled={type === "edit" ? false : true}
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
                label="Nội dung nhập"
                name={["phieunhapkhovattu", "noiDung"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nội dung nhập"
                  disabled={
                    type === "edit" && info.tinhTrang === "Chưa xác nhận"
                      ? false
                      : true
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
                label="Người giao"
                name={["phieunhapkhovattu", "nguoiGiao_Id"]}
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
                  placeholder="Người giao"
                  optionsvalue={["user_Id", "nguoiKiemTra"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={
                    type === "edit" && info.tinhTrang === "Chưa xác nhận"
                      ? false
                      : true
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
                name={["phieunhapkhovattu", "nguoiDuyet_Id"]}
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
                  placeholder="Người duyệt"
                  optionsvalue={["user_Id", "nguoiKiemTra"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={
                    type === "edit" && info.tinhTrang === "Chưa xác nhận"
                      ? false
                      : true
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
              <Form.Item
                label={`File chứng từ `}
                name={["phieunhapkhovattu", `fileChungTu`]}
                rules={[
                  {
                    type: "file",
                  },
                ]}
              >
                {!FileChungTu ? (
                  <Upload {...props}>
                    <Button
                      style={{ marginBottom: 0 }}
                      icon={<UploadOutlined />}
                      disabled={type === "xacnhan" || type === "detail"}
                    >
                      File chứng từ
                    </Button>
                  </Upload>
                ) : FileChungTu.name ? (
                  <span>
                    <span
                      style={{
                        color: "#0469B9",
                        cursor: "pointer",
                        whiteSpace: "break-spaces",
                        // wordBreak: "break-all",
                      }}
                      onClick={() => renderPDF(FileChungTu && FileChungTu)}
                    >
                      {FileChungTu.name}{" "}
                    </span>
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={type === "edit" ? false : true}
                      onClick={() => {
                        setFieldTouch(true);
                        setFileChungTu();
                        setFieldsValue({
                          phieunhapkhovattu: {
                            fileChungTu: null,
                          },
                        });
                      }}
                    />
                  </span>
                ) : (
                  <span>
                    <a
                      style={{
                        whiteSpace: "break-spaces",
                        wordBreak: "break-all",
                      }}
                      target="_blank"
                      href={BASE_URL_API + FileChungTu}
                      rel="noopener noreferrer"
                    >
                      {FileChungTu && FileChungTu.split("/")[5]}{" "}
                    </a>
                    {type === "edit" && (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={type === "edit" ? false : true}
                        onClick={() => {
                          setFieldTouch(true);
                          setFileChungTu();
                          setFieldsValue({
                            phieunhapkhovattu: {
                              fileChungTu: null,
                            },
                          });
                        }}
                      />
                    )}
                  </span>
                )}
              </Form.Item>
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
                  name={["phieunhapkhovattu", "lyDoDuyetTuChoi"]}
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
          </Row>
        </Form>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách vật tư"}
      >
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListVatTu && ListVatTu)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      {type === "xacnhan" && info.tinhTrang === "Chưa xác nhận" && (
        <>
          <Divider />
          <div
            style={{
              marginTop: "5px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              icon={<RollbackOutlined />}
              className="th-margin-bottom-0"
              type="default"
              onClick={goBack}
            >
              Quay lại
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={modalXK}
              disabled={info.tinhTrang !== "Chưa xác nhận"}
            >
              Xác nhận
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              className="th-margin-bottom-0"
              type="danger"
              onClick={() => setActiveModalTuChoi(true)}
              disabled={info.tinhTrang !== "Chưa xác nhận"}
            >
              Từ chối
            </Button>
          </div>
        </>
      )}
      {type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch}
        />
      ) : null}
      <ModalChonViTri
        openModal={ActiveModalChonViTri}
        openModalFS={setActiveModalChonViTri}
        itemData={{
          tits_qtsx_CauTrucKho_Id: info.tits_qtsx_CauTrucKho_Id,
          ListViTri: ViTri,
        }}
        ViTriLuuKho={handleViTriLuuKho}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default NhapKhoVatTuForm;
