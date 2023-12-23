import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
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
  Radio,
} from "antd";
import { includes } from "lodash";
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
import { DEFAULT_FORM_DENGHI_CVT } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalChonViTri from "./ModalChonViTri";
import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const VatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListVatTuTheoOEM, setListVatTuTheoOEM] = useState([]);
  const [ListVatTuTheoBOM, setListVatTuTheoBOM] = useState([]);
  const [VatTu, setVatTu] = useState([]);
  const [ListKhoVatTu, setListKhoVatTu] = useState([]);
  const [KhoVatTu, setKhoVatTu] = useState(null);
  const [DisabledKhoXuat, setDisabledKhoXuat] = useState(false);
  const [ActiveModalChonViTri, setActiveModalChonViTri] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [id, setId] = useState(undefined);
  const [value, setValue] = useState(0);
  const [NgayKHSX, setNgayKHSX] = useState(getDateNow(), "DD/MM/YYYY");
  const [Xuong, setXuong] = useState(null);
  const [SanPham, setSanPham] = useState(null);
  const [DonHang, setDonHang] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListSoLo, setListSoLo] = useState([]);
  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getUserKy(INFO);
        getUserLap(null, value);
        getXuong();
        getListKho();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue(
            value === 0 && {
              phieuxuatkhovattusanxuattheoOEM: {
                ngayKHSX: moment(getDateNow(), "DD/MM/YYYY"),
                ngayXuatKho: moment(getDateNow(), "DD/MM/YYYY"),
              },
            }
          );
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

  const getListSanPham = (tits_qtsx_Xuong_Id, ngayKeHoach) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id,
      ngayKeHoach,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoVatTuSanXuat/san-pham-theo-ke-hoach?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        setListSanPham(res.data);
      } else {
        setListSanPham([]);
      }
    });
  };

  const getListSoLo = (
    tits_qtsx_Xuong_Id,
    tits_qtsx_DonHang_Id,
    tits_qtsx_SanPham_Id,
    isThepTam
  ) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id,
      tits_qtsx_DonHang_Id,
      tits_qtsx_SanPham_Id,
      isThepTam,
      isBOM: value === 0 ? false : true,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoVatTuSanXuat/lo-theo-don-hang-san-pham?${params}`,
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
          setListSoLo(res.data);
        } else {
          setListSoLo([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListVatTu = (
    tits_qtsx_Xuong_Id,
    tits_qtsx_SanPham_Id,
    isThepTam,
    soLuongLo
  ) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id,
      tits_qtsx_SanPham_Id,
      isThepTam,
      isBOM: value === 0 ? false : true,
      soLuongLo,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuXuatKhoVatTuSanXuat/dinh-muc-vat-tu?${params}`,
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
              soLuongYeuCau: data.dinhMuc * soLuongLo,
              list_ChiTietLuuKhos: [],
            };
          });
          setListVatTuTheoOEM(newData);
        } else {
          setListVatTuTheoOEM([]);
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

  const getUserLap = (nguoiTao_Id, value) => {
    const params = convertObjectToUrlParams({
      id: nguoiTao_Id ? nguoiTao_Id : INFO.user_Id,
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiTao_Id ? nguoiTao_Id : INFO.user_Id}?${params}`,
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
        setFieldsValue(
          value === 0
            ? {
                phieuxuatkhovattusanxuattheoOEM: {
                  nguoiTao_Id: res.data.Id,
                  tenPhongBan: res.data.tenPhongBan,
                },
              }
            : {
                phieuxuatkhovattusanxuattheoBOM: {
                  nguoiTao_Id: res.data.Id,
                  tenPhongBan: res.data.tenPhongBan,
                },
              }
        );
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
          `tits_qtsx_phieuxuatkhovattusanxuat/${id}?donVi_Id=${INFO.donVi_Id}`,
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
          const listdata = res.data;
          setInfo(listdata);
          getXuong();
          getListKho();
          if (listdata.isBOM === false) {
            setValue(0);
            getUserLap(listdata.nguoiTao_Id, 0);
            setKhoVatTu(listdata.tits_qtsx_CauTrucKho_Id);
            setFieldsValue({
              phieuxuatkhovattusanxuattheoOEM: {
                ...listdata,
                ngayXuatKho: moment(listdata.ngayXuatKho, "DD/MM/YYYY"),
              },
            });
            const chiTiet =
              listdata.list_ChiTiets && JSON.parse(listdata.list_ChiTiets);
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
            setListVatTuTheoOEM(newData && newData);
            setDisabledKhoXuat(true);
          }
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
    const newData = ListVatTuTheoOEM.filter(
      (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
    );
    setListVatTuTheoOEM(newData);
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
    setListVatTuTheoOEM((prevListVatTuTheoOEM) => {
      return prevListVatTuTheoOEM.map((item) => {
        if (
          record.tits_qtsx_VatTu_Id.toLowerCase() ===
          item.tits_qtsx_VatTu_Id.toLowerCase()
        ) {
          return {
            ...item,
            list_ChiTietLuuKhos: [],
          };
        }
        return item;
      });
    });
  };

  const ThemViTri = (data) => {
    const newData = ListVatTuTheoOEM.map((listvattutheooem) => {
      if (
        listvattutheooem.tits_qtsx_VatTu_Id.toLowerCase() ===
        data.tits_qtsx_VatTu_Id.toLowerCase()
      ) {
        if (data.soLuongThucXuat <= listvattutheooem.soLuongYeuCau) {
          setDisabledKhoXuat(true);
          return {
            ...listvattutheooem,
            soLuongThucXuat: data.soLuongThucXuat,
            list_ChiTietLuuKhos: data.list_ChiTietLuuKhos,
          };
        } else {
          Helpers.alertError(
            `Số lượng xuất không được lớn hơn ${listvattutheooem.soLuongYeuCau}`
          );
        }
      }
      return listvattutheooem;
    });
    setListVatTuTheoOEM(newData);
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
                        color={"blue"}
                        style={{
                          marginRight: 5,
                          marginBottom: 3,
                          fontSize: 14,
                        }}
                      >
                        {`${vt.tenKho} (SL: ${vt.soLuong})`}
                      </Tag>
                    );
                  } else {
                    return null;
                  }
                } else {
                  return (
                    <Tag
                      key={index}
                      color={"blue"}
                      style={{
                        marginRight: 5,
                        marginBottom: 3,
                        fontSize: 14,
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {`${vt.viTri} (SL: ${vt.soLuong})`}
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

  let colValuesTheoOEM = [
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
      title: "Định mức",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
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
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];

  let colValuesTheoBOM = [
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
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
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

  const onFinish = (values) => {
    if (value === 0) {
      saveData(values.phieuxuatkhovattusanxuattheoOEM);
    } else {
      saveData(values.phieuxuatkhovattusanxuattheoBOM);
    }
  };

  const saveAndClose = (quit) => {
    validateFields()
      .then((values) => {
        if (value === 0) {
          if (ListVatTuTheoOEM.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveData(values.phieuxuatkhovattusanxuattheoOEM, quit);
          }
        } else {
          if (ListVatTuTheoBOM.length === 0) {
            Helpers.alertError("Danh sách vật tư rỗng");
          } else {
            saveData(values.phieuxuatkhovattusanxuattheoBOM, quit);
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new") {
      if (value === 0) {
        const newData = {
          ...data,
          ngayXuatKho: data.ngayXuatKho.format("DD/MM/YYYY"),
          ngayKHSX: data.ngayKHSX.format("DD/MM/YYYY"),
          isBOM: false,
          list_ChiTiets: ListVatTuTheoOEM,
        };
        console.log(newData);
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `tits_qtsx_PhieuXuatKhoVatTuSanXuat`,
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
                getUserKy(INFO);
                getUserLap(null, value);
                getXuong();
                getListKho();
                setFieldsValue(
                  value === 0 && {
                    phieuxuatkhovattusanxuattheoOEM: {
                      ngayXuatKho: moment(getDateNow(), "DD/MM/YYYY"),
                      ngayKHSX: moment(getDateNow(), "DD/MM/YYYY"),
                    },
                  }
                );
                setFieldTouch(false);
                setDisabledKhoXuat(false);
                setListVatTuTheoOEM([]);
              }
            } else {
              setFieldTouch(false);
            }
          })
          .catch((error) => console.error(error));
      }
      if (value === 1) {
        const newData = {
          ...data,
          ngayXuatKho: data.ngayXuatKho.format("DD/MM/YYYY"),
          isBOM: true,
          isThepTam: true,
          list_ChiTiets: ListVatTuTheoBOM,
        };
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `tits_qtsx_phieuxuatkhovattusanxuat`,
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
                getUserKy(INFO);
                getUserLap(null, value);
                getXuong();
                getListKho();
                setFieldTouch(false);
                setDisabledKhoXuat(false);
                setListVatTuTheoOEM([]);
              }
            } else {
              setFieldTouch(false);
            }
          })
          .catch((error) => console.error(error));
      }
    }
    if (type === "edit") {
      const newData = {
        ...data,
        id: id,
        tits_qtsx_PhieuYeuCauCapVatTu_Id: info.tits_qtsx_PhieuYeuCauCapVatTu_Id,
        ngayXuatKho: data.ngayXuatKho.format("DD/MM/YYYY"),
        list_ChiTiets: ListVatTuTheoOEM,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_phieuxuatkhovattusanxuat/${id}`,
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
          `tits_qtsx_phieuxuatkhovattusanxuat/duyet/${id}`,
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
    title: "Xác nhận phiếu xuất kho vật tư sản xuất",
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
          `tits_qtsx_phieuxuatkhovattusanxuat/duyet/${id}`,
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
      "Tạo phiếu xuất kho vật tư sản xuất"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu xuất kho vật tư sản xuất"
    ) : (
      <span>
        Chi tiết phiếu xuất kho vật tư sản xuất-{" "}
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
    setXuong(val);
    setFieldsValue({
      phieuxuatkhovattusanxuattheoOEM: {
        tits_qtsx_SanPham_Id: null,
      },
    });
    setListVatTuTheoOEM([]);
    getListSanPham(val, NgayKHSX);
  };

  const handleSelectListSanPham = (val) => {
    setSanPham(val);
    const newData = ListSanPham.filter((sp) => sp.tits_qtsx_SanPham_Id === val);
    setDonHang(newData[0].tits_qtsx_DonHang_Id);
    setFieldsValue({
      phieuxuatkhovattusanxuattheoOEM: {
        tits_qtsx_SoLo_Id: null,
        tits_qtsx_DonHang_Id: newData[0].tits_qtsx_DonHang_Id,
      },
    });
    setListVatTuTheoOEM([]);
    getListSoLo(Xuong, newData[0].tits_qtsx_DonHang_Id, val);
  };

  const handleSelectListSoLo = (val) => {
    const newData = ListSoLo.filter((sp) => sp.tits_qtsx_SoLo_Id === val);
    setFieldsValue({
      phieuxuatkhovattusanxuattheoOEM: {
        soLuongLo: newData[0].soLuongLo,
      },
    });
    getListVatTu(Xuong, SanPham, false, newData[0].soLuongLo);
  };

  const handleSelectKho = (val) => {
    setKhoVatTu(val);
  };

  const onChange = (e) => {
    setValue(e.target.value);
    getUserLap(null, e.target.value);
    if (e.target.value === 0) {
      resetFields();
      setFieldsValue({
        phieuxuatkhovattusanxuattheoOEM: {
          ngayXuatKho: moment(getDateNow(), "DD/MM/YYYY"),
          ngayKHSX: moment(getDateNow(), "DD/MM/YYYY"),
        },
      });
      setListVatTuTheoOEM([]);
    } else {
      resetFields();
    }
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Radio.Group
          onChange={onChange}
          value={value}
          style={{ width: "100%", display: "flex", marginBottom: 15 }}
        >
          <Col span={12} align="center">
            <Radio value={0} disabled={value === 1 && type !== "new"}>
              Phiếu xuất kho vật tư sản xuất theo OEM
            </Radio>
          </Col>
          <Col span={12} align="center">
            <Radio value={1} disabled={value === 0 && type !== "new"}>
              Phiếu xuất kho vật tư sản xuất theo BOM
            </Radio>
          </Col>
        </Radio.Group>
        {value === 0 ? (
          <>
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              title={"Thông tin phiếu xuất kho vật tư sản xuất theo OEM"}
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
                      name={["phieuxuatkhovattusanxuattheoOEM", "nguoiTao_Id"]}
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
                      name={["phieuxuatkhovattusanxuattheoOEM", "tenPhongBan"]}
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
                      label="Kho xuất"
                      name={[
                        "phieuxuatkhovattusanxuattheoOEM",
                        "tits_qtsx_CauTrucKho_Id",
                      ]}
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
                      label="Người giao"
                      name={["phieuxuatkhovattusanxuattheoOEM", "nguoiGiao_Id"]}
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
                        placeholder="Chọn người giao"
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
                      label="Ngày xuất kho"
                      name={["phieuxuatkhovattusanxuattheoOEM", "ngayXuatKho"]}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <DatePicker
                        format={"DD/MM/YYYY"}
                        allowClear={false}
                        disabled={type === "new" ? false : true}
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
                    >
                      <FormItem
                        label="Ngày KHSX"
                        name={["phieuxuatkhovattusanxuattheoOEM", "ngayKHSX"]}
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
                            getListSanPham(Xuong, dateString);
                            setNgayKHSX(dateString, "DD/MM/YYYY");
                            setFieldsValue({
                              phieuxuatkhovattusanxuattheoOEM: {
                                tits_qtsx_SanPham_Id: null,
                                ngayKHSX: moment(dateString, "DD/MM/YYYY"),
                              },
                            });
                          }}
                          disabled={type === "new" ? false : true}
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
                      label="Xưởng nhận"
                      name={[
                        "phieuxuatkhovattusanxuattheoOEM",
                        "tits_qtsx_Xuong_Id",
                      ]}
                      rules={[
                        {
                          type: "string",
                          required: true,
                        },
                      ]}
                    >
                      <Select
                        placeholder="Xưởng nhận"
                        className="heading-select slt-search th-select-heading"
                        data={ListXuong ? ListXuong : []}
                        optionsvalue={["id", "tenXuong"]}
                        style={{ width: "100%" }}
                        showSearch
                        optionFilterProp={"name"}
                        onSelect={handleSelectXuong}
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
                    style={{ marginBottom: 8 }}
                  >
                    <FormItem
                      label="Người nhận"
                      name={["phieuxuatkhovattusanxuattheoOEM", "nguoiNhan_Id"]}
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
                    {type === "new" ? (
                      <FormItem
                        label="Sản phẩm"
                        name={[
                          "phieuxuatkhovattusanxuattheoOEM",
                          "tits_qtsx_SanPham_Id",
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
                          data={ListSanPham ? ListSanPham : []}
                          placeholder="Chọn sản phẩm"
                          optionsvalue={["tits_qtsx_SanPham_Id", "tenSanPham"]}
                          style={{ width: "100%" }}
                          showSearch
                          optionFilterProp="name"
                          onSelect={handleSelectListSanPham}
                          disabled={type === "new" ? false : true}
                        />
                      </FormItem>
                    ) : (
                      <FormItem
                        label="Sản phẩm"
                        name={["phieuxuatkhovattusanxuattheoOEM", "tenSanPham"]}
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
                    {type === "new" ? (
                      <FormItem
                        label="Đơn đặt hàng"
                        name={[
                          "phieuxuatkhovattusanxuattheoOEM",
                          "tits_qtsx_DonHang_Id",
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
                          data={ListSanPham ? ListSanPham : []}
                          placeholder="Chọn đơn đặt hàng"
                          optionsvalue={["tits_qtsx_DonHang_Id", "maPhieu"]}
                          style={{ width: "100%" }}
                          showSearch
                          optionFilterProp="name"
                          disabled={true}
                        />
                      </FormItem>
                    ) : (
                      <FormItem
                        label="Đơn đặt hàng"
                        name={["phieuxuatkhovattusanxuattheoOEM", "tenDonHang"]}
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
                    {type === "new" ? (
                      <FormItem
                        label="Số lô"
                        name={[
                          "phieuxuatkhovattusanxuattheoOEM",
                          "tits_qtsx_SoLo_Id",
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
                          data={ListSoLo ? ListSoLo : []}
                          placeholder="Chọn số lô"
                          optionsvalue={["tits_qtsx_SoLo_Id", "tenSoLo"]}
                          style={{ width: "100%" }}
                          showSearch
                          optionFilterProp="name"
                          onSelect={handleSelectListSoLo}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                        />
                      </FormItem>
                    ) : (
                      <FormItem
                        label="Số lô"
                        name={["phieuxuatkhovattusanxuattheoOEM", "tenSoLo"]}
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
                      label="Lô xe"
                      name={["phieuxuatkhovattusanxuattheoOEM", "soLuongLo"]}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Số lượng lô xe"
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
                      label="PT Bộ phận"
                      name={[
                        "phieuxuatkhovattusanxuattheoOEM",
                        "nguoiPTBoPhanDuyet_Id",
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
                        data={ListUserKy}
                        placeholder="Chọn phụ trách bộ phận"
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
                      label="NV thống kê"
                      name={[
                        "phieuxuatkhovattusanxuattheoOEM",
                        "nguoiThongKeDuyet_Id",
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
                        data={ListUserKy}
                        placeholder="Chọn nhân viên thống kê duyệt"
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
                      label="Nội dung xuất"
                      name={["phieuxuatkhovattusanxuattheoOEM", "noiDung"]}
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
                      label="Ghi chú"
                      name={["phieuxuatkhovattusanxuattheoOEM", "moTa"]}
                      rules={[
                        {
                          type: "string",
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Nhập ghi chú"
                        disabled={
                          type === "new" || type === "edit" ? false : true
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
              headStyle={{
                textAlign: "center",
                backgroundColor: "#0469B9",
                color: "#fff",
              }}
            >
              <Table
                bordered
                columns={colValuesTheoOEM}
                scroll={{ x: 1300, y: "55vh" }}
                components={components}
                className="gx-table-responsive"
                dataSource={reDataForTable(ListVatTuTheoOEM)}
                size="small"
                rowClassName={"editable-row"}
                pagination={false}
                // loading={loading}
              />
            </Card>
          </>
        ) : (
          <>
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              title={"Thông tin phiếu xuất kho vật tư sản xuất theo BOM"}
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
                      name={["phieuxuatkhovattusanxuattheoBOM", "nguoiTao_Id"]}
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
                      name={["phieuxuatkhovattusanxuattheoBOM", "tenPhongBan"]}
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
                      label="Kho xuất"
                      name={[
                        "phieuxuatkhovattusanxuattheoBOM",
                        "tits_qtsx_CauTrucKho_Id",
                      ]}
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
                      label="Người giao"
                      name={["phieuxuatkhovattusanxuattheoBOM", "nguoiGiao_Id"]}
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
                        placeholder="Chọn người giao"
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
                      label="Xưởng nhận"
                      name={[
                        "phieuxuatkhovattusanxuattheoBOM",
                        "tits_qtsx_Xuong_Id",
                      ]}
                      rules={[
                        {
                          type: "string",
                          required: true,
                        },
                      ]}
                    >
                      <Select
                        placeholder="Xưởng nhận"
                        className="heading-select slt-search th-select-heading"
                        data={ListXuong ? ListXuong : []}
                        optionsvalue={["id", "tenXuong"]}
                        style={{ width: "100%" }}
                        showSearch
                        optionFilterProp={"name"}
                        onSelect={handleSelectXuong}
                        disabled={
                          type === "new" || type === "taophieuxuat"
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
                      label="Người nhận"
                      name={["phieuxuatkhovattusanxuattheoBOM", "nguoiNhan_Id"]}
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
                      label="Nội dung xuất"
                      name={["phieuxuatkhovattusanxuattheoBOM", "noiDung"]}
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
                      label="PT Bộ phận"
                      name={[
                        "phieuxuatkhovattusanxuattheoBOM",
                        "nguoiPTBoPhanDuyet_Id",
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
                        data={ListUserKy}
                        placeholder="Chọn phụ trách bộ phận"
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
                      label="NV thống kê"
                      name={[
                        "phieuxuatkhovattusanxuattheoBOM",
                        "nguoiThongKeDuyet_Id",
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
                        data={ListUserKy}
                        placeholder="Chọn nhân viên thống kê duyệt"
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
                      label="Sản phẩm"
                      name={[
                        "phieuxuatkhovattusanxuattheoBOM",
                        "tits_qtsx_SanPham_Id",
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
                        data={ListUserKy}
                        placeholder="Chọn sản phẩm"
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
                      label="Đơn đặt hàng"
                      name={[
                        "phieuxuatkhovattusanxuattheoBOM",
                        "tits_qtsx_DonHang_Id",
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
                        data={ListUserKy}
                        placeholder="Chọn đơn đặt hàng"
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
                      label="Số lô"
                      name={[
                        "phieuxuatkhovattusanxuattheoBOM",
                        "tits_qtsx_SoLo_Id",
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
                        data={ListUserKy}
                        placeholder="Chọn số lô"
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
                      label="Lô xe"
                      name={["phieuxuatkhovattusanxuattheoBOM", "soLuongLo"]}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input
                        className="input-item"
                        placeholder="Số lượng lô xe"
                        disabled={
                          type === "new" || type === "edit" ? false : true
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
              headStyle={{
                textAlign: "center",
                backgroundColor: "#0469B9",
                color: "#fff",
              }}
            >
              <Table
                bordered
                columns={colValuesTheoBOM}
                scroll={{ x: 1300, y: "55vh" }}
                components={components}
                className="gx-table-responsive"
                dataSource={reDataForTable(ListVatTuTheoBOM)}
                size="small"
                rowClassName={"editable-row"}
                pagination={false}
                // loading={loading}
              />
            </Card>
          </>
        )}
      </Card>

      {type === "new" || type === "edit" || type === "taophieuxuat" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={onFinish}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListVatTuTheoOEM.length !== 0}
        />
      ) : null}
      {(type === "xacnhan" &&
        info.tinhTrang === "Chưa duyệt" &&
        info.nguoiPTBoPhanDuyet_Id === INFO.user_Id) ||
      (type === "xacnhan" &&
        info.tinhTrang === "Chờ kế toán duyệt" &&
        info.nguoiThongKeDuyet_Id === INFO.user_Id) ? (
        <Row justify={"end"} style={{ marginTop: 15 }}>
          <Col style={{ marginRight: 15 }}>
            <Button type="primary" onClick={modalXK}>
              Xác nhận
            </Button>
          </Col>
          <Col style={{ marginRight: 15 }}>
            <Button type="danger" onClick={() => setActiveModalTuChoi(true)}>
              Từ chối
            </Button>
          </Col>
        </Row>
      ) : null}
      <ModalChonViTri
        openModal={ActiveModalChonViTri}
        openModalFS={setActiveModalChonViTri}
        itemData={{
          tits_qtsx_CauTrucKho_Id: KhoVatTu,
          ListVatTuTheoOEM: VatTu,
        }}
        ThemViTri={ThemViTri}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default VatTuForm;
