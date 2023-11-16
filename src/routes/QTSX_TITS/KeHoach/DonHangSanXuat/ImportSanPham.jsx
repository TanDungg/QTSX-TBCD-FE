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

function ImportSanPham({
  openModalFS,
  openModal,
  loading,
  refesh,
  addSanPham,
  listSanPham,
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
        if (dt.maSanPham === val) {
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
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
      title: "Lốp",
      dataIndex: "lop",
      key: "lop",
      align: "center",
    },
    {
      title: "Mã màu sắc",
      dataIndex: "maMauSac",
      key: "maMauSac",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Đơn giá/ chiếc(VNĐ)",
      dataIndex: "donGia",
      key: "donGia",
      align: "center",
    },
    {
      title: "Vận chuyển/ Chiếc(VNĐ)",
      dataIndex: "phiVanChuyen",
      key: "phiVanChuyen",
      align: "center",
    },
    {
      title: "Thành tiền (VNĐ)",
      key: "thanhtien",
      align: "center",
      render: (val) => (
        <span>{val && Number(val.donGia) + Number(val.phiVanChuyen)}</span>
      ),
    },
    {
      title: "Mã màu sắc",
      dataIndex: "maMauSac",
      key: "maMauSac",
      align: "center",
    },
    {
      title: "Ngày bàn giao",
      dataIndex: "ngay",
      key: "ngay",
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
          `tits_qtsx_Donhang/export-file-mau`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_Thong_Tin_San_Pham", res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Import Sản phẩm"];

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
          .trim() === "Mã sản phẩm" &&
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
          .trim() === "Tên sản phẩm" &&
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
          .trim() === "Lốp" &&
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
          .trim() === "Mã màu sắc" &&
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
          .trim() === "Số lượng" &&
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
          .trim() === "Đơn giá" &&
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
          .trim() === "Phí vận chuyển" &&
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
          .trim() === "Ngày bàn giao";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const MSP = "Mã sản phẩm";
        const TSP = "Tên sản phẩm";
        const SLuong = "Số lượng";
        const L = "Lốp";
        const MMS = "Mã màu sắc";
        const DG = "Đơn giá";
        const PVC = "Phí vận chuyển";
        const NBG = "Ngày bàn giao";
        const NewData = [];
        data.forEach((d, index) => {
          if (
            data[index][TSP] &&
            data[index][TSP].toString().trim() === "" &&
            data[index][MSP] &&
            data[index][MSP].toString().trim() === "" &&
            data[index][L] &&
            data[index][L].toString().trim() === "" &&
            data[index][MMS] &&
            data[index][MMS].toString().trim() === "" &&
            data[index][DG] &&
            data[index][DG].toString().trim() === "" &&
            data[index][PVC] &&
            data[index][PVC].toString().trim() === ""
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
              soLuong: data[index][SLuong]
                ? data[index][SLuong].toString().trim() !== ""
                  ? data[index][SLuong].toString().trim()
                  : undefined
                : undefined,
              lop: data[index][L]
                ? data[index][L].toString().trim() !== ""
                  ? data[index][L].toString().trim()
                  : undefined
                : undefined,
              maMauSac: data[index][MMS]
                ? data[index][MMS].toString().trim() !== ""
                  ? data[index][MMS].toString().trim()
                  : undefined
                : undefined,
              donGia: data[index][DG]
                ? data[index][DG].toString().trim() !== ""
                  ? data[index][DG].toString().trim()
                  : undefined
                : undefined,
              phiVanChuyen: data[index][PVC]
                ? data[index][PVC].toString().trim() !== ""
                  ? data[index][PVC].toString().trim()
                  : undefined
                : undefined,
              ngay: data[index][NBG]
                ? data[index][NBG].toString().trim() !== ""
                  ? data[index][NBG].toString().trim()
                  : undefined
                : undefined,
            });
          }
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
          for (let i = 0; i < NewData.length; i++) {
            for (let j = i + 1; j < NewData.length; j++) {
              if (
                NewData[i].maSanPham === NewData[j].maSanPham &&
                NewData[i].maMauSac === NewData[j].maMauSac &&
                NewData[j].maSanPham !== undefined &&
                NewData[i].maSanPham !== undefined &&
                NewData[j].maMauSac !== undefined &&
                NewData[i].maMauSac !== undefined
              ) {
                indices.push(NewData[i]);
                row.push(i + 1);
                row.push(j + 1);
              }
            }
          }
          if (indices.length > 0) {
            setMessageError(
              `Hàng ${row.join(", ")} có mã sản phẩm và mã màu sắc trùng nhau`
            );
            Helper.alertError(
              `Hàng ${row.join(", ")} có mã sản phẩm và mã màu sắc trùng nhau`
            );
            setHangTrung(indices);
            setCheckDanger(true);
          } else {
            setHangTrung([]);
            setCheckDanger(false);
          }
          setDataView(NewData);
          setFileName(file.name);
          setDataLoi();
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
          `tits_qtsx_Donhang/import-excel`,
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
        setMessageError("Import không thành công");
      } else {
        let check = false;
        res.data.forEach((dt) => {
          dt.tits_qtsx_ChiTiet =
            dt.tits_qtsx_SanPham_Id + "_" + dt.tits_qtsx_MauSac_Id;
          listSanPham.forEach((sp) => {
            if (
              dt.tits_qtsx_MauSac_Id === sp.tits_qtsx_MauSac_Id &&
              dt.tits_qtsx_SanPham_Id === sp.tits_qtsx_SanPham_Id
            ) {
              check = true;
              setMessageError(
                `Sản phẩm ${dt.tenSanPham} có màu ${dt.tenMauSac} đã được thêm`
              );
              dt.ghiChuImport = `Sản phẩm ${dt.tenSanPham} có màu ${dt.tenMauSac} đã được thêm`;
            }
          });
        });
        if (check) {
          setDataLoi(res.data);
          Helper.alertWarning(res.data[0].ghiChuImport);
        } else {
          addSanPham(res.data);
          setFileName(null);
          setDataView([]);
          openModalFS(false);
        }
      }
    });
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import thông tin sản phẩm",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((soLot) => {
        if (current.soLot === soLot) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.tenSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Tên sản phẩm không được rỗng");
      return "red-row";
    } else if (current.maSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Mã sản phẩm không được rỗng");
      return "red-row";
    } else if (current.soLuong === undefined) {
      setCheckDanger(true);
      setMessageError("Số lượng không được rỗng");
      return "red-row";
    } else if (current.maMauSac === undefined) {
      setCheckDanger(true);
      setMessageError("Mã màu sắc không được rỗng");
      return "red-row";
    } else if (current.donGia === undefined) {
      setCheckDanger(true);
      setMessageError("Đơn giá không được rỗng");
      return "red-row";
    } else if (current.phiVanChuyen === undefined) {
      setCheckDanger(true);
      setMessageError("Phí vận chuyển không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (current.soLot.toString() === dt.soLot.toString()) {
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
      title="Import thông tin sản phẩm"
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

export default ImportSanPham;
