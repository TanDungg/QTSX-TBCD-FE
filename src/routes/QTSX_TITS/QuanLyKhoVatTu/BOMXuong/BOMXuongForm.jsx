import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Row,
  Spin,
  Tag,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes, isEmpty, map } from "lodash";
import {
  Input,
  Select,
  FormSubmit,
  ModalDeleteConfirm,
  EditableTableRow,
  Table,
  Modal,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM, XUONG_GCCT } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  isJsonObject,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  DeleteOutlined,
  RollbackOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import ModalAddVatTu from "./ModalAddVatTu";
import Helpers from "src/helpers";
const { EditableRow, EditableCell } = EditableTableRow;

const FormItem = Form.Item;

function BOMXuongForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListDMVTThep, setListDMVTThep] = useState([]);

  const [ListChiTiet, setListChiTiet] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);

  const [ActiveModal, setActiveModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState([]);
  const [LoXe, setLoXe] = useState();

  const [info, setInfo] = useState({});
  const [fieldTouch, setFieldTouch] = useState(false);
  const [DisableGCCT, setDisableGCCT] = useState();

  const { setFieldsValue, validateFields, resetFields } = form;

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getXuong();
        getListSanPham();
        getUserKy(INFO);
        getUserLap();
        setFieldsValue({
          BOM: {
            ngay: moment(getDateNow(), "DD/MM/YYYY"),
          },
        });
      }
    } else if (includes(match.url, "chinh-sua")) {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getListSanPham();
        }
      }
    } else if (includes(match.url, "xac-nhan")) {
      if (permission && !permission.cof) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("xacnhan");
          setId(match.params.id);
          getInfo(match.params.id);
          getListSanPham();
        }
      }
    } else if (includes(match.url, "chi-tiet")) {
      if (permission && !permission.cof) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("detail");
          setId(match.params.id);
          getInfo(match.params.id);
          getListSanPham();
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getUserLap = (nguoiLap_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/${nguoiLap_Id ? nguoiLap_Id : INFO.user_Id}`,
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
          BOM: {
            userLapPhieu_Id: res.data.id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };
  const getUserKy = (info) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/user-by-dv-pb?donVi_Id=${info.donVi_Id}`,
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
            user: `${dt.maNhanVien} - ${dt.fullName}`,
          };
        });
        setListUserKy(newData);
      } else {
        setListUserKy([]);
      }
    });
  };
  const getDMVatTuThep = (val) => {
    const params = convertObjectToUrlParams({
      isThepTam: val === "true",
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_DinhMucVatTuThep?${params}`,
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
        setListDMVTThep(res.data);
      } else {
        setListDMVTThep([]);
      }
    });
  };
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
          setListSanPham(
            res.data.map((sp) => {
              return {
                ...sp,
                name: sp.maSanPham + " - " + sp.tenSanPham,
              };
            })
          );
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getChiTietDmVatTuThep = (val) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_DinhMucVatTuThep/${val}`,
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
          setListChiTiet(
            res.data.list_ChiTiets.map((ct) => {
              return {
                ...ct,
                chung: ct.quyCach.chung,
                dai: ct.quyCach.dai,
                day: ct.quyCach.day,
                dn: ct.quyCach.dn,
                dt: ct.quyCach.dt,
                rong: ct.quyCach.rong,
                dinhMuc: LoXe ? Number(1 / LoXe).toFixed(3) : "",
                yeuCauGiao: 1,
                tits_qtsx_VatTuChiTiet_Id: ct.tits_qtsx_VatTu_Id,
              };
            })
          );
        } else {
          setListChiTiet([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_Xuong?page=-1",
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
          setListXuong(res.data);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
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
          `tits_qtsx_BOMXuong/${id}`,
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
          getUserKy(INFO);
          getXuong();
          setLoXe(res.data.soLuongLo);
          getUserLap(res.data.createdBy);
          setListChiTiet(
            JSON.parse(res.data.tits_qtsx_BOMXuongChiTiets).map((ct) => {
              return {
                ...ct,
                dai: isJsonObject(ct.quyCach) ? JSON.parse(ct.quyCach).dai : "",
                rong: isJsonObject(ct.quyCach)
                  ? JSON.parse(ct.quyCach).rong
                  : "",
                day: isJsonObject(ct.quyCach) ? JSON.parse(ct.quyCach).day : "",
                dn: isJsonObject(ct.quyCach) ? JSON.parse(ct.quyCach).dn : "",
                dt: isJsonObject(ct.quyCach) ? JSON.parse(ct.quyCach).dt : "",
                chung: isJsonObject(ct.quyCach)
                  ? JSON.parse(ct.quyCach).chung
                  : "",
                maVatTu: ct.maVatTuChiTiet,
                tenVatTu: ct.tenVatTuChiTiet,
                yeuCauGiao: Number(ct.yeuCauGiao).toFixed(0),
              };
            })
          );

          res.data.isThepTam &&
            getDMVatTuThep(res.data.isThepTam ? "true" : "false");

          res.data.tits_qtsx_Xuong_Id === XUONG_GCCT
            ? setDisableGCCT(true)
            : setDisableGCCT(false);
          setFieldsValue({
            BOM: {
              ...res.data,
              isThepTam: res.data.isThepTam
                ? res.data.isThepTam === true
                  ? "true"
                  : "false"
                : null,
              ngay: moment(res.data.ngay, "DD/MM/YYYY"),
            },
          });
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
    const title = "chi tiết";
    ModalDeleteConfirm(deleteItemAction, item, item.maVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListChiTiet.filter(
      (d) => d.tits_qtsx_VatTuChiTiet_Id !== item.tits_qtsx_VatTuChiTiet_Id
    );
    setListChiTiet(newData);
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      type === "new" || type === "edit"
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
    if (isEmpty(soLuongNhap) || Number(soLuongNhap) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) => d.tits_qtsx_VatTuChiTiet_Id !== item.tits_qtsx_VatTuChiTiet_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListChiTiet];
    newData.forEach((ct, index) => {
      if (ct.tits_qtsx_VatTuChiTiet_Id === item.tits_qtsx_VatTuChiTiet_Id) {
        ct.dinhMuc = LoXe ? Number(soLuongNhap / LoXe).toFixed(3) : "";
        ct.yeuCauGiao = soLuongNhap;
      }
    });
    setListChiTiet(newData);
  };

  const rendersoLuong = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.tits_qtsx_VatTuChiTiet_Id === item.tits_qtsx_VatTuChiTiet_Id) {
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
          value={item.yeuCauGiao}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  let colValues = () => {
    return [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 45,
        align: "center",
      },
      {
        title: DisableGCCT === true ? "Mã vật tư" : "Mã chi tiết",
        dataIndex: "maVatTu",
        key: "maVatTu",
        align: "center",
      },
      {
        title: DisableGCCT === true ? "Tên vật tư" : "Tên chi tiết",
        dataIndex: "tenVatTu",
        key: "tenVatTu",
        align: "center",
      },
      {
        title: "Vật liệu",
        dataIndex: "vatLieu",
        key: "vatLieu",
        align: "center",
      },
      {
        title: "Quy cách chi tiết(mm)",
        key: "quyCach",
        align: "center",
        children: [
          {
            title: "Dài",
            dataIndex: "dai",
            key: "dai",
            align: "center",
            width: 50,
          },
          {
            title: "Rộng",
            dataIndex: "rong",
            key: "rong",
            align: "center",
            width: 50,
          },
          {
            title: "Dày",
            dataIndex: "day",
            key: "day",
            align: "center",
            width: 50,
          },
          {
            title: "Dn",
            dataIndex: "dn",
            key: "dn",
            align: "center",
            width: 50,
          },
          {
            title: "Dt",
            dataIndex: "dt",
            key: "dt",
            align: "center",
            width: 50,
          },
          {
            title: "Chung",
            dataIndex: "chung",
            key: "chung",
            align: "center",
            width: 55,
          },
        ],
      },
      {
        title: "Đơn vị tính",
        dataIndex: "tenDonViTinh",
        key: "tenDonViTinh",
        align: "center",
      },
      {
        title: "SL/SP",
        dataIndex: "dinhMuc",
        key: "dinhMuc",
        align: "center",
      },
      {
        title: "Yêu cầu giao",
        // dataIndex: "moTa",
        key: "yeuCauGiao",
        align: "center",
        render: (val) => rendersoLuong(val),
      },
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 80,
        render: (value) => actionContent(value),
      },
    ];
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

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.BOM);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        saveData(values.BOM, value);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (BOM, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...BOM,
        isThepTam: BOM.isThepTam ? BOM.isThepTam === "true" : null,
        ngay: BOM.ngay.format("DD/MM/YYYY"),
        tits_qtsx_BOMXuongChiTiets: ListChiTiet,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BOMXuong`,
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
              resetFields();
              setFieldTouch(false);
              setListChiTiet([]);
              // setFileName(null);
              getUserLap();
              setFieldsValue({
                BOM: {
                  ngay: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit") {
      const newData = {
        ...info,
        ...BOM,
        ngay: BOM.ngay.format("DD/MM/YYYY"),
        isThepTam: BOM.isThepTam ? BOM.isThepTam === "true" : null,
        tits_qtsx_BOMXuongChiTiets: ListChiTiet,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BOMXuong/${id}`,
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
  const saveDuyetTuChoi = (isDuyet) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BOMXuong/duyet/${id}`,
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
    title: "Xác nhận duyệt BOM Xưởng",
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
    title: "Xác nhận từ chối BOM Xưởng",
    onOk: () => {
      saveDuyetTuChoi(false);
    },
  };
  const modalTuChoi = () => {
    Modal(prop1);
  };
  const addChiTiet = (data) => {
    let check = false;
    ListChiTiet.forEach((ct) => {
      if (
        ct.tits_qtsx_VatTuChiTiet_Id.toLowerCase() ===
        data.tits_qtsx_VatTuChiTiet_Id.toLowerCase()
      ) {
        Helpers.alertWarning(`Chi tiết ${data.tenVatTu} đã được thêm`);
        check = true;
      }
    });
    if (!check) {
      setFieldTouch(true);
      setListChiTiet([
        ...ListChiTiet,
        {
          ...data,
          dinhMuc: LoXe ? Number(data.yeuCauGiao / LoXe).toFixed(3) : "",
        },
      ]);
    }
  };
  /**
   * Quay lại trang sản phẩm
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new"
          ? "/them-moi"
          : type === "edit"
          ? `/${match.params.id}/chinh-sua`
          : type === "xacnhan"
          ? `/${match.params.id}/xac-nhan`
          : `/${match.params.id}/chi-tiet`,
        ""
      )}`
    );
  };
  const formTitle =
    type === "new" ? (
      "Thêm mới định mức BOM Xưởng"
    ) : type === "edit" ? (
      "Chỉnh sửa định mức BOM Xưởng"
    ) : type === "xacnhan" ? (
      <span>
        Duyệt định mức BOM Xưởng{" "}
        <Tag
          style={{ fontSize: 14 }}
          color={
            info && info.tinhTrang === "Đã duyệt bởi PT bộ phận"
              ? "green"
              : info && info.tinhTrang === "Chưa xử lý"
              ? "blue"
              : "red"
          }
        >
          {info && info.maBOMXuong} - {info && info.tinhTrang}
        </Tag>
      </span>
    ) : (
      <span>
        Chi tiết định mức BOM Xưởng{" "}
        <Tag
          style={{ fontSize: 14 }}
          color={
            info && info.tinhTrang === "Đã duyệt bởi PT bộ phận"
              ? "green"
              : info && info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : "red"
          }
        >
          {info && info.maBOMXuong} - {info && info.tinhTrang}
        </Tag>
      </span>
    );

  // const RowStyle = (current, index) => {
  //   if (HangTrung.length > 0) {
  //     if (
  //       HangTrung.some(
  //         (maVatTuChiTiet) => current.maVatTuChiTiety === maVatTuChiTiet
  //       )
  //     ) {
  //       return "red-row";
  //     }
  //   }
  //   if (current.tenVatTuChiTiet === undefined) {
  //     setFieldTouch(false);
  //     setMessageError("Tên chi tiết không được rỗng");
  //     return "red-row";
  //   }
  //   if (current.maVatTuChiTiet === undefined) {
  //     setFieldTouch(false);
  //     setMessageError("Mã chi tiết không được rỗng");
  //     return "red-row";
  //   }
  //   if (DataLoi && DataLoi.length > 0) {
  //     if (
  //       DataLoi.some(
  //         (dt) =>
  //           current.maVatTuChiTiet.toString() === dt.maVatTuChiTiet.toString()
  //       )
  //     ) {
  //       setFieldTouch(false);
  //       return "red-row";
  //     }
  //   }
  //   return "";
  // };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin định mức vật tư xưởng"}
      >
        <Spin spinning={loading}>
          <Form
            {...DEFAULT_FORM_CUSTOM}
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
                  name={["BOM", "userLapPhieu_Id"]}
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
                    optionsvalue={["id", "fullName"]}
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
                  name={["BOM", "tenPhongBan"]}
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
                  name={["BOM", "tits_qtsx_Xuong_Id"]}
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
                    optionsvalue={["id", "tenXuong"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new" && type !== "edit"}
                    onSelect={(val) => {
                      if (val === XUONG_GCCT) {
                        setDisableGCCT(true);
                      } else {
                        setDisableGCCT(false);
                      }
                    }}
                  />
                </FormItem>
              </Col>
              {DisableGCCT && (
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
                    label="Loại thép"
                    name={["BOM", "isThepTam"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      data={[
                        {
                          id: "true",
                          name: "Thép tấm",
                        },
                        { id: "false", name: "Thép H" },
                      ]}
                      optionsvalue={["id", "name"]}
                      placeholder="Chọn loại thép"
                      style={{ width: "100%" }}
                      disabled={type !== "new" && type !== "edit"}
                      onSelect={(val) => {
                        getDMVatTuThep(val);
                        setListChiTiet([]);
                        setFieldsValue({
                          BOM: {
                            tits_qtsx_DinhMucVatTuThep_Id: null,
                          },
                        });
                      }}
                    />
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
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Ngày lập phiếu"
                  name={["BOM", "ngay"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    disabled={type !== "new" && type !== "edit"}
                    allowClear={false}
                    onChange={(dates, dateString) => {
                      setFieldsValue({
                        BOM: {
                          ngay: moment(dateString, "DD/MM/YYYY"),
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
                  label="Sản phẩm"
                  name={["BOM", "tits_qtsx_SanPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListSanPham}
                    placeholder="Chọn sản phẩm"
                    optionsvalue={["id", "name"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new" && type !== "edit"}
                  />
                </FormItem>
              </Col>
              {DisableGCCT && (
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
                    label="ĐM vật tư thép"
                    name={["BOM", "tits_qtsx_DinhMucVatTuThep_Id"]}
                    rules={[
                      {
                        type: "string",
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      data={ListDMVTThep}
                      placeholder="Chọn Định mức vật tư thép"
                      optionsvalue={[
                        "tits_qtsx_DinhMucVatTuThep_Id",
                        "maDinhMucVatTuThep",
                      ]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="name"
                      disabled={type !== "new" && type !== "edit"}
                      onSelect={(val) => getChiTietDmVatTuThep(val)}
                    />
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
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Lô xe"
                  name={["BOM", "soLuongLo"]}
                  rules={[
                    {
                      required: true,
                    },
                    {
                      pattern: /^[1-9]\d*$/,
                      message: "Lô xe không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập lô xe"
                    type="number"
                    disabled={type !== "new" && type !== "edit"}
                    onChange={(e) => {
                      setLoXe(e.target.value);
                      if (ListChiTiet.length > 0) {
                        setListChiTiet([
                          ...ListChiTiet.map((ct) => {
                            return {
                              ...ct,
                              dinhMuc: Number(
                                ct.yeuCauGiao / e.target.value
                              ).toFixed(3),
                            };
                          }),
                        ]);
                      }
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
                  label="PT bộ phận"
                  name={["BOM", "nguoiPTBoPhan_Id"]}
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
                    optionsvalue={["user_Id", "user"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new" && type !== "edit"}
                    onSelect={(val) => {}}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
      <Card className="th-card-margin-bottom" title="Danh sách chi tiết">
        {/* {type === "new" && (
          <>
            <Row style={{ marginTop: 5 }}>
              <Col
                xxl={2}
                xl={3}
                lg={4}
                md={4}
                sm={6}
                xs={7}
                style={{ marginTop: 8 }}
                align={"center"}
              >
                Import:
              </Col>
              <Col xxl={4} xl={5} lg={7} md={7} xs={17}>
                <Upload {...props}>
                  <Button
                    icon={<UploadOutlined />}
                    // danger={!fieldTouch}
                    disabled={SanPham === ""}
                  >
                    Tải dữ liệu lên
                  </Button>
                </Upload>
                {fileName && (
                  <>
                    <Popover
                      content={
                        fieldTouch ? (
                          fileName
                        ) : (
                          <Alert type="error" message={message} banner />
                        )
                      }
                    >
                      <p style={{ color: !fieldTouch ? "red" : "#1890ff" }}>
                        {fileName.length > 20
                          ? fileName.substring(0, 20) + "..."
                          : fileName}{" "}
                        <DeleteOutlined
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setListChiTiet([]);
                            setFileName(null);
                            setFieldTouch(false);
                          }}
                        />
                      </p>
                    </Popover>
                  </>
                )}
              </Col>
              <Col>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={TaiFileMau}
                  className="th-margin-bottom-0"
                  type="primary"
                  disabled={SanPham === ""}
                >
                  File mẫu
                </Button>
              </Col>
            </Row>
          </>
        )} */}
        {(type === "new" || type === "edit") && DisableGCCT === false ? (
          <Row>
            <Col span={24} align="end">
              <Button
                className="th-margin-bottom-0"
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => setActiveModal(true)}
              >
                Thêm chi tiết
              </Button>
            </Col>
          </Row>
        ) : null}
        <Table
          style={{ marginTop: 10 }}
          bordered
          scroll={{ x: 1000, y: "60vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListChiTiet)}
          size="small"
          loading={loading}
          // rowClassName={RowStyle}
          pagination={false}
        />
      </Card>
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          saveAndClose={saveAndClose}
          handleSave={saveAndClose}
          disabled={fieldTouch}
        />
      ) : null}
      {type === "xacnhan" && info && info.tinhTrang === "Chưa xử lý" && (
        <>
          <Divider />
          <Row>
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
      )}
      <ModalAddVatTu
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        addChiTiet={addChiTiet}
        ListChiTiet={ListChiTiet}
      />
    </div>
  );
}

export default BOMXuongForm;
