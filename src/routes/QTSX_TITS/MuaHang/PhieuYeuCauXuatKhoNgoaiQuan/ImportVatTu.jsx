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

function ImportVatTu({
  openModalFS,
  openModal,
  loading,
  refesh,
  addVatTu,
  listVatTu,
}) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
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
      width: 130,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      width: 200,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      width: 100,
    },
    {
      title: "Số bill",
      dataIndex: "soBill",
      key: "soBill",
      align: "center",
      width: 100,
    },
    {
      title: "Số lượng kiện",
      dataIndex: "soLuongKien",
      key: "soLuongKien",
      align: "center",
      width: 100,
    },
    {
      title: "Tiền thuế (USD)",
      align: "center",
      children: [
        {
          title: "Nhập khẩu",
          dataIndex: "nhapKhau",
          key: "nhapKhau",
          align: "center",
          width: 100,
        },
        {
          title: "VAT (10%)",
          dataIndex: "vat",
          key: "vat",
          align: "center",
          width: 100,
        },
        {
          title: "Tổng",
          //   dataIndex: "tong",
          key: "tong",
          align: "center",
          width: 100,
          render: (val) => (
            <span>{Number(val.nhapKhau) + Number(val.vat)}</span>
          ),
        },
      ],
    },
    {
      title: "Ngày hoàn thành thủ tục",
      dataIndex: "ngayHoanThanh",
      key: "ngayHoanThanh",
      align: "center",
      width: 130,
    },
    {
      title: "Hình thức khai báo",
      dataIndex: "hinhThucKhaiBao",
      key: "hinhThucKhaiBao",
      align: "center",
      width: 150,
    },
    {
      title: "Phiếu mua hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
      width: 150,
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
          `tits_qtsx_PhieuYeuCauXuatKhoNgoaiQuan/export-file-mau-import-vat-tu`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("file-mau-import-vat-tu", res.data.dataexcel);
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
          .trim() === "Tên đơn vị tính" &&
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
          .trim() === "Mã phiếu mua hàng ngoài" &&
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
          .trim() === "Số bill" &&
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
          .trim() === "Số lượng kiện" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 11, r: 2 }, e: { c: 11, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 11, r: 2 }, e: { c: 11, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ngày hoàn thành thủ tục" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 12, r: 2 }, e: { c: 12, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 12, r: 2 }, e: { c: 12, r: 2 } },
          })[0]
          .toString()
          .trim() === "Hình thức khai báo" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 13, r: 2 }, e: { c: 13, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 13, r: 2 }, e: { c: 13, r: 2 } },
          })[0]
          .toString()
          .trim() === "Ghi chú";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const data1 = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
        });
        const NewData = [];
        data.forEach((d) => {
          if (
            d["Mã vật tư"] &&
            d["Mã vật tư"].toString().trim() !== "" &&
            d["Tên vật tư"] &&
            d["Tên vật tư"].toString().trim() !== ""
          ) {
            NewData.push({
              tenVatTu: d["Tên vật tư"]
                ? d["Tên vật tư"].toString().trim() !== ""
                  ? d["Tên vật tư"].toString().trim()
                  : undefined
                : undefined,
              maVatTu: d["Mã vật tư"]
                ? d["Mã vật tư"].toString().trim() !== ""
                  ? d["Mã vật tư"].toString().trim()
                  : undefined
                : undefined,
              tenDonViTinh: d["Tên đơn vị tính"]
                ? d["Tên đơn vị tính"].toString().trim() !== ""
                  ? d["Tên đơn vị tính"].toString().trim()
                  : undefined
                : undefined,
              maPhieu: d["Mã phiếu mua hàng ngoài"]
                ? d["Mã phiếu mua hàng ngoài"].toString().trim() !== ""
                  ? d["Mã phiếu mua hàng ngoài"].toString().trim()
                  : undefined
                : undefined,
              soBill: d["Số bill"]
                ? d["Số bill"].toString().trim() !== ""
                  ? d["Số bill"].toString().trim()
                  : undefined
                : undefined,
              soLuong: d["Số lượng"]
                ? d["Số lượng"].toString().trim() !== ""
                  ? d["Số lượng"].toString().trim()
                  : 0
                : 0,
              soLuongKien: d["Số lượng kiện"]
                ? d["Số lượng kiện"].toString().trim() !== ""
                  ? d["Số lượng kiện"].toString().trim()
                  : undefined
                : undefined,
              ngayHoanThanh: d["Ngày hoàn thành thủ tục"]
                ? d["Ngày hoàn thành thủ tục"].toString().trim() !== ""
                  ? d["Ngày hoàn thành thủ tục"].toString().trim()
                  : undefined
                : undefined,
              hinhThucKhaiBao: d["Hình thức khai báo"]
                ? d["Hình thức khai báo"].toString().trim() !== ""
                  ? d["Hình thức khai báo"].toString().trim()
                  : undefined
                : undefined,
              moTa: d["Ghi chú"]
                ? d["Ghi chú"].toString().trim() !== ""
                  ? d["Ghi chú"].toString().trim()
                  : undefined
                : undefined,
            });
          } else {
          }
        });
        NewData.forEach((ndt) => {
          data1.forEach((d) => {
            if (
              ndt.maVatTu === d["__EMPTY_1"] &&
              ndt.tenVatTu === d["__EMPTY_2"]
            ) {
              ndt.nhapKhau = d["Nhập khẩu"];
              ndt.vat = d["VAT (10%)"];
            }
          });
        });
        if (NewData.length === 0) {
          setFileName(file.name);
          setDataView([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          for (let i = 0; i < NewData.length; i++) {
            for (let j = i + 1; j < NewData.length; j++) {
              if (
                NewData[i].maVatTu === NewData[j].maVatTu &&
                NewData[j].maVatTu !== undefined &&
                NewData[i].maVatTu !== undefined
              ) {
                NewData[i].ghiChuImport = `Hàng ${i + 1},${
                  j + 1
                } có mã vật tư trùng nhau`;
                NewData[j].ghiChuImport = `Hàng ${i + 1},${
                  j + 1
                } có mã vật tư trùng nhau`;
              }
            }
          }
          setCheckDanger(false);
          setDataView(NewData);
          setFileName(file.name);
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
    const newData = dataView.map((dt) => {
      return {
        ...dt,
        tong: Number(dt.nhapKhau) + Number(dt.vat),
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuYeuCauXuatKhoNgoaiQuan/import-excel-vat-tu`,
          "POST",
          newData,
          "A",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status === 409) {
        const newData = [...dataView];
        res.data.forEach((dt) => {
          newData.forEach((dtv) => {
            if (dt.maVatTu.toString() === dtv.maVatTu.toString()) {
              dtv.ghiChuImport = dt.ghiChuImport;
            }
          });
        });
        setDataView(newData);
        setMessageError("Import không thành công");
      } else {
        let check = false;
        res.data.forEach((dt) => {
          listVatTu.forEach((sp) => {
            if (dt.maVatTu.toString() === sp.maVatTu.toString()) {
              check = true;
              setMessageError(`Vật tư ${dt.tenVatTu} đã được thêm`);
              dt.ghiChuImport = `Vật tư ${dt.tenVatTu} đã được thêm`;
            }
          });
        });
        if (check) {
          setDataView(res.data);
          setMessageError("Import không thành công");
        } else {
          addVatTu(res.data);
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
    title: "Xác nhận import thông tin vật tư",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (current.ghiChuImport) {
      return "red-row";
    } else if (current.tenVatTu === undefined) {
      setCheckDanger(true);
      setMessageError("Tên vật tư không được rỗng");
      return "red-row";
    } else if (current.maVatTu === undefined) {
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
      setDataView([]);
    } else {
      openModalFS(false);
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

export default ImportVatTu;
