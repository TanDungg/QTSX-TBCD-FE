import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
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
  Image,
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
  EditableTableRow,
  Modal,
  ModalDeleteConfirm,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_DENGHI_CVT } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import { useLocation } from "react-router-dom";
import ModalTuChoi from "./ModalTuChoi";
import ModalChonViTri from "./ModalChonViTri";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuXuatKhoVatTuPhuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListPYCCVTP, setListPYCCVTP] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [VatTu, setVatTu] = useState([]);
  const [ListKhoVatTu, setListKhoVatTu] = useState([]);
  const [KhoVatTu, setKhoVatTu] = useState(null);
  const [DisabledKhoXuat, setDisabledKhoXuat] = useState(false);
  const [ActiveModalChonViTri, setActiveModalChonViTri] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (location.state) {
          const newData =
            location.state.phieuDNCVT && location.state.phieuDNCVT[0];
          setType("taophieuxuat");
          getPhieuDeNghiCVT(newData.length !== 0 && newData.id);
        } else {
          if (permission && permission.add) {
            setType("new");
            setFieldsValue({
              phieuxuatkhovattuphu: {
                ngay: moment(getDateNow(), "DD/MM/YYYY"),
              },
            });
          } else if (permission && !permission.add) {
            history.push("/home");
          }
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
    getUserLap(INFO, null);
    getXuong();
    getListKho();
  };

  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?page=-1`,
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
        setListXuong(res.data);
      } else {
        setListXuong([]);
      }
    });
  };

  const getListPYCCVTP = (tits_qtsx_Xuong_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoVatTuPhu/phieu-yeu-cau-chua-xuat?${params}`,
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
        setListPYCCVTP(res.data);
      } else {
        setListPYCCVTP([]);
      }
    });
  };

  const getPhieuDeNghiCVT = (tits_qtsx_PhieuYeuCauCapVatTu_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_PhieuYeuCauCapVatTu_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoVatTuPhu/vat-tu-chua-xuat?${params}`,
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
          const newData = res.data.map((data) => {
            return {
              ...data,
              viTri: null,
              soLuongThucXuat: 0,
              list_ChiTietLuuKhos: [],
            };
          });
          setListVatTu(newData);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListKho = () => {
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
          phieuxuatkhovattuphu: {
            nguoiTao_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
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
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoVatTuPhu/${id}`,
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
          getListKho();
          getUserLap(INFO, res.data.nguoiTao_Id);
          getListPYCCVTP(res.data.tits_qtsx_Xuong_Id);
          setFieldsValue({
            phieuxuatkhovattuphu: {
              ...res.data,
              ngay: moment(res.data.ngay, "DD/MM/YYYY"),
            },
          });
          const chiTiet =
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets);
          const newData =
            chiTiet &&
            chiTiet.map((data) => {
              const lstViTri = data.list_ChiTietLuuKhos.map((vt) => {
                const vitri = `${vt.maKe ? `${vt.maKe}` : ""}${
                  vt.maTang ? ` - ${vt.maTang}` : ""
                }${vt.maNgan ? ` - ${vt.maNgan}` : ""}`;
                return {
                  ...vt,
                  viTri: vitri ? vitri : null,
                };
              });
              return {
                ...data,
                list_ChiTietLuuKhos: lstViTri,
              };
            });
          setListVatTu(newData && newData);
          setDisabledKhoXuat(true);
        }
      })
      .catch((error) => console.error(error));
  };

  const goBack = () => {
    if (type === "taophieuxuat") {
      history.push({
        pathname: `/quan-ly-kho-tpc/phieu-de-nghi-cap-vat-tu`,
      });
    } else {
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
    }
  };

  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter((d) => d.maVatTu !== item.maVatTu);
    setListVatTu(newData);
    setFieldTouch(true);
  };

  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del && type === "new"
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
    setVatTu({
      ...record,
      isCheck: check,
    });
  };

  const DeleteViTri = (record) => {
    setListVatTu((prevListVatTu) => {
      return prevListVatTu.map((item) => {
        if (record.vatTu_Id === item.vatTu_Id) {
          return {
            ...item,
            chiTiet_LuuVatTus: [],
          };
        }
        return item;
      });
    });
  };

  const ThemViTri = (data) => {
    const newData = ListVatTu.map((listvattu) => {
      if (
        listvattu.tits_qtsx_VatTu_Id.toLowerCase() ===
        data.tits_qtsx_VatTu_Id.toLowerCase()
      ) {
        if (data.soLuongThucXuat <= listvattu.soLuongYeuCau) {
          setDisabledKhoXuat(true);
          return {
            ...listvattu,
            soLuongThucXuat: data.soLuongThucXuat,
            list_ChiTietLuuKhos: data.list_ChiTietLuuKhos,
          };
        } else {
          Helpers.alertError(
            `Số lượng xuất không được lớn hơn ${listvattu.soLuongYeuCau}`
          );
        }
      }
      return listvattu;
    });
    setListVatTu(newData);
    setFieldTouch(true);
  };

  const renderLstViTri = (record) => {
    return (
      <div>
        {record.list_ChiTietLuuKhos.length > 0 ? (
          <div>
            <div>
              {record.list_ChiTietLuuKhos.map((vt, index) => {
                if (!vt.viTri) {
                  if (index === 0) {
                    return (
                      <Tag
                        key={index}
                        style={{
                          marginRight: 5,
                          marginBottom: 3,
                          color: "#0469B9",
                        }}
                      >
                        {vt.tenKho}
                      </Tag>
                    );
                  } else {
                    return null;
                  }
                } else {
                  return (
                    <Tag
                      key={index}
                      style={{
                        marginRight: 5,
                        marginBottom: 3,
                        color: "#0469B9",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {vt.viTri}
                    </Tag>
                  );
                }
              })}
            </div>
            {type === "detail" || type === "xacnhan" ? null : (
              <>
                <EditOutlined
                  style={{
                    color: "#0469B9",
                  }}
                  onClick={() => {
                    HandleChonViTri(record, true);
                  }}
                />
                <Divider type="vertical" />
                <DeleteOutlined
                  style={{
                    color: "#0469B9",
                  }}
                  onClick={() => {
                    DeleteViTri(record);
                  }}
                />
              </>
            )}
          </div>
        ) : (
          <Button
            icon={<CheckCircleOutlined />}
            className="th-margin-bottom-0"
            type="primary"
            onClick={() => HandleChonViTri(record, false)}
            disabled={!KhoVatTu}
          >
            Chọn vị trí
          </Button>
        )}
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
      title: "SL yêu cầu",
      dataIndex: "soLuongYeuCau",
      key: "soLuongYeuCau",
      align: "center",
    },
    {
      title: "SL thực xuất",
      dataIndex: "soLuongThucXuat",
      key: "soLuongThucXuat",
      align: "center",
    },
    {
      title: "Vị trí trong kho",
      key: "list_ChiTietLuuKhos",
      align: "center",
      render: (record) => renderLstViTri(record),
      width: 250,
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) => (
        <span>
          <Image
            src={BASE_URL_API + value}
            alt="Hình ảnh"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </span>
      ),
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

  const onFinish = (values) => {
    saveData(values.phieuxuatkhovattuphu);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.phieuxuatkhovattuphu, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new" || type === "taophieuxuat") {
      const newData = {
        ...data,
        ngay: data.ngay.format("DD/MM/YYYY"),
        list_ChiTiets: ListVatTu,
      };
      console.log(newData);
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuXuatKhoVatTuPhu`,
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
              getData();
              setFieldsValue({
                phieuxuatkhovattuphu: {
                  ngay: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
              setFieldTouch(false);
              setDisabledKhoXuat(false);
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
        ...data,
        id: id,
        tits_qtsx_PhieuYeuCauCapVatTu_Id: info.tits_qtsx_PhieuYeuCauCapVatTu_Id,
        ngay: data.ngay.format("DD/MM/YYYY"),
        list_ChiTiets: ListVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuXuatKhoVatTuPhu/${id}`,
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
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoVatTuPhu/duyet/${id}`,
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
    title: "Xác nhận phiếu xuất kho vật tư phụ",
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
          `tits_qtsx_PhieuXuatKhoVatTuPhu/duyet/${id}`,
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
    type === "new" || type === "taophieuxuat" ? (
      "Tạo phiếu xuất kho vật tư phụ"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu xuất kho vật tư phụ"
    ) : (
      <span>
        Chi tiết phiếu xuất kho vật tư phụ-{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "orange"
              : info.tinhTrang === "Đã duyệt"
              ? "blue"
              : info.tinhTrang && info.tinhTrang.startsWith("Bị hủy")
              ? "red"
              : "cyan"
          }
          style={{
            fontSize: "14px",
          }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );

  const handleSelectXuong = (val) => {
    setFieldsValue({
      phieuxuatkhovattuphu: {
        tits_qtsx_PhieuYeuCauCapVatTu_Id: null,
      },
    });
    setListVatTu([]);
    getListPYCCVTP(val);
  };

  const handleSelectListVatTu = (val) => {
    getPhieuDeNghiCVT(val);
  };

  const handleSelectKho = (val) => {
    setKhoVatTu(val);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu xuất kho vật tư phụ"}
      >
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
                name={["phieuxuatkhovattuphu", "nguoiTao_Id"]}
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
                name={["phieuxuatkhovattuphu", "tenPhongBan"]}
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
                name={["phieuxuatkhovattuphu", "tits_qtsx_Xuong_Id"]}
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
                  optionsvalue={["id", "tenXuong"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectXuong}
                  disabled={
                    type === "new" || type === "taophieuxuat" ? false : true
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
              {type === "new" || type === "taophieuxuat" ? (
                <FormItem
                  label="Phiếu đề nghị CVT"
                  name={[
                    "phieuxuatkhovattuphu",
                    "tits_qtsx_PhieuYeuCauCapVatTu_Id",
                  ]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListPYCCVTP ? ListPYCCVTP : []}
                    optionsvalue={[
                      "tits_qtsx_PhieuYeuCauCapVatTu_Id",
                      "maPhieu",
                    ]}
                    style={{ width: "100%" }}
                    placeholder="Phiếu đề nghị cấp vật tư"
                    showSearch
                    optionFilterProp={"name"}
                    onSelect={handleSelectListVatTu}
                  />
                </FormItem>
              ) : (
                <FormItem
                  label="Phiếu đề nghị CVT"
                  name={["phieuxuatkhovattuphu", "maPhieuYeuCauCapVatTu"]}
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
                label="Kho xuất"
                name={["phieuxuatkhovattuphu", "tits_qtsx_CauTrucKho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  placeholder="Kho xuất"
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoVatTu ? ListKhoVatTu : []}
                  optionsvalue={["id", "tenCauTrucKho"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectKho}
                  disabled={DisabledKhoXuat}
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
                name={["phieuxuatkhovattuphu", "ngay"]}
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
                label="Người nhận"
                name={["phieuxuatkhovattuphu", "nguoiNhan_Id"]}
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
                  placeholder="Chọn người nhận"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={
                    type === "new" || type === "edit" || type === "taophieuxuat"
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
                label="PT Bộ phận"
                name={["phieuxuatkhovattuphu", "nguoiPTBoPhanDuyet_Id"]}
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
                  disabled={
                    type === "new" || type === "edit" || type === "taophieuxuat"
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
                label="BP kế toán"
                name={["phieuxuatkhovattuphu", "nguoiKeToanDuyet_Id"]}
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
                  placeholder="Chọn bộ phận kế toán"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={
                    type === "new" || type === "edit" || type === "taophieuxuat"
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
                label="Nội dung xuất"
                name={["phieuxuatkhovattuphu", "noiDung"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập nội dung xuất"
                  disabled={
                    type === "new" || type === "edit" || type === "taophieuxuat"
                      ? false
                      : true
                  }
                />
              </FormItem>
            </Col>
            {info.tinhTrang && info.tinhTrang.startsWith("Bị hủy") ? (
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
                    value={
                      info.lyDoPTBoPhanTuChoi
                        ? info.lyDoPTBoPhanTuChoi
                        : info.lyDoKeToanTuChoi
                    }
                  />
                </FormItem>
              </Col>
            ) : null}
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
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListVatTu)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      {type === "new" || type === "edit" || type === "taophieuxuat" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={onFinish}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListVatTu.length !== 0}
        />
      ) : null}
      {(type === "xacnhan" &&
        info.tinhTrang === "Chưa duyệt" &&
        info.nguoiPTBoPhanDuyet_Id === INFO.user_Id) ||
      (type === "xacnhan" &&
        info.tinhTrang === "Chờ kế toán duyệt" &&
        info.nguoiKeToanDuyet_Id === INFO.user_Id) ? (
        <>
          <Divider />
          <div style={{ display: "flex", justifyContent: "center" }}>
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
            >
              Xác nhận
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              className="th-margin-bottom-0"
              type="danger"
              onClick={() => setActiveModalTuChoi(true)}
            >
              Từ chối
            </Button>
          </div>
        </>
      ) : null}
      <ModalChonViTri
        openModal={ActiveModalChonViTri}
        openModalFS={setActiveModalChonViTri}
        itemData={{
          tits_qtsx_CauTrucKho_Id: KhoVatTu,
          ListViTriVatTu: VatTu,
        }}
        ThemViTri={ThemViTri}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
      <ModalChonViTri
        openModal={ActiveModalChonViTri}
        openModalFS={setActiveModalChonViTri}
        itemData={{
          tits_qtsx_CauTrucKho_Id: KhoVatTu,
          ListVatTu: VatTu,
        }}
        ThemViTri={ThemViTri}
      />
    </div>
  );
};

export default PhieuXuatKhoVatTuPhuForm;
