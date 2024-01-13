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
  ModalDeleteConfirm,
  EditableTableRow,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_170PX } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
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
  const [ListChungTu, setListChungTu] = useState([]);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [DisabledXacNhan, setDisabledXacNhan] = useState(false);

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
        const newChungTu = res.data.filter((d) => d.id === cautruckho);
        setListChungTu(
          newChungTu &&
            newChungTu[0].chiTietChungTus &&
            JSON.parse(newChungTu[0].chiTietChungTus)
        );
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
          const listchungtu =
            res.data.list_ChungTu && JSON.parse(res.data.list_ChungTu);
          if (listchungtu === null) {
            setDisabledXacNhan(true);
          }

          const newListChungTu = {};
          listchungtu &&
            listchungtu.forEach((chungtu) => {
              const key = `fileChungTu${chungtu.maChungTu}`;
              newListChungTu[key] = chungtu.fileChungTu;
            });

          setListChungTu(listchungtu && listchungtu);
          setFieldsValue({
            phieunhapkhovattu: {
              ...res.data,
              ...newListChungTu,
              list_ChungTu: listchungtu && listchungtu,
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
      permission && permission.del && type === "edit"
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
        {type === "edit" && (
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
          disabled={type === "edit" ? false : true}
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
          uploadFile(values.phieunhapkhovattu, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (phieunhapkhovattu, saveQuit) => {
    if (type === "new" && ListChungTu) {
      const formData = new FormData();
      Object.keys(phieunhapkhovattu).forEach((key) => {
        if (key.startsWith("fileChungTu") && phieunhapkhovattu[key] !== "") {
          formData.append("lstFiles", phieunhapkhovattu[key].file);
        }
      });
      fetch(`${BASE_URL_API}/api/Upload/Multi`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((path) => {
          path.forEach((pathname) => {
            Object.keys(phieunhapkhovattu).forEach((key) => {
              if (
                key.startsWith("fileChungTu") &&
                phieunhapkhovattu[key] !== ""
              ) {
                if (phieunhapkhovattu[key] && phieunhapkhovattu[key].fileList) {
                  const fileList = phieunhapkhovattu[key].fileList.find(
                    (file) => file.name === pathname.fileName
                  );
                  if (fileList) {
                    phieunhapkhovattu[key] = pathname.path;
                  }
                }
              }
            });
          });

          const newData = {
            ...phieunhapkhovattu,
            ngayNhapKho: phieunhapkhovattu.ngayNhapKho.format(
              "DD/MM/YYYY HH:mm:ss"
            ),
            list_ChungTu: ListChungTu.map((chungtu) => {
              const filechungtu = [];
              for (const key in phieunhapkhovattu) {
                if (
                  key.startsWith("fileChungTu") &&
                  key.slice(11) === chungtu.maChungTu
                ) {
                  filechungtu.push(phieunhapkhovattu[key]);
                }
              }
              return {
                ...chungtu,
                fileChungTu: filechungtu.length > 0 ? filechungtu[0] : null,
              };
            }),
            tits_qtsx_PhieuNhapKhoVatTuChiTiets: ListVatTu,
          };
          saveData(newData, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else if (type === "edit" && ListChungTu) {
      const formData = new FormData();
      Object.keys(phieunhapkhovattu).forEach((key) => {
        if (key.startsWith("fileChungTu")) {
          phieunhapkhovattu[key] &&
            formData.append("lstFiles", phieunhapkhovattu[key].file);
        }
      });
      fetch(`${BASE_URL_API}/api/Upload/Multi`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((path) => {
          path.forEach((pathname) => {
            Object.keys(phieunhapkhovattu).forEach((key) => {
              if (
                key.startsWith("fileChungTu") &&
                phieunhapkhovattu[key] !== ""
              ) {
                if (phieunhapkhovattu[key] && phieunhapkhovattu[key].fileList) {
                  const fileList = phieunhapkhovattu[key].fileList.find(
                    (file) => file.name === pathname.fileName
                  );
                  if (fileList) {
                    phieunhapkhovattu[key] = pathname.path;
                  }
                }
              }
            });
          });

          const newData = {
            ...phieunhapkhovattu,
            id: id,
            tits_qtsx_PhieuKiemTraVatTu_Id: info.tits_qtsx_PhieuKiemTraVatTu_Id,
            ngayNhapKho: phieunhapkhovattu.ngayNhapKho.format(
              "DD/MM/YYYY HH:mm:ss"
            ),
            list_ChungTu: ListChungTu.map((chungtu) => {
              const filechungtu = [];
              for (const key in phieunhapkhovattu) {
                if (
                  key.startsWith("fileChungTu") &&
                  key.slice(11) === chungtu.maChungTu
                ) {
                  filechungtu.push(phieunhapkhovattu[key]);
                }
              }
              return {
                ...chungtu,
                fileChungTu: filechungtu.length > 0 ? filechungtu[0] : null,
              };
            }),
            tits_qtsx_PhieuNhapKhoVatTuChiTiets: ListVatTu,
          };
          saveData(newData, saveQuit);
        })
        .catch(() => {
          console.log("upload failed.");
        });
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
              setListChungTu([]);
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
    }
    if (type === "edit") {
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

  const renderFileChungTu = () => {
    const chungtu = [];
    const [FileChungTu, setFileChungTu] = useState([]);

    const handleFileChange = (index, file, key) => {
      setFieldTouch(key);
      setFileChungTu((prevFileChungTu) => {
        const newChungTu = [...prevFileChungTu];
        newChungTu[index] = file;
        return newChungTu;
      });

      const maChungTu = ListChungTu[index].maChungTu;
      setFieldsValue({
        phieunhapkhovattu: {
          [`fileChungTu${maChungTu}`]: file,
        },
      });
    };
    useEffect(() => {
      ListChungTu &&
        ListChungTu.forEach((item, i) => {
          if (item.fileChungTu) {
            handleFileChange(i, item.fileChungTu, false);
          }
        });
    }, [ListChungTu]);

    for (let i = 0; i < (ListChungTu && ListChungTu.length); i++) {
      const props = {
        accept: ".pdf",
        beforeUpload: (file) => {
          const isPDF = file.type === "application/pdf";

          if (!isPDF) {
            Helpers.alertError(`${file.name} không phải là file PDF`);
          } else {
            handleFileChange(i, file, true);
            return false;
          }
        },
        showUploadList: false,
        maxCount: 1,
      };

      chungtu.push(
        <Col
          key={i}
          xxl={12}
          xl={12}
          lg={24}
          md={24}
          sm={24}
          xs={24}
          style={{ marginBottom: 8 }}
        >
          <Form.Item
            label={`File chứng từ ${ListChungTu[i].maChungTu}`}
            name={[
              "phieunhapkhovattu",
              `fileChungTu${ListChungTu[i].maChungTu}`,
            ]}
            rules={[
              {
                type: "file",
                required: true,
              },
            ]}
          >
            {!FileChungTu[i] ? (
              <Upload {...props}>
                <Button
                  style={{ marginBottom: 0 }}
                  icon={<UploadOutlined />}
                  disabled={type === "xacnhan" || type === "detail"}
                >
                  File chứng từ {ListChungTu[i].maChungTu}
                </Button>
              </Upload>
            ) : FileChungTu[i].name ? (
              <span>
                <span
                  style={{
                    color: "#0469B9",
                    cursor: "pointer",
                    whiteSpace: "break-spaces",
                    // wordBreak: "break-all",
                  }}
                  onClick={() => renderPDF(FileChungTu[i] && FileChungTu[i])}
                >
                  {FileChungTu[i].name}{" "}
                </span>
                <DeleteOutlined
                  style={{ cursor: "pointer", color: "red" }}
                  disabled={type === "edit" ? false : true}
                  onClick={() => handleFileChange(i, null, true)}
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
                  href={BASE_URL_API + FileChungTu[i]}
                  rel="noopener noreferrer"
                >
                  {FileChungTu[i].split("/")[5]}{" "}
                </a>
                {type === "edit" && (
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    disabled={type === "edit" ? false : true}
                    onClick={() => {
                      handleFileChange(i, null, true);
                    }}
                  />
                )}
              </span>
            )}
          </Form.Item>
        </Col>
      );
    }
    return chungtu;
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
                  disabled={type === "edit" ? false : true}
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
                label="Biên bản bàn giao"
                name={["phieunhapkhovattu", "bienBanBanGiao"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Biên bản bàn giao"
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
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
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
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {renderFileChungTu()}
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
            disabled={
              info.tinhTrang !== "Chưa xác nhận" || DisabledXacNhan === true
            }
          >
            Xác nhận
          </Button>
          <Button
            icon={<CloseCircleOutlined />}
            className="th-margin-bottom-0"
            type="danger"
            onClick={() => setActiveModalTuChoi(true)}
            disabled={
              info.tinhTrang !== "Chưa xác nhận" || DisabledXacNhan === true
            }
          >
            Từ chối
          </Button>
        </div>
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
