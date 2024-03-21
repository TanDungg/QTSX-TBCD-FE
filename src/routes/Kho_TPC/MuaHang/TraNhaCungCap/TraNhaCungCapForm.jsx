import {
  DeleteOutlined,
  PlusCircleOutlined,
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
  Divider,
  Upload,
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_DIEUCHUYEN_THANHLY,
} from "src/constants/Config";
import {
  FileName,
  convertObjectToUrlParams,
  createGuid,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalChonVatTu from "./ModalChonVatTu";
import ModalTuChoi from "./ModalTuChoi";
const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;
const TraNhaCungCapForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ListNhaCungCap, setListNhaCungCap] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListKhoVatTu, setListKhoVatTu] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListUserDuyet, setListUserDuyet] = useState([]);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(null);
  const [editingRecord, setEditingRecord] = useState([]);
  const [DisabledSave, setDisabledSave] = useState(true);
  const [DisableFileDinhKem, setDisableFileDinhKem] = useState(false);
  const [FileDinhKem, setFileDinhKem] = useState(null);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue({
            tranhacungcap: {
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
  const getData = () => {
    getNhaCungCap();
    getListKho();
    getUserLap(INFO, null);
    getUserDuyet(INFO);
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
          setListNhaCungCap(res.data);
        } else {
          setListNhaCungCap([]);
        }
      });
    }
  };

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&isThanhPham=false`,
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
          setListKhoVatTu(res.data);
        } else {
          setListKhoVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserLap = (info, nguoiLap_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/${nguoiLap_Id ? nguoiLap_Id : info.user_Id}`,
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
          tranhacungcap: {
            userLap_Id: res.data.id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

  const getUserDuyet = (info) => {
    const params = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-cbnv-thuoc-don-vi-va-co-quyen?${params}`,
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
        setListUserDuyet(res.data);
      } else {
        setListUserDuyet([]);
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
          `lkn_PhieuTraHangNCC/${id}?${params}`,
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
          getNhaCungCap();
          getUserDuyet(INFO);
          getListKho();
          getUserLap(INFO, res.data.userLap_Id);
          setFileDinhKem(res.data.fileDanhGiaChatLuong);
          setFieldsValue({
            tranhacungcap: {
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              benNhan_Id: res.data.benNhan_Id,
              benVanChuyen_Id: res.data.benVanChuyen_Id,
              userDuyet_Id: res.data.userDuyet_Id,
              fileDanhGiaChatLuong: res.data.fileDanhGiaChatLuong,
            },
          });

          const newData =
            res.data.chiTietVatTu &&
            JSON.parse(res.data.chiTietVatTu).map((data) => {
              const vitri = `${data.tenKe ? `${data.tenKe}` : ""}${
                data.tenTang ? ` - ${data.tenTang}` : ""
              }${data.tenNgan ? ` - ${data.tenNgan}` : ""}`;

              return {
                ...data,
                soLuongTraNCC: data.soLuongTraNCC,
                lkn_ChiTietKhoVatTu_Id: data.lkn_ChiTietKhoVatTu_Id
                  ? data.lkn_ChiTietKhoVatTu_Id.toLowerCase()
                  : createGuid(),
                vatTu: `${data.maVatTu} - ${data.tenVatTu}${
                  vitri ? ` (${vitri})` : ""
                }`,
              };
            });
          setListVatTu(newData ? newData : []);
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
    const newData = ListVatTu.filter((d) => d.maVatTu !== item.maVatTu);
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
  const handleInputChange = (val, item) => {
    const soLuongTraNCC = val.target.value;
    if (isEmpty(soLuongTraNCC) || Number(soLuongTraNCC) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (Number(soLuongTraNCC) > Number(item.soLuong)) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = `Số lượng phải nhỏ hơn số lượng trong kho ${item.soLuong}`;
    } else {
      const newData = editingRecord.filter(
        (d) => d.lkn_ChiTietKhoVatTu_Id !== item.lkn_ChiTietKhoVatTu_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
        ct.soLuongTraNCC = soLuongTraNCC;
      }
    });
    setListVatTu(newData);
  };

  const renderSoLuongTraNCC = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.lkn_ChiTietKhoVatTu_Id === item.lkn_ChiTietKhoVatTu_Id) {
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
          value={item.soLuongTraNCC}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
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
      title: "Tên kho",
      dataIndex: "tenCTKho",
      key: "tenCTKho",
      align: "center",
    },
    {
      title: "Tên kệ",
      dataIndex: "tenKe",
      key: "tenKe",
      align: "center",
    },
    {
      title: "Tên tầng",
      dataIndex: "tenTang",
      key: "tenTang",
      align: "center",
    },
    {
      title: "Tên ngăn",
      dataIndex: "tenNgan",
      key: "tenNgan",
      align: "center",
    },
    {
      title: "Số lượng",
      key: "soLuongTraNCC",
      align: "center",
      render: (record) => renderSoLuongTraNCC(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
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

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.tranhacungcap);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        saveData(values.tranhacungcap, value);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    const tokenInfo = getTokenInfo();
    if (type === "new") {
      if (ListVatTu.length === 0) {
        Helpers.alertError("Danh sách vật tư rỗng");
      } else {
        if (FileDinhKem === null) {
          const newData = {
            ...data,
            ngayYeuCau: data.ngayYeuCau.format("DD/MM/YYYY"),
            chiTiet_traHangNCCs: ListVatTu,
          };
          new Promise((resolve, reject) => {
            dispatch(
              fetchStart(
                `lkn_PhieuTraHangNCC`,
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
                  getUserLap(INFO);
                  setFieldsValue({
                    tranhacungcap: {
                      ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
                    },
                  });
                  setListVatTu([]);
                  setFileDinhKem(null);
                  setDisableFileDinhKem(false);
                }
              } else {
                setFieldTouch(false);
              }
            })
            .catch((error) => console.error(error));
        } else {
          const formData = new FormData();
          FileDinhKem !== null && formData.append("lstFiles", FileDinhKem);
          fetch(`${BASE_URL_API}/api/Upload/Multi`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(tokenInfo.token),
            },
          })
            .then((res) => res.json())
            .then((path) => {
              const newData = {
                ...data,
                ngayYeuCau: data.ngayYeuCau.format("DD/MM/YYYY"),
                fileDanhGiaChatLuong: path[0].path,
                chiTiet_traHangNCCs: ListVatTu,
              };
              new Promise((resolve, reject) => {
                dispatch(
                  fetchStart(
                    `lkn_PhieuTraHangNCC`,
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
                      getUserLap(INFO);
                      setFieldsValue({
                        tranhacungcap: {
                          ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
                        },
                      });
                      setListVatTu([]);
                      setFileDinhKem(null);
                      setDisableFileDinhKem(false);
                    }
                  } else {
                    setFieldTouch(false);
                  }
                })
                .catch((error) => console.error(error));
            });
        }
      }
    }
    if (type === "edit") {
      if (!FileDinhKem || !FileDinhKem.name) {
        const newData = {
          ...data,
          id: id,
          ngayYeuCau: data.ngayYeuCau.format("DD/MM/YYYY"),
          chiTiet_traHangNCCs: ListVatTu,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `lkn_PhieuTraHangNCC/${id}`,
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
              setDisabledSave(true);
            }
          })
          .catch((error) => console.error(error));
      } else {
        const formData = new FormData();
        FileDinhKem.name !== null && formData.append("lstFiles", FileDinhKem);
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(tokenInfo.token),
          },
        })
          .then((res) => res.json())
          .then((path) => {
            const newData = {
              ...data,
              id: id,
              ngayYeuCau: data.ngayYeuCau.format("DD/MM/YYYY"),
              fileDanhGiaChatLuong: path[0].path,
              chiTiet_traHangNCCs: ListVatTu,
            };
            new Promise((resolve, reject) => {
              dispatch(
                fetchStart(
                  `lkn_PhieuTraHangNCC/${id}`,
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
                  setDisabledSave(true);
                }
              })
              .catch((error) => console.error(error));
          });
      }
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
          `lkn_PhieuTraHangNCC/xac-nhan/${id}`,
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
    title: "Xác nhận phiếu trả vật tư nhà cung cấp",
    onOk: handleXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const hanldeTuChoi = () => {
    setActiveModalTuChoi(true);
  };

  const handleRefeshModal = () => {
    goBack();
  };

  const handleChonVatTu = () => {
    setActiveModalChonVatTu(true);
  };

  const handleThemVatTu = (data) => {
    console.log(data);
    const newListVatTu = [...ListVatTu, ...data];
    setListVatTu(newListVatTu);
    if (type === "edit") {
      setFieldTouch(true);
    }
  };

  const propsFileDinhKem = {
    beforeUpload: (file) => {
      setFileDinhKem(file);
      setDisableFileDinhKem(true);
      return false;
    },
    showUploadList: false,
    maxCount: 1,
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu trả vật tư nhà cung cấp"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu trả vật tư nhà cung cấp"
    ) : (
      <span>
        Chi tiết phiếu trả vật tư nhà cung cấp -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieuTraHangNCC}
        </Tag>
        <Tag
          color={
            info.isXacNhan === null
              ? "orange"
              : info.isXacNhan === true
              ? "blue"
              : "error"
          }
          style={{ fontSize: "14px" }}
        >
          {info.isXacNhan === null
            ? "Chưa xác nhận"
            : info.isXacNhan === true
            ? "Đã xác nhận"
            : "Đã từ chối"}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_DIEUCHUYEN_THANHLY}
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
                name={["tranhacungcap", "userLap_Id"]}
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
                name={["tranhacungcap", "tenPhongBan"]}
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
                label="Bên nhận"
                name={["tranhacungcap", "benNhan_Id"]}
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
                  placeholder="Chọn bên nhận"
                  optionsvalue={["id", "tenNhaCungCap"]}
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
                label="Người đại diện"
                name={["tranhacungcap", "benNhan_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhaCungCap}
                  placeholder="Người liên hệ bên nhận"
                  optionsvalue={["id", "nguoiLienHe"]}
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
                label="Bên vận chuyển"
                name={["tranhacungcap", "benVanChuyen_Id"]}
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
                  placeholder="Chọn bên vận chuyển"
                  optionsvalue={["id", "tenNhaCungCap"]}
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
                label="Người đại diện"
                name={["tranhacungcap", "benVanChuyen_Id"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhaCungCap}
                  placeholder="Người đại diện bên vận chuyển"
                  optionsvalue={["id", "nguoiLienHe"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
          </Row>
          <Divider style={{ marginBottom: 20 }} />
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
                label="Người duyệt"
                name={["tranhacungcap", "userDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserDuyet}
                  placeholder="Chọn người duyệt"
                  optionsvalue={["id", "fullName"]}
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
                label="Ngày yêu cầu"
                name={["tranhacungcap", "ngayYeuCau"]}
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
                label="File đính kèm"
                name={["tranhacungcap", "fileDanhGiaChatLuong"]}
              >
                {!DisableFileDinhKem && FileDinhKem === null ? (
                  <Upload {...propsFileDinhKem}>
                    <Button
                      style={{
                        marginBottom: 0,
                        height: 30,
                        lineHeight: "25px",
                      }}
                      icon={<UploadOutlined />}
                      disabled={type === "detail" || type === "xacnhan"}
                    >
                      Tải file đính kèm
                    </Button>
                  </Upload>
                ) : (
                  <>
                    {FileDinhKem && FileDinhKem.name ? (
                      <span
                        style={{ color: "#0469B9", cursor: "pointer" }}
                        // onClick={() => renderPDF(FileDinhKem)}
                      >
                        {FileDinhKem.name}
                      </span>
                    ) : (
                      <a
                        href={`${BASE_URL_API}${FileDinhKem}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {FileDinhKem && FileName(FileDinhKem)}
                      </a>
                    )}
                    {type === "detail" || type === "xacnhan" ? null : (
                      <DeleteOutlined
                        style={{
                          cursor: "pointer",
                          marginLeft: 10,
                          color: "red",
                        }}
                        onClick={() => {
                          setFileDinhKem(null);
                          setDisableFileDinhKem(false);
                        }}
                      />
                    )}
                  </>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Divider style={{ marginBottom: 15 }} />
        <Row justify={"center"}>
          <h2 style={{ color: "#0469B9" }}>
            <strong>DANH SÁCH VẬT TƯ</strong>
          </h2>
        </Row>
        {type === "xacnhan" || type === "detail" ? null : (
          <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleChonVatTu}
            >
              Chọn vật tư
            </Button>
          </Row>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={
            type === "new"
              ? reDataForTable(ListVatTu)
              : reDataForTable(
                  ListVatTu.map((list) => {
                    const Kho = ListKhoVatTu.filter(
                      (d) =>
                        d.id.toLowerCase() === list.cauTrucKho_Id.toLowerCase()
                    );
                    return {
                      ...list,
                      tenCTKho: Kho.length !== 0 && Kho[0].tenCTKho,
                    };
                  })
                )
          }
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
        {type === "xacnhan" || type === "detail" ? null : (
          <FormSubmit
            goBack={goBack}
            handleSave={onFinish}
            saveAndClose={saveAndClose}
            disabled={
              type === "new"
                ? fieldTouch && ListVatTu.length !== 0
                : fieldTouch || !DisabledSave
            }
          />
        )}
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
      <ModalChonVatTu
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        itemData={ListVatTu && ListVatTu}
        ThemVatTu={handleThemVatTu}
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

export default TraNhaCungCapForm;
