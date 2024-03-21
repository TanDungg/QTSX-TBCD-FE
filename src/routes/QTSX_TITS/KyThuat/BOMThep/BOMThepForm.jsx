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
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  exportExcel,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  RollbackOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import moment from "moment";
import { messages } from "src/constants/Messages";
const { EditableRow, EditableCell } = EditableTableRow;

const FormItem = Form.Item;

function BOMThepForm({ match, permission, history }) {
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
  const [message, setMessageError] = useState([]);
  const [DataLoi, setDataLoi] = useState();

  const [info, setInfo] = useState({});
  const [fieldTouch, setFieldTouch] = useState(false);
  const { setFieldsValue, validateFields, resetFields } = form;

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
          `tits_qtsx_DinhMucVatTuThep/${id}`,
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
          setListChiTiet(
            res.data.list_ChiTiets.map((ct) => {
              return {
                ...ct,
                dai: ct.quyCach.dai,
                rong: ct.quyCach.rong,
                day: ct.quyCach.day,
                dn: ct.quyCach.dn,
                dt: ct.quyCach.dt,
                chung: ct.quyCach.chung,
              };
            })
          );
          setFieldsValue({
            BOM: {
              ...res.data,
              isThepTam: res.data.isThepTam ? "true" : "false",
              ngayBanHanh: moment(res.data.ngayBanHanh, "DD/MM/YYYY"),
              ngayApDung: moment(res.data.ngayApDung, "DD/MM/YYYY"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const renderLoi = (val) => {
    let check = false;
    let messageLoi = "";
    if (DataLoi && DataLoi.length > 0) {
      DataLoi.forEach((dt) => {
        if (dt.maVatTu === val.maVatTu) {
          check = true;
          messageLoi = dt.ghiChuImport;
        }
      });
    }
    return check ? (
      <Popover content={<span style={{ color: "red" }}>{messageLoi}</span>}>
        {val.maVatTu}
      </Popover>
    ) : val.STT === "*" ? (
      <span style={{ fontWeight: "bold" }}>{val.maVatTu}</span>
    ) : (
      <span>{val.maVatTu}</span>
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
        title: "Mã vật tư",
        // dataIndex: "maChiTiet",
        key: "maVatTu",
        align: "center",

        render: (val) => renderLoi(val),
      },
      {
        title: "Tên vật tư",
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
        title: "Quy cách phôi(mm)",
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
        title: "Khối lượng",
        dataIndex: "khoiLuong",
        key: "khoiLuong",
        align: "center",
      },
      {
        title: "Ghi chú",
        dataIndex: "moTa",
        key: "moTa",
        align: "center",
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
          `tits_qtsx_DinhMucVatTuThep/export-file-mau?${param}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_DinhMucVatTuThep", res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Import"];
      let checkMau =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 2 }, e: { c: 0, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 0, r: 2 }, e: { c: 0, r: 2 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 1, r: 2 }, e: { c: 1, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 2 }, e: { c: 1, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã vật tư" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
          })[0]
          .toString()
          .trim() === "Tên vật tư" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
          })[0]
          .toString()
          .trim() === "Vật liệu" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
          })[0]
          .toString()
          .trim() === "Quy cách" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 10, r: 2 }, e: { c: 10, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 2 }, e: { c: 10, r: 2 } },
          })[0]
          .toString()
          .trim() === "Khối lượng" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 11, r: 2 }, e: { c: 11, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 11, r: 2 }, e: { c: 11, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ghi chú" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 4, r: 3 }, e: { c: 4, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 3 }, e: { c: 4, r: 3 } },
          })[0]
          .toString()
          .trim() === "Dài" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 5, r: 3 }, e: { c: 5, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 3 }, e: { c: 5, r: 3 } },
          })[0]
          .toString()
          .trim() === "Rộng" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 6, r: 3 }, e: { c: 6, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 3 }, e: { c: 6, r: 3 } },
          })[0]
          .toString()
          .trim() === "Dày" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 7, r: 3 }, e: { c: 7, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 3 }, e: { c: 7, r: 3 } },
          })[0]
          .toString()
          .trim() === "Dn" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 8, r: 3 }, e: { c: 8, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 3 }, e: { c: 8, r: 3 } },
          })[0]
          .toString()
          .trim() === "Dt" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 9, r: 3 }, e: { c: 9, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 3 }, e: { c: 9, r: 3 } },
          })[0]
          .toString()
          .trim() === "Chung";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const data2 = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
        });
        const MCT = "Mã vật tư";
        const TCT = "Tên vật tư";
        const VL = "Vật liệu";
        const KL = "Khối lượng";
        const GC = "Ghi chú";
        const NewData = [];
        data.forEach((d) => {
          if (
            (typeof d[TCT] !== "undefined" &&
              (d[TCT] !== 0 || d[TCT] === 0) &&
              d[TCT].toString().trim() !== "") ||
            (typeof d[MCT] !== "undefined" &&
              (d[MCT] !== 0 || d[MCT] === 0) &&
              d[MCT].toString().trim() !== "") ||
            (typeof d.VL !== "undefined" &&
              (d.VL !== 0 || d.VL === 0) &&
              d.VL.toString().trim() !== "")
          ) {
            NewData.push({
              tenVatTu:
                (d[TCT] && d[TCT] !== 0) || d[TCT] === 0
                  ? d[TCT].toString().trim() !== ""
                    ? d[TCT].toString().trim()
                    : undefined
                  : undefined,
              maVatTu:
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
              dai:
                (d["Dài"] && d["Dài"] !== 0) || d["Dài"] === 0
                  ? d["Dài"].toString().trim() !== ""
                    ? d["Dài"].toString().trim()
                    : undefined
                  : undefined,
              khoiLuong:
                (d[KL] && d[KL] !== 0) || d[KL] === 0
                  ? d[KL].toString().trim() !== ""
                    ? Number(d[KL].toString().trim()).toFixed(3)
                    : undefined
                  : undefined,
              moTa:
                (d[GC] && d[GC] !== 0) || d[GC] === 0
                  ? d[GC].toString().trim() !== ""
                    ? d[GC].toString().trim()
                    : undefined
                  : undefined,
              rong:
                (d["Rộng"] && d["Rộng"] !== 0) || d["Rộng"] === 0
                  ? d["Rộng"].toString().trim() !== ""
                    ? d["Rộng"].toString().trim()
                    : undefined
                  : undefined,
              day:
                (d["Dày"] && d["Dày"] !== 0) || d["Dày"] === 0
                  ? d["Dày"].toString().trim() !== ""
                    ? d["Dày"].toString().trim()
                    : undefined
                  : undefined,
              chung:
                (d["Chung"] && d["Chung"] !== 0) || d["Chung"] === 0
                  ? d["Chung"].toString().trim() !== ""
                    ? d["Chung"].toString().trim()
                    : undefined
                  : undefined,
              dn:
                (d["Dn"] && d["Dn"] !== 0) || d["Dn"] === 0
                  ? d["Dn"].toString().trim() !== ""
                    ? d["Dn"].toString().trim()
                    : undefined
                  : undefined,
              dt:
                (d["Dt"] && d["Dt"] !== 0) || d["Dt"] === 0
                  ? d["Dt"].toString().trim() !== ""
                    ? d["Dt"].toString().trim()
                    : undefined
                  : undefined,
            });
          }
        });
        data2.forEach((d) => {
          if (
            (typeof d["Dài"] !== "undefined" &&
              (d["Dài"] !== 0 || d["Dài"] === 0) &&
              d["Dài"].toString().trim() !== "") ||
            (typeof d["Rộng"] !== "undefined" &&
              (d["Rộng"] !== 0 || d["Rộng"] === 0) &&
              d["Rộng"].toString().trim() !== "") ||
            (typeof d["Dày"] !== "undefined" &&
              (d["Dày"] !== 0 || d["Dày"] === 0) &&
              d["Dày"].toString().trim() !== "")
          ) {
            NewData.forEach((dt) => {
              if (dt.maVatTu === d.__EMPTY_1) {
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
                dt.chung =
                  (d["Chung"] && d["Chung"] !== 0) || d["Chung"] === 0
                    ? d["Chung"].toString().trim() !== ""
                      ? d["Chung"].toString().trim()
                      : undefined
                    : undefined;
                dt.dn =
                  (d["Dn"] && d["Dn"] !== 0) || d["Dn"] === 0
                    ? d["Dn"].toString().trim() !== ""
                      ? d["Dn"].toString().trim()
                      : undefined
                    : undefined;
                dt.dt =
                  (d["Dt"] && d["Dt"] !== 0) || d["Dt"] === 0
                    ? d["Dt"].toString().trim() !== ""
                      ? d["Dt"].toString().trim()
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
        isThepTam: BOM.isThepTam === "true",
        ngayBanHanh: BOM.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: BOM.ngayApDung.format("DD/MM/YYYY"),
        list_ChiTiets: ListChiTiet.map((ct) => {
          return {
            ...ct,
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
            `tits_qtsx_DinhMucVatTuThep`,
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
          } else {
            setDataLoi(res.data);
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit") {
      const newData = {
        ...info,
        ...BOM,
        ngayBanHanh: BOM.ngayBanHanh.format("DD/MM/YYYY"),
        ngayApDung: BOM.ngayApDung.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_DinhMucVatTuThep/${id}`,
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
          `tits_qtsx_DinhMucVatTuThep/duyet/${id}`,
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
      "Thêm mới định mức vật tư thép"
    ) : type === "edit" ? (
      "Chỉnh sửa định mức vật tư thép"
    ) : type === "xacnhan" ? (
      <span>
        Duyệt định mức vật tư thép{" "}
        <Tag
          style={{ fontSize: 14 }}
          color={
            info && info.trangThai === "Đã duyệt"
              ? "green"
              : info && info.trangThai === "Chưa duyệt"
              ? "blue"
              : "red"
          }
        >
          {info && info.maDinhMucVatTuThep} - {info && info.trangThai}
        </Tag>
      </span>
    ) : (
      <span>
        Chi tiết định mức vật tư thép{" "}
        <Tag
          style={{ fontSize: 14 }}
          color={
            info && info.trangThai === "Đã duyệt"
              ? "green"
              : info && info.trangThai === "Chưa duyệt"
              ? "blue"
              : "red"
          }
        >
          {info && info.maDinhMucVatTuThep} - {info && info.trangThai}
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
    if (current.tenVatTu === undefined) {
      setFieldTouch(false);
      setMessageError("Tên chi tiết không được rỗng");
      return "red-row";
    }
    if (current.maVatTu === undefined) {
      setFieldTouch(false);
      setMessageError("Mã chi tiết không được rỗng");
      return "red-row";
    }
    if (DataLoi && DataLoi.length > 0) {
      if (
        DataLoi.some(
          (dt) => current.maVatTu.toString() === dt.maVatTu.toString()
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
      <Card
        className="th-card-margin-bottom"
        title="Thông tin định mức vật tư thép"
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
                  label="Loại định mức"
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
                        name: "Định mức vật tư thép tấm",
                      },
                      {
                        id: "false",
                        name: "Định mức vật tư thép H",
                      },
                    ]}
                    placeholder="Chọn loại định mức"
                    optionsvalue={["id", "name"]}
                    style={{ width: "100%" }}
                    disabled={type !== "new"}
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
                  label="Tên định mức"
                  name={["BOM", "tenDinhMucVatTuThep"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên định mức không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên định mức"
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
                  name={["BOM", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập ghi chú"
                    disabled={type !== "new" && type !== "edit"}
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
      <Card className="th-card-margin-bottom" title="Thông tin vật tư">
        {type === "new" && (
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
        )}
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
      {type === "xacnhan" && info && info.trangThai === "Chưa duyệt" && (
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
    </div>
  );
}

export default BOMThepForm;
