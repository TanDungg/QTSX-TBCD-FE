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
      if (ThietLap.kho) {
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
      if (ThietLap.xhlkr) {
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
      if (ThietLap.xhkx) {
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
      if (ThietLap.phunBi) {
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
      if (ThietLap.son) {
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
      if (ThietLap.xlr) {
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
      if (ThietLap.kiemDinh) {
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
      if (ThietLap.dongKien) {
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
        dataIndex: "key",
        key: "key",
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
            title: "Do",
            dataIndex: "dn",
            key: "dn",
            align: "center",
            width: 50,
          },
          {
            title: "Di",
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
        dataIndex: "xuatXu",
        key: "xuatXu",
        align: "center",
        width: 55,
      },
      // {
      //   title: "Chuyển",
      //   key: "chuyen",
      //   align: "center",
      //   children: [
      //     {
      //       title: "THCK(CMC)",
      //       key: "THCK(CMC)",
      //       align: "center",
      //       children: [],
      //     },
      //     {
      //       title: "NMK",
      //       dataIndex: "nMK",
      //       key: "nMK",
      //       align: "center",
      //       width: 50,
      //     },
      //     {
      //       title: "Công ty SMRM & Cấu kiện nặng(TITS)",
      //       key: "Công ty SMRM & Cấu kiện nặng(TITS)",
      //       align: "center",
      //       children: [
      //         {
      //           title: "Kho",
      //           dataIndex: "kho",
      //           key: "kho",
      //           align: "center",
      //           width: 50,
      //         },
      //         {
      //           title: "Xưởng GCCT",
      //           key: "xuongGCCT",
      //           align: "center",
      //           children: [
      //             {
      //               title: "Lazer",
      //               dataIndex: "lazer",
      //               key: "lazer",
      //               align: "center",
      //               width: 50,
      //             },
      //             {
      //               title: "Lazer Dầm H",
      //               dataIndex: "lazerDamH",
      //               key: "lazerDamH",
      //               align: "center",
      //               width: 50,
      //             },
      //             {
      //               title: "Cưa vòng",
      //               key: "cuaVong",
      //               dataIndex: "cuaVong",
      //               align: "center",
      //               width: 50,
      //             },
      //             {
      //               title: "Chấn/ Đột",
      //               key: "chanDot",
      //               dataIndex: "chanDot",
      //               align: "center",
      //               width: 50,
      //             },
      //             {
      //               title: "Vát mép",
      //               key: "vatMep",
      //               dataIndex: "vatMep",
      //               align: "center",
      //               width: 50,
      //             },
      //             {
      //               title: "Khoan lỗ",
      //               key: "khoanLo",
      //               dataIndex: "khoanLo",
      //               align: "center",
      //               width: 55,
      //             },
      //           ],
      //         },
      //         {
      //           title: "XHLKR",
      //           key: "xHLKR",
      //           dataIndex: "xHLKR",
      //           align: "center",
      //           width: 60,
      //         },
      //         {
      //           title: "XHKX",
      //           key: "xHKX",
      //           dataIndex: "xHKX",
      //           align: "center",
      //           width: 55,
      //         },
      //         {
      //           title: "Phun bi",
      //           key: "phunBi",
      //           dataIndex: "phunBi",
      //           align: "center",
      //           width: 55,
      //         },
      //         {
      //           title: "Sơn",
      //           key: "son",
      //           dataIndex: "son",
      //           align: "center",
      //           width: 55,
      //         },
      //         {
      //           title: "X - LR",
      //           key: "xLR",
      //           dataIndex: "xLR",
      //           align: "center",
      //           width: 55,
      //         },
      //         {
      //           title: "Kiểm định",
      //           key: "kiemDinh",
      //           dataIndex: "kiemDinh",
      //           align: "center",
      //           width: 55,
      //         },
      //         {
      //           title: "Đóng kiện",
      //           key: "dongKien",
      //           dataIndex: "dongKien",
      //           align: "center",
      //           width: 55,
      //         },
      //       ],
      //     },
      //   ],
      // },
      ThietLap,
      {
        title: "Ghi chú",
        key: "ghiChu",
        align: "center",
        children: [
          {
            title: "Phương pháp gia công",
            dataIndex: "phuongPhapGiaCong",
            key: "phuongPhapGiaCong",
            align: "center",
            width: 100,
          },
        ],
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
  const TaiFileMau = (sanpham_Id) => {
    const param = convertObjectToUrlParams({
      sanpham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BOM/export-file?${param}`,
          "POST",
          null,
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
      const data = XLSX.utils.sheet_to_json(worksheet, {
        range: 8,
      });
      console.log(data);
    };
    //   const checkMau =
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 0, r: 2 }, e: { c: 0, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 0, r: 2 }, e: { c: 0, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "STT" &&
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 1, r: 2 }, e: { c: 1, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 1, r: 2 }, e: { c: 1, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "Mã sản phẩm" &&
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "Tên sản phẩm" &&
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "Lốp" &&
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "Mã màu sắc" &&
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "Số lượng" &&
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 6, r: 2 }, e: { c: 6, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 6, r: 2 }, e: { c: 6, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "Đơn giá" &&
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 7, r: 2 }, e: { c: 7, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 7, r: 2 }, e: { c: 7, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "Phí vận chuyển" &&
    //     XLSX.utils.sheet_to_json(worksheet, {
    //       header: 1,
    //       range: { s: { c: 8, r: 2 }, e: { c: 8, r: 2 } },
    //     })[0] &&
    //     XLSX.utils
    //       .sheet_to_json(worksheet, {
    //         header: 1,
    //         range: { s: { c: 8, r: 2 }, e: { c: 8, r: 2 } },
    //       })[0]
    //       .toString()
    //       .trim() === "Ngày bàn giao";
    //   if (checkMau) {
    //     const data = XLSX.utils.sheet_to_json(worksheet, {
    //       range: 2,
    //     });
    //     const MSP = "Mã sản phẩm";
    //     const TSP = "Tên sản phẩm";
    //     const SLuong = "Số lượng";
    //     const L = "Lốp";
    //     const MMS = "Mã màu sắc";
    //     const DG = "Đơn giá";
    //     const PVC = "Phí vận chuyển";
    //     const NBG = "Ngày bàn giao";
    //     const NewData = [];
    //     data.forEach((d, index) => {
    //       if (
    //         data[index][TSP] &&
    //         data[index][TSP].toString().trim() === "" &&
    //         data[index][MSP] &&
    //         data[index][MSP].toString().trim() === "" &&
    //         data[index][L] &&
    //         data[index][L].toString().trim() === "" &&
    //         data[index][MMS] &&
    //         data[index][MMS].toString().trim() === "" &&
    //         data[index][DG] &&
    //         data[index][DG].toString().trim() === "" &&
    //         data[index][PVC] &&
    //         data[index][PVC].toString().trim() === ""
    //       ) {
    //       } else {
    //         NewData.push({
    //           tenSanPham: data[index][TSP]
    //             ? data[index][TSP].toString().trim() !== ""
    //               ? data[index][TSP].toString().trim()
    //               : undefined
    //             : undefined,
    //           maSanPham: data[index][MSP]
    //             ? data[index][MSP].toString().trim() !== ""
    //               ? data[index][MSP].toString().trim()
    //               : undefined
    //             : undefined,
    //           soLuong: data[index][SLuong]
    //             ? data[index][SLuong].toString().trim() !== ""
    //               ? data[index][SLuong].toString().trim()
    //               : undefined
    //             : undefined,
    //           lop: data[index][L]
    //             ? data[index][L].toString().trim() !== ""
    //               ? data[index][L].toString().trim()
    //               : undefined
    //             : undefined,
    //           maMauSac: data[index][MMS]
    //             ? data[index][MMS].toString().trim() !== ""
    //               ? data[index][MMS].toString().trim()
    //               : undefined
    //             : undefined,
    //           donGia: data[index][DG]
    //             ? data[index][DG].toString().trim() !== ""
    //               ? data[index][DG].toString().trim()
    //               : undefined
    //             : undefined,
    //           phiVanChuyen: data[index][PVC]
    //             ? data[index][PVC].toString().trim() !== ""
    //               ? data[index][PVC].toString().trim()
    //               : undefined
    //             : undefined,
    //           ngay: data[index][NBG]
    //             ? data[index][NBG].toString().trim() !== ""
    //               ? data[index][NBG].toString().trim()
    //               : undefined
    //             : undefined,
    //         });
    //       }
    //     });
    //     if (NewData.length === 0) {
    //       setFileName(file.name);
    //       setDataView([]);
    //       setCheckDanger(true);
    //       setMessageError("Dữ liệu import không được rỗng");
    //       Helper.alertError("Dữ liệu import không được rỗng");
    //     } else {
    //       const indices = [];
    //       const row = [];
    //       for (let i = 0; i < NewData.length; i++) {
    //         for (let j = i + 1; j < NewData.length; j++) {
    //           if (
    //             NewData[i].maSanPham === NewData[j].maSanPham &&
    //             NewData[i].maMauSac === NewData[j].maMauSac &&
    //             NewData[j].maSanPham !== undefined &&
    //             NewData[i].maSanPham !== undefined &&
    //             NewData[j].maMauSac !== undefined &&
    //             NewData[i].maMauSac !== undefined
    //           ) {
    //             indices.push(NewData[i]);
    //             row.push(i + 1);
    //             row.push(j + 1);
    //           }
    //         }
    //       }
    //       if (indices.length > 0) {
    //         setMessageError(
    //           `Hàng ${row.join(", ")} có mã sản phẩm và mã màu sắc trùng nhau`
    //         );
    //         Helper.alertError(
    //           `Hàng ${row.join(", ")} có mã sản phẩm và mã màu sắc trùng nhau`
    //         );
    //         setHangTrung(indices);
    //         setCheckDanger(true);
    //       } else {
    //         setHangTrung([]);
    //         setCheckDanger(false);
    //       }
    //       setDataView(NewData);
    //       setFileName(file.name);
    //       setDataLoi();
    //     }
    //   } else {
    //     setFileName(file.name);
    //     setDataView([]);
    //     setCheckDanger(true);
    //     setMessageError("Mẫu import không hợp lệ");
    //     Helper.alertError("Mẫu file import không hợp lệ");
    //   }
    // };
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
      HangTrung.forEach((maSanPham) => {
        if (current.maSanPham === maSanPham) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.tenSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Tên sản phẩm không được rỗng");
      return "red-row";
    } else if (current.maSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Mã sản phẩm không được rỗng");
      return "red-row";
    } else if (current.soLuong === undefined) {
      setCheckDanger(true);
      setMessageError("Số lượng không được rỗng");
      return "red-row";
    } else if (current.maMauSac === undefined) {
      setCheckDanger(true);
      setMessageError("Mã màu sắc không được rỗng");
      return "red-row";
    } else if (current.donGia === undefined) {
      setCheckDanger(true);
      setMessageError("Đơn giá không được rỗng");
      return "red-row";
    } else if (current.phiVanChuyen === undefined) {
      setCheckDanger(true);
      setMessageError("Phí vận chuyển không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (current.maSanPham.toString() === dt.maSanPham.toString()) {
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
                className="th-btn-margin-bottom-0"
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
            className="th-btn-margin-bottom-0"
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
