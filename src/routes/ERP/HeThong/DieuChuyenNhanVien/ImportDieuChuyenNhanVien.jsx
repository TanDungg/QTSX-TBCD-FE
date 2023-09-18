import {
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Upload, Alert, Popover } from "antd";
import { messages } from "src/constants/Messages";
import Helper from "src/helpers";
import map from "lodash/map";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { Modal } from "src/components/Common";
import { exportExcel, reDataForTable } from "src/util/Common";
import * as XLSX from "xlsx";
import ContainerHeader from "src/components/ContainerHeader";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportDieuChuyenNhanVien({ history, permission }) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [CBNVError, setCBNVError] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const [messageError, setMessageError] = useState();
  const [page, setPage] = useState(1);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
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
      title: "Mã bộ phận",
      dataIndex: "maBoPhan",
      key: "maBoPhan",
      align: "center",
    },
    {
      title: "Mã phòng ban",
      dataIndex: "maPhongBan",
      key: "maPhongBan",
      align: "center",
    },
    {
      title: "Mã đơn vị",
      dataIndex: "maDonVi",
      align: "center",
      key: "maDonVi",
    },
    {
      title: "Mã đơn vị trả lương",
      dataIndex: "maDonViTraLuong",
      align: "center",
      key: "maDonViTraLuong",
    },
    {
      title: "Mã bộ phận chuyển đến",
      dataIndex: "maBoPhanNew",
      align: "center",
      key: "maBoPhanNew",
    },
    {
      title: "Mã phòng ban chuyển đến",
      dataIndex: "maPhongBanNew",
      align: "center",
      key: "maPhongBanNew",
    },
    {
      title: "Mã đơn vị chuyển đến",
      dataIndex: "maDonViNew",
      align: "center",
      key: "maDonViNew",
    },
    {
      title: "Mã đơn vị trả lương chuyển đến",
      dataIndex: "maDonViTraLuongNew",
      align: "center",
      key: "maDonViTraLuongNew",
    },
    {
      title: "Ngày điều chuyển",
      dataIndex: "ngayDieuChuyen",
      align: "center",
      key: "ngayDieuChuyen",
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

  const TaiFileMau = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DieuChuyenNhanVien/ExportFileExcel`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Dieu_Chuyen_CBNV", res.data.dataexcel);
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
          .trim() === "Mã bộ phận" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã phòng ban" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 2 }, e: { c: 6, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị trả lương" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 2 }, e: { c: 7, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã bộ phận chuyển đến" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 2 }, e: { c: 8, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã phòng ban chuyển đến" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 2 }, e: { c: 9, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị chuyển đến" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 2 }, e: { c: 10, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị trả lương chuyển đến" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 11, r: 2 }, e: { c: 11, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ngày điều chuyển" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 12, r: 2 }, e: { c: 12, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ghi chú";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        if (data.length === 0) {
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const MNV = "Mã nhân viên";
          const HVT = "Họ tên";
          const BP = "Mã bộ phận";
          const PB = "Mã phòng ban";
          const DV = "Mã đơn vị";
          const DVTL = "Mã đơn vị trả lương";
          const BPCD = "Mã bộ phận chuyển đến";
          const PBCD = "Mã phòng ban chuyển đến";
          const DVCD = "Mã đơn vị chuyển đến";
          const DVTLCD = "Mã đơn vị trả lương chuyển đến";
          const NDC = "Ngày điều chuyển";
          const GC = "Ghi chú";
          const Data = [];
          data.forEach((d, index) => {
            data[index].maNhanVien = data[index][MNV].toString();
            data[index].fullName = data[index][HVT];
            data[index].maDonVi = data[index][DV];
            data[index].maBoPhan = data[index][BP];
            data[index].maPhongBan = data[index][PB];
            data[index].maDonViNew = data[index][DVCD];
            data[index].maBoPhanNew = data[index][BPCD];
            data[index].maPhongBanNew = data[index][PBCD];
            data[index].maDonViTraLuongNew = data[index][DVTLCD];
            data[index].maDonViTraLuong = data[index][DVTL];
            data[index].ngayDieuChuyen = data[index][NDC];
            data[index].ghiChu = data[index][GC] ? data[index][GC] : "";
            Data.push(d.maNhanVien);
          });
          const indices = [];
          const row = [];

          for (let i = 0; i < Data.length; i++) {
            for (let j = i + 1; j < Data.length; j++) {
              if (
                Data[i] === Data[j] &&
                Data[i] !== undefined &&
                Data[j] !== undefined
              ) {
                indices.push(Data[i]);
                row.push(i + 1);
                row.push(j + 1);
              }
            }
          }
          setDataView(data);
          setFileName(file.name);
          setDataLoi();
          if (indices.length > 0) {
            setCBNVError(indices);
            setCheckDanger(true);
            setMessageError(
              `Hàng ${row.join(", ")} có mã nhân viên trùng nhau`
            );
            Helper.alertError(
              `Hàng ${row.join(", ")} có mã nhân viên trùng nhau`
            );
          } else {
            setCBNVError([]);
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
    const newData = map(dataView, (d) => {
      return {
        maNhanVien: d.maNhanVien,
        maBoPhan: d.maBoPhan,
        maBoPhanNew: d.maBoPhanNew,
        maPhongBan: d.maPhongBan,
        maPhongBanNew: d.maPhongBanNew,
        maDonVi: d.maDonVi,
        maDonViNew: d.maDonViNew,
        maDonViTraLuong: d.maDonViTraLuong,
        maDonViTraLuongNew: d.maDonViTraLuongNew,
        ghiChu: d.ghiChu,
        ngayDieuChuyen: d.ngayDieuChuyen,
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DieuChuyenNhanVien/ImportExel`,
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
          setDataLoi(res.data);
          setMessageError(res.data.ghiChuImport);
        } else {
          setFileName(null);
          setDataView([]);
          goBack();
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
    if (DataLoi) {
      if (current.maNhanVien === DataLoi.maNhanVien) {
        setCheckDanger(true);
        return "red-row";
      }
    }
    if (CBNVError.length > 0) {
      let check = "";
      CBNVError.forEach((nv) => {
        if (current.maNhanVien === nv) {
          setCheckDanger(true);
          check = "red-row";
        }
      });
      return check;
    }
  };
  /**
   * Quay lại trang người dùng
   *
   */
  const goBack = () => {
    history.push("/he-thong/dieu-chuyen-cbnv");
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Import điều chuyển cán bộ nhân viên"
        back={goBack}
      />
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
                        setCBNVError([]);
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
            x: 1300,
            y: "55vh",
          }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(dataView)}
          size="small"
          // loading={loading}
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
  );
}

export default ImportDieuChuyenNhanVien;
