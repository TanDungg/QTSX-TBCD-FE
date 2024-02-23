import { Card, Col, Upload, Button, Popover, Divider, Alert, Row } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  exportExcel,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { EditableTableRow, Modal, Table } from "src/components/Common";
import { map } from "lodash";
import * as XLSX from "xlsx";
import Helpers from "src/helpers";
import { messages } from "src/constants/Messages";
import {
  DeleteOutlined,
  DownloadOutlined,
  RollbackOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportNguoiDung({ match, history }) {
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
      width: 120,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 180,
    },
    {
      title: "Mã quyền",
      dataIndex: "maQuyen",
      key: "maQuyen",
      align: "left",
      width: 200,
    },
    {
      title: "Tên quyền",
      dataIndex: "tenQuyen",
      key: "tenQuyen",
      align: "left",
      width: 200,
    },
    {
      title: "Lỗi",
      dataIndex: "ghiChuImport",
      key: "ghiChuImport",
      align: "left",
      width: 200,
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
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 4 }, e: { c: 0, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 0, r: 4 }, e: { c: 0, r: 4 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 1, r: 4 }, e: { c: 1, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 4 }, e: { c: 1, r: 4 } },
          })[0]
          .toString()
          .trim() === "Mã nhân viên *" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 2, r: 4 }, e: { c: 2, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 4 }, e: { c: 2, r: 4 } },
          })[0]
          .toString()
          .trim() === "Họ tên" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 3, r: 4 }, e: { c: 3, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 4 }, e: { c: 3, r: 4 } },
          })[0]
          .toString()
          .trim() === "Mã quyền *" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 4, r: 4 }, e: { c: 4, r: 4 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 4 }, e: { c: 4, r: 4 } },
          })[0]
          .toString()
          .trim() === "Tên quyền";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 4,
        });

        if (data.length === 0) {
          setFileImport(file.name);
          setDataListNguoiDung([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helpers.alertError("Dữ liệu import không được rỗng");
        } else {
          const MNV = "Mã nhân viên *";
          const HT = "Họ tên";
          const MQ = "Mã quyền *";
          const TQ = "Tên quyền";

          const DataTrung = [];
          const ListCNBV = [];
          data.forEach((d, index) => {
            ListCNBV.push({
              maNhanVien: data[index][MNV]
                ? data[index][MNV].toString().trim() !== ""
                  ? data[index][MNV].toString()
                  : null
                : null,
              fullName: data[index][HT]
                ? data[index][HT].toString().trim() !== ""
                  ? data[index][HT].toString().trim()
                  : null
                : null,
              maQuyen: data[index][MQ]
                ? data[index][MQ].toString().trim() !== ""
                  ? data[index][MQ].toString().trim()
                  : null
                : null,
              tenQuyen: data[index][TQ]
                ? data[index][TQ].toString().trim() !== ""
                  ? data[index][TQ].toString().trim()
                  : null
                : null,
              ghiChuImport: null,
            });

            DataTrung.push(d["Mã nhân viên *"]);
          });
          if (ListCNBV.length === 0) {
            setFileImport(file.name);
            setDataListNguoiDung([]);
            setCheckDanger(true);
            setMessageError("Dữ liệu import không được rỗng");
            Helpers.alertError("Dữ liệu import không được rỗng");
          } else {
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

            const RowTrung = {};
            let duplicatedRows = [];

            ListCNBV.forEach((item, index) => {
              const { maNhanVien } = item;

              if (RowTrung[maNhanVien] === undefined) {
                RowTrung[maNhanVien] = [index + 1];
              } else {
                RowTrung[maNhanVien].push(index + 1);
              }
            });

            Object.keys(RowTrung).forEach((maNhanVien) => {
              const indices = RowTrung[maNhanVien];
              if (indices.length > 1) {
                // duplicatedRows.push(
                //   `Mã nhân viên ${maNhanVien} trùng tại hàng: ${indices.join(
                //     ", "
                //   )}`
                // );
                indices.forEach((index) => {
                  const listhangtrung = indices.filter((key) => key !== index);
                  ListCNBV[
                    index - 1
                  ].ghiChuImport = `Trùng mã nhân viên với hàng: ${listhangtrung.join(
                    ", "
                  )}`;
                });
              }
            });

            if (duplicatedRows.length > 0) {
              setCheckDanger(true);
              // const message = duplicatedRows.join("; ");
              // setMessageError(message);
            }

            setDataListNguoiDung(newData);
            setFileImport(file.name);
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
          goBack();
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import danh sách người dùng",
    onOk: handleSubmit,
  };

  const modalLuu = () => {
    Modal(prop);
  };

  const RowStyle = (current) => {
    if (current.maNhanVien === null) {
      setCheckDanger(true);
      setMessageError("Import không thành công");
      return "red-row";
    } else if (current.ghiChuImport !== null) {
      setCheckDanger(true);
      setMessageError("Import không thành công");
      return "red-row";
    }
  };

  const goBack = () => {
    history.push(`${match.url.replace(`/import`, "")}`);
  };

  const titile = "Import danh sách người dùng";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={titile} back={goBack} />
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
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          style={{ marginTop: 10 }}
          bordered
          scroll={{
            x: 1100,
            y: "55vh",
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              icon={<RollbackOutlined />}
              className="th-margin-bottom-0"
              onClick={() => goBack()}
            >
              Quay lại
            </Button>
            <Button
              icon={<SaveOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={modalLuu}
              disabled={
                DataListNguoiDung.length > 0 && !checkDanger ? false : true
              }
            >
              Lưu
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ImportNguoiDung;
