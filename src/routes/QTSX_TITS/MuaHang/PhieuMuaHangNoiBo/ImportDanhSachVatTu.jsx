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
  Image,
  Divider,
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
  createGuid,
  exportExcel,
} from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";
const { EditableRow, EditableCell } = EditableTableRow;

function ImportDanhSachVatTu({
  openModalFS,
  openModal,
  DataThemVatTu,
  itemData,
}) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataListVatTu, setDataListVatTu] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [message, setMessageError] = useState([]);

  let colValues = [
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
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Ngày yêu cầu giao",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "donGia",
      key: "donGia",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChuImport",
      key: "ghiChuImport",
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
          `tits_qtsx_PhieuMuaHangNoiBo/export-file-mau-vat-tu`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("FileMauImportDanhSachVatTu", res.data.dataexcel);
    });
  };

  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Import"];

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
          .trim() === "Mã đơn hàng" &&
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
          .trim() === "Số lượng" &&
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
          .trim() === "Ngày yêu cầu giao" &&
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
          .trim() === "Đơn giá";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const KEY = "STT";
        const MVT = "Mã vật tư";
        const TVT = "Tên vật tư";
        const MDH = "Mã đơn hàng";
        const SL = "Số lượng";
        const NYCG = "Ngày yêu cầu giao";
        const DG = "Đơn giá";

        const DataVatTu = [];
        data.forEach((d, index) => {
          if (
            data[index][KEY] &&
            data[index][KEY].toString().trim() === "" &&
            data[index][MVT] &&
            data[index][MVT].toString().trim() === "" &&
            data[index][TVT] &&
            data[index][TVT].toString().trim() === ""
          ) {
          } else {
            DataVatTu.push({
              id: createGuid(),
              key: data[index][KEY]
                ? data[index][KEY].toString().trim() !== ""
                  ? data[index][KEY].toString().trim()
                  : null
                : null,
              maVatTu: data[index][MVT]
                ? data[index][MVT].toString().trim() !== ""
                  ? data[index][MVT].toString().trim()
                  : null
                : null,
              tenVatTu: data[index][TVT]
                ? data[index][TVT].toString().trim() !== ""
                  ? data[index][TVT].toString().trim()
                  : null
                : null,
              maPhieu: data[index][MDH]
                ? data[index][MDH].toString().trim() !== ""
                  ? data[index][MDH].toString().trim()
                  : null
                : null,
              soLuong: data[index][SL]
                ? data[index][SL].toString().trim() !== ""
                  ? data[index][SL].toString().trim()
                  : null
                : null,
              ngay: data[index][NYCG]
                ? data[index][NYCG].toString().trim() !== ""
                  ? data[index][NYCG].toString().trim()
                  : null
                : null,
              donGia: data[index][DG]
                ? data[index][DG].toString().trim() !== ""
                  ? data[index][DG].toString().trim()
                  : null
                : null,
              ghiChuImport: null,
            });
          }
        });

        if (DataVatTu.length === 0) {
          setFileName(file.name);
          setDataListVatTu([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          setFileName(file.name);
          setDataListVatTu(DataVatTu);
          setCheckDanger(false);
          setMessageError(null);
        }
      } else {
        setFileName(file.name);
        setDataListVatTu([]);
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
        setCheckDanger(false);
        return false;
      }
    },

    showUploadList: false,
    maxCount: 1,
  };

  const XacNhanImport = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuMuaHangNoiBo/import-vat-tu`,
          "POST",
          DataListVatTu,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status !== 409) {
        DataThemVatTu(res.data);
        setFileName(null);
        setDataListVatTu([]);
        openModalFS(false);
      } else {
        const newData = DataListVatTu.map((vt) => {
          const loi = res.data.find((dt) => dt.maVatTu == vt.maVatTu);
          if (loi) {
            return { ...vt, ghiChuImport: loi.ghiChuImport };
          }
          return vt;
        });
        setMessageError("Mẫu import không hợp lệ");
        setDataListVatTu(newData);
        setCheckDanger(true);
      }
    });
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import vật tư",
    onOk: XacNhanImport,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      const trunglap = HangTrung.find(
        (item) => item.maVatTu === current.maVatTu
      );
      if (trunglap) {
        setCheckDanger(true);
        return "red-row";
      }
    } else if (current.ghiChuImport !== null) {
      setCheckDanger(true);
      return "red-row";
    } else if (current.STT === null) {
      setCheckDanger(true);
      setMessageError("STT không được rỗng");
      return "red-row";
    } else if (current.STT === "*" && current.tenVatTu === null) {
      setCheckDanger(true);
      setMessageError("Tên chi tiết không được rỗng");
      return "red-row";
    } else if (current.STT !== "*" && current.maVatTu === null) {
      setCheckDanger(true);
      setMessageError("Mã vật tư không được rỗng");
      return "red-row";
    }
  };
  const handleCancel = () => {
    if (checkDanger === true) {
      openModalFS(false);
      setCheckDanger(false);
      setFileName(null);
      setDataListVatTu([]);
    } else {
      openModalFS(false);
    }
  };

  return (
    <AntModal
      title="Import danh sách vật tư"
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row style={{ marginTop: 10 }}>
            <Col
              xxl={2}
              xl={3}
              lg={4}
              md={4}
              sm={6}
              xs={7}
              style={{ marginTop: 10 }}
              align={"center"}
            >
              Import:
            </Col>
            <Col xxl={4} xl={5} lg={7} md={7} xs={17}>
              <Upload {...props}>
                <Button
                  className="th-margin-bottom-0"
                  icon={<UploadOutlined />}
                  danger={checkDanger}
                >
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
                          setDataListVatTu([]);
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
                onClick={() => TaiFileMau()}
                className="th-margin-bottom-0"
                type="primary"
              >
                File mẫu
              </Button>
            </Col>
          </Row>
          <Table
            bordered
            columns={columns}
            scroll={{ x: 900, y: "40vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={DataListVatTu}
            size="small"
            rowClassName={RowStyle}
            pagination={false}
            // loading={loading}
          />
          <Divider
            style={{
              marginTop: "20px",
            }}
          />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              className="th-margin-bottom-0"
              type="primary"
              onClick={modalXK}
              disabled={DataListVatTu.length > 0 && checkDanger}
            >
              Lưu
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ImportDanhSachVatTu;
