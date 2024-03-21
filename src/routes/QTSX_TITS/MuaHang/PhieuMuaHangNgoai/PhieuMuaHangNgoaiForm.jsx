import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Button,
  Tag,
  Upload,
  DatePicker,
  Image,
  Divider,
} from "antd";
import { includes, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { BASE_URL_API } from "src/constants/Config";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  Modal,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  renderPDF,
} from "src/util/Common";
import Helper from "src/helpers";
import ModalChonVatTu from "./ModalChonVatTu";
import ModalTuChoi from "./ModalTuChoi";
import ImportDanhSachVatTu from "./ImportDanhSachVatTu";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuMuaHangNgoaiForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [File, setFile] = useState(null);
  // const [FileXacNhan, setFileXacNhan] = useState(null);
  // const [disableUploadXacNhan, setDisableUploadXacNhan] = useState(false);
  const [info, setInfo] = useState({});
  const [daTaEdit, setDaTaEdit] = useState();
  const [ActiveModalImportVatTu, setActiveModalImportVatTu] = useState(false);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(false);
  const [isMuaHangTrongNuoc, setIsMuaHangTrongNuoc] = useState("1");

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getListDonVi();
          getListPhongBan();
          getUserKy(INFO);
          setFieldsValue({
            phieumuahangngoai: {
              donViYeuCau_Id: INFO.donVi_Id.toLowerCase(),
              donViNhanYeuCau_Id: "2a2a811f-ba5e-4fef-9389-9f74bd6a0d93",
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
          getListDonVi();
          getListPhongBan();
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id, true);
          getListDonVi();
          getListPhongBan();
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
          getListDonVi();
          getListPhongBan();
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

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`DonVi?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    }).then((res) => {
      if (res && res.data) {
        setListDonVi(res.data);
      } else {
        setListDonVi([]);
      }
    });
  };

  const getListPhongBan = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?donviid=d12ca19c-2e1a-41b7-86f3-3eb3c7d81a90&page=-1`,
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
        setListPhongBan(res.data);
      } else {
        setListPhongBan([]);
      }
    });
  };

  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/user-by-dv-pb?${params}&key=1`,
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
            nguoiDuyet: `${dt.maNhanVien} - ${dt.fullName}`,
          };
        });
        setListUserKy(newData);
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
          `tits_qtsx_PhieuMuaHangNgoai/${id}`,
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
          const newData = res.data;
          setInfo(newData);

          const vattu =
            newData.tits_qtsx_PhieuMuaHangNgoaiChiTiets &&
            JSON.parse(newData.tits_qtsx_PhieuMuaHangNgoaiChiTiets).map(
              (ct) => {
                return {
                  ...ct,
                  ngayGiaoDuKien: ct.ngayGiaoDuKien
                    ? ct.ngayGiaoDuKien
                    : getDateNow(),
                };
              }
            );
          setListVatTu(reDataForTable(vattu));
          if (newData.isMuaHangTrongNuoc) {
            setIsMuaHangTrongNuoc("1");
          } else {
            setIsMuaHangTrongNuoc("0");
          }
          if (newData.fileDinhKem) {
            setFile(newData.fileDinhKem);
          }
          // if (newData.fileXacNhan) {
          //   setFileXacNhan(newData.fileXacNhan);
          //   setDisableUploadXacNhan(true);
          // }

          setFieldsValue({
            phieumuahangngoai: {
              ...newData,
              isMuaHangTrongNuoc: newData.isMuaHangTrongNuoc ? "1" : "0",
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
          : type === "detail" || type === "UploadFile"
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
    const newData = ListVatTu.filter((d) => d.key !== item.key);
    if (newData.length !== 0) {
      setFieldTouch(true);
    }
    setListVatTu(reDataForTable(newData));
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItemVal =
      permission && permission.edit && (type === "new" || type === "edit")
        ? {
            onClick: () => {
              setDaTaEdit(item);
              setActiveModalChonVatTu(true);
            },
          }
        : { disabled: true };
    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...editItemVal} title="Sửa">
            <EditOutlined />
          </a>
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };
  const renderDatePicker = (val, record) => {
    return info.tinhTrang === "Chưa xử lý" ? (
      <DatePicker
        format={"DD/MM/YYYY"}
        value={val ? moment(val, "DD/MM/YYYY") : null}
        onChange={(date, dateString) => {
          ListVatTu.forEach((vt) => {
            if (
              vt.tits_qtsx_PhieuMuaHangNgoaiChiTiet_Id ===
              record.tits_qtsx_PhieuMuaHangNgoaiChiTiet_Id
            ) {
              vt.ngayGiaoDuKien = dateString;
            }
          });
          setListVatTu([...ListVatTu]);
        }}
        allowClear={false}
      />
    ) : (
      <span>{val}</span>
    );
  };
  let colValues = () => {
    const colStart = [
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
        width: 150,
      },
      {
        title: "Tên vật tư",
        dataIndex: "tenVatTu",
        key: "tenVatTu",
        align: "center",
        width: 150,
      },
      {
        title: "Loại vật tư",
        dataIndex: "tenLoaiVatTu",
        key: "tenLoaiVatTu",
        align: "center",
        width: 150,
      },
    ];
    const colIsNoi = [
      {
        title: "Đơn vị tính",
        dataIndex: "tenDonViTinh",
        key: "tenDonViTinh",
        align: "center",
        width: 100,
      },
      {
        title: "Định mức",
        dataIndex: "dinhMuc",
        key: "dinhMuc",
        align: "center",
        width: 100,
      },
      {
        title: "SL dự phòng",
        key: "soLuongDuPhong",
        dataIndex: "soLuongDuPhong",
        align: "center",
        width: 100,
      },
      {
        title: "SL đặt mua",
        key: "soLuongDatMua",
        dataIndex: "soLuongDatMua",
        align: "center",
        width: 100,
      },
      {
        title: "Ngày yêu cầu giao",
        dataIndex: "ngay",
        key: "ngay",
        align: "center",
        width: 100,
      },
      {
        title: "Mã đơn hàng",
        dataIndex: "maPhieu",
        key: "maPhieu",
        align: "center",
        width: 100,
      },
      {
        title: "CV thu mua",
        dataIndex: "tenNguoiThuMua",
        key: "tenNguoiThuMua",
        align: "center",
        width: 100,
      },
      {
        title: "Hạng mục",
        dataIndex: "hangMucSuDung",
        key: "hangMucSuDung",
        align: "center",
        width: 100,
      },
      {
        title: "Ghi chú",
        dataIndex: "moTa",
        width: 100,
        key: "moTa",
        align: "center",
        render: (val, record) => {
          if (record.render) {
            if (val) {
              if (val.file && val.file.type === "application/pdf") {
                return (
                  <span
                    style={{ color: "#0469B9", cursor: "pointer" }}
                    onClick={() => {
                      renderPDF(val.file);
                    }}
                  >
                    {val.file.name.length > 15
                      ? val.file.name.substring(0, 15) + "..."
                      : val.file.name}
                  </span>
                );
              } else {
                return <Image width={100} src={record.hinhAnh} alt="preview" />;
              }
            }
          } else {
            if (val) {
              if (val.includes(".pdf")) {
                return (
                  <a
                    target="_blank"
                    href={BASE_URL_API + val}
                    rel="noopener noreferrer"
                    style={{
                      whiteSpace: "break-spaces",
                      wordBreak: "break-all",
                    }}
                  >
                    {val.split("/")[5]}{" "}
                  </a>
                );
              } else {
                return (
                  <Image width={100} src={BASE_URL_API + val} alt="preview" />
                );
              }
            }
          }
        },
      },
    ];
    const colIsNgoai = [
      {
        title: "Xuất xứ",
        dataIndex: "xuatXu",
        key: "xuatXu",
        align: "center",
        width: 100,
      },
      {
        title: "Đơn vị tính",
        dataIndex: "tenDonViTinh",
        key: "tenDonViTinh",
        align: "center",
        width: 100,
      },
      {
        title: "Định mức",
        dataIndex: "dinhMuc",
        key: "dinhMuc",
        align: "center",
        width: 100,
      },
      {
        title: "SL cần dùng",
        key: "soLuongDuPhong",
        dataIndex: "soLuongDuPhong",
        align: "center",
        width: 100,
      },
      {
        title: "SL tồn kho",
        key: "soLuongTrongKho",
        dataIndex: "soLuongTrongKho",
        width: 100,
        align: "center",
      },
      {
        title: "SL đặt mua",
        key: "soLuongDatMua",
        dataIndex: "soLuongDatMua",
        width: 100,
        align: "center",
      },
      {
        title: "Mã đơn hàng",
        dataIndex: "maPhieu",
        key: "maPhieu",
        width: 100,
        align: "center",
      },
      {
        title: "CV thu mua",
        dataIndex: "tenNguoiThuMua",
        key: "tenNguoiThuMua",
        width: 100,
        align: "center",
      },
      {
        title: "Ngày yêu cầu giao",
        dataIndex: "ngay",
        key: "ngay",
        align: "center",
        width: 100,
      },
      {
        title: "Hạng mục",
        dataIndex: "hangMucSuDung",
        key: "hangMucSuDung",
        align: "center",
        width: 100,
      },
      {
        title: "Chứng nhận",
        dataIndex: "chungNhan",
        key: "chungNhan",
        align: "center",
        width: 100,
      },
      {
        title: "Bảo hành",
        dataIndex: "baoHanh",
        key: "baoHanh",
        align: "center",
        width: 100,
      },
      {
        title: "Ghi chú",
        dataIndex: "moTa",
        key: "moTa",
        align: "center",
        width: 100,
      },
    ];
    if (isMuaHangTrongNuoc === "1") {
      if (type === "xacnhan") {
        colIsNoi.splice(5, 0, {
          title: "Ngày dự kiến giao",
          dataIndex: "ngayGiaoDuKien",
          key: "ngayGiaoDuKien",
          width: 100,
          align: "center",
          render: (val, record) => renderDatePicker(val, record),
        });
      }
      return [...colStart, ...colIsNoi];
    } else if (isMuaHangTrongNuoc === "0") {
      if (type === "xacnhan") {
        colIsNgoai.splice(9, 0, {
          title: "Ngày dự kiến giao",
          dataIndex: "ngayGiaoDuKien",
          key: "ngayGiaoDuKien",
          width: 100,
          align: "center",
          render: (val, record) => renderDatePicker(val, record),
        });
      }
      return [...colStart, ...colIsNgoai];
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
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    if (ListVatTu.length > 0) {
      if (isMuaHangTrongNuoc === "1") {
        if (values.phieumuahangngoai.fileDinhKem) {
          uploadFile(values.phieumuahangngoai);
        } else {
          saveData(values.phieumuahangngoai);
        }
      } else if (isMuaHangTrongNuoc === "0") {
        let check = false;
        ListVatTu.forEach((vt) => {
          if (vt.moTa) {
            check = true;
          }
        });
        if (values.phieumuahangngoai.fileDinhKem && check) {
          console.log("object");
          uploadFile(values.phieumuahangngoai, ListVatTu);
        } else if (values.phieumuahangngoai.fileDinhKem && !check) {
          uploadFile(values.phieumuahangngoai);
        } else if (!values.phieumuahangngoai.fileDinhKem && check) {
          uploadFile(null, ListVatTu);
        } else {
          saveData(values.phieumuahangngoai);
        }
      }
    } else {
      Helpers.alertError("Danh sách vật tư rỗng");
    }
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length > 0) {
          uploadFile(values.phieumuahangngoai, ListVatTu, val);
        } else {
          Helpers.alertError("Danh sách vật tư rỗng");
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  const removeFile = (removePath) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Upload/RemoveMulti`,
          "POST",
          removePath,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status === 200) {
      }
    });
  };

  const uploadFile = (phieumuahangngoai, listFile, saveQuit = false) => {
    // if (type === "new") {
    const formData = new FormData();
    const removePath = [];
    let check = false;
    if (phieumuahangngoai.fileDinhKem) {
      if (type === "new") {
        check = true;
        formData.append("lstFiles", phieumuahangngoai.fileDinhKem.file);
      } else {
        if (phieumuahangngoai.fileDinhKem !== info.fileDinhKem) {
          formData.append("lstFiles", phieumuahangngoai.fileDinhKem.file);
          removePath.push({
            stringPath: info.fileDinhKem,
          });
        }
      }
    } else {
      if (info.fileDinhKem) {
        removePath.push({
          stringPath: info.fileDinhKem,
        });
      }
    }
    if (listFile) {
      listFile.forEach((vt) => {
        if (vt.moTa && vt.moTa.file) {
          check = true;
          formData.append("lstFiles", vt.moTa.file);
        }
        if (info && info.tits_qtsx_PhieuMuaHangNgoaiChiTiets) {
          JSON.parse(info.tits_qtsx_PhieuMuaHangNgoaiChiTiets).forEach((ct) => {
            if (
              ct.tits_qtsx_PhieuMuaHangNgoaiChiTiet_Id ===
                vt.tits_qtsx_PhieuMuaHangNgoaiChiTiet_Id &&
              ct.moTa !== vt.moTa
            ) {
              removePath.push({
                stringPath: ct.moTa,
              });
            }
          });
        }
      });
    }
    if (removePath.length > 0) {
      removeFile(removePath);
    }
    if (!check) {
      saveData(phieumuahangngoai, listFile, saveQuit);
    } else {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Upload/Multi`,
            "POST",
            formData,
            "",
            "",
            resolve,
            reject,
            true
          )
        );
      }).then((res) => {
        if (res && res.status === 200) {
          res.data.forEach((dt) => {
            if (
              phieumuahangngoai.fileDinhKem &&
              phieumuahangngoai.fileDinhKem.file &&
              dt.fileName === phieumuahangngoai.fileDinhKem.file.name
            ) {
              phieumuahangngoai.fileDinhKem = dt.path;
            } else if (listFile) {
              listFile.forEach((vt) => {
                if (
                  vt.moTa &&
                  vt.moTa.file &&
                  vt.moTa.file.name === dt.fileName
                ) {
                  vt.moTa = dt.path;
                }
              });
            }
          });
          saveData(phieumuahangngoai, listFile, saveQuit);
        }
      });
    }
  };

  const saveData = (phieumuahangngoai, listFile, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieumuahangngoai,
        isMuaHangTrongNuoc: phieumuahangngoai.isMuaHangTrongNuoc === "1",
        donViYeuCau_Id: INFO.donVi_Id,
        tits_qtsx_PhieuMuaHangNgoaiChiTiets: listFile,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuMuaHangNgoai`,
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
          if (res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setListVatTu([]);
              setFile();
              setFieldsValue({
                phieumuahangngoai: {
                  donViYeuCau_Id: INFO.donVi_Id.toLowerCase(),
                  donViNhanYeuCau_Id: "2a2a811f-ba5e-4fef-9389-9f74bd6a0d93",
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit") {
      const newData = {
        id: id,
        ...phieumuahangngoai,
        isMuaHangTrongNuoc: phieumuahangngoai.isMuaHangTrongNuoc === "1",
        donViYeuCau_Id: INFO.donVi_Id,
        tits_qtsx_PhieuMuaHangNgoaiChiTiets: listFile,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuMuaHangNgoai/${id}`,
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
            if (res.status === 200) goBack();
          } else {
            getInfo(id);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const hanldeXacNhan = () => {
    const datalist = {
      id: id,
      isDuyet: true,
      list_ngayDuKienGiaoHangs: ListVatTu.map((vt) => {
        return {
          tits_qtsx_PhieuMuaHangNgoaiChiTiet_Id:
            vt.tits_qtsx_PhieuMuaHangNgoaiChiTiet_Id,
          ngayGiaoDuKien: vt.ngayGiaoDuKien,
        };
      }),
    };

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuMuaHangNgoai/xac-nhan/${id}`,
          "PUT",
          datalist,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status === 204) {
          getInfo(id);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu mua hàng ngoài",
    onOk: hanldeXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const saveTuChoi = (data) => {
    const newData = {
      id: id,
      isDuyet: false,
      lyDoTuChoi: data,
    };

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuMuaHangNgoai/xac-nhan/${id}`,
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
        if (res.status === 204) getInfo(id);
      })
      .catch((error) => console.error(error));
  };

  const DataThemVatTu = (data) => {
    if (data.type === "new") {
      setListVatTu(reDataForTable([...ListVatTu, data]));
    } else if (data.type === "edit") {
      const newData = [];
      ListVatTu.forEach((vt) => {
        if (
          vt.tits_qtsx_VatTu_Id.toLowerCase() ===
          data.tits_qtsx_VatTu_Id.toLowerCase()
        ) {
          newData.push({
            ...vt,
            ...data,
          });
        } else {
          newData.push(vt);
        }
      });
      setListVatTu(reDataForTable(newData));
    } else {
      setListVatTu(reDataForTable(data));
    }
    setFieldTouch(true);
  };

  const props = {
    accept: ".pdf, .xlsx",
    beforeUpload: (file) => {
      const isPDF = file.type === "application/pdf";
      const isXLSX =
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      if (!isPDF && !isXLSX) {
        Helper.alertError(
          `${file.name} không phải là file PDF hoặc file Excel`
        );
      } else {
        setFile(file);

        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleViewFile = (file) => {
    if (file.type === "application/pdf") {
      renderPDF(file);
    } else {
    }
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu mua hàng ngoài"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu mua hàng ngoài"
    ) : (
      <span>
        Chi tiết phiếu mua hàng ngoài -{" "}
        <Tag color={"blue"} style={{ fontSize: 15 }}>
          {info && info.maPhieu}
        </Tag>{" "}
        <Tag
          color={
            info && info.tinhTrang === "Chưa xác nhận"
              ? "orange"
              : info && info.tinhTrang === "Đã xác nhận"
              ? "blue"
              : "red"
          }
          style={{ fontSize: 15 }}
        >
          {info && info.tinhTrang}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu mua hàng ngoài"}
      >
        <Form
          {...DEFAULT_FORM_TWO_COL}
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
                label="Đơn vị yêu cầu"
                name={["phieumuahangngoai", "donViYeuCau_Id"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDonVi}
                  placeholder="Đơn vị yêu cầu"
                  optionsvalue={["id", "tenDonVi"]}
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
                label="Đơn vị nhận yêu cầu"
                name={["phieumuahangngoai", "donViNhanYeuCau_Id"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListPhongBan}
                  placeholder="Đơn vị nhận yêu cầu"
                  optionsvalue={["id", "tenPhongBan"]}
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
                label="Loại đề nghị"
                name={["phieumuahangngoai", "isMuaHangTrongNuoc"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
                initialValue={"1"}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={[
                    {
                      id: "1",
                      name: "Mua hàng trong nước",
                    },
                    {
                      id: "0",
                      name: "Mua hàng nước ngoài",
                    },
                  ]}
                  optionsvalue={["id", "name"]}
                  style={{ width: "100%" }}
                  disabled={type === "new" || type === "edit" ? false : true}
                  onChange={(val) => setIsMuaHangTrongNuoc(val)}
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
                name={["phieumuahangngoai", "nguoiNhan_Id"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn người nhận"
                  optionsvalue={["user_Id", "nguoiDuyet"]}
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
                label="Người kiểm tra"
                name={["phieumuahangngoai", "nguoiKiemTra_Id"]}
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
                  optionsvalue={["user_Id", "nguoiDuyet"]}
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
                label="Kế toán duyệt"
                name={["phieumuahangngoai", "nguoiKeToan_Id"]}
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
                  placeholder="Chọn kế toán duyệt"
                  optionsvalue={["user_Id", "nguoiDuyet"]}
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
                label="Duyệt"
                name={["phieumuahangngoai", "nguoiDuyet_Id"]}
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
                  optionsvalue={["user_Id", "nguoiDuyet"]}
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
                label="Địa chỉ giao hàng"
                name={["phieumuahangngoai", "diaChiGiaoHang"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập địa chỉ giao hàng"
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
                label="File đính kèm"
                name={["phieumuahangngoai", "fileDinhKem"]}
              >
                {!File ? (
                  <Upload {...props}>
                    <Button
                      style={{
                        marginBottom: 0,
                      }}
                      icon={<UploadOutlined />}
                      disabled={type === "xacnhan" || type === "detail"}
                    >
                      File đính kèm
                    </Button>
                  </Upload>
                ) : File.name ? (
                  <span>
                    <span
                      style={{
                        color: "#0469B9",
                        cursor: "pointer",
                        whiteSpace: "break-spaces",
                      }}
                      onClick={() => handleViewFile(File)}
                    >
                      {File.name}{" "}
                    </span>
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      disabled={
                        type === "new" || type === "edit" ? false : true
                      }
                      onClick={() => {
                        setFile(null);
                        setFieldTouch(true);
                        setFieldsValue({
                          phieumuahangngoai: {
                            fileDinhKem: null,
                          },
                        });
                      }}
                    />
                  </span>
                ) : (
                  <span>
                    <a
                      target="_blank"
                      href={BASE_URL_API + File}
                      rel="noopener noreferrer"
                      style={{
                        whiteSpace: "break-spaces",
                        wordBreak: "break-all",
                      }}
                    >
                      {File.split("/")[5]}{" "}
                    </a>
                    {(type === "new" || type === "edit") && (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFile(null);
                          setFieldTouch(true);
                          setFieldsValue({
                            phieumuahangngoai: {
                              fileDinhKem: null,
                            },
                          });
                        }}
                      />
                    )}
                  </span>
                )}
              </FormItem>
            </Col>
            {/* {(info.isDuyet === true ||
              (type === "xacnhan" && info.tinhTrang === "Chưa xác nhận")) && (
              <>
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
                    label="CV thu mua"
                    name={["phieumuahangngoai", "nguoiThuMua_Id"]}
                    rules={[
                      {
                        required: true,
                        type: "string",
                      },
                    ]}
                  >
                    <Select
                      className="heading-select slt-search th-select-heading"
                      data={ListUserKy}
                      placeholder="Chọn người thu mua"
                      optionsvalue={["user_Id", "nguoiDuyet"]}
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="name"
                      disabled={
                        type === "xacnhan" && info.tinhTrang === "Chưa xác nhận"
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
                    label="File xác nhận"
                    name={["phieumuahangngoai", "fileXacNhan"]}
                  >
                    {!disableUploadXacNhan ? (
                      <Upload {...propsxacnhan}>
                        <Button
                          style={{
                            marginBottom: 0,
                          }}
                          icon={<UploadOutlined />}
                          disabled={type === "detail"}
                        >
                          File xác nhận
                        </Button>
                      </Upload>
                    ) : FileXacNhan && FileXacNhan.name ? (
                      <span>
                        <span
                          style={{
                            color: "#0469B9",
                            cursor: "pointer",
                            whiteSpace: "break-spaces",
                          }}
                          onClick={() => handleViewFile(FileXacNhan)}
                        >
                          {FileXacNhan.name}{" "}
                        </span>
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => {
                            setFileXacNhan(null);
                            setDisableUploadXacNhan(false);
                            setFieldTouch(false);
                            setFieldsValue({
                              phieumuahangngoai: {
                                fileXacNhan: null,
                              },
                            });
                          }}
                        />
                      </span>
                    ) : (
                      <span>
                        <a
                          target="_blank"
                          href={BASE_URL_API + FileXacNhan}
                          rel="noopener noreferrer"
                          style={{
                            whiteSpace: "break-spaces",
                            wordBreak: "break-all",
                          }}
                        >
                          {FileXacNhan && FileXacNhan.split("/")[5]}{" "}
                        </a>
                      </span>
                    )}
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
                    label="Ngày giao dự kiến"
                    name={["phieumuahangngoai", "ngayGiaoDuKien"]}
                  >
                    <DatePicker
                      format={"DD/MM/YYYY"}
                      allowClear={false}
                      disabled={
                        type === "xacnhan" && info.tinhTrang === "Chưa xác nhận"
                          ? false
                          : true
                      }
                    />
                  </FormItem>
                </Col>
              </>
            )} */}
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
                  name={["phieumuahangngoai", "lyDoDuyetTuChoi"]}
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
        {(type === "new" || type === "edit") && (
          <div align={"end"} style={{ marginBottom: 10 }}>
            {type === "new" && (
              <Button
                icon={<UploadOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                onClick={() => setActiveModalImportVatTu(true)}
              >
                Import vật tư
              </Button>
            )}
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={() => {
                setDaTaEdit();
                setActiveModalChonVatTu(true);
              }}
            >
              Thêm vật tư
            </Button>
          </div>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1600, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={ListVatTu}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>
      {type === "xacnhan" && info.tinhTrang === "Chưa xác nhận" ? (
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
            disabled={info.tinhTrang !== "Chưa xác nhận"}
          >
            Từ chối
          </Button>
        </div>
      ) : null}
      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListVatTu.length !== 0}
        />
      ) : null}
      <ModalChonVatTu
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        itemVatTu={ListVatTu && ListVatTu}
        DataThemVatTu={DataThemVatTu}
        ListUserThuMua={ListUserKy}
        isMuaHangTrongNuoc={isMuaHangTrongNuoc}
        dataEdit={daTaEdit && daTaEdit}
      />
      <ImportDanhSachVatTu
        openModal={ActiveModalImportVatTu}
        openModalFS={setActiveModalImportVatTu}
        itemData={ListVatTu && ListVatTu}
        DataThemVatTu={DataThemVatTu}
        isMuaHangTrongNuoc={isMuaHangTrongNuoc}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default PhieuMuaHangNgoaiForm;
