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

function ImportThongTinVatTu({ openModalFS, openModal, loading, refesh }) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const [message, setMessageError] = useState([]);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
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
      align: "center",
      key: "tenVatTu",
    },
    {
      title: "Mã nhà cung cấp",
      dataIndex: "maNhaCungCap",
      align: "center",
      key: "maNhaCungCap",
    },
    {
      title: "Ngày nhận hàng",
      dataIndex: "ngayNhapVT_SP",
      align: "center",
      key: "ngayNhapVT_SP",
    },
    {
      title: "Thời gian sử dụng",
      dataIndex: "thoiGianSuDung",
      align: "center",
      key: "thoiGianSuDung",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      align: "center",
      key: "ghiChu",
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
          `lkn_ThongTinVatTu_SanPham/ExportFileExcel`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_Thong_Tin_Vat_Tu", res.data.dataexcel);
    });
  };

  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Thông tin vật tư"];

      const checkMau =
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 0, r: 2 }, e: { c: 0, r: 2 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 2 }, e: { c: 1, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã vật tư" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
          })[0]
          .toString()
          .trim() === "Tên vật tư" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã nhà cung cấp" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ngày nhận hàng" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
          })[0]
          .toString()
          .trim() === "Thời gian sử dụng" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 2 }, e: { c: 6, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ghi chú";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const MVT = "Mã vật tư";
        const TVT = "Tên vật tư";
        const MNCC = "Mã nhà cung cấp";
        const NNH = "Ngày nhận hàng";
        const TGSD = "Thời gian sử dụng";
        const GC = "Ghi chú";

        const Data = [];
        const NewData = [];
        data.forEach((d, index) => {
          if (
            data[index][MVT] &&
            data[index][MVT].toString().trim() === "" &&
            data[index][TVT] &&
            data[index][TVT].toString().trim() === "" &&
            data[index][MNCC] &&
            data[index][MNCC].toString().trim() === "" &&
            data[index][NNH] &&
            data[index][NNH].toString().trim() === ""
          ) {
          } else {
            NewData.push({
              maVatTu: data[index][MVT]
                ? data[index][MVT].toString().trim() !== ""
                  ? data[index][MVT].toString().trim()
                  : undefined
                : undefined,
              tenVatTu: data[index][TVT]
                ? data[index][TVT].toString().trim() !== ""
                  ? data[index][TVT].toString().trim()
                  : undefined
                : undefined,
              maNhaCungCap: data[index][MNCC]
                ? data[index][MNCC].toString().trim() !== ""
                  ? data[index][MNCC].toString().trim()
                  : undefined
                : undefined,
              ngayNhapVT_SP: data[index][NNH]
                ? data[index][NNH].toString().trim() !== ""
                  ? data[index][NNH].toString().trim()
                  : undefined
                : undefined,
              thoiGianSuDung: data[index][TGSD]
                ? data[index][TGSD].toString().trim() !== ""
                  ? data[index][TGSD].toString().trim()
                  : undefined
                : undefined,
              ghiChu: data[index][GC]
                ? data[index][GC].toString().trim() !== ""
                  ? data[index][GC].toString().trim()
                  : undefined
                : undefined,
            });
          }
          Data.push(data[index][MVT]);
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
            setMessageError(`Hàng ${row.join(", ")} có mã vật tư trùng nhau`);
            Helper.alertError(`Hàng ${row.join(", ")} có mã vật tư trùng nhau`);
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
          `VatTu/ImportExel`,
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
        setMessageError(res.data.ghiChuImport);
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
    title: "Xác nhận import vật tư",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((maVatTu) => {
        if (current.maVatTu === maVatTu) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.maVatTu === undefined) {
      setCheckDanger(true);
      setMessageError("Mã vật tư không được rỗng");
      return "red-row";
    } else if (current.tenVatTu === undefined) {
      setCheckDanger(true);
      setMessageError("Tên vật tư không được rỗng");
      return "red-row";
    } else if (current.maNhomVatTu === undefined) {
      setCheckDanger(true);
      setMessageError("Mã nhóm vật tư không được rỗng");
      return "red-row";
    } else if (current.maDonViTinh === undefined) {
      setCheckDanger(true);
      setMessageError("Mã đơn vị tính không được rỗng");
      return "red-row";
    } else if (DataLoi) {
      if (current.maVatTu.toString() === DataLoi.maVatTu) {
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
      title="Import thông tin vật tư"
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
            pagination={{ pageSize: 20 }}
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

export default ImportThongTinVatTu;
