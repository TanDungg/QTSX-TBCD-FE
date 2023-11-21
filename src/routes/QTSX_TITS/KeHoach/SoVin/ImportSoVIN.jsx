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
import {
  convertObjectToUrlParams,
  exportExcel,
  reDataForTable,
} from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportSoVIN({
  openModalFS,
  openModal,
  loading,
  refesh,
  tits_qtsx_SoLo_Id,
  addSanPham,
  soLuongDonHang,
}) {
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
        if (dt.maSoVin === val.maSoVin) {
          check = true;
          messageLoi = dt.ghiChuImport;
        }
      });
    }
    return check ? (
      <Popover content={<span style={{ color: "red" }}>{messageLoi}</span>}>
        {val.maSanPham}
      </Popover>
    ) : (
      <span>{val.maSanPham}</span>
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
      title: "Mã sản phẩm",
      // dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      render: (val) => renderLoi(val),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Mã loại sản phẩm",
      dataIndex: "maLoaiSanPham",
      key: "maLoaiSanPham",
      align: "center",
    },
    {
      title: "Mã màu",
      dataIndex: "maMau",
      key: "maMau",
      align: "center",
    },
    {
      title: "Tên số lô",
      dataIndex: "tenSoLo",
      key: "tenSoLo",
      align: "center",
    },
    {
      title: "Mã số VIN",
      dataIndex: "maSoVin",
      key: "maSoVin",
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
    const params = convertObjectToUrlParams({
      tits_qtsx_SoLo_Id: tits_qtsx_SoLo_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SoVin/export-file-mau?${params}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_So_VIN", res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["số VIN"];

      const checkMau =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 4 }, e: { c: 0, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 0, r: 4 }, e: { c: 0, r: 4 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 1, r: 4 }, e: { c: 1, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 4 }, e: { c: 1, r: 4 } },
          })[0]
          .toString()
          .trim() === "Mã sản phẩm" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 2, r: 4 }, e: { c: 2, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 4 }, e: { c: 2, r: 4 } },
          })[0]
          .toString()
          .trim() === "Tên sản phẩm" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 3, r: 4 }, e: { c: 3, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 4 }, e: { c: 3, r: 4 } },
          })[0]
          .toString()
          .trim() === "Mã loại sản phẩm" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 4, r: 4 }, e: { c: 4, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 4 }, e: { c: 4, r: 4 } },
          })[0]
          .toString()
          .trim() === "Mã màu" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 5, r: 4 }, e: { c: 5, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 4 }, e: { c: 5, r: 4 } },
          })[0]
          .toString()
          .trim() === "Tên số lô" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 6, r: 4 }, e: { c: 6, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 4 }, e: { c: 6, r: 4 } },
          })[0]
          .toString()
          .trim() === "Mã số VIN";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 4,
        });
        const MSP = "Mã sản phẩm";
        const TSP = "Tên sản phẩm";
        const MLSP = "Mã loại sản phẩm";
        const MM = "Mã màu";
        const MSV = "Mã số VIN";
        const MSPNB = "Tên số lô";
        const Data = [];
        const NewData = [];
        data.forEach((d, index) => {
          if (
            data[index][TSP] &&
            data[index][TSP].toString().trim() === "" &&
            data[index][MSP] &&
            data[index][MSP].toString().trim() === "" &&
            data[index][MLSP] &&
            data[index][MLSP].toString().trim() === "" &&
            data[index][MM] &&
            data[index][MM].toString().trim() === "" &&
            data[index][MSV] &&
            data[index][MSV].toString().trim() === "" &&
            data[index][MSPNB] &&
            data[index][MSPNB].toString().trim() === ""
          ) {
          } else {
            NewData.push({
              tenSanPham: data[index][TSP]
                ? data[index][TSP].toString().trim() !== ""
                  ? data[index][TSP].toString().trim()
                  : undefined
                : undefined,
              maSanPham: data[index][MSP]
                ? data[index][MSP].toString().trim() !== ""
                  ? data[index][MSP].toString().trim()
                  : undefined
                : undefined,
              maLoaiSanPham: data[index][MLSP]
                ? data[index][MLSP].toString().trim() !== ""
                  ? data[index][MLSP].toString().trim()
                  : undefined
                : undefined,
              maMau: data[index][MM]
                ? data[index][MM].toString().trim() !== ""
                  ? data[index][MM].toString().trim()
                  : undefined
                : undefined,
              tenSoLo: data[index][MSPNB]
                ? data[index][MSPNB].toString().trim() !== ""
                  ? data[index][MSPNB].toString().trim()
                  : undefined
                : undefined,
              maSoVin: data[index][MSV]
                ? data[index][MSV].toString().trim() !== ""
                  ? data[index][MSV].toString().trim()
                  : undefined
                : undefined,
              tits_qtsx_SoLo_Id: tits_qtsx_SoLo_Id,
            });
          }
          Data.push(data[index][MSV]);
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
            setMessageError(`Hàng ${row.join(", ")} có mã số VIN trùng nhau`);
            Helper.alertError(`Hàng ${row.join(", ")} có mã số VIN trùng nhau`);
            setHangTrung(indices);
            setCheckDanger(true);
          } else {
            setHangTrung([]);
            setCheckDanger(false);
          }
          if (NewData.length > soLuongDonHang) {
            setCheckDanger(true);
            setMessageError(
              `Số lượng import lớn hơn số lượng trong lô (${soLuongDonHang}) `
            );
            Helper.alertError(
              `Số lượng import lớn hơn số lượng trong lô (${soLuongDonHang}) `
            );
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
          `tits_qtsx_SoVin/kiem-tra-file-export`,
          "POST",
          dataView,
          "a",
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
        addSanPham(res.data);
        setFileName(null);
        setDataView([]);
        openModalFS(false);
      }
    });
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import Số VIN",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((maSoVin) => {
        if (current.maSoVin === maSoVin) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.tenSoLo === undefined) {
      setCheckDanger(true);
      setMessageError("Tên số Lô không được rỗng");
      return "red-row";
    } else if (current.maSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Mã sản phẩm không được rỗng");
      return "red-row";
    } else if (current.tenSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Tên sản phẩm không được rỗng");
      return "red-row";
    } else if (current.maLoaiSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Mã loại sản phẩm không được rỗng");
      return "red-row";
    } else if (current.maSoVin === undefined) {
      setCheckDanger(true);
      setMessageError("Mã số VIN không được rỗng");
      return "red-row";
    } else if (current.maMau === undefined) {
      setCheckDanger(true);
      setMessageError("Mã màu không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (current.maSoVin.toString() === dt.maSoVin.toString()) {
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
      title="Import Số VIN"
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

export default ImportSoVIN;
