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
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportVatTu({ openModalFS, openModal, loading, refesh }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
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
      title: "Mã loại vật tư",
      dataIndex: "maLoaiVatTu",
      align: "center",
      key: "maLoaiVatTu",
    },
    {
      title: "Thông số kỹ thuật",
      dataIndex: "thongSoKyThuat",
      align: "center",
      key: "thongSoKyThuat",
    },
    {
      title: "Mã màu sắc",
      dataIndex: "maMauSac",
      align: "center",
      key: "maMauSac",
    },
    {
      title: "Mã đơn vị tính",
      dataIndex: "maDonViTinh",
      align: "center",
      key: "maDonViTinh",
    },
    {
      title: "Mã đơn vị tính quy đổi",
      dataIndex: "maDonViTinhQuyDoi",
      align: "center",
      key: "maDonViTinhQuyDoi",
    },
    {
      title: "Tỉ lệ quy đổi",
      dataIndex: "tiLeQuyDoi",
      align: "center",
      key: "tiLeQuyDoi",
    },
    {
      title: "Lỗi",
      dataIndex: "ghiChuImport",
      align: "center",
      key: "ghiChuImport",
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
    let param = convertObjectToUrlParams({
      DonVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_VatTu/export-file-excel?${param}`,
          "GET",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("FileMauImportVatTu", res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Vật tư"];

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
          .trim() === "Mã loại vật tư" &&
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
          .trim() === "Thông số kỹ thuật" &&
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
          .trim() === "Mã màu sắc" &&
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
          .trim() === "Mã đơn vị tính" &&
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
          .trim() === "Mã đơn vị tính quy đổi" &&
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
          .trim() === "Tỉ lệ quy đổi";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const MVT = "Mã vật tư";
        const TVT = "Tên vật tư";
        const MLVT = "Mã loại vật tư";
        const TSKT = "Thông số kỹ thuật";
        const MDVT = "Mã đơn vị tính";
        const MMS = "Mã màu sắc";
        const DVQD = "Mã đơn vị tính quy đổi";
        const TLQD = "Tỉ lệ quy đổi";

        const Data = [];
        const NewData = [];
        data.forEach((d, index) => {
          NewData.push({
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
            maLoaiVatTu: data[index][MLVT]
              ? data[index][MLVT].toString().trim() !== ""
                ? data[index][MLVT].toString().trim()
                : null
              : null,
            thongSoKyThuat: data[index][TSKT]
              ? data[index][TSKT].toString().trim() !== ""
                ? data[index][TSKT].toString().trim()
                : null
              : null,
            maMauSac: data[index][MMS]
              ? data[index][MMS].toString().trim() !== ""
                ? data[index][MMS].toString().trim()
                : null
              : null,
            maDonViTinh: data[index][MDVT]
              ? data[index][MDVT].toString().trim() !== ""
                ? data[index][MDVT].toString().trim()
                : null
              : null,
            maDonViTinhQuyDoi: data[index][DVQD]
              ? data[index][DVQD].toString().trim() !== ""
                ? data[index][DVQD].toString().trim()
                : null
              : null,
            tiLeQuyDoi: data[index][TLQD]
              ? data[index][TLQD].toString().trim() !== ""
                ? data[index][TLQD].toString().trim()
                : null
              : null,
          });
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
              if (Data[i] === Data[j] && Data[j] !== null && Data[i] !== null) {
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
    const newListSanPham = {
      donVi_Id: INFO.donVi_Id,
      list_VatTus: dataView,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_VatTu/import-excel`,
          "POST",
          newListSanPham,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status === 409) {
        setDataLoi(res.data);
        const newData = dataView.map((data) => {
          const dt = res.data.find((item) => item.maVatTu === data.maVatTu);
          if (dt) {
            return {
              ...data,
              ghiChuImport: dt.ghiChuImport,
            };
          } else {
            return data;
          }
        });
        setDataView(newData);
        setMessageError("Import không thành công");
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
    } else if (current.maVatTu === null) {
      setCheckDanger(true);
      setMessageError("Mã vật tư không được rỗng");
      return "red-row";
    } else if (current.tenVatTu === null) {
      setCheckDanger(true);
      setMessageError("Tên vật tư không được rỗng");
      return "red-row";
    } else if (current.maLoaiVatTu === null) {
      setCheckDanger(true);
      setMessageError("Mã nhóm vật tư không được rỗng");
      return "red-row";
    } else if (current.maDonViTinh === null) {
      setCheckDanger(true);
      setMessageError("Mã đơn vị tính không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (current.maVatTu.toString() === dt.maVatTu.toString()) {
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
      refesh();
    } else {
      openModalFS(false);
      refesh();
    }
  };

  return (
    <AntModal
      title="Import vật tư"
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
            pagination={{ pageSize: 20 }}
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
