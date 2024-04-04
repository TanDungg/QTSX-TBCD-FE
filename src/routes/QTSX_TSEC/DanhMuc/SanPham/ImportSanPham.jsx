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

function ImportSanPham({ openModalFS, openModal, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataListSanPham, setDataListSanPham] = useState([]);
  const [FileImport, setFileImport] = useState(null);
  const [checkDanger, setCheckDanger] = useState(false);
  const [messageError, setMessageError] = useState([]);

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenSanPham, "sản phẩm");
  };

  const deleteItemAction = (item) => {
    const newDanhSach = DataListSanPham.filter(
      (ds) => ds.maSanPham !== item.maSanPham
    );
    if (newDanhSach.length) {
      setDataListSanPham(newDanhSach);
    } else {
      Helper.alertError("Dữ liệu không được rỗng");
    }
  };

  const actionContent = (item) => {
    const deleteItem = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItem} title="Xóa sản phẩm">
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "left",
      width: 150,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "left",
      width: 200,
    },
    {
      title: "Mã loại sản phẩm",
      dataIndex: "maLoaiSanPham",
      key: "maLoaiSanPham",
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
          `tsec_qtsx_SanPham/export-file-excel?DonVi_Id=${INFO.donVi_Id}`,
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
        exportExcel("File_Mau_ImportSanPham", res.data.dataexcel);
      }
    });
  };

  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Sản phẩm"];

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
          .trim() === "Mã loại sản phẩm" &&
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
          .trim() === "Mã đơn vị tính" &&
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
          .trim() === "Ghi chú";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const sothutu = "STT";
        const masanpham = "Mã sản phẩm";
        const tensanpham = "Tên sản phẩm";
        const maloaisanpham = "Mã loại sản phẩm";
        const madonvitinh = "Mã đơn vị tính";
        const ghichu = "Ghi chú";

        const ListSanPham = [];
        const DataSanPham = [];
        data.forEach((d, index) => {
          ListSanPham.push({
            key: data[index][sothutu]
              ? data[index][sothutu].toString().trim() !== ""
                ? data[index][sothutu].toString().trim()
                : null
              : null,
            maSanPham: data[index][masanpham]
              ? data[index][masanpham].toString().trim() !== ""
                ? data[index][masanpham].toString().trim()
                : null
              : null,
            tenSanPham: data[index][tensanpham]
              ? data[index][tensanpham].toString().trim() !== ""
                ? data[index][tensanpham].toString().trim()
                : null
              : null,
            maLoaiSanPham: data[index][maloaisanpham]
              ? data[index][maloaisanpham].toString().trim() !== ""
                ? data[index][maloaisanpham].toString().trim()
                : null
              : null,
            maDonViTinh: data[index][madonvitinh]
              ? data[index][madonvitinh].toString().trim() !== ""
                ? data[index][madonvitinh].toString().trim()
                : null
              : null,
            moTa: data[index][ghichu]
              ? data[index][ghichu].toString().trim() !== ""
                ? data[index][ghichu].toString().trim()
                : null
              : null,
            ghiChuImport: null,
          });
          DataSanPham.push(d);
        });

        if (ListSanPham.length === 0) {
          setFileImport(file.name);
          setDataListSanPham([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const newData = ListSanPham.map((dt) => {
            if (!dt.maSanPham) {
              return {
                ...dt,
                ghiChuImport: "Mã sản phẩm không được trống!",
              };
            } else if (!dt.tenSanPham) {
              return {
                ...dt,
                ghiChuImport: "Tên sản phẩm không được trống!",
              };
            } else if (!dt.maLoaiSanPham) {
              return {
                ...dt,
                ghiChuImport: "Mã loại sản phẩm không được trống!",
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

          ListSanPham.forEach((item, index) => {
            const { maSanPham } = item;

            if (RowTrung[maSanPham] === undefined) {
              RowTrung[maSanPham] = [index + 1];
            } else {
              RowTrung[maSanPham].push(index + 1);
            }
          });

          Object.keys(RowTrung).forEach((maSanPham) => {
            const indices = RowTrung[maSanPham];
            if (indices.length > 1) {
              indices.forEach((index) => {
                const listhangtrung = indices.filter((key) => key !== index);
                ListSanPham[
                  index - 1
                ].ghiChuImport = `Trùng mã sản phẩm với hàng: ${listhangtrung.join(
                  ", "
                )}`;
              });
            }
          });

          if (duplicatedRows.length > 0) {
            setCheckDanger(true);
          }

          setDataListSanPham(newData);
          setFileImport(file.name);
        }
      } else {
        setFileImport(file.name);
        setDataListSanPham([]);
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
      sanPhams: DataListSanPham,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_SanPham/import-excel`,
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
        setDataListSanPham([]);
        openModalFS(false);
        refesh();
      } else {
        const dataloi = res.data;
        const newData = DataListSanPham.map((dt) => {
          const loi = dataloi.find(
            (l) => String(l.maSanPham) === String(dt.maSanPham)
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
        setDataListSanPham(newData);
      }
    });
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import sản phẩm",
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
      setDataListSanPham([]);
      refesh();
    } else {
      openModalFS(false);
      refesh();
    }
  };

  return (
    <AntModal
      title="Import danh sách sản phẩm"
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
                      setDataListSanPham([]);
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
            dataSource={DataListSanPham}
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
              disabled={!DataListSanPham.length || checkDanger}
            >
              Lưu
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ImportSanPham;
