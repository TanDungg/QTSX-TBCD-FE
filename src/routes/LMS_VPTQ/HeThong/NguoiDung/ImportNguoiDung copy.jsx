import {
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  SaveOutlined,
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
import Helpers from "src/helpers";
import map from "lodash/map";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { Modal } from "src/components/Common";
import {
  exportExcel,
  getTokenInfo,
  getLocalStorage,
  reDataForTable,
  convertObjectToUrlParams,
} from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportNguoiDung({ openModalFS, openModal }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataListNguoiDung, setDataListNguoiDung] = useState([]);
  const [FileImport, setFileImport] = useState(null);
  const [checkDanger, setCheckDanger] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [HangTrung, setHangTrung] = useState([]);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã số nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 120,
    },
    {
      title: "Họ & tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 180,
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      width: 100,
      align: "center",
    },
    {
      title: "Chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
      width: 120,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 200,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 200,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
    },
    {
      title: "Lỗi",
      dataIndex: "ghiChuImport",
      key: "ghiChuImport",
      align: "center",
      width: 150,
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const TaiFileMau = () => {
    const param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      phanMem_Id: INFO.phanMem_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/export-file-mau-phan-quyen?${param}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("FileMauImportNguoiDung", res.data.dataexcel);
    });
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

  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });

      const worksheet = workbook.Sheets["Import"];

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
          .trim() === "Mã số nhân viên" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
          })[0]
          .toString()
          .trim() === "Họ & tên" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ngày sinh" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
          })[0]
          .toString()
          .trim() === "Chức danh" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
          })[0]
          .toString()
          .trim() === "Phòng ban" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 2 }, e: { c: 6, r: 2 } },
          })[0]
          .toString()
          .trim() === "Đơn vị" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 2 }, e: { c: 7, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ghi chú";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        if (data.length === 0) {
          setFileImport(file.name);
          setDataListNguoiDung([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helpers.alertError("Dữ liệu import không được rỗng");
        } else {
          const MSNV = "Mã số nhân viên";
          const HT = "Họ & tên";
          const NS = "Ngày sinh";
          const CD = "Chức danh";
          const PB = "Phòng ban";
          const DV = "Đơn vị";
          const MT = "Ghi chú";

          const DataTrung = [];
          const ListCNBV = [];
          data.forEach((d, index) => {
            ListCNBV.push({
              maNhanVien: data[index][MSNV]
                ? data[index][MSNV].toString().trim() !== ""
                  ? data[index][MSNV].toString()
                  : null
                : null,
              fullName: data[index][HT]
                ? data[index][HT].toString().trim() !== ""
                  ? data[index][HT].toString().trim()
                  : null
                : null,
              ngaySinh: data[index][NS]
                ? data[index][NS].toString().trim() !== ""
                  ? data[index][NS].toString().trim()
                  : null
                : null,
              tenChucDanh: data[index][CD]
                ? data[index][CD].toString().trim() !== ""
                  ? data[index][CD].toString().trim()
                  : null
                : null,
              tenPhongBan: data[index][PB]
                ? data[index][PB].toString().trim() !== ""
                  ? data[index][PB].toString().trim()
                  : null
                : null,
              tenDonVi: data[index][DV]
                ? data[index][DV].toString().trim() !== ""
                  ? data[index][DV].toString().trim()
                  : null
                : null,
              moTa: data[index][MT]
                ? data[index][MT].toString().trim() !== ""
                  ? data[index][MT].toString().trim()
                  : null
                : null,
              ghiChuImport: null,
            });
            DataTrung.push(d["Mã số nhân viên"]);
          });
          if (ListCNBV.length === 0) {
            setFileImport(file.name);
            setDataListNguoiDung([]);
            setCheckDanger(true);
            setMessageError("Dữ liệu import không được rỗng");
            Helpers.alertError("Dữ liệu import không được rỗng");
          } else {
            let indices = [];
            let row = [];
            let seenValues = {};

            for (let i = 0; i < DataTrung.length; i++) {
              for (let j = i + 1; j < DataTrung.length; j++) {
                if (
                  DataTrung[i] === DataTrung[j] &&
                  !seenValues[DataTrung[i]]
                ) {
                  indices.push(DataTrung[i]);

                  let currentRow = [i + 1, j + 1];
                  row.push(currentRow);

                  seenValues[DataTrung[i]] = true;
                }
              }
            }

            const newData = ListCNBV.map((cbnv) => {
              if (!cbnv.maNhanVien) {
                return {
                  ...cbnv,
                  ghiChuImport: "Mã CBNV không được trống",
                };
              } else {
                return cbnv;
              }
            });
            setDataListNguoiDung(newData);
            setFileImport(file.name);
            if (indices.length > 0) {
              setHangTrung(indices);
              setCheckDanger(true);
              setMessageError(
                `Hàng ${row.join(", ")} có mã số nhân viên trùng nhau`
              );
            } else {
              setHangTrung([]);
              setCheckDanger(false);
            }
          }
        }
      } else {
        setFileImport(file.name);
        setDataListNguoiDung([]);
        setCheckDanger(true);
        setMessageError("Mẫu import không hợp lệ");
        Helpers.alertError("Mẫu file import không hợp lệ");
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
        Helpers.alertError(messages.UPLOAD_ERROR);
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
    const newData = {
      donVi_Id: INFO.donVi_Id,
      phanMem_Id: INFO.phanMem_Id,
      list_ChiTiets: DataListNguoiDung,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/import`,
          "POST",
          newData,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status === 409) {
          const newData = DataListNguoiDung.map((dt) => {
            const loi = res.data.find((l) => l.maNhanVien === dt.maNhanVien);
            if (loi) {
              return {
                ...dt,
                ghiChuImport: loi.ghiChuImport,
              };
            } else {
              return dt;
            }
          });
          setDataListNguoiDung(newData);
        } else {
          setFileImport(null);
          setDataListNguoiDung([]);
          openModalFS(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import CBNV",
    onOk: handleSubmit,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((maNhanVien) => {
        if (current.maNhanVien === maNhanVien) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.maNhanVien === null) {
      setCheckDanger(true);
      setMessageError("Import không thành công");
      return "red-row";
    } else if (current.ghiChuImport !== null) {
      setCheckDanger(true);
      setMessageError("Import không thành công");
      return "red-row";
    }
  };

  const handleCancel = () => {
    if (checkDanger === true) {
      openModalFS(false);
      setCheckDanger(false);
      setFileImport(null);
      setDataListNguoiDung([]);
      setHangTrung([]);
    } else {
      openModalFS(false);
    }
  };

  return (
    <AntModal
      title="Import cán bộ nhân viên"
      open={openModal}
      width={`85%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row>
            <Col
              xxl={6}
              xl={12}
              lg={16}
              md={16}
              sm={20}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: 10,
              }}
            >
              <span
                style={{
                  width: "80px",
                }}
              >
                Import:
              </span>
              {!FileImport ? (
                <Upload {...props}>
                  <Button
                    className="th-margin-bottom-0"
                    icon={<UploadOutlined />}
                    danger={checkDanger}
                  >
                    Tải dữ liệu lên
                  </Button>
                </Upload>
              ) : (
                <Popover
                  content={
                    !checkDanger ? (
                      FileImport
                    ) : (
                      <Alert type="error" message={messageError} banner />
                    )
                  }
                >
                  <span
                    style={{
                      color: checkDanger ? "red" : "#0469B9",
                      cursor: "pointer",
                    }}
                  >
                    {FileImport.length > 30
                      ? FileImport.substring(0, 30) + "..."
                      : FileImport}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFileImport(null);
                      setCheckDanger(false);
                      setMessageError(null);
                      setDataListNguoiDung([]);
                    }}
                  />
                </Popover>
              )}
            </Col>
            <Col xxl={4} xl={5} lg={5} md={6} xs={7}>
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
            scroll={{
              x: 1100,
              y: "45vh",
            }}
            columns={columns}
            components={components}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(DataListNguoiDung)}
            size="small"
            rowClassName={(current, index) => RowStyle(current, index)}
            pagination={false}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Divider />
            <Button
              icon={<SaveOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={modalXK}
              disabled={
                DataListNguoiDung.length > 0 && !checkDanger ? false : true
              }
            >
              Lưu
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ImportNguoiDung;
