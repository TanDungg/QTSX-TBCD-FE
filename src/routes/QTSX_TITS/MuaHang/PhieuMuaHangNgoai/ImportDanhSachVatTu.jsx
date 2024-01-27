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
  exportExcel,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";
import Helpers from "src/helpers";
const { EditableRow, EditableCell } = EditableTableRow;

function ImportDanhSachVatTu({
  openModalFS,
  openModal,
  DataThemVatTu,
  isMuaHangTrongNuoc,
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
  const [Loi, setLoi] = useState(false);

  const [HangTrung, setHangTrung] = useState([]);
  const [message, setMessageError] = useState([]);

  let colValues = () => {
    const colStart = [
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
        width: 150,
      },
      {
        title: "Tên vật tư",
        dataIndex: "tenVatTu",
        key: "tenVatTu",
        align: "center",
        width: 150,
      },
    ];
    const colIsNoi = [
      {
        title: "Định mức",
        dataIndex: "dinhMuc",
        key: "dinhMuc",
        align: "center",
        width: 100,
      },
      {
        title: "SL dự phòng",
        key: "soLuongDuPhong",
        dataIndex: "soLuongDuPhong",
        align: "center",
        width: 100,
      },
      {
        title: "SL đặt mua",
        key: "soLuongDatMua",
        dataIndex: "soLuongDatMua",
        align: "center",
        width: 100,
      },
      {
        title: "Ngày yêu cầu giao",
        dataIndex: "ngay",
        key: "ngay",
        align: "center",
        width: 100,
      },
      {
        title: "Mã đơn hàng",
        dataIndex: "maPhieu",
        key: "maPhieu",
        align: "center",
        width: 100,
      },
      {
        title: "Mã CV thu mua",
        dataIndex: "maNhanVien",
        key: "maNhanVien",
        width: 100,
        align: "center",
      },
      {
        title: "Hạng mục",
        dataIndex: "hangMucSuDung",
        key: "hangMucSuDung",
        align: "center",
        width: 100,
      },
    ];
    const colIsNgoai = [
      {
        title: "Xuất xứ",
        dataIndex: "xuatXu",
        key: "xuatXu",
        align: "center",
        width: 100,
      },
      {
        title: "Định mức",
        dataIndex: "dinhMuc",
        key: "dinhMuc",
        align: "center",
        width: 100,
      },
      {
        title: "SL cần dùng",
        key: "soLuongDuPhong",
        dataIndex: "soLuongDuPhong",
        align: "center",
        width: 100,
      },
      {
        title: "SL đặt mua",
        key: "soLuongDatMua",
        dataIndex: "soLuongDatMua",
        width: 100,
        align: "center",
      },
      {
        title: "Mã đơn hàng",
        dataIndex: "maPhieu",
        key: "maPhieu",
        width: 100,
        align: "center",
      },
      {
        title: "Mã CV thu mua",
        dataIndex: "maNhanVien",
        key: "maNhanVien",
        width: 100,
        align: "center",
      },
      {
        title: "Ngày yêu cầu giao",
        dataIndex: "ngay",
        key: "ngay",
        align: "center",
        width: 100,
      },
      {
        title: "Hạng mục",
        dataIndex: "hangMucSuDung",
        key: "hangMucSuDung",
        align: "center",
        width: 100,
      },
      {
        title: "Chứng nhận",
        dataIndex: "chungNhan",
        key: "chungNhan",
        align: "center",
        width: 100,
      },
      {
        title: "Bảo hành",
        dataIndex: "baoHanh",
        key: "baoHanh",
        align: "center",
        width: 100,
      },
    ];
    if (Loi) {
      colStart.splice(0, 0, {
        title: "Lỗi",
        dataIndex: "ghiChuImport",
        key: "ghiChuImport",
        width: 100,
        align: "center",
      });
    }
    if (isMuaHangTrongNuoc === "1") {
      return [...colStart, ...colIsNoi];
    } else if (isMuaHangTrongNuoc === "0") {
      return [...colStart, ...colIsNgoai];
    }
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
    const params = convertObjectToUrlParams({
      isMuaHangTrongNuoc: isMuaHangTrongNuoc === "1",
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuMuaHangNgoai/export-file-mau-vat-tu?${params}`,
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
      const dataCheck =
        isMuaHangTrongNuoc === "1"
          ? [
              {
                name: "STT",
                key: "key",
              },
              {
                name: "Mã vật tư",
                key: "maVatTu",
              },
              {
                name: "Tên vật tư",
                key: "tenVatTu",
              },
              {
                name: "Mã nhân viên thu mua",
                key: "maNhanVien",
              },
              {
                name: "Ngày yêu cầu giao",
                key: "ngay",
              },
              {
                name: "Định mức",
                key: "dinhMuc",
              },
              {
                name: "Số lượng dự phòng",
                key: "soLuongDuPhong",
              },
              {
                name: "Số lượng đặt mua",
                key: "soLuongDatMua",
              },
              {
                name: "Mã đơn hàng",
                key: "maPhieu",
              },
              {
                name: "Hạng mục sử dụng",
                key: "hangMucSuDung",
              },
            ]
          : [
              {
                name: "STT",
                key: "key",
              },
              {
                name: "Mã vật tư",
                key: "maVatTu",
              },
              {
                name: "Tên vật tư",
                key: "tenVatTu",
              },
              {
                name: "Xuất xứ",
                key: "xuatXu",
              },
              {
                name: "Mã nhân viên thu mua",
                key: "maNhanVien",
              },
              {
                name: "Ngày yêu cầu giao",
                key: "ngay",
              },
              {
                name: "Định mức",
                key: "dinhMuc",
              },
              {
                name: "Số lượng dự phòng",
                key: "soLuongDuPhong",
              },
              {
                name: "Số lượng đặt mua",
                key: "soLuongDatMua",
              },
              {
                name: "Mã đơn hàng",
                key: "maPhieu",
              },
              {
                name: "Chứng nhận",
                key: "chungNhan",
              },
              {
                name: "Bảo hành",
                key: "baoHanh",
              },
              {
                name: "Hạng mục sử dụng",
                key: "hangMucSuDung",
              },
            ];

      let checkMau = true;
      for (let index = 0; index < dataCheck.length; index++) {
        if (
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: index, r: 2 }, e: { c: index, r: 2 } },
          })[0] &&
          XLSX.utils
            .sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: index, r: 2 }, e: { c: index, r: 2 } },
            })[0]
            .toString()
            .trim() === dataCheck[index].name
        ) {
          checkMau = true;
        } else {
          checkMau = false;
        }
      }

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const DataVatTu = [];
        data.forEach((d, index) => {
          const newData = {};
          dataCheck.forEach((dt) => {
            newData[dt.key] =
              d[dt.name] || d[dt.name] === 0
                ? data[index][dt.name].toString().trim() !== ""
                  ? data[index][dt.name].toString().trim()
                  : null
                : null;
          });
          DataVatTu.push(newData);
        });

        if (DataVatTu.length === 0) {
          setFileName(file.name);
          setDataListVatTu([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const indices = [];
          const row = [];
          for (let i = 0; i < DataVatTu.length; i++) {
            for (let j = i + 1; j < DataVatTu.length; j++) {
              if (
                DataVatTu[i].maVatTu === DataVatTu[j].maVatTu &&
                DataVatTu[j].maVatTu !== undefined &&
                DataVatTu[i].maVatTu !== undefined
              ) {
                indices.push(DataVatTu[i].maVatTu);
                row.push(i + 1);
                row.push(j + 1);
              }
            }
          }
          if (indices.length > 0) {
            setMessageError(`Hàng ${row.join(", ")} có vật tư trùng nhau`);
            Helper.alertError(`Hàng ${row.join(", ")} có vật tư trùng nhau`);
            setHangTrung(indices);
            setCheckDanger(true);
          } else {
            setHangTrung([]);
            setCheckDanger(false);
          }
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
          `tits_qtsx_PhieuMuaHangNgoai/import-vat-tu`,
          "POST",
          DataListVatTu,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status === 200) {
        DataThemVatTu(res.data);
        setFileName(null);
        setDataListVatTu([]);
        openModalFS(false);
      } else if (res.status === 409) {
        setMessageError("Mẫu import không hợp lệ");
        res.data.forEach((dtl) => {
          DataListVatTu.forEach((dt) => {
            if (dtl.maVatTu === dt.maVatTu) {
              dt.ghiChuImport = dtl.ghiChuImport;
            }
          });
        });
        setDataListVatTu(reDataForTable([...DataListVatTu]));
        setLoi(true);
        setCheckDanger(true);
      } else {
        Helpers.alertError("Lỗi server");
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
    } else if (current.tenVatTu === null) {
      setCheckDanger(true);
      setMessageError("Tên chi tiết không được rỗng");
      return "red-row";
    } else if (current.maVatTu === null) {
      setCheckDanger(true);
      setMessageError("Mã vật tư không được rỗng");
      return "red-row";
    } else if (current.maNhanVien === null) {
      setCheckDanger(true);
      setMessageError("Mã CV thu mua không được rỗng");
      return "red-row";
    } else if (current.soLuongDuPhong === null) {
      setCheckDanger(true);
      setMessageError("Số lượng dự phòng không được rỗng");
      return "red-row";
    } else if (current.soLuongDatMua === null) {
      setCheckDanger(true);
      setMessageError("Số lượng đặt mua không được rỗng");
      return "red-row";
    } else if (current.ghiChuImport) {
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
                className="th-btn-margin-bottom-0"
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
              className="th-btn-margin-bottom-0"
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
