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

const { EditableRow, EditableCell } = EditableTableRow;

function ImportNhaCungCap({ openModalFS, openModal, loading, refesh }) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const [message, setMessageError] = useState([]);
  const renderLoi = (val) => {
    let check = false;
    let messageLoi = "";
    if (DataLoi && DataLoi.length > 0) {
      DataLoi.forEach((dt) => {
        if (dt.maNhaCungCap === val) {
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
      title: "Mã nhà cung cấp",
      dataIndex: "maNhaCungCap",
      key: "maNhaCungCap",
      align: "center",
      render: (val) => renderLoi(val),
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "tenNhaCungCap",
      align: "center",
      key: "tenNhaCungCap",
    },
    {
      title: "Mã loại nhà cung cấp",
      dataIndex: "maLoaiNhaCungCap",
      align: "center",
      key: "maLoaiNhaCungCap",
    },
    {
      title: "Người liên hệ",
      dataIndex: "nguoiLienHe",
      align: "center",
      key: "nguoiLienHe",
    },
    {
      title: "Số điện thoại",
      dataIndex: "sdt",
      align: "center",
      key: "sdt",
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      key: "email",
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      align: "center",
      key: "diaChi",
    },
    {
      title: "Mã số thuế",
      dataIndex: "maSoThue",
      align: "center",
      key: "maSoThue",
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
          `NhaCungCap/ExportFileExcel`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("FileMauImportNhaCungCap", res.data.dataexcel);
    });
  };

  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Bảng nhà cung cấp"];

      const checkMau =
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
          .trim() === "Mã nhà cung cấp" &&
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
          .trim() === "Tên nhà cung cấp" &&
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
          .trim() === "Mã loại nhà cung cấp" &&
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
          .trim() === "Người liên hệ" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
          })[0]
          .toString()
          .trim() === "Số điện thoại" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 6, r: 2 }, e: { c: 6, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 2 }, e: { c: 6, r: 2 } },
          })[0]
          .toString()
          .trim() === "Email" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 7, r: 2 }, e: { c: 7, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 2 }, e: { c: 7, r: 2 } },
          })[0]
          .toString()
          .trim() === "Địa chỉ" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 8, r: 2 }, e: { c: 8, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 2 }, e: { c: 8, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã số thuế";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const MNCC = "Mã nhà cung cấp";
        const TNCC = "Tên nhà cung cấp";
        const MLNCC = "Mã loại nhà cung cấp";
        const NLH = "Người liên hệ";
        const SDT = "Số điện thoại";
        const EMAIL = "Email";
        const DC = "Địa chỉ";
        const MST = "Mã số thuế";

        const Data = [];
        const NewData = [];
        data.forEach((d, index) => {
          if (
            data[index][MNCC] &&
            data[index][MNCC].toString().trim() === "" &&
            data[index][TNCC] &&
            data[index][TNCC].toString().trim() === "" &&
            data[index][MLNCC] &&
            data[index][MLNCC].toString().trim() === ""
          ) {
          } else {
            NewData.push({
              maNhaCungCap: data[index][MNCC]
                ? data[index][MNCC].toString().trim() !== ""
                  ? data[index][MNCC].toString().trim()
                  : undefined
                : undefined,
              tenNhaCungCap: data[index][TNCC]
                ? data[index][TNCC].toString().trim() !== ""
                  ? data[index][TNCC].toString().trim()
                  : undefined
                : undefined,
              maLoaiNhaCungCap: data[index][MLNCC]
                ? data[index][MLNCC].toString().trim() !== ""
                  ? data[index][MLNCC].toString().trim()
                  : undefined
                : undefined,
              nguoiLienHe: data[index][NLH]
                ? data[index][NLH].toString().trim() !== ""
                  ? data[index][NLH].toString().trim()
                  : undefined
                : undefined,
              email: data[index][EMAIL]
                ? data[index][EMAIL].toString().trim() !== ""
                  ? data[index][EMAIL].toString().trim()
                  : undefined
                : undefined,
              sdt: data[index][SDT]
                ? data[index][SDT].toString().trim() !== ""
                  ? data[index][SDT].toString().trim()
                  : undefined
                : undefined,
              diaChi: data[index][DC]
                ? data[index][DC].toString().trim() !== ""
                  ? data[index][DC].toString().trim()
                  : undefined
                : undefined,
              maSoThue: data[index][MST]
                ? data[index][MST].toString().trim() !== ""
                  ? data[index][MST].toString().trim()
                  : undefined
                : undefined,
            });
          }
          Data.push(data[index][MNCC]);
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
              `Hàng ${row.join(", ")} có mã nhà cung cấp trùng nhau`
            );
            Helper.alertError(
              `Hàng ${row.join(", ")} có mã nhà cung cấp trùng nhau`
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
        setMessageError("Mẫu file import không hợp lệ");
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
          `NhaCungCap/ImportExel`,
          "POST",
          dataView,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status === 409) {
        setDataLoi(res.data);
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
    title: "Xác nhận import nhà cung cấp",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    console.log(DataLoi);
    if (HangTrung.length > 0) {
      HangTrung.forEach((maNhaCungCap) => {
        if (current.maNhaCungCap === maNhaCungCap) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.maNhaCungCap === undefined) {
      setCheckDanger(true);
      setMessageError("Mã nhà cung cấp không được rỗng");
      return "red-row";
    } else if (current.tenNhaCungCap === undefined) {
      setCheckDanger(true);
      setMessageError("Tên nhà cung cấp không được rỗng");
      return "red-row";
    } else if (current.maLoaiNhaCungCap === undefined) {
      setCheckDanger(true);
      setMessageError("Mã loại nhà cung cấp không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi !== undefined) {
      let check = false;
      if (current.maNhaCungCap.toString() === DataLoi.maNhaCungCap.toString()) {
        check = true;
      }
      if (check) {
        setCheckDanger(true);
        setMessageError(DataLoi.ghiChuImport);
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
      title="Import nhà cung cấp"
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
            scroll={{ x: "100%", y: "60vh" }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(dataView)}
            size="small"
            loading={loading}
            rowClassName={RowStyle}
            pagination={{ pageSize: 20 }}
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
    </AntModal>
  );
}

export default ImportNhaCungCap;
