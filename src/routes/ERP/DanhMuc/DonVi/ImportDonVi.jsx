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

function ImportDonVi({ openModalFS, openModal, loading, refesh }) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [messageError, setMessageError] = useState([]);
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },

    {
      title: "Mã đơn vị",
      dataIndex: "maDonVi",
      key: "maDonVi",
      align: "center",
    },
    {
      title: "Tên đơn vị",
      dataIndex: "tenDonVi",
      align: "center",
      key: "tenDonVi",
    },
    {
      title: "Mã tập đoàn",
      dataIndex: "maTapDoan",
      align: "center",
      key: "maTapDoan",
    },
    {
      title: "Mã đơn vị cha",
      dataIndex: "maDonViCha",
      align: "center",
      key: "maDonViCha",
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

  const TaiFileMau = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/ExportFileExcel`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_Don_Vi", res.data.dataexcel);
    });
  };

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
          .trim() === "Mã đơn vị" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
          })[0]
          .toString()
          .trim() === "Tên đơn vị" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã tập đoàn" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị cha";
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
          const MDV = "Mã đơn vị";
          const TDV = "Tên đơn vị";
          const MTTD = "Mã tập đoàn";
          const MDVC = "Mã đơn vị cha";
          const Data = [];
          const NewData = [];
          data.forEach((d, index) => {
            if (
              data[index][MDV] &&
              data[index][MDV].toString().trim() === "" &&
              data[index][TDV] &&
              data[index][TDV].toString().trim() === "" &&
              data[index][MTTD] &&
              data[index][MTTD].toString().trim() === "" &&
              data[index][MDVC] &&
              data[index][MDVC].toString().trim() === ""
            ) {
            } else {
              NewData.push({
                maDonVi: data[index][MDV]
                  ? data[index][MDV].toString().trim() !== ""
                    ? data[index][MDV].toString().trim()
                    : undefined
                  : undefined,
                tenDonVi: data[index][TDV]
                  ? data[index][TDV].toString().trim() !== ""
                    ? data[index][TDV].toString().trim()
                    : undefined
                  : undefined,
                maTapDoan: data[index][MTTD]
                  ? data[index][MTTD].toString().trim() !== ""
                    ? data[index][MTTD].toString().trim()
                    : undefined
                  : undefined,
                maDonViCha: data[index][MDVC]
                  ? data[index][MDVC].toString().trim() !== ""
                    ? data[index][MDVC].toString().trim()
                    : undefined
                  : undefined,
              });
            }
            Data.push(data[index][MDV]);
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
                if (
                  Data[i] === Data[j] &&
                  Data[j] !== undefined &&
                  Data[i] !== undefined
                ) {
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
              setMessageError(`Hàng ${row.join(", ")} có mã đơn vị trùng nhau`);
              Helper.alertError(
                `Hàng ${row.join(", ")} có mã đơn vị trùng nhau`
              );
              setHangTrung(indices);
              setCheckDanger(true);
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
          `DonVi/ImportExel`,
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
          setMessageError(res.data.ghiChuImport);
          setDataLoi(res.data);
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
    title: "Xác nhận import đơn vị",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((maDonVi) => {
        if (current.maDonVi === maDonVi) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.maDonVi === undefined) {
      setCheckDanger(true);
      setMessageError("Mã đơn vị không được rỗng");
      return "red-row";
    } else if (current.tenDonVi === undefined) {
      setCheckDanger(true);
      setMessageError("Tên đơn vị không được rỗng");
      return "red-row";
    } else if (current.maTapDoan === undefined) {
      setCheckDanger(true);
      setMessageError("Mã tập đoàn không được rỗng");
      return "red-row";
    } else if (DataLoi) {
      if (current.maDonVi.toString() === DataLoi.maDonVi) {
        setCheckDanger(true);
        return "red-row";
      }
    }
  };
  const handleCancel = () => {
    if (checkDanger === true) {
      openModalFS(false);
      setCheckDanger(false);
      refesh();
      setFileName(null);
      setDataView([]);
    } else {
      refesh();
      openModalFS(false);
    }
  };
  return (
    <AntModal
      title="Import đơn vị"
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
            scroll={{ x: "100%" }}
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

export default ImportDonVi;
