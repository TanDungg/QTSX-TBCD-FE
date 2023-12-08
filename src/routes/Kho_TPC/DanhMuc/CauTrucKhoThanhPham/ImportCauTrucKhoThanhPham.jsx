import {
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
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
import { exportExcel, reDataForTable } from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
const { EditableRow, EditableCell } = EditableTableRow;

function ImportCauTrucKhoThanhPham({
  openModalFS,
  openModal,
  loading,
  refesh,
}) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [message, setMessageError] = useState([]);
  const renderLoi = (val) => {
    let check = false;
    let messageLoi = "";
    if (DataLoi && DataLoi.length > 0) {
      DataLoi.forEach((dt) => {
        if (dt.maCauTrucKho === val) {
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
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã cấu trúc kho",
      dataIndex: "maCauTrucKho",
      key: "maCauTrucKho",
      align: "center",
      render: (val) => renderLoi(val),
    },
    {
      title: "Tên cấu trúc kho",
      dataIndex: "tenCauTrucKho",
      key: "tenCauTrucKho",
      align: "center",
    },
    {
      title: "Mã Ban/Phòng",
      dataIndex: "maPhongBan",
      key: "maPhongBan",
      align: "center",
    },
    {
      title: "Mã cấu trúc kho cha",
      dataIndex: "maCauTrucKhoCha",
      key: "maCauTrucKhoCha",
      align: "center",
    },
    {
      title: "Sức chứa",
      dataIndex: "sucChua",
      key: "sucChua",
      align: "center",
    },
    {
      title: "Vị trí",
      dataIndex: "viTri",
      key: "viTri",
      align: "center",
    },
    {
      title: "Cố định",
      dataIndex: "isCoDinh",
      key: "isCoDinh",
      align: "center",
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

  //File mẫu
  const TaiFileMau = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/ExportFileExcel-san-pham?donVi_Id=${INFO.donVi_Id}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_Cau_Truc_Kho_Thanh_Pham", res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Import cấu trúc kho"];

      const checkMau =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 1 }, e: { c: 0, r: 1 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 0, r: 1 }, e: { c: 0, r: 1 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 1, r: 1 }, e: { c: 1, r: 1 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 1 }, e: { c: 1, r: 1 } },
          })[0]
          .toString()
          .trim() === "Mã cấu trúc kho" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 2, r: 1 }, e: { c: 2, r: 1 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 1 }, e: { c: 2, r: 1 } },
          })[0]
          .toString()
          .trim() === "Tên cấu trúc kho" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 3, r: 1 }, e: { c: 3, r: 1 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 1 }, e: { c: 3, r: 1 } },
          })[0]
          .toString()
          .trim() === "Mã Ban/Phòng" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 4, r: 1 }, e: { c: 4, r: 1 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 1 }, e: { c: 4, r: 1 } },
          })[0]
          .toString()
          .trim() === "Mã cấu trúc kho cha" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 5, r: 1 }, e: { c: 5, r: 1 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 1 }, e: { c: 5, r: 1 } },
          })[0]
          .toString()
          .trim() === "Sức chứa" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 6, r: 1 }, e: { c: 6, r: 1 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 1 }, e: { c: 6, r: 1 } },
          })[0]
          .toString()
          .trim() === "Vị trí" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 7, r: 1 }, e: { c: 7, r: 1 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 1 }, e: { c: 7, r: 1 } },
          })[0]
          .toString()
          .trim() === "Cố định";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 1,
        });
        const MCTK = "Mã cấu trúc kho";
        const TCTK = "Tên cấu trúc kho";
        const BP = "Mã Ban/Phòng";
        const MCTKC = "Mã cấu trúc kho cha";
        const VT = "Vị trí";
        const SC = "Sức chứa";
        const CD = "Cố định";

        const Data = [];
        const NewData = [];
        data.forEach((d, index) => {
          if (
            data[index][MCTK] &&
            data[index][MCTK].toString().trim() === "" &&
            data[index][TCTK] &&
            data[index][TCTK].toString().trim() === "" &&
            data[index][BP] &&
            data[index][BP].toString().trim() === ""
          ) {
          } else {
            NewData.push({
              maCauTrucKho: data[index][MCTK]
                ? data[index][MCTK].toString().trim() !== ""
                  ? data[index][MCTK].toString().trim()
                  : undefined
                : undefined,
              tenCauTrucKho: data[index][TCTK]
                ? data[index][TCTK].toString().trim() !== ""
                  ? data[index][TCTK].toString().trim()
                  : undefined
                : undefined,
              maPhongBan: data[index][BP]
                ? data[index][BP].toString().trim() !== ""
                  ? data[index][BP].toString().trim()
                  : undefined
                : undefined,
              maCauTrucKhoCha: data[index][MCTKC]
                ? data[index][MCTKC].toString().trim() !== ""
                  ? data[index][MCTKC].toString().trim()
                  : undefined
                : undefined,
              viTri: data[index][VT]
                ? data[index][VT].toString().trim() !== ""
                  ? data[index][VT].toString().trim()
                  : undefined
                : undefined,
              sucChua: data[index][SC]
                ? data[index][SC].toString().trim() !== ""
                  ? data[index][SC].toString().trim()
                  : undefined
                : undefined,
              isCoDinh: data[index][CD]
                ? data[index][CD].toString().trim() !== ""
                  ? data[index][CD].toString().trim()
                  : undefined
                : undefined,
            });
          }
          Data.push(data[index][MCTK]);
        });
        if (NewData.length === 0) {
          setFileName(file.name);
          setDataView([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const indices = [];
          const row = [];
          for (let i = 0; i < Data.length; i++) {
            for (let j = i + 1; j < Data.length; j++) {
              if (
                Data[i] === Data[j] &&
                Data[j] !== undefined &&
                Data[i] !== undefined
              ) {
                indices.push(Data[i]);
                row.push(i + 1);
                row.push(j + 1);
              }
            }
          }
          setDataView(NewData);
          setFileName(file.name);
          setDataLoi();
          if (indices.length > 0) {
            setMessageError(
              `Hàng ${row.join(", ")} có mã cấu trúc kho trùng nhau`
            );
            Helper.alertError(
              `Hàng ${row.join(", ")} có mã cấu trúc kho trùng nhau`
            );
            setHangTrung(indices);
            setCheckDanger(true);
          } else {
            setHangTrung([]);
            setCheckDanger(false);
          }
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
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/ImportExel-san-pham`,
          "POST",
          dataView.map((ctk) => {
            return {
              ...ctk,
              isCoDinh: ctk.isCoDinh && ctk.isCoDinh.toLowerCase() === "x",
            };
          }),
          "IMPORT",
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
        setFileName(null);
        setDataView([]);
        openModalFS(false);
        refesh();
      }
    });
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import cấu trúc kho thành phẩm",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((maCauTrucKho) => {
        if (current.maCauTrucKho === maCauTrucKho) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.maCauTrucKho === undefined) {
      setCheckDanger(true);
      setMessageError("Mã cấu trúc kho không được rỗng");
      return "red-row";
    } else if (current.tenCauTrucKho === undefined) {
      setCheckDanger(true);
      setMessageError("Tên cấu trúc kho không được rỗng");
      return "red-row";
    } else if (current.maPhongBan === undefined) {
      setCheckDanger(true);
      setMessageError("Mã Ban/Phòng không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (current.maCauTrucKho.toString() === dt.maCauTrucKho.toString()) {
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
      refesh();
    } else {
      openModalFS(false);
      refesh();
    }
  };

  return (
    <AntModal
      title="Import cấu trúc kho thành phẩm"
      open={openModal}
      width={`80%`}
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
            scroll={{ x: "100%", y: "60vh" }}
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
    </AntModal>
  );
}

export default ImportCauTrucKhoThanhPham;
