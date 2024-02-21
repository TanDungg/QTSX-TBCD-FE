import {
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Modal as AntModal,
  Button,
  Card,
  Col,
  Row,
  Upload,
  Alert,
  Popover,
} from "antd";
import { messages } from "src/constants/Messages";
import Helper from "src/helpers";
import map from "lodash/map";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { Modal } from "src/components/Common";
import {
  convertObjectToUrlParams,
  exportExcel,
  reDataForTable,
} from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";
import ModalThietLap from "./ModalThietLap";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportBOM({
  openModalFS,
  openModal,
  loading,
  refesh,
  addSanPham,
  listSanPham,
  SanPham,
}) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const [ActiceModalThietLap, setActiceModalThietLap] = useState(false);
  const [dataThietLap, setDataThietLap] = useState({
    giaCong: true,
    ed: true,
    xiMa: true,
    nmk: true,
    kho: true,
    lazer: true,
    lazerDamH: true,
    cuaVong: true,
    chanDot: true,
    vatMep: true,
    khoanLo: true,
    xhlkr: true,
    xhkx: true,
    phunBi: true,
    son: true,
    xlr: true,
    kiemDinh: true,
    dongKien: true,
  });
  const [message, setMessageError] = useState([]);
  const renderLoi = (val) => {
    let check = false;
    let messageLoi = "";
    if (DataLoi && DataLoi.length > 0) {
      DataLoi.forEach((dt) => {
        if (dt.maSanPham === val) {
          check = true;
          messageLoi = dt.ghiChuImport;
        }
      });
    }
    return check ? (
      <Popover content={<span style={{ color: "red" }}>{messageLoi}</span>}>
        {val}
      </Popover>
    ) : (
      <span>{val}</span>
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
        dataIndex: "STT",
        key: "STT",
        width: 45,
        align: "center",
      },
      {
        title: "Mã chi tiết",
        dataIndex: "maChiTiet",
        key: "maChiTiet",
        align: "center",
        width: 150,
      },
      {
        title: "Tên chi tiết",
        dataIndex: "tenChiTiet",
        key: "tenChiTiet",
        align: "center",
        width: 150,
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

  //File mẫu
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
            ((d[TCT] && d[TCT] !== 0) || d[TCT] === 0) &&
            d[TCT].toString().trim() !== "" &&
            ((d[TCT] && d[TCT] !== 0) || d[TCT] === 0) &&
            d[MCT].toString().trim() !== "" &&
            ((d.STT && d.STT !== 0) || d.STT === 0) &&
            d.STT.toString().trim() !== ""
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
                    ? d[KL].toString().trim()
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
                  (d.DI && d.DI !== 0) || d.DI === 0
                    ? d.DI.toString().trim() !== ""
                      ? d.DI.toString().trim()
                      : undefined
                    : undefined;
                dt.dn =
                  (d.DO && d.DO !== 0) || d.DO === 0
                    ? d.DO.toString().trim() !== ""
                      ? d.DO.toString().trim()
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
          setDataView([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          // const indices = [];
          // const row = [];
          // for (let i = 0; i < NewData.length; i++) {
          //   for (let j = i + 1; j < NewData.length; j++) {
          //     if (
          //       NewData[i].maSanPham === NewData[j].maSanPham &&
          //       NewData[i].maMauSac === NewData[j].maMauSac &&
          //       NewData[j].maSanPham !== undefined &&
          //       NewData[i].maSanPham !== undefined &&
          //       NewData[j].maMauSac !== undefined &&
          //       NewData[i].maMauSac !== undefined
          //     ) {
          //       indices.push(NewData[i]);
          //       row.push(i + 1);
          //       row.push(j + 1);
          //     }
          //   }
          // }
          // if (indices.length > 0) {
          //   setMessageError(
          //     `Hàng ${row.join(", ")} có mã sản phẩm và mã màu sắc trùng nhau`
          //   );
          //   Helper.alertError(
          //     `Hàng ${row.join(", ")} có mã sản phẩm và mã màu sắc trùng nhau`
          //   );
          //   setHangTrung(indices);
          //   setCheckDanger(true);
          // } else {
          //   setHangTrung([]);
          //   setCheckDanger(false);
          // }
          setDataView(NewData);
          setFileName(file.name);
          setDataLoi();
        }
      } else {
        setFileName(file.name);
        setDataView([]);
        setCheckDanger(true);
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

  const handleSubmit = () => {
    const indexCTCum = [];
    dataView.forEach((ct, i) => {
      if (ct.stt === "*") {
        indexCTCum.push(i);
      }
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Donhang/import-excel`,
          "POST",
          dataView,
          "A",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status === 409) {
        setDataLoi(res.data);
        setMessageError("Import không thành công");
      } else {
        let check = false;
        res.data.forEach((dt) => {
          dt.tits_qtsx_ChiTiet =
            dt.tits_qtsx_SanPham_Id + "_" + dt.tits_qtsx_MauSac_Id;
          listSanPham.forEach((sp) => {
            if (
              dt.tits_qtsx_MauSac_Id === sp.tits_qtsx_MauSac_Id &&
              dt.tits_qtsx_SanPham_Id === sp.tits_qtsx_SanPham_Id
            ) {
              check = true;
              setMessageError(
                `Sản phẩm ${dt.tenSanPham} có màu ${dt.tenMauSac} đã được thêm`
              );
              dt.ghiChuImport = `Sản phẩm ${dt.tenSanPham} có màu ${dt.tenMauSac} đã được thêm`;
            }
          });
        });
        if (check) {
          setDataLoi(res.data);
          Helper.alertWarning(res.data[0].ghiChuImport);
        } else {
          addSanPham(res.data);
          setFileName(null);
          setDataView([]);
          openModalFS(false);
        }
      }
    });
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import thông tin sản phẩm",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((maChiTiet) => {
        if (current.maChiTiet === maChiTiet) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.tenChiTiet === undefined) {
      setCheckDanger(true);
      setMessageError("Tên chi tiết không được rỗng");
      return "red-row";
    } else if (current.maChiTiet === undefined) {
      setCheckDanger(true);
      setMessageError("Mã chi tiết không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (current.maChiTiet.toString() === dt.maChiTiet.toString()) {
          check = true;
        }
      });
      if (check) {
        setCheckDanger(true);
        return "red-row";
      }
    }
  };
  const handleCancel = () => {
    if (checkDanger === true) {
      openModalFS(false);
      setCheckDanger(false);
      setFileName(null);
      setDataView([]);
    } else {
      openModalFS(false);
    }
  };

  return (
    <AntModal
      title="Import thông tin sản phẩm"
      open={openModal}
      width={`95%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom th-card-reset-margin">
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
          </Row>
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
              Import:
            </Col>
            <Col xxl={4} xl={5} lg={7} md={7} xs={17}>
              <Upload {...props}>
                <Button icon={<UploadOutlined />} danger={checkDanger}>
                  Tải dữ liệu lên
                </Button>
              </Upload>
              {fileName && (
                <>
                  <Popover
                    content={
                      !checkDanger ? (
                        fileName
                      ) : (
                        <Alert type="error" message={message} banner />
                      )
                    }
                  >
                    <p style={{ color: checkDanger ? "red" : "#1890ff" }}>
                      {fileName.length > 20
                        ? fileName.substring(0, 20) + "..."
                        : fileName}{" "}
                      <DeleteOutlined
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setDataView([]);
                          setFileName(null);
                          setCheckDanger(false);
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
              >
                File mẫu
              </Button>
            </Col>
          </Row>
          <Table
            style={{ marginTop: 10 }}
            bordered
            scroll={{ x: 1800, y: "60vh" }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(dataView)}
            size="small"
            loading={loading}
            rowClassName={RowStyle}
          />
          <Button
            className="th-margin-bottom-0"
            style={{ marginTop: 10, float: "right" }}
            type="primary"
            onClick={modalXK}
            disabled={dataView.length > 0 && !checkDanger ? false : true}
          >
            Lưu
          </Button>
        </Card>
      </div>
      <ModalThietLap
        openModal={ActiceModalThietLap}
        openModalFS={setActiceModalThietLap}
        dataTL={dataThietLap}
        saveThietLap={setDataThietLap}
      />
    </AntModal>
  );
}

export default ImportBOM;
