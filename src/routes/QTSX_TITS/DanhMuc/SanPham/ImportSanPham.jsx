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
  Image,
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
import { BASE_URL_API } from "src/constants/Config";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportSanPham({ openModalFS, openModal, loading, refesh }) {
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
  const [message, setMessageError] = useState(null);
  const [FileAnh, setFileAnh] = useState(null);
  const [OpenImage, setOpenImage] = useState(false);

  const handleViewFile = () => {
    setOpenImage(true);
  };

  const handleUploadFileThongSo = (file, index) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const isAllowedType = allowedTypes.includes(file.type);

    if (!isAllowedType) {
      Helper.alertError(
        `File ${file.name} không phải là file Excel, PDF, hoặc Word`
      );
    } else {
      const newData = dataView.map((data) => {
        if (data.maSanPham === index.maSanPham) {
          return {
            ...data,
            thongSoKyThuat: file,
          };
        }
        return data;
      });
      setDataView(newData);
      return false;
    }
  };

  const renderThongSo = (record) => {
    return record.thongSoKyThuat ? (
      <span>
        <span
          style={{ color: "#0469B9", cursor: "pointer" }}
          onClick={() => handleViewFile(record.thongSoKyThuat)}
        >
          {record.thongSoKyThuat.name.length > 20
            ? record.thongSoKyThuat.name.substring(0, 20) + "..."
            : record.thongSoKyThuat.name}
        </span>
        <DeleteOutlined
          style={{ cursor: "pointer", color: "red" }}
          onClick={() => {
            const newDataView = dataView.map((data) => {
              if (data.maSanPham === record.maSanPham) {
                return {
                  ...data,
                  thongSoKyThuat: null,
                };
              }
              return data;
            });
            setDataView(newDataView);
          }}
        />
      </span>
    ) : (
      <Upload
        beforeUpload={(file) => handleUploadFileThongSo(file, record)}
        showUploadList={false}
        maxCount={1}
      >
        <Button
          style={{
            marginBottom: 0,
          }}
          icon={<UploadOutlined />}
        >
          Tải file hình ảnh
        </Button>
      </Upload>
    );
  };

  const handleUploadFileHinhAnh = (file, index) => {
    const isPNG = file.type === "image/png" || file.type === "image/jpeg";
    if (!isPNG) {
      Helper.alertError(`${file.name} không phải hình ảnh`);
    } else {
      const newData = dataView.map((data) => {
        if (data.maSanPham === index.maSanPham) {
          return {
            ...data,
            hinhAnh: file,
            ghiChuImport: null,
          };
        }
        return data;
      });
      setDataView(newData);
      setCheckDanger(false);
      setDataLoi();
      setMessageError(null);
      const reader = new FileReader();
      reader.onload = (e) => setFileAnh(e.target.result);
      reader.readAsDataURL(file);
      return false;
    }
  };
  const renderHinhAnh = (record) => {
    return record.hinhAnh ? (
      <span>
        <span
          style={{ color: "#0469B9", cursor: "pointer" }}
          onClick={() => handleViewFile(record.hinhAnh)}
        >
          {record.hinhAnh.name.length > 20
            ? record.hinhAnh.name.substring(0, 20) + "..."
            : record.hinhAnh.name}
        </span>
        <DeleteOutlined
          style={{ cursor: "pointer", color: "red" }}
          onClick={() => {
            const newDataView = dataView.map((data) => {
              if (data.maSanPham === record.maSanPham) {
                return {
                  ...data,
                  hinhAnh: null,
                };
              }
              return data;
            });
            setDataView(newDataView);
          }}
        />
      </span>
    ) : (
      <Upload
        beforeUpload={(file) => handleUploadFileHinhAnh(file, record)}
        showUploadList={false}
        maxCount={1}
      >
        <Button
          style={{
            marginBottom: 0,
          }}
          icon={<UploadOutlined />}
        >
          Tải file hình ảnh
        </Button>
      </Upload>
    );
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Mã loại sản phẩm",
      dataIndex: "maLoaiSanPham",
      key: "maLoaiSanPham",
      align: "center",
    },
    {
      title: "Mã đơn vị tính",
      dataIndex: "maDonViTinh",
      key: "maDonViTinh",
      align: "center",
    },
    {
      title: "Thông số kỹ thuật",
      key: "thongSoKyThuat",
      align: "center",
      render: (record) => renderThongSo(record),
    },
    {
      title: "Hình ảnh",
      key: "hinhAnh",
      align: "center",
      render: (record) => renderHinhAnh(record),
    },

    {
      title: "Lỗi",
      dataIndex: "ghiChuImport",
      key: "ghiChuImport",
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
    let param = convertObjectToUrlParams({
      DonVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham/export-file-excel?${param}`,
          "GET",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("FileMauImportSanPham", res.data.dataexcel);
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
          .trim() === "Mã đơn vị tính";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });

        const MSP = "Mã sản phẩm";
        const TSP = "Tên sản phẩm";
        const MLSP = "Mã loại sản phẩm";
        const MDVT = "Mã đơn vị tính";

        const Data = [];
        const NewData = [];
        data.forEach((d, index) => {
          if (
            data[index][MSP] &&
            data[index][MSP].toString().trim() === "" &&
            data[index][TSP] &&
            data[index][TSP].toString().trim() === "" &&
            data[index][MLSP] &&
            data[index][MLSP].toString().trim() === "" &&
            data[index][MDVT] &&
            data[index][MDVT].toString().trim() === ""
          ) {
          } else {
            NewData.push({
              maSanPham: data[index][MSP]
                ? data[index][MSP].toString().trim() !== ""
                  ? data[index][MSP].toString().trim()
                  : null
                : null,
              tenSanPham: data[index][TSP]
                ? data[index][TSP].toString().trim() !== ""
                  ? data[index][TSP].toString().trim()
                  : null
                : null,
              maLoaiSanPham: data[index][MLSP]
                ? data[index][MLSP].toString().trim() !== ""
                  ? data[index][MLSP].toString().trim()
                  : null
                : null,
              maDonViTinh: data[index][MDVT]
                ? data[index][MDVT].toString().trim() !== ""
                  ? data[index][MDVT].toString().trim()
                  : null
                : null,
              thongSoKyThuat: null,
              hinhAnh: null,
              ghiChuImport: null,
            });
          }
          Data.push(data[index][MSP]);
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
            setMessageError(`Hàng ${row.join(", ")} có mã sản phẩm trùng nhau`);
            Helper.alertError(
              `Hàng ${row.join(", ")} có mã sản phẩm trùng nhau`
            );
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
    let hasError = false;

    const newData = dataView.map((dt) => {
      if (!dt.hinhAnh && !dt.thongSoKyThuat) {
        hasError = true;
        return {
          ...dt,
          ghiChuImport: "Vui lòng tải hình ảnh lên",
        };
      } else if (!dt.thongSoKyThuat) {
        const formData = new FormData();
        formData.append("file", dt.hinhAnh);

        return fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => ({
            ...dt,
            hinhAnh: data.path,
          }))
          .catch((error) => {
            console.log("Tải lên thất bại.", error);
            hasError = true;
            return dt;
          });
      } else {
        const formData = new FormData();
        formData.append("lstFiles", dt.thongSoKyThuat);
        formData.append("lstFiles", dt.hinhAnh);

        return fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => ({
            ...dt,
            thongSoKyThuat: data[0].path,
            hinhAnh: data[1].path,
          }))
          .catch((error) => {
            console.log("Tải lên thất bại.", error);
            hasError = true;
            return dt;
          });
      }
    });

    if (hasError) {
      setDataView(newData);
      setDataLoi(newData);
      setCheckDanger(true);
      setMessageError("Import sản phẩm không thành công");
      return;
    }

    Promise.all(newData)
      .then((data) => {
        const newListSanPham = {
          donVi_Id: INFO.donVi_Id,
          list_SanPhams: data,
        };

        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `tits_qtsx_SanPham/import-excel`,
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
              const dt = res.data.find(
                (item) => item.maSanPham === data.maSanPham
              );

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
            setCheckDanger(false);
            setMessageError(null);
            refesh();
          }
        });
      })
      .catch((error) => {
        console.error("Lỗi khi xử lý", error);
      });
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import sản phẩm",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((maSanPham) => {
        if (current.maSanPham === maSanPham) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.maSanPham === null) {
      setCheckDanger(true);
      setMessageError("Mã sản phẩm không được rỗng");
      return "red-row";
    } else if (current.tenSanPham === null) {
      setCheckDanger(true);
      setMessageError("Tên sản phẩm không được rỗng");
      return "red-row";
    } else if (current.maLoaiSanPham === null) {
      setCheckDanger(true);
      setMessageError("Mã loại sản phẩm không được rỗng");
      return "red-row";
    } else if (current.maDonViTinh === null) {
      setCheckDanger(true);
      setMessageError("Mã đơn vị tính không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (current.maSanPham.toString() === dt.maSanPham.toString()) {
          check = true;
        }
      });
      if (check) {
        setCheckDanger(true);
        return "red-row";
      } else {
        setCheckDanger(false);
        return "";
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
      title="Import sản phẩm"
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
        <Image
          width={"80%"}
          src={FileAnh}
          alt="preview"
          style={{
            display: "none",
          }}
          preview={{
            visible: OpenImage,
            scaleStep: 0.5,
            src: FileAnh,
            onVisibleChange: (value) => {
              setOpenImage(value);
            },
          }}
        />
      </div>
    </AntModal>
  );
}

export default ImportSanPham;
