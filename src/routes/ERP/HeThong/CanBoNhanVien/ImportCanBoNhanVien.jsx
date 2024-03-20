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
  convertDaysToDateString,
  exportExcel,
  reDataForTable,
} from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportCanBoNhanVien({ openModalFS, openModal, loading, refesh }) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [messageError, setMessageError] = useState();
  const [IsLoi, setIsLoi] = useState(false);

  let colValues = () => {
    const col = [
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
        title: "Tên nhân viên",
        dataIndex: "fullName",
        align: "center",
        key: "fullName",
      },
      {
        title: "Ngày sinh",
        dataIndex: "ngaySinh",
        align: "center",
        key: "ngaySinh",
      },
      {
        title: "Ngày vào làm",
        dataIndex: "ngayVaoLam",
        align: "center",
        key: "ngayVaoLam",
      },
      {
        title: "Email Thaco",
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
        title: "Cấp độ nhân sự",
        dataIndex: "tenCapDoNhanSu",
        align: "center",
        key: "tenCapDoNhanSu",
      },
      {
        title: "Chức danh",
        dataIndex: "tenChucDanh",
        align: "center",
        key: "tenChucDanh",
      },
      {
        title: "Chức vụ",
        dataIndex: "tenChucVu",
        align: "center",
        key: "tenChucVu",
      },
      {
        title: "Thành phần",
        dataIndex: "tenThanhPhan",
        align: "center",
        key: "tenThanhPhan",
      },
      {
        title: "Mã phòng ban",
        dataIndex: "maPhongBanHRM",
        align: "center",
        key: "maPhongBanHRM",
      },
      {
        title: "Đơn vị chi lương",
        dataIndex: "tenDonViTraLuong",
        align: "center",
        key: "tenDonViTraLuong",
      },
      {
        title: "Trình Độ Chuyên môn",
        dataIndex: "trinhDoChuyenMon",
        align: "center",
        key: "trinhDoChuyenMon",
      },
      {
        title: "Trường",
        dataIndex: "truong",
        align: "center",
        key: "truong",
      },
      {
        title: "Chuyên ngành",
        dataIndex: "chuyenNganh",
        align: "center",
        key: "chuyenNganh",
      },
      {
        title: "Ghi chú",
        dataIndex: "chuyenNganh",
        align: "center",
        key: "chuyenNganh",
      },
    ];
    if (IsLoi) {
      col.splice(0, 0, {
        title: "Lỗi",
        dataIndex: "ghiChuImport",
        key: "ghiChuImport",
        align: "center",
      });
    }
    return col;
  };
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
            range: { s: { c: 0, r: 1 }, e: { c: 0, r: 1 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 1 }, e: { c: 1, r: 1 } },
          })[0]
          .toString()
          .trim() === "Mã nhân viên" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 1 }, e: { c: 2, r: 1 } },
          })[0]
          .toString()
          .trim() === "Tên nhân viên" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 1 }, e: { c: 3, r: 1 } },
          })[0]
          .toString()
          .trim() === "Ngày sinh" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 1 }, e: { c: 4, r: 1 } },
          })[0]
          .toString()
          .trim() === "Ngày vào làm" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 1 }, e: { c: 5, r: 1 } },
          })[0]
          .toString()
          .trim() === "Email Thaco" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 1 }, e: { c: 6, r: 1 } },
          })[0]
          .toString()
          .trim() === "SĐT" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 1 }, e: { c: 7, r: 1 } },
          })[0]
          .toString()
          .trim() === "Cấp độ nhân sự" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 1 }, e: { c: 8, r: 1 } },
          })[0]
          .toString()
          .trim() === "Chức danh" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 1 }, e: { c: 9, r: 1 } },
          })[0]
          .toString()
          .trim() === "Chức vụ" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 1 }, e: { c: 10, r: 1 } },
          })[0]
          .toString()
          .trim() === "Thành phần" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 11, r: 1 }, e: { c: 11, r: 1 } },
          })[0]
          .toString()
          .trim() === "Mã phòng ban" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 12, r: 1 }, e: { c: 12, r: 1 } },
          })[0]
          .toString()
          .trim() === "Đơn vị chi lương" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 13, r: 1 }, e: { c: 13, r: 1 } },
          })[0]
          .toString()
          .trim() === "Trình Độ Chuyên môn" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 14, r: 1 }, e: { c: 14, r: 1 } },
          })[0]
          .toString()
          .trim() === "Trường" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 15, r: 1 }, e: { c: 15, r: 1 } },
          })[0]
          .toString()
          .trim() === "Chuyên ngành" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 16, r: 1 }, e: { c: 16, r: 1 } },
          })[0]
          .toString()
          .trim() === "Ghi chú";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 1,
        });
        if (data.length === 0) {
          setFileName(file.name);
          setDataView([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const NewData = [];
          data.forEach((d, index) => {
            if (index > 0) {
              if (
                d["Mã nhân viên"] &&
                d["Mã nhân viên"].toString().trim() === "" &&
                d["Tên nhân viên"] &&
                d["Tên nhân viên"].toString().trim() === "" &&
                d["Email Thaco"] &&
                d["Email Thaco"].toString().trim() === "" &&
                d["Cấp độ nhân sự"] &&
                d["Cấp độ nhân sự"].toString().trim() === "" &&
                d["Mã phòng ban"] &&
                d["Mã phòng ban"].toString().trim() === ""
              ) {
              } else {
                let ngaySinh = "";
                if (typeof d["Ngày sinh"] === "number") {
                  ngaySinh = convertDaysToDateString(d["Ngày sinh"]);
                } else if (typeof d["Ngày sinh"] === "string") {
                  const ngay = d["Ngày sinh"].split("/");
                  ngaySinh =
                    (ngay[0].length === 1 ? `0${ngay[0]}` : ngay[0]) +
                    (ngay[1].length === 1 ? `0${ngay[1]}` : ngay[1]) +
                    ngay[2];
                } else {
                  ngaySinh = undefined;
                }
                let ngayVaoLam = "";
                if (typeof d["Ngày vào làm"] === "number") {
                  ngayVaoLam = convertDaysToDateString(d["Ngày vào làm"]);
                } else if (typeof d["Ngày vào làm"] === "string") {
                  const ngay = d["Ngày vào làm"].split("/");
                  ngayVaoLam =
                    (ngay[0].length === 1 ? `0${ngay[0]}` : ngay[0]) +
                    (ngay[1].length === 1 ? `0${ngay[1]}` : ngay[1]) +
                    ngay[2];
                } else {
                  ngayVaoLam = undefined;
                }
                NewData.push({
                  maNhanVien: d["Mã nhân viên"]
                    ? d["Mã nhân viên"].toString().trim() !== ""
                      ? d["Mã nhân viên"].toString()
                      : undefined
                    : undefined,
                  email: d["Email Thaco"]
                    ? d["Email Thaco"].toString().trim() !== ""
                      ? d["Email Thaco"].toString()
                      : undefined
                    : undefined,
                  phoneNumber: d["SĐT"]
                    ? d["SĐT"].toString().trim() !== ""
                      ? d["SĐT"].toString()
                      : undefined
                    : undefined,
                  fullName: d["Tên nhân viên"]
                    ? d["Tên nhân viên"].toString().trim() !== ""
                      ? d["Tên nhân viên"].toString()
                      : undefined
                    : undefined,
                  tenChucDanh: d["Chức danh"]
                    ? d["Chức danh"].toString().trim() !== ""
                      ? d["Chức danh"].toString()
                      : undefined
                    : undefined,
                  tenChucVu: d["Chức vụ"]
                    ? d["Chức vụ"].toString().trim() !== ""
                      ? d["Chức vụ"].toString()
                      : undefined
                    : undefined,
                  tenThanhPhan: d["Thành phần"]
                    ? d["Thành phần"].toString().trim() !== ""
                      ? d["Thành phần"].toString()
                      : undefined
                    : undefined,
                  maPhongBanHRM: d["Mã phòng ban"]
                    ? d["Mã phòng ban"].toString().trim() !== ""
                      ? d["Mã phòng ban"].toString()
                      : undefined
                    : undefined,
                  tenDonViTraLuong: d["Đơn vị chi lương"]
                    ? d["Đơn vị chi lương"].toString().trim() !== ""
                      ? d["Đơn vị chi lương"].toString()
                      : undefined
                    : undefined,
                  tenCapDoNhanSu: d["Cấp độ nhân sự"]
                    ? d["Cấp độ nhân sự"].toString().trim() !== ""
                      ? d["Cấp độ nhân sự"].toString()
                      : undefined
                    : undefined,
                  trinhDoChuyenMon: d["Trình Độ Chuyên môn"]
                    ? d["Trình Độ Chuyên môn"].toString().trim() !== ""
                      ? d["Trình Độ Chuyên môn"].toString()
                      : undefined
                    : undefined,
                  truong: d["Trường"]
                    ? d["Trường"].toString().trim() !== ""
                      ? d["Trường"].toString()
                      : undefined
                    : undefined,
                  chuyenNganh: d["Chuyên ngành"]
                    ? d["Chuyên ngành"].toString().trim() !== ""
                      ? d["Chuyên ngành"].toString()
                      : undefined
                    : undefined,
                  ngaySinh: ngaySinh,
                  ngayVaoLam: ngayVaoLam,
                  ghiChu: d["Ghi chú"]
                    ? d["Ghi chú"].toString().trim() !== ""
                      ? d["Ghi chú"].toString()
                      : undefined
                    : undefined,
                });
              }
            }
          });
          if (NewData.length === 0) {
            setFileName(file.name);
            setDataView([]);
            setCheckDanger(true);
            setMessageError("Dữ liệu import không được rỗng");
            Helper.alertError("Dữ liệu import không được rỗng");
          } else {
            let check = false;
            for (let i = 0; i < NewData.length; i++) {
              for (let j = i + 1; j < NewData.length; j++) {
                if (NewData[i].maNhanVien === NewData[j].maNhanVien) {
                  NewData[i].ghiChuImport = "Mã nhân viên trùng";
                  NewData[j].ghiChuImport = "Mã nhân viên trùng";
                  setCheckDanger(true);
                  setIsLoi(true);
                  setMessageError(`Mã nhân viên trùng nhau`);
                  check = true;
                  Helper.alertError(`Mã nhân viên trùng nhau`);
                }
              }
            }
            if (!check) {
              setIsLoi(false);
              setCheckDanger(false);
            }
            setDataView(NewData);
            setFileName(file.name);
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
    setCheckDanger(false);
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
          res.data.forEach((dt) => {
            dataView.forEach((dtv) => {
              if (dt.maNhanVien === dtv.maNhanVien) {
                dtv.ghiChuImport = dt.ghiChuImport;
              }
            });
          });
          setIsLoi(true);
          setCheckDanger(true);
          setDataView([...dataView]);
          setMessageError("Import không thành công !!!");
          Helper.alertError("Import không thành công !!!");
        } else if (res.status === 200) {
          setDataView([]);
          setIsLoi(false);
          setCheckDanger(false);
          setFileName(null);
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
    if (current.ghiChuImport && IsLoi) {
      setCheckDanger(true);
      return "red-row";
    } else if (current.maNhanVien === undefined) {
      setCheckDanger(true);
      setMessageError("Mã nhân viên không được rỗng");
      return "red-row";
    } else if (current.fullName === undefined) {
      setCheckDanger(true);
      setMessageError("Tên nhân viên không được rỗng");
      return "red-row";
    } else if (current.maPhongBanHRM === undefined) {
      setCheckDanger(true);
      setMessageError("Mã phòng ban không được rỗng");
      return "red-row";
    }
  };

  const handleCancel = () => {
    if (checkDanger === true) {
      openModalFS(false);
      setCheckDanger(false);
      setFileName(null);
      refesh();
      setDataView([]);
    } else {
      refesh();
      openModalFS(false);
    }
  };

  return (
    <AntModal
      title="Import cán bộ nhân viên"
      open={openModal}
      width={`100%`}
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
              x: 1400,
              y: "55vh",
            }}
            columns={columns}
            components={components}
            className="gx-table-responsive gx-table-resize"
            dataSource={reDataForTable(dataView)}
            size="small"
            loading={loading}
            rowClassName={(current, index) => RowStyle(current, index)}
            pagination={false}
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

export default ImportCanBoNhanVien;
