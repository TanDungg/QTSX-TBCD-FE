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

function ImportCanBoNhanVien({ openModalFS, openModal, loading, refesh }) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [DataLoi, setDataLoi] = useState();
  const [messageError, setMessageError] = useState();
  const [page, setPage] = useState(1);
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
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      align: "center",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      width: 250,
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
    },
    {
      title: "Mã chức vụ",
      dataIndex: "maChucVu",
      align: "center",
      key: "maChucVu",
    },
    {
      title: "Mã bộ phận",
      dataIndex: "maBoPhan",
      align: "center",
      key: "maBoPhan",
    },
    {
      title: "Mã Ban/Phòng",
      dataIndex: "maPhongBan",
      align: "center",
      key: "maPhongBan",
    },
    {
      title: "Mã đơn vị",
      dataIndex: "maDonVi",
      align: "center",
      key: "maDonVi",
    },
    {
      title: "Mã tập đoàn",
      dataIndex: "maTapDoan",
      align: "center",
      key: "maTapDoan",
    },
    {
      title: "Mã đơn vị trả lương",
      dataIndex: "maDonViTraLuong",
      align: "center",
      key: "maDonViTraLuong",
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const TaiFileMau = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/ExportFileExcel`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_CBNV", res.data.dataexcel);
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
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
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
          .trim() === "Mã nhân viên" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
          })[0]
          .toString()
          .trim() === "Họ tên" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
          })[0]
          .toString()
          .trim() === "Email" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
          })[0]
          .toString()
          .trim() === "SĐT" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã chức vụ" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 2 }, e: { c: 6, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã bộ phận" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 2 }, e: { c: 7, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã Ban/Phòng" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 2 }, e: { c: 8, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 2 }, e: { c: 9, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã tập đoàn" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 2 }, e: { c: 10, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị trả lương";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        if (data.length === 0) {
          setFileName(file.name);
          setDataView([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const MNV = "Mã nhân viên";
          const HVT = "Họ tên";
          const EMAIL = "Email";
          const SDT = "SĐT";
          const CV = "Mã chức vụ";
          const BP = "Mã bộ phận";
          const PB = "Mã Ban/Phòng";
          const DV = "Mã đơn vị";
          const TD = "Mã tập đoàn";
          const DVTL = "Mã đơn vị trả lương";
          const Data = [];
          const NewData = [];
          data.forEach((d, index) => {
            if (
              data[index][MNV] &&
              data[index][MNV].toString().trim() === "" &&
              data[index][HVT] &&
              data[index][HVT].toString().trim() === "" &&
              data[index][EMAIL] &&
              data[index][EMAIL].toString().trim() === "" &&
              data[index][SDT] &&
              data[index][SDT].toString().trim() === "" &&
              data[index][CV] &&
              data[index][CV].toString().trim() === "" &&
              data[index][BP] &&
              data[index][BP].toString().trim() === "" &&
              data[index][PB] &&
              data[index][PB].toString().trim() === "" &&
              data[index][DV] &&
              data[index][DV].toString().trim() === "" &&
              data[index][DVTL] &&
              data[index][DVTL].toString().trim() === "" &&
              data[index][TD] &&
              data[index][TD].toString().trim() === ""
            ) {
            } else {
              NewData.push({
                maNhanVien: data[index][MNV]
                  ? data[index][MNV].toString().trim() !== ""
                    ? data[index][MNV].toString()
                    : undefined
                  : undefined,
                fullName: data[index][HVT]
                  ? data[index][HVT].toString().trim() !== ""
                    ? data[index][HVT].toString().trim()
                    : undefined
                  : undefined,
                email: data[index][EMAIL]
                  ? data[index][EMAIL].toString().trim() !== ""
                    ? data[index][EMAIL].toString().trim()
                    : undefined
                  : undefined,
                phoneNumber: data[index][SDT]
                  ? data[index][SDT].toString().trim() !== ""
                    ? data[index][SDT].toString().trim()
                    : undefined
                  : undefined,
                maChucVu: data[index][CV]
                  ? data[index][CV].toString().trim() !== ""
                    ? data[index][CV].toString().trim()
                    : undefined
                  : undefined,
                maBoPhan: data[index][BP]
                  ? data[index][BP].toString().trim() !== ""
                    ? data[index][BP].toString().trim()
                    : undefined
                  : undefined,
                maPhongBan: data[index][PB]
                  ? data[index][PB].toString().trim() !== ""
                    ? data[index][PB].toString().trim()
                    : undefined
                  : undefined,
                maDonVi: data[index][DV]
                  ? data[index][DV].toString().trim() !== ""
                    ? data[index][DV].toString().trim()
                    : undefined
                  : undefined,
                maTapDoan: data[index][TD]
                  ? data[index][TD].toString().trim() !== ""
                    ? data[index][TD].toString().trim()
                    : undefined
                  : undefined,
                maDonViTraLuong: data[index][DVTL]
                  ? data[index][DVTL].toString().trim() !== ""
                    ? data[index][DVTL].toString().trim()
                    : undefined
                  : undefined,
              });
            }
            Data.push(d.maNhanVien);
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
                if (Data[i] === Data[j]) {
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
              setHangTrung(indices);
              setCheckDanger(true);
              setMessageError(
                `Hàng ${row.join(", ")} có mã nhân viên trùng nhau`
              );
            } else {
              setHangTrung([]);
              setCheckDanger(false);
            }
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
          `Account/ImportExel`,
          "POST",
          dataView,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status === 409) {
          setDataLoi(res.data);
          setMessageError(res.data.ghiChuImport);
        } else {
          setFileName(null);
          setDataView([]);
          openModalFS(false);
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import kế hoạch",
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
    } else if (current.maNhanVien === undefined) {
      setCheckDanger(true);
      setMessageError("Mã nhân viên không được rỗng");
      return "red-row";
    } else if (current.fullName === undefined) {
      setCheckDanger(true);
      setMessageError("Tên nhân viên không được rỗng");
      return "red-row";
    } else if (current.maChucVu === undefined) {
      setCheckDanger(true);
      setMessageError("Mã chức vụ không được rỗng");
      return "red-row";
    } else if (current.maTapDoan === undefined) {
      setCheckDanger(true);
      setMessageError("Mã tập đoàn không được rỗng");
      return "red-row";
    } else if (current.maDonVi === undefined) {
      setCheckDanger(true);
      setMessageError("Mã đơn vị không được rỗng");
      return "red-row";
    } else if (current.maPhongBan === undefined) {
      setCheckDanger(true);
      setMessageError("Mã phòng ban không được rỗng");
      return "red-row";
    } else if (DataLoi) {
      if (current.maNhanVien.toString() === DataLoi.maNhanVien) {
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
      refesh();
      setDataView([]);
      setHangTrung([]);
    } else {
      refesh();
      openModalFS(false);
    }
  };

  return (
    <AntModal
      title="Import cán bộ nhân viên"
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
            <Col xxl={4} xl={7} lg={8} md={9} xs={11}>
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
                        <Alert type="error" message={messageError} banner />
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
                          setPage(1);
                          setDataLoi();
                          setHangTrung([]);
                        }}
                      />
                    </p>
                  </Popover>
                </>
              )}
            </Col>
            <Col xxl={4} xl={5} lg={5} md={6} xs={7}>
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
            scroll={{
              x: 1100,
              y: "55vh",
            }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(dataView)}
            size="small"
            loading={loading}
            rowClassName={(current, index) => RowStyle(current, index, page)}
            pagination={{
              onChange: (p) => setPage(p),
              pageSize: 20,
              showSizeChanger: false,
              showQuickJumper: true,
            }}
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

export default ImportCanBoNhanVien;
