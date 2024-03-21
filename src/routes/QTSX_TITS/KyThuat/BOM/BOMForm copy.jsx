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
  ModalDeleteConfirm,
  EditableTableRow,
  Table,
  Modal,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  exportExcel,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import Helpers from "src/helpers";
import {
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  SettingOutlined,
  UploadOutlined,
  RollbackOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import moment from "moment";
import ImportBOM from "./ImportBOM";
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
  const { loading } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListChiTiet, setListChiTiet] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [SanPham, setSanPham] = useState("");
  const [fileName, setFileName] = useState("");
  const [ActiceModalThietLap, setActiceModalThietLap] = useState(false);
  const [message, setMessageError] = useState([]);
  const [DataLoi, setDataLoi] = useState();
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
        setListUserKy(res.data);
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
              return {
                ...ct,
                STT: ct.thuTuNguoiDung,
                dai: ct.quyCach.dai,
                rong: ct.quyCach.rong,
                day: ct.quyCach.day,
                dn: ct.quyCach.dn,
                dt: ct.quyCach.dt,
                chanDot: ct.thuTuChuyen.chanDot,
                cuaVong: ct.thuTuChuyen.cuaVong,
                dongKien: ct.thuTuChuyen.dongKien,
                eD: ct.thuTuChuyen.eD,
                giaCong: ct.thuTuChuyen.giaCong,
                kho: ct.thuTuChuyen.kho,
                khoanLo: ct.thuTuChuyen.khoanLo,
                kiemDinh: ct.thuTuChuyen.kiemDinh,
                lazer: ct.thuTuChuyen.lazer,
                lazerDamH: ct.thuTuChuyen.lazerDamH,
                nMK: ct.thuTuChuyen.nMK,
                phunBi: ct.thuTuChuyen.phunBi,
                son: ct.thuTuChuyen.son,
                vatMep: ct.thuTuChuyen.vatMep,
                xHKX: ct.thuTuChuyen.xHKX,
                xHLKR: ct.thuTuChuyen.xHLKR,
                xLR: ct.thuTuChuyen.xLR,
                xiMa: ct.thuTuChuyen.xiMa,
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
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "chi tiết";
    ModalDeleteConfirm(deleteItemAction, item, item.maChiTiet, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListSanPham.filter((d) => d.key !== item.key);
    setListSanPham(newData);
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItemVal =
      type === "new" || type === "edit"
        ? {
            onClick: () => {
              // setActiveModalEdit(true);
              // setTypeAddTable("edit");
              // setInfoSanPham(item);
            },
          }
        : { disabled: true };
    const deleteItemVal =
      type === "new" || type === "edit"
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...editItemVal} title="Xóa">
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
  const renderLoi = (val) => {
    let check = false;
    let messageLoi = "";
    if (DataLoi && DataLoi.length > 0) {
      DataLoi.forEach((dt) => {
        if (dt.maChiTiet === val.maChiTiet) {
          check = true;
          messageLoi = dt.ghiChuImport;
        }
      });
    }
    return check ? (
      <Popover content={<span style={{ color: "red" }}>{messageLoi}</span>}>
        {val.maChiTiet}
      </Popover>
    ) : val.STT === "*" ? (
      <span style={{ fontWeight: "bold" }}>{val.maChiTiet}</span>
    ) : (
      <span>{val.maChiTiet}</span>
    );
  };
  let colValues = () => {
    const ThietLap = {
      title: "Chuyển",
      key: "chuyen",
      align: "center",
      children: [],
    };
    if (dataThietLap.giaCong || dataThietLap.ed || dataThietLap.xiMa) {
      ThietLap.children.push({
        title: "THCK(CMC)",
        key: "THCK(CMC)",
        align: "center",
        children: [],
      });
      if (dataThietLap.giaCong) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "THCK(CMC)") {
            cd.children.push({
              title: "Gia công",
              dataIndex: "giaCong",
              key: "giaCong",
              align: "center",
              width: 55,
            });
          }
        });
      }
      if (dataThietLap.ed) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "THCK(CMC)") {
            cd.children.push({
              title: "ED",
              dataIndex: "eD",
              key: "eD",
              align: "center",
              width: 50,
            });
          }
        });
      }
      if (dataThietLap.xiMa) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "THCK(CMC)") {
            cd.children.push({
              title: "Xi mạ",
              key: "xiMa",
              dataIndex: "xiMa",
              align: "center",
              width: 50,
            });
          }
        });
      }
    }
    if (dataThietLap.nmk) {
      ThietLap.children.push({
        title: "NMK",
        dataIndex: "nMK",
        key: "nMK",
        align: "center",
        width: 50,
      });
    }
    if (
      dataThietLap.kho ||
      dataThietLap.lazer ||
      dataThietLap.lazerDamH ||
      dataThietLap.cuaVong ||
      dataThietLap.chanDot ||
      dataThietLap.vatMep ||
      dataThietLap.khoanLo ||
      dataThietLap.xhlkr ||
      dataThietLap.xhkx ||
      dataThietLap.phunBi ||
      dataThietLap.son ||
      dataThietLap.xlr ||
      dataThietLap.kiemDinh ||
      dataThietLap.dongKien
    ) {
      ThietLap.children.push({
        title: "Công ty SMRM & Cấu kiện nặng(TITS)",
        key: "Công ty SMRM & Cấu kiện nặng(TITS)",
        align: "center",
        children: [],
      });
      if (dataThietLap.kho) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "Kho",
              dataIndex: "kho",
              key: "kho",
              align: "center",
              width: 50,
            });
          }
        });
      }
      if (
        dataThietLap.lazer ||
        dataThietLap.lazerDamH ||
        dataThietLap.cuaVong ||
        dataThietLap.chanDot ||
        dataThietLap.vatMep ||
        dataThietLap.khoanLo
      ) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "Xưởng GCCT",
              key: "Xưởng GCCT",
              align: "center",
              children: [],
            });
          }
        });
        if (dataThietLap.lazer) {
          ThietLap.children.forEach((cd) => {
            if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
              cd.children.forEach((ct) => {
                if (ct.title === "Xưởng GCCT") {
                  ct.children.push({
                    title: "Lazer",
                    dataIndex: "lazer",
                    key: "lazer",
                    align: "center",
                    width: 50,
                  });
                }
              });
            }
          });
        }
        if (dataThietLap.lazerDamH) {
          ThietLap.children.forEach((cd) => {
            if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
              cd.children.forEach((ct) => {
                if (ct.title === "Xưởng GCCT") {
                  ct.children.push({
                    title: "Lazer Dầm H",
                    dataIndex: "lazerDamH",
                    key: "lazerDamH",
                    align: "center",
                    width: 50,
                  });
                }
              });
            }
          });
        }
        if (dataThietLap.cuaVong) {
          ThietLap.children.forEach((cd) => {
            if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
              cd.children.forEach((ct) => {
                if (ct.title === "Xưởng GCCT") {
                  ct.children.push({
                    title: "Cưa vòng",
                    key: "cuaVong",
                    dataIndex: "cuaVong",
                    align: "center",
                    width: 50,
                  });
                }
              });
            }
          });
        }
        if (dataThietLap.chanDot) {
          ThietLap.children.forEach((cd) => {
            if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
              cd.children.forEach((ct) => {
                if (ct.title === "Xưởng GCCT") {
                  ct.children.push({
                    title: "Chấn/ Đột",
                    key: "chanDot",
                    dataIndex: "chanDot",
                    align: "center",
                    width: 50,
                  });
                }
              });
            }
          });
        }
        if (dataThietLap.vatMep) {
          ThietLap.children.forEach((cd) => {
            if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
              cd.children.forEach((ct) => {
                if (ct.title === "Xưởng GCCT") {
                  ct.children.push({
                    title: "Vát mép",
                    key: "vatMep",
                    dataIndex: "vatMep",
                    align: "center",
                    width: 50,
                  });
                }
              });
            }
          });
        }
        if (dataThietLap.khoanLo) {
          ThietLap.children.forEach((cd) => {
            if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
              cd.children.forEach((ct) => {
                if (ct.title === "Xưởng GCCT") {
                  ct.children.push({
                    title: "Khoan lỗ",
                    key: "khoanLo",
                    dataIndex: "khoanLo",
                    align: "center",
                    width: 55,
                  });
                }
              });
            }
          });
        }
      }
      if (dataThietLap.xhlkr) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "XHLKR",
              key: "xHLKR",
              dataIndex: "xHLKR",
              align: "center",
              width: 60,
            });
          }
        });
      }
      if (dataThietLap.xhkx) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "XHKX",
              key: "xHKX",
              dataIndex: "xHKX",
              align: "center",
              width: 55,
            });
          }
        });
      }
      if (dataThietLap.phunBi) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "Phun bi",
              key: "phunBi",
              dataIndex: "phunBi",
              align: "center",
              width: 55,
            });
          }
        });
      }
      if (dataThietLap.son) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "Sơn",
              key: "son",
              dataIndex: "son",
              align: "center",
              width: 55,
            });
          }
        });
      }
      if (dataThietLap.xlr) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "X - LR",
              key: "xLR",
              dataIndex: "xLR",
              align: "center",
              width: 55,
            });
          }
        });
      }
      if (dataThietLap.kiemDinh) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "Kiểm định",
              key: "kiemDinh",
              dataIndex: "kiemDinh",
              align: "center",
              width: 55,
            });
          }
        });
      }
      if (dataThietLap.dongKien) {
        ThietLap.children.forEach((cd) => {
          if (cd.title === "Công ty SMRM & Cấu kiện nặng(TITS)") {
            cd.children.push({
              title: "Đóng kiện",
              key: "dongKien",
              dataIndex: "dongKien",
              align: "center",
              width: 55,
            });
          }
        });
      }
    }
    return [
      {
        title: "STT",
        // dataIndex: "STT",
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
      },
      {
        title: "Mã chi tiết",
        // dataIndex: "maChiTiet",
        key: "maChiTiet",
        align: "center",
        width: 150,
        render: (val) => renderLoi(val),
      },
      {
        title: "Tên chi tiết",
        // dataIndex: "tenChiTiet",
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
        title: "Quy cách(mm)",
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
      ThietLap,
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
      // {
      //   title: "Chức năng",
      //   key: "action",
      //   align: "center",
      //   width: 80,
      //   render: (value) => actionContent(value),
      // },
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
  const TaiFileMau = () => {
    const param = convertObjectToUrlParams({
      tits_qtsx_SanPham_Id: SanPham,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BOM/export-file?${param}`,
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
          .trim() === "Quy cách (mm)" &&
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
          range: { s: { c: 5, r: 8 }, e: { c: 5, r: 8 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 8 }, e: { c: 5, r: 8 } },
          })[0]
          .toString()
          .trim() === "Dài" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 6, r: 8 }, e: { c: 6, r: 8 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 8 }, e: { c: 6, r: 8 } },
          })[0]
          .toString()
          .trim() === "Rộng" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 7, r: 8 }, e: { c: 7, r: 8 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 8 }, e: { c: 7, r: 8 } },
          })[0]
          .toString()
          .trim() === "Dày" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 8, r: 8 }, e: { c: 8, r: 8 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 8 }, e: { c: 8, r: 8 } },
          })[0]
          .toString()
          .trim() === "Dn" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 9, r: 8 }, e: { c: 9, r: 8 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 8 }, e: { c: 9, r: 8 } },
          })[0]
          .toString()
          .trim() === "Dt" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 10, r: 8 }, e: { c: 10, r: 8 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 8 }, e: { c: 10, r: 8 } },
          })[0]
          .toString()
          .trim() === "Chung" &&
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
          .trim() === "Chuyển";

      if (dataThietLap.giaCong || dataThietLap.ed || dataThietLap.xiMa) {
        if (
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 13, r: 6 }, e: { c: 13, r: 6 } },
          })[0] &&
          !XLSX.utils
            .sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: 13, r: 6 }, e: { c: 13, r: 6 } },
            })[0]
            .toString()
            .trim() === "THCK(CMC)"
        ) {
          checkMau = false;
        }
        if (dataThietLap.giaCong) {
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: 13, r: 7 }, e: { c: 13, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: 13, r: 7 }, e: { c: 13, r: 7 } },
              })[0]
              .toString()
              .trim() === "Gia công"
          ) {
            checkMau = false;
          }
        }
        if (dataThietLap.ed) {
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: {
                s: { c: !dataThietLap.giaCong ? 13 : 14, r: 7 },
                e: { c: 14, r: 7 },
              },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: {
                  s: { c: !dataThietLap.giaCong ? 13 : 14, r: 7 },
                  e: { c: 14, r: 7 },
                },
              })[0]
              .toString()
              .trim() === "ED"
          ) {
            checkMau = false;
          }
        }
        if (dataThietLap.xiMa) {
          const colum = dataThietLap.giaCong
            ? dataThietLap.ed
              ? 13 + 2
              : 13 + 1
            : dataThietLap.ed
            ? 13 + 1
            : 13;
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "Xi mạ"
          ) {
            checkMau = false;
          }
        }
      }
      if (dataThietLap.nmk) {
        let colum = 13;
        if (dataThietLap.ed) {
          colum += 1;
        }
        if (dataThietLap.giaCong) {
          colum += 1;
        }
        if (dataThietLap.xiMa) {
          colum += 1;
        }

        if (
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: colum, r: 6 }, e: { c: colum, r: 6 } },
          })[0] &&
          !XLSX.utils
            .sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 6 }, e: { c: colum, r: 6 } },
            })[0]
            .toString()
            .trim() === "NMK"
        ) {
          checkMau = false;
        }
      }
      if (
        dataThietLap.kho ||
        dataThietLap.lazer ||
        dataThietLap.lazerDamH ||
        dataThietLap.cuaVong ||
        dataThietLap.chanDot ||
        dataThietLap.vatMep ||
        dataThietLap.khoanLo ||
        dataThietLap.xhlkr ||
        dataThietLap.xhkx ||
        dataThietLap.phunBi ||
        dataThietLap.son ||
        dataThietLap.xlr ||
        dataThietLap.kiemDinh ||
        dataThietLap.dongKien
      ) {
        let colum = 13;
        if (dataThietLap.ed) {
          colum += 1;
        }
        if (dataThietLap.giaCong) {
          colum += 1;
        }
        if (dataThietLap.xiMa) {
          colum += 1;
        }
        if (dataThietLap.nmk) {
          colum += 1;
        }
        if (
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: colum, r: 6 }, e: { c: colum, r: 6 } },
          })[0] &&
          !XLSX.utils
            .sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 6 }, e: { c: colum, r: 6 } },
            })[0]
            .toString()
            .trim() === "Công ty SMRM & Cấu kiện nặng(TITS)"
        ) {
          checkMau = false;
        }
        if (dataThietLap.kho) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "Kho"
          ) {
            checkMau = false;
          }
        }
        if (
          dataThietLap.lazer ||
          dataThietLap.lazerDamH ||
          dataThietLap.cuaVong ||
          dataThietLap.chanDot ||
          dataThietLap.vatMep ||
          dataThietLap.khoanLo
        ) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (dataThietLap.kho) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "Xưởng GCCT"
          ) {
            checkMau = false;
          }
          if (dataThietLap.lazer) {
            let colum = 13;
            if (dataThietLap.ed) {
              colum += 1;
            }
            if (dataThietLap.giaCong) {
              colum += 1;
            }
            if (dataThietLap.xiMa) {
              colum += 1;
            }
            if (dataThietLap.nmk) {
              colum += 1;
            }
            if (dataThietLap.kho) {
              colum += 1;
            }
            if (
              XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
              })[0] &&
              !XLSX.utils
                .sheet_to_json(worksheet, {
                  header: 1,
                  range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
                })[0]
                .toString()
                .trim() === "Lazer"
            ) {
              checkMau = false;
            }
          }
          if (dataThietLap.lazerDamH) {
            let colum = 13;
            if (dataThietLap.ed) {
              colum += 1;
            }
            if (dataThietLap.giaCong) {
              colum += 1;
            }
            if (dataThietLap.xiMa) {
              colum += 1;
            }
            if (dataThietLap.nmk) {
              colum += 1;
            }
            if (dataThietLap.kho) {
              colum += 1;
            }
            if (dataThietLap.lazer) {
              colum += 1;
            }
            if (
              XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
              })[0] &&
              !XLSX.utils
                .sheet_to_json(worksheet, {
                  header: 1,
                  range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
                })[0]
                .toString()
                .trim() === "Lazer Dầm H"
            ) {
              checkMau = false;
            }
          }
          if (dataThietLap.cuaVong) {
            let colum = 13;
            if (dataThietLap.ed) {
              colum += 1;
            }
            if (dataThietLap.giaCong) {
              colum += 1;
            }
            if (dataThietLap.xiMa) {
              colum += 1;
            }
            if (dataThietLap.nmk) {
              colum += 1;
            }
            if (dataThietLap.kho) {
              colum += 1;
            }
            if (dataThietLap.lazer) {
              colum += 1;
            }
            if (dataThietLap.lazerDamH) {
              colum += 1;
            }
            if (
              XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
              })[0] &&
              !XLSX.utils
                .sheet_to_json(worksheet, {
                  header: 1,
                  range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
                })[0]
                .toString()
                .trim() === "Cưa vòng"
            ) {
              checkMau = false;
            }
          }
          if (dataThietLap.chanDot) {
            let colum = 13;
            if (dataThietLap.ed) {
              colum += 1;
            }
            if (dataThietLap.giaCong) {
              colum += 1;
            }
            if (dataThietLap.xiMa) {
              colum += 1;
            }
            if (dataThietLap.nmk) {
              colum += 1;
            }
            if (dataThietLap.kho) {
              colum += 1;
            }
            if (dataThietLap.lazer) {
              colum += 1;
            }
            if (dataThietLap.lazerDamH) {
              colum += 1;
            }
            if (dataThietLap.cuaVong) {
              colum += 1;
            }
            if (
              XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
              })[0] &&
              !XLSX.utils
                .sheet_to_json(worksheet, {
                  header: 1,
                  range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
                })[0]
                .toString()
                .trim() === "Chấn/ đột"
            ) {
              checkMau = false;
            }
          }
          if (dataThietLap.vatMep) {
            let colum = 13;
            if (dataThietLap.ed) {
              colum += 1;
            }
            if (dataThietLap.giaCong) {
              colum += 1;
            }
            if (dataThietLap.xiMa) {
              colum += 1;
            }
            if (dataThietLap.nmk) {
              colum += 1;
            }
            if (dataThietLap.kho) {
              colum += 1;
            }
            if (dataThietLap.lazer) {
              colum += 1;
            }
            if (dataThietLap.lazerDamH) {
              colum += 1;
            }
            if (dataThietLap.cuaVong) {
              colum += 1;
            }
            if (dataThietLap.chanDot) {
              colum += 1;
            }
            if (
              XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
              })[0] &&
              !XLSX.utils
                .sheet_to_json(worksheet, {
                  header: 1,
                  range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
                })[0]
                .toString()
                .trim() === "Vát mép"
            ) {
              checkMau = false;
            }
          }
          if (dataThietLap.khoanLo) {
            let colum = 13;
            if (dataThietLap.ed) {
              colum += 1;
            }
            if (dataThietLap.giaCong) {
              colum += 1;
            }
            if (dataThietLap.xiMa) {
              colum += 1;
            }
            if (dataThietLap.nmk) {
              colum += 1;
            }
            if (dataThietLap.kho) {
              colum += 1;
            }
            if (dataThietLap.lazer) {
              colum += 1;
            }
            if (dataThietLap.lazerDamH) {
              colum += 1;
            }
            if (dataThietLap.cuaVong) {
              colum += 1;
            }
            if (dataThietLap.chanDot) {
              colum += 1;
            }
            if (dataThietLap.vatMep) {
              colum += 1;
            }
            if (
              XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
              })[0] &&
              !XLSX.utils
                .sheet_to_json(worksheet, {
                  header: 1,
                  range: { s: { c: colum, r: 8 }, e: { c: colum, r: 8 } },
                })[0]
                .toString()
                .trim() === "Khoan lỗ"
            ) {
              checkMau = false;
            }
          }
        }
        if (dataThietLap.xhlkr) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (dataThietLap.kho) {
            colum += 1;
          }
          if (dataThietLap.lazer) {
            colum += 1;
          }
          if (dataThietLap.lazerDamH) {
            colum += 1;
          }
          if (dataThietLap.cuaVong) {
            colum += 1;
          }
          if (dataThietLap.chanDot) {
            colum += 1;
          }
          if (dataThietLap.vatMep) {
            colum += 1;
          }
          if (dataThietLap.khoanLo) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "XHLKR"
          ) {
            checkMau = false;
          }
        }
        if (dataThietLap.xhkx) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (dataThietLap.kho) {
            colum += 1;
          }
          if (dataThietLap.lazer) {
            colum += 1;
          }
          if (dataThietLap.lazerDamH) {
            colum += 1;
          }
          if (dataThietLap.cuaVong) {
            colum += 1;
          }
          if (dataThietLap.chanDot) {
            colum += 1;
          }
          if (dataThietLap.vatMep) {
            colum += 1;
          }
          if (dataThietLap.khoanLo) {
            colum += 1;
          }
          if (dataThietLap.xhlkr) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "XHKX"
          ) {
            checkMau = false;
          }
        }
        if (dataThietLap.phunBi) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (dataThietLap.kho) {
            colum += 1;
          }
          if (dataThietLap.lazer) {
            colum += 1;
          }
          if (dataThietLap.lazerDamH) {
            colum += 1;
          }
          if (dataThietLap.cuaVong) {
            colum += 1;
          }
          if (dataThietLap.chanDot) {
            colum += 1;
          }
          if (dataThietLap.vatMep) {
            colum += 1;
          }
          if (dataThietLap.khoanLo) {
            colum += 1;
          }
          if (dataThietLap.xhlkr) {
            colum += 1;
          }
          if (dataThietLap.xhkx) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "Phun bi"
          ) {
            checkMau = false;
          }
        }
        if (dataThietLap.son) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (dataThietLap.kho) {
            colum += 1;
          }
          if (dataThietLap.lazer) {
            colum += 1;
          }
          if (dataThietLap.lazerDamH) {
            colum += 1;
          }
          if (dataThietLap.cuaVong) {
            colum += 1;
          }
          if (dataThietLap.chanDot) {
            colum += 1;
          }
          if (dataThietLap.vatMep) {
            colum += 1;
          }
          if (dataThietLap.khoanLo) {
            colum += 1;
          }
          if (dataThietLap.xhlkr) {
            colum += 1;
          }
          if (dataThietLap.xhkx) {
            colum += 1;
          }
          if (dataThietLap.phunBi) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "Sơn"
          ) {
            checkMau = false;
          }
        }
        if (dataThietLap.xlr) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (dataThietLap.kho) {
            colum += 1;
          }
          if (dataThietLap.lazer) {
            colum += 1;
          }
          if (dataThietLap.lazerDamH) {
            colum += 1;
          }
          if (dataThietLap.cuaVong) {
            colum += 1;
          }
          if (dataThietLap.chanDot) {
            colum += 1;
          }
          if (dataThietLap.vatMep) {
            colum += 1;
          }
          if (dataThietLap.khoanLo) {
            colum += 1;
          }
          if (dataThietLap.xhlkr) {
            colum += 1;
          }
          if (dataThietLap.xhkx) {
            colum += 1;
          }
          if (dataThietLap.phunBi) {
            colum += 1;
          }
          if (dataThietLap.son) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString() === "X - LR"
          ) {
            checkMau = false;
          }
        }
        if (dataThietLap.kiemDinh) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (dataThietLap.kho) {
            colum += 1;
          }
          if (dataThietLap.lazer) {
            colum += 1;
          }
          if (dataThietLap.lazerDamH) {
            colum += 1;
          }
          if (dataThietLap.cuaVong) {
            colum += 1;
          }
          if (dataThietLap.chanDot) {
            colum += 1;
          }
          if (dataThietLap.vatMep) {
            colum += 1;
          }
          if (dataThietLap.khoanLo) {
            colum += 1;
          }
          if (dataThietLap.xhlkr) {
            colum += 1;
          }
          if (dataThietLap.xhkx) {
            colum += 1;
          }
          if (dataThietLap.phunBi) {
            colum += 1;
          }
          if (dataThietLap.son) {
            colum += 1;
          }
          if (dataThietLap.xlr) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "Kiểm định"
          ) {
            checkMau = false;
          }
        }
        if (dataThietLap.dongKien) {
          let colum = 13;
          if (dataThietLap.ed) {
            colum += 1;
          }
          if (dataThietLap.giaCong) {
            colum += 1;
          }
          if (dataThietLap.xiMa) {
            colum += 1;
          }
          if (dataThietLap.nmk) {
            colum += 1;
          }
          if (dataThietLap.kho) {
            colum += 1;
          }
          if (dataThietLap.lazer) {
            colum += 1;
          }
          if (dataThietLap.lazerDamH) {
            colum += 1;
          }
          if (dataThietLap.cuaVong) {
            colum += 1;
          }
          if (dataThietLap.chanDot) {
            colum += 1;
          }
          if (dataThietLap.vatMep) {
            colum += 1;
          }
          if (dataThietLap.khoanLo) {
            colum += 1;
          }
          if (dataThietLap.xhlkr) {
            colum += 1;
          }
          if (dataThietLap.xhkx) {
            colum += 1;
          }
          if (dataThietLap.phunBi) {
            colum += 1;
          }
          if (dataThietLap.son) {
            colum += 1;
          }
          if (dataThietLap.xlr) {
            colum += 1;
          }
          if (dataThietLap.kiemDinh) {
            colum += 1;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum, r: 7 }, e: { c: colum, r: 7 } },
              })[0]
              .toString()
              .trim() === "Đóng kiện"
          ) {
            checkMau = false;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum + 1, r: 5 }, e: { c: colum + 1, r: 5 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum + 1, r: 5 }, e: { c: colum + 1, r: 5 } },
              })[0]
              .toString()
              .trim() === "Phương pháp gia công"
          ) {
            checkMau = false;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum + 2, r: 5 }, e: { c: colum + 2, r: 5 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum + 2, r: 5 }, e: { c: colum + 2, r: 5 } },
              })[0]
              .toString()
              .trim() === "Mã trạm"
          ) {
            checkMau = false;
          }
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: colum + 3, r: 5 }, e: { c: colum + 3, r: 5 } },
            })[0] &&
            !XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: colum + 3, r: 5 }, e: { c: colum + 3, r: 5 } },
              })[0]
              .toString()
              .trim() === "Ghi chú kĩ thuật"
          ) {
            checkMau = false;
          }
        }
      }
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 5,
        });
        const data1 = XLSX.utils.sheet_to_json(worksheet, {
          range: 6,
        });
        const data2 = XLSX.utils.sheet_to_json(worksheet, {
          range: 7,
        });
        const data3 = XLSX.utils.sheet_to_json(worksheet, {
          range: 8,
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
            NewData.push({
              STT:
                (d.STT && d.STT !== 0) || d.STT === 0
                  ? d.STT.toString().trim() !== ""
                    ? d.STT.toString().trim()
                    : undefined
                  : undefined,
              tenChiTiet:
                (d[TCT] && d[TCT] !== 0) || d[TCT] === 0
                  ? d[TCT].toString().trim() !== ""
                    ? d[TCT].toString().trim()
                    : undefined
                  : undefined,
              maChiTiet:
                (d[MCT] && d[MCT] !== 0) || d[MCT] === 0
                  ? d[MCT].toString().trim() !== ""
                    ? d[MCT].toString().trim()
                    : undefined
                  : undefined,
              vatLieu:
                (d[VL] && d[VL] !== 0) || d[VL] === 0
                  ? d[VL].toString().trim() !== ""
                    ? d[VL].toString().trim()
                    : undefined
                  : undefined,
              xuatXu:
                (d[XX] && d[XX] !== 0) || d[XX] === 0
                  ? d[XX].toString().trim() !== ""
                    ? d[XX].toString().trim()
                    : undefined
                  : undefined,
              khoiLuong:
                (d[KL] && d[KL] !== 0) || d[KL] === 0
                  ? d[KL].toString().trim() !== ""
                    ? Number(d[KL].toString().trim()).toFixed(3)
                    : undefined
                  : undefined,
              dinhMuc:
                (d[DM] && d[DM] !== 0) || d[DM] === 0
                  ? d[DM].toString().trim() !== ""
                    ? d[DM].toString().trim()
                    : undefined
                  : undefined,
              phuongPhapGiaCong:
                (d[PPGC] && d[PPGC] !== 0) || d[PPGC] === 0
                  ? d[PPGC].toString().trim() !== ""
                    ? d[PPGC].toString().trim()
                    : undefined
                  : undefined,
              moTa:
                (d[GCKT] && d[GCKT] !== 0) || d[GCKT] === 0
                  ? d[GCKT].toString().trim() !== ""
                    ? d[GCKT].toString().trim()
                    : undefined
                  : undefined,
              maTram:
                (d[MT] && d[MT] !== 0) || d[MT] === 0
                  ? d[MT].toString().trim() !== ""
                    ? d[MT].toString().trim()
                    : undefined
                  : undefined,
            });
          }
        });
        data1.forEach((d) => {
          if (
            d.__EMPTY_1 &&
            d.__EMPTY_1.toString().trim() !== "" &&
            d.__EMPTY_2 &&
            d.__EMPTY_2.toString().trim() !== "" &&
            ((d.NMK && d.NMK !== 0) || d.NMK === 0) &&
            d.NMK.toString().trim() !== ""
          ) {
            NewData.forEach((dt) => {
              if (dt.maChiTiet === d.__EMPTY_1) {
                dt.nMK =
                  (d.NMK && d.NMK !== 0) || d.NMK === 0
                    ? d.NMK.toString().trim() !== ""
                      ? d.NMK.toString().trim()
                      : undefined
                    : undefined;
              }
            });
          }
        });
        data2.forEach((d) => {
          if (
            d.__EMPTY_1 &&
            d.__EMPTY_1.toString().trim() !== "" &&
            d.__EMPTY_2 &&
            d.__EMPTY_2.toString().trim() !== "" &&
            ((((d.ED && d.ED !== 0) || d.ED === 0) &&
              d.ED.toString().trim() !== "") ||
              (((d.Kho && d.Kho !== 0) || d.Kho === 0) &&
                d.Kho.toString().trim() !== "") ||
              (((d.XHLKR && d.XHLKR !== 0) || d.XHLKR === 0) &&
                d.XHKX.toString().trim() !== "") ||
              (((d.XHKX && d.XHKX !== 0) || d.XHKX === 0) &&
                d.XHLKR.toString().trim() !== "") ||
              (((d["Kiểm định"] && d["Kiểm định"] !== 0) ||
                d["Kiểm định"] === 0) &&
                d["Kiểm định"].toString().trim() !== "") ||
              (((d["Gia công"] && d["Gia công"] !== 0) ||
                d["Gia công"] === 0) &&
                d["Gia công"].toString().trim() !== "") ||
              (((d["Xi mạ"] && d["Xi mạ"] !== 0) || d["Xi mạ"] === 0) &&
                d["Xi mạ"].toString().trim() !== "") ||
              (((d["Đóng kiện"] && d["Đóng kiện"] !== 0) ||
                d["Đóng kiện"] === 0) &&
                d["Đóng kiện"].toString().trim() !== "") ||
              (((d["Sơn"] && d["Sơn"] !== 0) || d["Sơn"] === 0) &&
                d["Sơn"].toString().trim() !== "") ||
              (((d["Phun bi"] && d["Phun bi"] !== 0) || d["Phun bi"] === 0) &&
                d["Phun bi"].toString().trim() !== "") ||
              (((d["X - LR"] && d["X - LR"] !== 0) || d["X - LR"] === 0) &&
                d["X - LR"].toString().trim() !== ""))
          ) {
            NewData.forEach((dt) => {
              if (dt.maChiTiet === d.__EMPTY_1) {
                dt.eD =
                  (d.ED && d.ED !== 0) || d.ED === 0
                    ? d.ED.toString().trim() !== ""
                      ? d.ED.toString().trim()
                      : undefined
                    : undefined;
                dt.kho =
                  (d.Kho && d.Kho !== 0) || d.Kho === 0
                    ? d.Kho.toString().trim() !== ""
                      ? d.Kho.toString().trim()
                      : undefined
                    : undefined;
                dt.xHLKR =
                  (d.XHLKR && d.XHLKR !== 0) || d.XHLKR === 0
                    ? d.XHLKR.toString().trim() !== ""
                      ? d.XHLKR.toString().trim()
                      : undefined
                    : undefined;
                dt.xHKX =
                  (d.XHKX && d.XHKX !== 0) || d.XHKX === 0
                    ? d.XHKX.toString().trim() !== ""
                      ? d.XHKX.toString().trim()
                      : undefined
                    : undefined;
                dt.kiemDinh =
                  (d["Kiểm định"] && d["Kiểm định"] !== 0) ||
                  d["Kiểm định"] === 0
                    ? d["Kiểm định"].toString().trim() !== ""
                      ? d["Kiểm định"].toString().trim()
                      : undefined
                    : undefined;
                dt.giaCong =
                  (d["Gia công"] && d["Gia công"] !== 0) || d["Gia công"] === 0
                    ? d["Gia công"].toString().trim() !== ""
                      ? d["Gia công"].toString().trim()
                      : undefined
                    : undefined;
                dt.xiMa =
                  (d["Xi mạ"] && d["Xi mạ"] !== 0) || d["Xi mạ"] === 0
                    ? d["Xi mạ"].toString().trim() !== ""
                      ? d["Xi mạ"].toString().trim()
                      : undefined
                    : undefined;
                dt.dongKien =
                  (d["Đóng kiện"] && d["Đóng kiện"] !== 0) ||
                  d["Đóng kiện"] === 0
                    ? d["Đóng kiện"].toString().trim() !== ""
                      ? d["Đóng kiện"].toString().trim()
                      : undefined
                    : undefined;
                dt.son =
                  (d["Sơn"] && d["Sơn"] !== 0) || d["Sơn"] === 0
                    ? d["Sơn"].toString().trim() !== ""
                      ? d["Sơn"].toString().trim()
                      : undefined
                    : undefined;
                dt.phunBi =
                  (d["Phun bi"] && d["Phun bi"] !== 0) || d["Phun bi"] === 0
                    ? d["Phun bi"].toString().trim() !== ""
                      ? d["Phun bi"].toString().trim()
                      : undefined
                    : undefined;
                dt.xLR =
                  (d["X - LR"] && d["X - LR"] !== 0) || d["X - LR"] === 0
                    ? d["X - LR"].toString().trim() !== ""
                      ? d["X - LR"].toString().trim()
                      : undefined
                    : undefined;
              }
            });
          }
        });
        data3.forEach((d) => {
          if (
            d.__EMPTY_1 &&
            d.__EMPTY_1.toString().trim() !== "" &&
            d.__EMPTY_2 &&
            d.__EMPTY_2.toString().trim() !== "" &&
            ((((d["Lazer"] && d["Lazer"] !== 0) || d["Lazer"] === 0) &&
              d["Lazer"].toString().trim() !== "") ||
              (((d.Chung && d.Chung !== 0) || d.Chung === 0) &&
                d.Chung.toString().trim() !== "") ||
              (((d.Dn && d.Dn !== 0) || d.Dn === 0) &&
                d.Dn.toString().trim() !== "") ||
              (((d.Dt && d.Dt !== 0) || d.Dt === 0) &&
                d.Dt.toString().trim() !== "") ||
              (((d["Dài"] && d["Dài"] !== 0) || d["Dài"] === 0) &&
                d["Dài"].toString().trim() !== "") ||
              (((d["Rộng"] && d["Rộng"] !== 0) || d["Rộng"] === 0) &&
                d["Rộng"].toString().trim() !== "") ||
              (((d["Dày"] && d["Dày"] !== 0) || d["Dày"] === 0) &&
                d["Dày"].toString().trim() !== "") ||
              (((d["Lazer Dầm H"] && d["Lazer Dầm H"] !== 0) ||
                d["Lazer Dầm H"] === 0) &&
                d["Lazer Dầm H"].toString().trim() !== "") ||
              (((d["Cưa vòng"] && d["Cưa vòng"] !== 0) ||
                d["Cưa vòng"] === 0) &&
                d["Cưa vòng"].toString().trim() !== "") ||
              (((d["Chấn/ đột"] && d["Chấn/ đột"] !== 0) ||
                d["Chấn/ đột"] === 0) &&
                d["Chấn/ đột"].toString().trim() !== "") ||
              (((d["Vát mép"] && d["Vát mép"] !== 0) || d["Vát mép"] === 0) &&
                d["Vát mép"].toString().trim() !== "") ||
              (((d["Khoan lỗ"] && d["Khoan lỗ"] !== 0) ||
                d["Khoan lỗ"] === 0) &&
                d["Khoan lỗ"].toString().trim() !== ""))
          ) {
            NewData.forEach((dt) => {
              if (dt.maChiTiet === d.__EMPTY_1) {
                dt.lazer =
                  (d["Lazer"] && d["Lazer"] !== 0) || d["Lazer"] === 0
                    ? d["Lazer"].toString().trim() !== ""
                      ? d["Lazer"].toString().trim()
                      : undefined
                    : undefined;
                dt.chung =
                  (d.Chung && d.Chung !== 0) || d.Chung === 0
                    ? d.Chung.toString().trim() !== ""
                      ? d.Chung.toString().trim()
                      : undefined
                    : undefined;
                dt.dt =
                  (d.Dt && d.Dt !== 0) || d.Dt === 0
                    ? d.Dt.toString().trim() !== ""
                      ? d.Dt.toString().trim()
                      : undefined
                    : undefined;
                dt.dn =
                  (d.Dn && d.Dn !== 0) || d.Dn === 0
                    ? d.Dn.toString().trim() !== ""
                      ? d.Dn.toString().trim()
                      : undefined
                    : undefined;
                dt.dai =
                  (d["Dài"] && d["Dài"] !== 0) || d["Dài"] === 0
                    ? d["Dài"].toString().trim() !== ""
                      ? d["Dài"].toString().trim()
                      : undefined
                    : undefined;
                dt.rong =
                  (d["Rộng"] && d["Rộng"] !== 0) || d["Rộng"] === 0
                    ? d["Rộng"].toString().trim() !== ""
                      ? d["Rộng"].toString().trim()
                      : undefined
                    : undefined;
                dt.day =
                  (d["Dày"] && d["Dày"] !== 0) || d["Dày"] === 0
                    ? d["Dày"].toString().trim() !== ""
                      ? d["Dày"].toString().trim()
                      : undefined
                    : undefined;
                dt.lazerDamH =
                  (d["Lazer Dầm H"] && d["Lazer Dầm H"] !== 0) ||
                  d["Lazer Dầm H"] === 0
                    ? d["Lazer Dầm H"].toString().trim() !== ""
                      ? d["Lazer Dầm H"].toString().trim()
                      : undefined
                    : undefined;
                dt.cuaVong =
                  (d["Cưa vòng"] && d["Cưa vòng"] !== 0) || d["Cưa vòng"] === 0
                    ? d["Cưa vòng"].toString().trim() !== ""
                      ? d["Cưa vòng"].toString().trim()
                      : undefined
                    : undefined;
                dt.chanDot =
                  (d["Chấn/ đột"] && d["Chấn/ đột"] !== 0) ||
                  d["Chấn/ đột"] === 0
                    ? d["Chấn/ đột"].toString().trim() !== ""
                      ? d["Chấn/ đột"].toString().trim()
                      : undefined
                    : undefined;
                dt.vatMep =
                  (d["Vát mép"] && d["Vát mép"] !== 0) || d["Vát mép"] === 0
                    ? d["Vát mép"].toString().trim() !== ""
                      ? d["Vát mép"].toString().trim()
                      : undefined
                    : undefined;
                dt.khoanLo =
                  (d["Khoan lỗ"] && d["Khoan lỗ"] !== 0) || d["Khoan lỗ"] === 0
                    ? d["Khoan lỗ"].toString().trim() !== ""
                      ? d["Khoan lỗ"].toString().trim()
                      : undefined
                    : undefined;
              }
            });
          }
        });
        if (NewData.length === 0) {
          setFileName(file.name);
          setListChiTiet([]);
          setFieldTouch(true);
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
            setFieldTouch(true);
          } else {
            setHangTrung([]);
            setFieldTouch(false);
          }
          setListChiTiet(NewData);
          setFileName(file.name);
          setDataLoi();
        }
      } else {
        setFileName(file.name);
        setListChiTiet([]);
        setFieldTouch(true);
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
        donVi_Id: INFO.donVi_Id,
        ngayBanHanh: BOM.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: BOM.ngayApDung.format("DD/MM/YYYY"),
        congDoanSuDung: dataThietLap,
        list_ChiTiets: ListChiTiet.map((ct) => {
          return {
            ...ct,
            thuTuNguoiDung: ct.STT,
            thuTuChuyen: {
              giaCong: ct.giaCong ? ct.giaCong : undefined,
              eD: ct.eD ? ct.eD : undefined,
              xiMa: ct.xiMa ? ct.xiMa : undefined,
              nMK: ct.nMK ? ct.nMK : undefined,
              kho: ct.kho ? ct.kho : undefined,
              lazer: ct.lazer ? ct.lazer : undefined,
              lazerDamH: ct.lazerDamH ? ct.lazerDamH : undefined,
              cuaVong: ct.cuaVong ? ct.cuaVong : undefined,
              chanDot: ct.chanDot ? ct.chanDot : undefined,
              vatMep: ct.vatMep ? ct.vatMep : undefined,
              khoanLo: ct.khoanLo ? ct.khoanLo : undefined,
              xHLKR: ct.xHLKR ? ct.xHLKR : undefined,
              xHKX: ct.xHKX ? ct.xHKX : undefined,
              phunBi: ct.phunBi ? ct.phunBi : undefined,
              son: ct.son ? ct.son : undefined,
              xLR: ct.xLR ? ct.xLR : undefined,
              kiemDinh: ct.kiemDinh ? ct.kiemDinh : undefined,
              dongKien: ct.dongKien ? ct.dongKien : undefined,
            },
            quyCach: {
              dai: ct.dai ? ct.dai : undefined,
              rong: ct.rong ? ct.rong : undefined,
              day: ct.day ? ct.day : undefined,
              dn: ct.dn ? ct.dn : undefined,
              dt: ct.dt ? ct.dt : undefined,
              chung: ct.chung ? ct.chung : undefined,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setListChiTiet([]);
              setFileName(null);
              setFieldsValue({
                BOM: {
                  ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
            }
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
      current && current < form.getFieldValue("BOM").ngayBanHanh.endOf("day")
    );
  };
  const disableDateNgayApDung = (current) => {
    return (
      current && current > form.getFieldValue("BOM").ngayApDung.endOf("day")
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
    if (current.tenChiTiet === undefined) {
      setFieldTouch(false);
      setMessageError("Tên chi tiết không được rỗng");
      return "red-row";
    }
    if (current.maChiTiet === undefined) {
      setFieldTouch(false);
      setMessageError("Mã chi tiết không được rỗng");
      return "red-row";
    }
    if (DataLoi && DataLoi.length > 0) {
      if (
        DataLoi.some(
          (dt) => current.maChiTiet.toString() === dt.maChiTiet.toString()
        )
      ) {
        setFieldTouch(false);
        return "red-row";
      }
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
                    optionsvalue={["id", "fullName"]}
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
                    optionsvalue={["id", "fullName"]}
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
            <Row>
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
                <Row style={{ marginBottom: 5 }}>
                  {dataThietLap.giaCong ||
                  dataThietLap.ed ||
                  dataThietLap.xiMa ? (
                    <>
                      <Tag color="#ff9c6e">CMC</Tag>
                      {dataThietLap.giaCong ? (
                        <Tag color="green">Gia công</Tag>
                      ) : null}
                      {dataThietLap.ed ? <Tag color="green">ED</Tag> : null}
                      {dataThietLap.xiMa ? (
                        <Tag color="green">Xi mạ</Tag>
                      ) : null}
                    </>
                  ) : null}
                </Row>
                <Divider />
                <Row>
                  {dataThietLap.kho ||
                  dataThietLap.lazer ||
                  dataThietLap.lazerDamH ||
                  dataThietLap.cuaVong ||
                  dataThietLap.chanDot ||
                  dataThietLap.vatMep ||
                  dataThietLap.khoanLo ||
                  dataThietLap.xhlkr ||
                  dataThietLap.xhkx ||
                  dataThietLap.phunBi ||
                  dataThietLap.son ||
                  dataThietLap.xlr ||
                  dataThietLap.kiemDinh ||
                  dataThietLap.dongKien ? (
                    <>
                      <Tag color="#ff9c6e">TITS</Tag>
                      {dataThietLap.kho ? <Tag color="green">Kho</Tag> : null}
                      {dataThietLap.lazer ? (
                        <Tag color="green">Lazer</Tag>
                      ) : null}
                      {dataThietLap.lazerDamH ? (
                        <Tag color="green">Lazer Dầm H</Tag>
                      ) : null}
                      {dataThietLap.cuaVong ? (
                        <Tag color="green">Cưa vòng</Tag>
                      ) : null}
                      {dataThietLap.chanDot ? (
                        <Tag color="green">Chấn đột</Tag>
                      ) : null}
                      {dataThietLap.vatMep ? (
                        <Tag color="green">Vát mép</Tag>
                      ) : null}
                      {dataThietLap.khoanLo ? (
                        <Tag color="green">Khoan lỗ</Tag>
                      ) : null}
                      {dataThietLap.xhlkr ? (
                        <Tag color="green">XHLKR</Tag>
                      ) : null}
                      {dataThietLap.xhkx ? <Tag color="green">XHKX</Tag> : null}
                      {dataThietLap.phunBi ? (
                        <Tag color="green">Phun bi</Tag>
                      ) : null}
                      {dataThietLap.son ? <Tag color="green">Sơn</Tag> : null}
                      {dataThietLap.xlr ? <Tag color="green">X-LR</Tag> : null}
                      {dataThietLap.kiemDinh ? (
                        <Tag color="green">Kiểm định</Tag>
                      ) : null}
                      {dataThietLap.dongKien ? (
                        <Tag color="green">Đóng kiện</Tag>
                      ) : null}
                    </>
                  ) : null}
                </Row>
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
      />
    </div>
  );
}

export default BOMForm;
