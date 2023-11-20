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

function ImportDinhMucVatTu({
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
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const [message, setMessageError] = useState([]);
  const renderLoi = (val) => {
    let check = false;
    let messageLoi = "";
    if (DataLoi && DataLoi.length > 0) {
      DataLoi.forEach((dt) => {
        if (dt.maVatTu === val && dt.ghiChuImport) {
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
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      render: (val) => renderLoi(val),
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Định mức",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
    },
    {
      title: "Định mức xả nhựa",
      dataIndex: "dinhMucXaNhua",
      key: "dinhMucXaNhua",
      align: "center",
      render: (val) => <span>{val !== 0 && val}</span>,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
    {
      title: "Bắt buộc",
      dataIndex: "isBatBuoc",
      key: "isBatBuoc",
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
          `lkn_DinhMucVatTu/export-file-mau`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_Dinh_Muc", res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Định mức vật tư"];

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
          .trim() === "Định mức" &&
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
          .trim() === "Định mức xả nhựa" &&
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
          .trim() === "Ghi chú" &&
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
          .trim() === "Bắt buộc" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 7, r: 2 }, e: { c: 7, r: 2 } },
        })[0];
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const MVT = "Mã vật tư";
        const TVT = "Tên vật tư";
        const DM = "Định mức";
        const DMXN = "Định mức xả nhựa";
        const GC = "Ghi chú";
        const BB = "Bắt buộc";
        const NewData = [];

        data.forEach((d, index) => {
          console.log(data[index][TVT].toString().trim() === "");
          if (
            data[index][TVT] &&
            data[index][TVT].toString().trim() !== "" &&
            data[index][MVT] &&
            data[index][MVT].toString().trim() !== "" &&
            data[index][DM] &&
            data[index][DM].toString().trim() !== ""
          ) {
            NewData.push({
              tenVatTu: data[index][TVT]
                ? data[index][TVT].toString().trim() !== ""
                  ? data[index][TVT].toString().trim()
                  : undefined
                : undefined,
              maVatTu: data[index][MVT]
                ? data[index][MVT].toString().trim() !== ""
                  ? data[index][MVT].toString().trim()
                  : undefined
                : undefined,
              dinhMuc: data[index][DM]
                ? data[index][DM].toString().trim() !== ""
                  ? data[index][DM].toString().trim()
                  : undefined
                : undefined,
              dinhMucXaNhua: data[index][DMXN]
                ? data[index][DMXN].toString().trim() !== ""
                  ? data[index][DMXN].toString().trim()
                  : 0
                : 0,
              ghiChu: data[index][GC]
                ? data[index][GC].toString().trim() !== ""
                  ? data[index][GC].toString().trim()
                  : undefined
                : undefined,
              isBatBuoc: data[index][BB]
                ? data[index][BB].toString().trim() !== ""
                  ? data[index][BB].toString().trim()
                  : undefined
                : undefined,
            });
          } else {
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
          let checkIsBatBuoc = false;
          for (let i = 0; i < NewData.length; i++) {
            for (let j = i + 1; j < NewData.length; j++) {
              if (
                NewData[i].maVatTu === NewData[j].maVatTu &&
                NewData[j].maVatTu !== undefined &&
                NewData[i].maVatTu !== undefined
              ) {
                indices.push(NewData[i]);
                row.push(i + 1);
                row.push(j + 1);
              }
              if (NewData[i].isBatBuoc) {
                checkIsBatBuoc = true;
              }
            }
          }
          if (indices.length > 0) {
            setMessageError(`Hàng ${row.join(", ")} có mã vật tư trùng nhau`);
            Helper.alertError(`Hàng ${row.join(", ")} có mã vật tư trùng nhau`);
            setHangTrung(indices);
            setCheckDanger(true);
          } else if (!checkIsBatBuoc) {
            setMessageError(`Phải có ít nhất 1 vật tư bắt buộc`);
            Helper.alertError(`Phải có ít nhất 1 vật tư bắt buộc`);
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
    const newData = dataView.map((dt) => {
      return {
        ...dt,
        isBatBuoc: dt.isBatBuoc === "x",
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/kiem-tra-file-export`,
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
        setDataLoi(res.data);
        setMessageError("Import không thành công");
      } else {
        let check = false;
        res.data.forEach((dt) => {
          listVatTu.forEach((sp) => {
            if (dt.vatTu_Id === sp.vatTu_Id) {
              check = true;
              setMessageError(`Vật tư ${dt.tenVatTu} đã được thêm`);
              dt.ghiChuImport = `Vật tư ${dt.tenVatTu} đã được thêm`;
            }
          });
        });
        if (check) {
          setDataLoi(res.data);
          Helper.alertWarning(res.data[0].ghiChuImport);
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
    if (HangTrung.length > 0) {
      HangTrung.forEach((maVatTu) => {
        if (current.maVatTu === maVatTu) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.tenVatTu === undefined) {
      setCheckDanger(true);
      setMessageError("Tên vật tư không được rỗng");
      return "red-row";
    } else if (current.maVatTu === undefined) {
      setCheckDanger(true);
      setMessageError("Mã vật tư không được rỗng");
      return "red-row";
    } else if (current.dinhMuc === undefined) {
      setCheckDanger(true);
      setMessageError("Định mức");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (
          current.maVatTu.toString() === dt.maVatTu.toString() &&
          dt.ghiChuImport
        ) {
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

export default ImportDinhMucVatTu;
