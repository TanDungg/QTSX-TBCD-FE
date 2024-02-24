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
  Checkbox,
} from "antd";
import { messages } from "src/constants/Messages";
import Helper from "src/helpers";
import map from "lodash/map";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { Modal, ModalDeleteConfirm } from "src/components/Common";
import { exportExcel, getTokenInfo, getLocalStorage } from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";
const { EditableRow, EditableCell } = EditableTableRow;

function ImportCauHoi({ openModalFS, openModal, refesh }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataListCauHoi, setDataListCauHoi] = useState([]);
  const [FileImport, setFileImport] = useState(null);
  const [checkDanger, setCheckDanger] = useState(false);
  const [DataLoi, setDataLoi] = useState(null);
  const [messageError, setMessageError] = useState([]);

  const handleChangeXaoTron = (value, record) => {
    const newListData = DataListCauHoi.map((cauhoi) => {
      if (String(cauhoi.noiDung) === String(record.noiDung)) {
        return {
          ...cauhoi,
          isXaoDapAn: !cauhoi.isXaoDapAn,
        };
      }
      return cauhoi;
    });

    setDataListCauHoi(newListData);
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.noiDung, "câu hỏi");
  };

  const deleteItemAction = (item) => {
    const newDanhSach = DataListCauHoi.filter(
      (ds) => ds.noiDung !== item.noiDung
    );
    if (newDanhSach.length) {
      setDataListCauHoi(newDanhSach);
    } else {
      Helper.alertError("Dữ liệu không được rỗng");
    }
  };

  const actionContent = (item) => {
    const deleteItem = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItem} title="Xóa câu hỏi">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      align: "center",
      width: 50,
      render: (record) => actionContent(record),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã chuyên đề",
      dataIndex: "maChuyenDeDaoTao",
      key: "maChuyenDeDaoTao",
      align: "left",
      width: 150,
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "noiDung",
      key: "noiDung",
      align: "left",
      width: 200,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 120,
    },
    {
      title: "Đáp án 1",
      dataIndex: "dapAn1",
      key: "dapAn1",
      align: "left",
      width: 120,
    },
    {
      title: "Đáp án 2",
      dataIndex: "dapAn2",
      key: "dapAn2",
      align: "left",
      width: 120,
    },
    {
      title: "Đáp án 3",
      dataIndex: "dapAn3",
      key: "dapAn3",
      align: "left",
      width: 120,
    },
    {
      title: "Đáp án 4",
      dataIndex: "dapAn4",
      key: "dapAn4",
      align: "left",
      width: 120,
    },
    {
      title: "Đáp án 5",
      dataIndex: "dapAn5",
      key: "dapAn5",
      align: "left",
      width: 120,
    },
    {
      title: "Đáp án 6",
      dataIndex: "dapAn6",
      key: "dapAn6",
      align: "left",
      width: 120,
    },
    {
      title: (
        <div>
          Đáp án <br />
          đúng
        </div>
      ),
      dataIndex: "thuTuDapAnDung",
      key: "thuTuDapAnDung",
      align: "center",
      width: 80,
    },
    {
      title: (
        <div>
          Xáo trộn <br />
          đáp án
        </div>
      ),
      dataIndex: "isXaoDapAn",
      key: "isXaoDapAn",
      align: "center",
      width: 80,

      render: (value, record) => {
        return (
          <Checkbox
            checked={value}
            onChange={() => handleChangeXaoTron(value, record)}
          />
        );
      },
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
          `vptq_lms_CauHoi/export-file-mau?donViHienHanh_Id=${INFO.donVi_Id}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("FileMauImportCauHoi", res.data.dataexcel);
    });
  };

  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Câu hỏi"];

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
          .trim() === "Mã chuyên đề" &&
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
          .trim() === "Tên chuyên đề" &&
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
          .trim() === "Nội dung câu hỏi" &&
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
          .trim() === "Ghi chú" &&
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
          .trim() === "Đáp án 1" &&
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
          .trim() === "Đáp án 2" &&
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
          .trim() === "Đáp án 3" &&
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
          .trim() === "Đáp án 4" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 9, r: 2 }, e: { c: 9, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 2 }, e: { c: 9, r: 2 } },
          })[0]
          .toString()
          .trim() === "Đáp án 5" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 10, r: 2 }, e: { c: 10, r: 2 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 2 }, e: { c: 10, r: 2 } },
          })[0]
          .toString()
          .trim() === "Đáp án 6" &&
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
          .trim() === "STT đáp án đúng" &&
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
          .trim() === "Chọn xáo đáp án";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const KEY = "STT";
        const MCD = "Mã chuyên đề";
        const TCD = "Tên chuyên đề";
        const NDCH = "Nội dung câu hỏi";
        const MT = "Ghi chú";
        const DA1 = "Đáp án 1";
        const DA2 = "Đáp án 2";
        const DA3 = "Đáp án 3";
        const DA4 = "Đáp án 4";
        const DA5 = "Đáp án 5";
        const DA6 = "Đáp án 6";
        const DAD = "STT đáp án đúng";
        const CXDA = "Chọn xáo đáp án";

        const DanhSachCauHoi = [];
        const DataCauHoi = [];
        data.forEach((d, index) => {
          if (
            data[index][MCD] &&
            data[index][MCD].toString().trim() === "" &&
            data[index][TCD] &&
            data[index][TCD].toString().trim() === "" &&
            data[index][NDCH] &&
            data[index][NDCH].toString().trim() === "" &&
            data[index][DA1] &&
            data[index][DA1].toString().trim() === "" &&
            data[index][DA2] &&
            data[index][DA2].toString().trim() === "" &&
            data[index][DAD] &&
            data[index][DAD].toString().trim() === ""
          ) {
          } else {
            DanhSachCauHoi.push({
              key: data[index][KEY]
                ? data[index][KEY].toString().trim() !== ""
                  ? data[index][KEY].toString().trim()
                  : null
                : null,
              maChuyenDeDaoTao: data[index][MCD]
                ? data[index][MCD].toString().trim() !== ""
                  ? data[index][MCD].toString().trim()
                  : null
                : null,
              tenChuyenDeDaoTao: data[index][TCD]
                ? data[index][TCD].toString().trim() !== ""
                  ? data[index][TCD].toString().trim()
                  : null
                : null,
              noiDung: data[index][NDCH]
                ? data[index][NDCH].toString().trim() !== ""
                  ? data[index][NDCH].toString().trim()
                  : null
                : null,
              moTa: data[index][MT]
                ? data[index][MT].toString().trim() !== ""
                  ? data[index][MT].toString().trim()
                  : null
                : null,
              dapAn1: data[index][DA1]
                ? data[index][DA1].toString().trim() !== ""
                  ? data[index][DA1].toString().trim()
                  : null
                : null,
              dapAn2: data[index][DA2]
                ? data[index][DA2].toString().trim() !== ""
                  ? data[index][DA2].toString().trim()
                  : null
                : null,
              dapAn3: data[index][DA3]
                ? data[index][DA3].toString().trim() !== ""
                  ? data[index][DA3].toString().trim()
                  : null
                : null,
              dapAn4: data[index][DA4]
                ? data[index][DA4].toString().trim() !== ""
                  ? data[index][DA4].toString().trim()
                  : null
                : null,
              dapAn5: data[index][DA5]
                ? data[index][DA5].toString().trim() !== ""
                  ? data[index][DA5].toString().trim()
                  : null
                : null,
              dapAn6: data[index][DA6]
                ? data[index][DA6].toString().trim() !== ""
                  ? data[index][DA6].toString().trim()
                  : null
                : null,
              thuTuDapAnDung: data[index][DAD]
                ? data[index][DAD].toString().trim() !== ""
                  ? data[index][DAD].toString().trim()
                  : null
                : null,
              isXaoDapAn: data[index][CXDA]
                ? data[index][CXDA].toString().trim() !== ""
                  ? data[index][CXDA].toString().trim()
                  : null
                : null,
              ghiChuImport: null,
            });
          }
          DataCauHoi.push(d);
        });

        if (DanhSachCauHoi.length === 0) {
          setFileImport(file.name);
          setDataListCauHoi([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const newData = DanhSachCauHoi.map((dt) => {
            if (!dt.noiDung) {
              return {
                ...dt,
                isXaoDapAn: dt.isXaoDapAn ? true : false,
                ghiChuImport: "Nội dung câu hỏi không được trống",
              };
            } else if (!dt.maChuyenDeDaoTao) {
              return {
                ...dt,
                isXaoDapAn: dt.isXaoDapAn ? true : false,
                ghiChuImport: "Mã chuyên đề đào tạo không được trống",
              };
            } else if (isNaN(dt.thuTuDapAnDung)) {
              return {
                ...dt,
                isXaoDapAn: dt.isXaoDapAn ? true : false,
                ghiChuImport: "STT đáp án đúng phải là số",
              };
            } else {
              return {
                ...dt,
                isXaoDapAn: dt.isXaoDapAn ? true : false,
              };
            }
          });
          setDataListCauHoi(newData);
          setFileImport(file.name);
        }
      } else {
        setFileImport(file.name);
        setDataListCauHoi([]);
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
        setCheckDanger(false);
        return false;
      }
    },

    showUploadList: false,
    maxCount: 1,
  };

  const XacNhanImport = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          DataLoi && !DataLoi.isError
            ? `vptq_lms_CauHoi/import-bo-qua-trung?donViHienHanh_Id=${INFO.donVi_Id}`
            : `vptq_lms_CauHoi/import?donViHienHanh_Id=${INFO.donVi_Id}`,
          "POST",
          DataListCauHoi,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        setFileImport(null);
        setDataListCauHoi([]);
        openModalFS(false);
        refesh();
      } else {
        const dataloi = res.data;
        setDataLoi(dataloi);
        const newData = DataListCauHoi.map((dt) => {
          const loi = dataloi.errors.find(
            (l) => String(l.noiDung) === String(dt.noiDung)
          );
          if (loi) {
            return {
              ...dt,
              ghiChuImport: loi.ghiChuImport,
            };
          } else {
            return dt;
          }
        });
        setDataListCauHoi(newData);
      }
    });
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import câu hỏi",
    onOk: XacNhanImport,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (current.maChuyenDeDaoTao === null) {
      setCheckDanger(true);
      setMessageError("Import không thành công");
      return "red-row";
    } else if (current.noiDung === null) {
      setCheckDanger(true);
      setMessageError("Import không thành công");
      return "red-row";
    } else if (isNaN(current.thuTuDapAnDung)) {
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
      setDataLoi(null);
      setDataListCauHoi([]);
      refesh();
    } else {
      openModalFS(false);
      refesh();
    }
  };

  return (
    <AntModal
      title="Import danh sách câu hỏi"
      open={openModal}
      width={`95%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row style={{ marginBottom: "20px" }}>
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
                      setDataListCauHoi([]);
                      setMessageError(null);
                    }}
                  />
                </Popover>
              )}
            </Col>
            <Col xxl={2} xl={3} lg={4} md={5} xs={6}>
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
            bordered
            columns={columns}
            scroll={{ x: 1550, y: "40vh" }}
            components={components}
            className="gx-table-responsive th-table"
            dataSource={DataListCauHoi}
            size="small"
            rowClassName={RowStyle}
            pagination={false}
            // loading={loading}
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
            {!DataLoi || DataLoi.isError ? (
              <Button
                icon={<SaveOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                onClick={modalXK}
                disabled={!DataListCauHoi.length || checkDanger}
              >
                Lưu
              </Button>
            ) : (
              <Button
                icon={<SaveOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                onClick={modalXK}
                disabled={!DataListCauHoi.length}
              >
                Lưu và bỏ lỗi trùng
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ImportCauHoi;
