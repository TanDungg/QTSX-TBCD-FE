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
} from "antd";
import { messages } from "src/constants/Messages";
import Helper from "src/helpers";
import map from "lodash/map";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { Modal, ModalDeleteConfirm } from "src/components/Common";
import { exportExcel, getTokenInfo, getLocalStorage } from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportVatTu({ openModalFS, openModal, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataListVatTu, setDataListVatTu] = useState([]);
  const [FileImport, setFileImport] = useState(null);
  const [checkDanger, setCheckDanger] = useState(false);
  const [messageError, setMessageError] = useState([]);

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, "vật tư");
  };

  const deleteItemAction = (item) => {
    const newDanhSach = DataListVatTu.filter(
      (ds) => ds.tenVatTu !== item.tenVatTu
    );
    if (newDanhSach.length) {
      setDataListVatTu(newDanhSach);
    } else {
      Helper.alertError("Dữ liệu không được rỗng");
    }
  };

  const actionContent = (item) => {
    const deleteItem = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItem} title="Xóa vật tư">
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
      width: 80,
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
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "left",
      width: 150,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "left",
      width: 200,
    },
    {
      title: "Tên tiếng Anh",
      dataIndex: "tenTiengAnh",
      key: "tenTiengAnh",
      align: "left",
      width: 200,
    },
    {
      title: "Mã loại vật tư",
      dataIndex: "maLoaiVatTu",
      key: "maLoaiVatTu",
      align: "center",
      width: 150,
    },
    {
      title: "Mã đơn vị tính",
      dataIndex: "maDonViTinh",
      key: "maDonViTinh",
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
          `tsec_qtsx_VatTu/export-file-excel?DonVi_Id=${INFO.donVi_Id}`,
          "GET",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        exportExcel("File_Mau_ImportVatTu", res.data.dataexcel);
      }
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
          .trim() === "Tên tiếng Anh" &&
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
          .trim() === "Mã loại vật tư" &&
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
          .trim() === "Mã đơn vị tính" &&
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
          .trim() === "Ghi chú";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const KEY = "STT";
        const MVT = "Mã vật tư";
        const TVT = "Tên vật tư";
        const TTA = "Tên tiếng Anh";
        const MLVT = "Mã loại vật tư";
        const MDVT = "Mã đơn vị tính";
        const GC = "Ghi chú";

        const ListVatTu = [];
        const DataVatTu = [];
        data.forEach((d, index) => {
          ListVatTu.push({
            key: data[index][KEY]
              ? data[index][KEY].toString().trim() !== ""
                ? data[index][KEY].toString().trim()
                : null
              : null,
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
            tenTiengAnh: data[index][TTA]
              ? data[index][TTA].toString().trim() !== ""
                ? data[index][TTA].toString().trim()
                : null
              : null,
            maLoaiVatTu: data[index][MLVT]
              ? data[index][MLVT].toString().trim() !== ""
                ? data[index][MLVT].toString().trim()
                : null
              : null,
            maDonViTinh: data[index][MDVT]
              ? data[index][MDVT].toString().trim() !== ""
                ? data[index][MDVT].toString().trim()
                : null
              : null,
            moTa: data[index][GC]
              ? data[index][GC].toString().trim() !== ""
                ? data[index][GC].toString().trim()
                : null
              : null,
            ghiChuImport: null,
          });
          DataVatTu.push(d);
        });

        if (ListVatTu.length === 0) {
          setFileImport(file.name);
          setDataListVatTu([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const newData = ListVatTu.map((dt) => {
            if (!dt.maVatTu) {
              return {
                ...dt,
                ghiChuImport: "Mã vật tư không được trống!",
              };
            } else if (!dt.tenVatTu) {
              return {
                ...dt,
                ghiChuImport: "Tên vật tư không được trống!",
              };
            } else if (!dt.maLoaiVatTu) {
              return {
                ...dt,
                ghiChuImport: "Mã loại vật tư không được trống!",
              };
            } else if (!dt.maDonViTinh) {
              return {
                ...dt,
                ghiChuImport: "Mã đơn vị tính không được trống!",
              };
            } else {
              return dt;
            }
          });

          const RowTrung = {};
          let duplicatedRows = [];

          ListVatTu.forEach((item, index) => {
            const { maVatTu } = item;

            if (RowTrung[maVatTu] === undefined) {
              RowTrung[maVatTu] = [index + 1];
            } else {
              RowTrung[maVatTu].push(index + 1);
            }
          });

          Object.keys(RowTrung).forEach((maVatTu) => {
            const indices = RowTrung[maVatTu];
            if (indices.length > 1) {
              indices.forEach((index) => {
                const listhangtrung = indices.filter((key) => key !== index);
                ListVatTu[
                  index - 1
                ].ghiChuImport = `Trùng mã vật tư với hàng: ${listhangtrung.join(
                  ", "
                )}`;
              });
            }
          });

          if (duplicatedRows.length > 0) {
            setCheckDanger(true);
          }

          setDataListVatTu(newData);
          setFileImport(file.name);
        }
      } else {
        setFileImport(file.name);
        setDataListVatTu([]);
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
    const newData = {
      donVi_Id: INFO.donVi_Id,
      vatTus: DataListVatTu,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_VatTu/import-excel`,
          "POST",
          newData,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status === 200) {
        setFileImport(null);
        setDataListVatTu([]);
        openModalFS(false);
        refesh();
      } else {
        const dataloi = res.data;
        const newData = DataListVatTu.map((dt) => {
          const loi = dataloi.find(
            (l) => String(l.maVatTu) === String(dt.maVatTu)
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
        setDataListVatTu(newData);
      }
    });
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import vật tư",
    onOk: XacNhanImport,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (current.ghiChuImport !== null) {
      setCheckDanger(true);
      setMessageError("Import không thành công");
      return "red-row";
    } else {
      setCheckDanger(false);
    }
  };

  const handleCancel = () => {
    if (checkDanger === true) {
      openModalFS(false);
      setCheckDanger(false);
      setFileImport(null);
      setDataListVatTu([]);
      refesh();
    } else {
      openModalFS(false);
      refesh();
    }
  };

  return (
    <AntModal
      title="Import danh sách vật tư"
      open={openModal}
      width={width >= 1600 ? "85%" : "100%"}
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
                    className="th-margin-bottom-0 btn-margin-bottom-0"
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
                      setDataListVatTu([]);
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
                className="th-margin-bottom-0 btn-margin-bottom-0"
                type="primary"
              >
                File mẫu
              </Button>
            </Col>
          </Row>
          <Table
            bordered
            columns={columns}
            scroll={{ x: 1400, y: "40vh" }}
            components={components}
            className="gx-table-responsive th-table"
            dataSource={DataListVatTu}
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
            <Button
              icon={<SaveOutlined />}
              className="th-margin-bottom-0 btn-margin-bottom-0"
              type="primary"
              onClick={modalXK}
              disabled={!DataListVatTu.length || checkDanger}
            >
              Lưu
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ImportVatTu;
