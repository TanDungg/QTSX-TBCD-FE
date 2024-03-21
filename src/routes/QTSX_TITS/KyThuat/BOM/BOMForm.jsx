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
  Upload,
  Popover,
  Alert,
  Tag,
} from "antd";
import Helper from "src/helpers";
import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";
import {
  Input,
  Select,
  FormSubmit,
  EditableTableRow,
  Table,
  Modal,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  getDateNow,
  getLocalStorage,
  exportExcel,
  getTokenInfo,
  reDataForTable,
  convertObjectToUrlParams,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import Helpers from "src/helpers";
import {
  DeleteOutlined,
  DownloadOutlined,
  SettingOutlined,
  UploadOutlined,
  RollbackOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import moment from "moment";
import { messages } from "src/constants/Messages";
import ModalThietLap from "./ModalThietLap";
const { EditableRow, EditableCell } = EditableTableRow;

const FormItem = Form.Item;

function BOMForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [SanPham, setSanPham] = useState("");
  const [fileName, setFileName] = useState("");
  const [ActiceModalThietLap, setActiceModalThietLap] = useState(false);
  const [message, setMessageError] = useState([]);
  const [IsLoi, setIsLoi] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [info, setInfo] = useState({});
  const [fieldTouch, setFieldTouch] = useState(false);
  const { setFieldsValue, validateFields, resetFields } = form;
  const [dataThietLap, setDataThietLap] = useState([]);
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getListSanPham();
        getUserKy(INFO);
        setFieldsValue({
          BOM: {
            ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
            ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
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
  const getUserKy = (info) => {
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

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BOM/${id}`,
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
          setDataThietLap(res.data.congDoanSuDung);
          setListChiTiet(
            res.data.list_ChiTiets.map((ct) => {
              const thuTuChuyenDong = {};
              ct.thuTuChuyen_Dong.forEach((cd) => {
                thuTuChuyenDong[cd.tits_qtsx_TramXuong_Id] = cd.thuTu;
              });
              return {
                ...ct,
                ...thuTuChuyenDong,
                STT: ct.thuTuNguoiDung,
                dai: ct.quyCach.dai,
                rong: ct.quyCach.rong,
                day: ct.quyCach.day,
                dn: ct.quyCach.dn,
                dt: ct.quyCach.dt,
                chung: ct.quyCach.chung,
                ed: ct.thuTuChuyen_Tinh.eD,
                giaCong: ct.thuTuChuyen_Tinh.giaCong,
                kho: ct.thuTuChuyen_Tinh.kho,
                nmk: ct.thuTuChuyen_Tinh.nmk,
                xiMa: ct.thuTuChuyen_Tinh.xiMa,
              };
            })
          );
          setFieldsValue({
            BOM: {
              ...res.data,
              ngayBanHanh: moment(res.data.ngayBanHanh, "DD/MM/YYYY"),
              ngayApDung: moment(res.data.ngayApDung, "DD/MM/YYYY"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  let colValues = () => {
    const data = dataThietLap.map((dt, i) => {
      return {
        title: dt.name,
        dataIndex: dt.tits_qtsx_TramXuong_Id,
        key: dt.tits_qtsx_TramXuong_Id,
        align: "center",
        width: 55,
      };
    });
    const col = [
      {
        title: "STT",
        key: "STT",
        width: 45,
        align: "center",
        render: (val) => {
          if (val.STT === "*") {
            return <span style={{ fontWeight: "bold" }}>{val.STT}</span>;
          } else {
            return <span>{val.STT}</span>;
          }
        },
        fixed: width > 992 ? "left" : "none",
      },
      {
        title: "Mã chi tiết",
        dataIndex: "maChiTiet",
        key: "maChiTiet",
        align: "center",
        width: 150,
        fixed: width > 992 ? "left" : "none",
      },
      {
        title: "Tên chi tiết",
        key: "tenChiTiet",
        align: "center",
        width: 150,
        render: (val) => {
          if (val.STT === "*") {
            return <span style={{ fontWeight: "bold" }}>{val.tenChiTiet}</span>;
          } else {
            return <span>{val.tenChiTiet}</span>;
          }
        },
        fixed: width > 992 ? "left" : "none",
      },
      {
        title: "Vật liệu",
        dataIndex: "vatLieu",
        key: "vatLieu",
        align: "center",
        width: 120,
      },
      {
        title: "Xuất xứ",
        dataIndex: "xuatXu",
        key: "xuatXu",
        align: "center",
        width: 70,
      },
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
      {
        title: "SL/SP",
        dataIndex: "dinhMuc",
        key: "dinhMuc",
        align: "center",
        width: 55,
      },
      {
        title: "KL/SP",
        dataIndex: "khoiLuong",
        key: "khoiLuong",
        align: "center",
        width: 55,
      },
      {
        title: "Gia công",
        dataIndex: "giaCong",
        key: "giaCong",
        align: "center",
        width: 55,
      },
      {
        title: "ED",
        dataIndex: "ed",
        key: "ed",
        align: "center",
        width: 55,
      },
      {
        title: "Xi mạ",
        dataIndex: "xiMa",
        key: "xiMa",
        align: "center",
        width: 55,
      },
      {
        title: "NMK",
        dataIndex: "nmk",
        key: "nmk",
        align: "center",
        width: 55,
      },
      {
        title: "Kho",
        dataIndex: "kho",
        key: "kho",
        align: "center",
        width: 55,
      },
      ...data,
      {
        title: "Phương pháp gia công",
        dataIndex: "phuongPhapGiaCong",
        key: "phuongPhapGiaCong",
        align: "center",
        width: 100,
      },
      {
        title: "Phân trạm",
        dataIndex: "maTram",
        key: "maTram",
        align: "center",
        width: 100,
      },
      {
        title: "Ghi chú kỹ thuật",
        dataIndex: "moTa",
        key: "moTa",
        align: "center",
        width: 150,
      },
    ];
    if (IsLoi) {
      col.splice(0, 0, {
        title: "Lỗi",
        dataIndex: "ghiChuImport",
        key: "ghiChuImport",
        width: 150,
        align: "center",
      });
    }
    return col;
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
  const TaiFileMau = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BOM/export-file?tits_qtsx_SanPham_Id=${SanPham}`,
          "POST",
          dataThietLap,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_BOM", res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["BOM"];
      let checkMau =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 5 }, e: { c: 0, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 0, r: 5 }, e: { c: 0, r: 5 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 1, r: 5 }, e: { c: 1, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 5 }, e: { c: 1, r: 5 } },
          })[0]
          .toString()
          .trim() === "Mã số chi tiết" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 2, r: 5 }, e: { c: 2, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 5 }, e: { c: 2, r: 5 } },
          })[0]
          .toString()
          .trim() === "Tên chi tiết" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 3, r: 5 }, e: { c: 3, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 5 }, e: { c: 3, r: 5 } },
          })[0]
          .toString()
          .trim() === "Vật liệu" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 4, r: 5 }, e: { c: 4, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 5 }, e: { c: 4, r: 5 } },
          })[0]
          .toString()
          .trim() === "Xuất xứ" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 5, r: 5 }, e: { c: 5, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 5 }, e: { c: 5, r: 5 } },
          })[0]
          .toString()
          .trim() === "Dài" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 6, r: 5 }, e: { c: 6, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 5 }, e: { c: 6, r: 5 } },
          })[0]
          .toString()
          .trim() === "Rộng" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 7, r: 5 }, e: { c: 7, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 5 }, e: { c: 7, r: 5 } },
          })[0]
          .toString()
          .trim() === "Dày" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 8, r: 5 }, e: { c: 8, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 5 }, e: { c: 8, r: 5 } },
          })[0]
          .toString()
          .trim() === "Dn" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 9, r: 5 }, e: { c: 9, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 5 }, e: { c: 9, r: 5 } },
          })[0]
          .toString()
          .trim() === "Dt" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 10, r: 5 }, e: { c: 10, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 5 }, e: { c: 10, r: 5 } },
          })[0]
          .toString()
          .trim() === "Chung" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 11, r: 5 }, e: { c: 11, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 11, r: 5 }, e: { c: 11, r: 5 } },
          })[0]
          .toString()
          .trim() === "Sl/xe" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 12, r: 5 }, e: { c: 12, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 12, r: 5 }, e: { c: 12, r: 5 } },
          })[0]
          .toString()
          .trim() === "Kl/xe" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 13, r: 5 }, e: { c: 13, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 13, r: 5 }, e: { c: 13, r: 5 } },
          })[0]
          .toString()
          .trim() === "Gia công" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 14, r: 5 }, e: { c: 14, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 14, r: 5 }, e: { c: 14, r: 5 } },
          })[0]
          .toString()
          .trim() === "ED" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 15, r: 5 }, e: { c: 15, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 15, r: 5 }, e: { c: 15, r: 5 } },
          })[0]
          .toString()
          .trim() === "Xi mạ" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 16, r: 5 }, e: { c: 16, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 16, r: 5 }, e: { c: 16, r: 5 } },
          })[0]
          .toString()
          .trim() === "NMK" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 17, r: 5 }, e: { c: 17, r: 5 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 17, r: 5 }, e: { c: 17, r: 5 } },
          })[0]
          .toString()
          .trim() === "Kho";
      dataThietLap.forEach((dt, index) => {
        if (
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: {
              s: { c: 17 + index + 1, r: 5 },
              e: { c: 17 + index + 1, r: 5 },
            },
          })[0] &&
          XLSX.utils
            .sheet_to_json(worksheet, {
              header: 1,
              range: {
                s: { c: 17 + index + 1, r: 5 },
                e: { c: 17 + index + 1, r: 5 },
              },
            })[0]
            .toString()
            .trim() !== dt.name
        ) {
          checkMau = false;
        }
      });
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 5,
        });
        const MCT = "Mã số chi tiết";
        const TCT = "Tên chi tiết";
        const VL = "Vật liệu";
        const XX = "Xuất xứ";
        const DM = "Sl/xe";
        const KL = "Kl/xe";
        const PPGC = "Phương pháp gia công";
        const MT = "Mã trạm";
        const GCKT = "Ghi chú kĩ thuật";
        const NewData = [];
        let checkLoi = false;
        data.forEach((d) => {
          if (
            (typeof d[TCT] !== "undefined" &&
              (d[TCT] !== 0 || d[TCT] === 0) &&
              d[TCT].toString().trim() !== "") ||
            (typeof d[MCT] !== "undefined" &&
              (d[TCT] !== 0 || d[TCT] === 0) &&
              d[MCT].toString().trim() !== "") ||
            (typeof d.STT !== "undefined" &&
              (d.STT !== 0 || d.STT === 0) &&
              d.STT.toString().trim() !== "")
          ) {
            const object = {};
            dataThietLap.forEach((dt) => {
              object[dt.tits_qtsx_TramXuong_Id] =
                d[dt.name] !== undefined
                  ? d[dt.name].toString().trim() !== ""
                    ? d[dt.name].toString().trim()
                    : undefined
                  : undefined;
            });
            NewData.push({
              ...object,
              STT:
                d.STT !== undefined
                  ? d.STT.toString().trim() !== ""
                    ? d.STT.toString().trim()
                    : undefined
                  : undefined,
              tenChiTiet:
                d[TCT] !== undefined
                  ? d[TCT].toString().trim() !== ""
                    ? d[TCT].toString().trim()
                    : undefined
                  : undefined,
              maChiTiet:
                d[MCT] !== undefined
                  ? d[MCT].toString().trim() !== ""
                    ? d[MCT].toString().trim()
                    : undefined
                  : undefined,
              vatLieu:
                d[VL] !== undefined
                  ? d[VL].toString().trim() !== ""
                    ? d[VL].toString().trim()
                    : undefined
                  : undefined,
              xuatXu:
                d[XX] !== undefined
                  ? d[XX].toString().trim() !== ""
                    ? d[XX].toString().trim()
                    : undefined
                  : undefined,
              khoiLuong:
                d[KL] !== undefined
                  ? d[KL].toString().trim() !== ""
                    ? Number(d[KL].toString().trim()).toFixed(1)
                    : undefined
                  : undefined,
              dinhMuc:
                d[DM] !== undefined
                  ? d[DM].toString().trim() !== ""
                    ? d[DM].toString().trim()
                    : undefined
                  : undefined,
              phuongPhapGiaCong:
                d[PPGC] !== undefined
                  ? d[PPGC].toString().trim() !== ""
                    ? d[PPGC].toString().trim()
                    : undefined
                  : undefined,
              moTa:
                d[GCKT] !== undefined
                  ? d[GCKT].toString().trim() !== ""
                    ? d[GCKT].toString().trim()
                    : undefined
                  : undefined,
              maTram:
                d[MT] !== undefined
                  ? d[MT].toString().trim() !== ""
                    ? d[MT].toString().trim()
                    : undefined
                  : undefined,
              dai:
                d["Dài"] !== undefined
                  ? d["Dài"].toString().trim() !== ""
                    ? d["Dài"].toString().trim()
                    : undefined
                  : undefined,
              rong:
                d["Rộng"] !== undefined
                  ? d["Rộng"].toString().trim() !== ""
                    ? d["Rộng"].toString().trim()
                    : undefined
                  : undefined,
              day:
                d["Dày"] !== undefined
                  ? d["Dày"].toString().trim() !== ""
                    ? d["Dày"].toString().trim()
                    : undefined
                  : undefined,
              dn:
                d["Dn"] !== undefined
                  ? d["Dn"].toString().trim() !== ""
                    ? d["Dn"].toString().trim()
                    : undefined
                  : undefined,
              dt:
                d["Dt"] !== undefined
                  ? d["Dt"].toString().trim() !== ""
                    ? d["Dt"].toString().trim()
                    : undefined
                  : undefined,
              chung:
                d.Chung !== undefined
                  ? d.Chung.toString().trim() !== ""
                    ? d.Chung.toString().trim()
                    : undefined
                  : undefined,
              kho:
                d["Kho"] !== undefined
                  ? d["Kho"].toString().trim() !== ""
                    ? d["Kho"].toString().trim()
                    : undefined
                  : undefined,
              ed:
                d["ED"] !== undefined
                  ? d["ED"].toString().trim() !== ""
                    ? d["ED"].toString().trim()
                    : undefined
                  : undefined,
              giaCong:
                d["Gia công"] !== undefined
                  ? d["Gia công"].toString().trim() !== ""
                    ? d["Gia công"].toString().trim()
                    : undefined
                  : undefined,
              xiMa:
                d["Xi mạ"] !== undefined
                  ? d["Xi mạ"].toString().trim() !== ""
                    ? d["Xi mạ"].toString().trim()
                    : undefined
                  : undefined,
              nmk:
                d["NMK"] !== undefined
                  ? d["NMK"].toString().trim() !== ""
                    ? d["NMK"].toString().trim()
                    : undefined
                  : undefined,
              ghiChuImport:
                d["Dài"] !== undefined && typeof d["Dài"] !== "number"
                  ? "Dài không phải là số"
                  : d["Rộng"] !== undefined && typeof d["Rộng"] !== "number"
                  ? "Rộng không phải là số"
                  : d["Dày"] !== undefined && typeof d["Dày"] !== "number"
                  ? "Dày không phải là số"
                  : d["Dn"] !== undefined && typeof d["Dn"] !== "number"
                  ? "Dn không phải là số"
                  : d["Dt"] !== undefined && typeof d["Dt"] !== "number"
                  ? "Dt không phải là số"
                  : d[DM] !== undefined && typeof d[DM] !== "number"
                  ? "SL/SP không phải là số nguyên"
                  : undefined,
            });
            if (
              (d["Dài"] !== undefined && typeof d["Dài"] !== "number") ||
              (d["Rộng"] !== undefined && typeof d["Rộng"] !== "number") ||
              (d["Dày"] !== undefined && typeof d["Dày"] !== "number") ||
              (d["Dn"] !== undefined && typeof d["Dn"] !== "number") ||
              (d["Dt"] !== undefined && typeof d["Dt"] !== "number") ||
              (d[DM] !== undefined && typeof d[DM] !== "number")
            ) {
              checkLoi = true;
            }
          }
        });
        if (checkLoi) {
          setIsLoi(true);
        } else {
          setIsLoi(false);
        }
        if (NewData.length === 0) {
          setFileName(file.name);
          setListChiTiet([]);
          setFieldTouch(false);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          let maChiTietSet = new Set();
          const indices = [];
          // Duyệt qua từng phần tử trong danh sách
          NewData.forEach((item, index) => {
            // Kiểm tra nếu là phần tử có STT = "*"
            if (item.STT === "*") {
              // Reset Set khi gặp dấu sao
              maChiTietSet = new Set();
            } else {
              // Kiểm tra xem maChiTiet đã tồn tại trong Set chưa
              if (
                maChiTietSet.has(item.maChiTiet) &&
                item.maChiTiet !== undefined
              ) {
                indices.push(
                  item.STT +
                    item.maChiTiet +
                    item.tenChiTiet +
                    item.vatLieu +
                    item.dai +
                    item.rong +
                    item.day
                );
              } else {
                // Nếu chưa có, thêm vào Set
                maChiTietSet.add(item.maChiTiet);
              }
            }
          });

          if (indices.length > 0) {
            setMessageError("Có chi tiết trong 1 cụm trùng nhau");
            Helper.alertError("Có chi tiết trong 1 cụm trùng nhau");
            setHangTrung(indices);
            setFieldTouch(false);
          } else {
            setHangTrung([]);
            setFieldTouch(true);
          }
          setFieldTouch(true);
          setListChiTiet(NewData);
          setFileName(file.name);
        }
      } else {
        setFileName(file.name);
        setListChiTiet([]);
        setFieldTouch(false);
        setMessageError("Mẫu import không hợp lệ");
        Helper.alertError("Mẫu file import không hợp lệ");
      }
    };
    reader.readAsBinaryString(file);
  };

  const props = {
    accept: ".xls, .xlsx",
    beforeUpload: (file) => {
      const isPNG =
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (!isPNG) {
        Helper.alertError(messages.UPLOAD_ERROR);
        return isPNG || Upload.LIST_IGNORE;
      } else {
        xuLyExcel(file);
        return false;
      }
    },

    showUploadList: false,
    maxCount: 1,
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    if (ListChiTiet.length === 0) {
      Helpers.alertError("Chưa import chi tiết BOM");
    } else {
      saveData(values.BOM);
    }
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        if (ListChiTiet.length === 0) {
          Helpers.alertError("Chưa import chi tiết BOM");
        } else {
          saveData(values.BOM, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (BOM, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...BOM,
        donVi_Id: INFO.donVi_Id,
        ngayBanHanh: BOM.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: BOM.ngayApDung.format("DD/MM/YYYY"),
        congDoanSuDung: dataThietLap,
        list_ChiTiets: ListChiTiet.map((ct) => {
          let keys = Object.keys(ct);
          return {
            ...ct,
            thuTuNguoiDung: ct.STT,
            thuTuChuyen_Tinh: {
              giaCong: ct.giaCong,
              ed: ct.ed,
              xiMa: ct.xiMa,
              nmk: ct.nmk,
              kho: ct.kho,
            },
            thuTuChuyen_Dong: dataThietLap.map((dt) => {
              let key = "";
              keys.forEach((k) => {
                if (k === dt.tits_qtsx_TramXuong_Id) {
                  key = k;
                }
              });
              return {
                tits_qtsx_TramXuong_Id: dt.tits_qtsx_TramXuong_Id,
                thuTu: ct[key] ? ct[key] : undefined,
              };
            }),
            quyCach: {
              dai: ct.dai,
              rong: ct.rong,
              day: ct.day,
              dn: ct.dn,
              dt: ct.dt,
              chung: ct.chung,
            },
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BOM`,
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
          if (res && res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setListChiTiet([]);
              setDataThietLap([]);
              setFileName(null);
              setFieldsValue({
                BOM: {
                  ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
            }
          } else if (res.status === 409) {
            res.data.forEach((dt) => {
              ListChiTiet.forEach((ct) => {
                if (dt.maChiTiet === ct.maChiTiet && dt.ghiChuImport) {
                  ct.ghiChuImport = dt.ghiChuImport;
                }
              });
            });
            setIsLoi(true);
            setListChiTiet([...ListChiTiet]);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit") {
      const newData = {
        ...BOM,
        ngayBanHanh: BOM.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: BOM.ngayApDung.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_BOM/${id}`,
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
          if (res && res.status === 200) {
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
          `tits_qtsx_BOM/duyet/${id}`,
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
      "Thêm mới BOM"
    ) : type === "edit" ? (
      "Chỉnh sửa BOM"
    ) : type === "xacnhan" ? (
      <span>
        Duyệt BOM{" "}
        <Tag
          style={{ fontSize: 14 }}
          color={
            info && info.tinhTrang === "Đã xác nhận"
              ? "green"
              : info && info.tinhTrang === "Chưa xác nhận"
              ? "blue"
              : "red"
          }
        >
          {info && info.maBOM} - {info && info.tinhTrang}
        </Tag>
      </span>
    ) : (
      <span>
        Chi tiết BOM{" "}
        <Tag
          style={{ fontSize: 14 }}
          color={
            info && info.tinhTrang === "Đã xác nhận"
              ? "green"
              : info && info.tinhTrang === "Chưa xác nhận"
              ? "blue"
              : "red"
          }
        >
          {info && info.maBOM} - {info && info.tinhTrang}
        </Tag>
      </span>
    );
  const disableDate = (current) => {
    return (
      current &&
      current < form.getFieldValue("BOM") &&
      form.getFieldValue("BOM").ngayBanHanh.endOf("day")
    );
  };
  const disableDateNgayApDung = (current) => {
    return (
      current &&
      current > form.getFieldValue("BOM") &&
      form.getFieldValue("BOM").ngayApDung.endOf("day")
    );
  };
  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      if (
        HangTrung.some(
          (maChiTiet) =>
            current.STT +
              current.maChiTiet +
              current.tenChiTiet +
              current.vatLieu +
              current.dai +
              current.rong +
              current.day ===
            maChiTiet
        )
      ) {
        return "red-row";
      }
    }
    if (current.ghiChuImport !== undefined && IsLoi) {
      setFieldTouch(false);
      return "red-row";
    } else if (current.tenChiTiet === undefined) {
      setFieldTouch(false);
      setMessageError("Tên chi tiết không được rỗng");
      return "red-row";
    } else if (current.maChiTiet === undefined) {
      setFieldTouch(false);
      setMessageError("Mã chi tiết không được rỗng");
      return "red-row";
    }
    return "";
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
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
                  label="Tên BOM"
                  name={["BOM", "tenBOM"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên BOM không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên BOM"
                    disabled={type !== "new" && type !== "edit"}
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
                  label="Ngày ban hành"
                  name={["BOM", "ngayBanHanh"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    format={"DD/MM/YYYY"}
                    disabledDate={disableDateNgayApDung}
                    disabled={type !== "new" && type !== "edit"}
                    allowClear={false}
                    onChange={(dates, dateString) => {
                      setFieldsValue({
                        BOM: {
                          ngayBanHanh: moment(dateString, "DD/MM/YYYY"),
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
                  label="Ngày áp dụng"
                  name={["BOM", "ngayApDung"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    disabled={type !== "new" && type !== "edit"}
                    disabledDate={disableDate}
                    format={"DD/MM/YYYY"}
                    allowClear={false}
                    onChange={(dates, dateString) => {
                      setFieldsValue({
                        BOM: {
                          ngayApDung: moment(dateString, "DD/MM/YYYY"),
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
                    disabled={type !== "new"}
                    onSelect={(val) => setSanPham(val)}
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
                  name={["BOM", "nguoiKiemTra_Id"]}
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
                    optionsvalue={["id", "user"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={type !== "new" && type !== "edit"}
                    onSelect={(val) => {}}
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
                  name={["BOM", "nguoiPheDuyet_Id"]}
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
                    optionsvalue={["id", "user"]}
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
      <Card className="th-card-margin-bottom" title="Thông tin vật tư BOM">
        {type === "new" && (
          <>
            <Row align="middle">
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
                <Button
                  type="primary"
                  icon={<SettingOutlined />}
                  onClick={() => {
                    setActiceModalThietLap(true);
                  }}
                >
                  Thiết lập
                </Button>
              </Col>
              <Col xxl={22} xl={21} lg={20} md={20} sm={18} xs={17}>
                {dataThietLap.map((dt) => {
                  return <Tag color="green">{dt.name}</Tag>;
                })}
              </Col>
            </Row>
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
                        !fieldTouch ? (
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
        )}
        <Table
          style={{ marginTop: 10 }}
          bordered
          scroll={{ x: 1800, y: "60vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListChiTiet)}
          size="small"
          loading={loading}
          rowClassName={RowStyle}
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
      <ModalThietLap
        openModal={ActiceModalThietLap}
        openModalFS={setActiceModalThietLap}
        saveThietLap={setDataThietLap}
        dataTL={dataThietLap}
      />
    </div>
  );
}

export default BOMForm;
