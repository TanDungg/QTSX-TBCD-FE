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
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { Modal, Select } from "src/components/Common";
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

function DanhSachImport({
  openModalFS,
  openModal,
  loading,
  DanhSachChiTiet,
  itemData,
}) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const [message, setMessageError] = useState([]);
  const [FileAnh, setFileAnh] = useState(null);
  const [OpenImage, setOpenImage] = useState(false);

  useEffect(() => {
    if (openModal) {
      getSanPham();
    }
  }, [openModal]);

  const getSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_SanPham?page=-1",
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleViewFile = () => {
    setOpenImage(true);
  };

  const handleUploadFile = (file, index) => {
    const isPNG = file.type === "image/png" || file.type === "image/jpeg";
    if (!isPNG) {
      Helper.alertError(`${file.name} không phải hình ảnh`);
    } else {
      const newData = dataView.map((data) => {
        if (data.maVatTuChiTiet === index.maVatTuChiTiet) {
          return {
            ...data,
            hinhAnh: file,
          };
        }
        return data;
      });
      setDataView(newData);
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
              if (data.maVatTuChiTiet === record.maVatTuChiTiet) {
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
        beforeUpload={(file) => handleUploadFile(file, record)}
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
      title: "Mã vật tư/chi tiết",
      dataIndex: "maVatTuChiTiet",
      key: "maVatTuChiTiet",
      align: "center",
    },
    {
      title: "Tên vật tư/chi tiết",
      dataIndex: "tenVatTuChiTiet",
      key: "tenVatTuChiTiet",
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
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
    },
    {
      title: "Vật liệu",
      dataIndex: "vatLieu",
      key: "vatLieu",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
    },
    {
      title: "Mã xưởng nhận",
      dataIndex: "maXuong",
      key: "maXuong",
      align: "center",
    },
    {
      title: "Hình ảnh",
      key: "hinhAnh",
      align: "center",
      // render: (record) => renderHinhAnh(record),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
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
  const TaiFileMau = (tits_qtsx_SanPham_Id, donVi_Id) => {
    let param = convertObjectToUrlParams({
      tits_qtsx_SanPham_Id,
      donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_OEM/export-file-mau?${param}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("FileMauImportChiTietOEM", res.data.dataexcel);
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
          .trim() === "Mã vật tư/chi tiết" &&
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
          .trim() === "Tên vật tư/chi tiết" &&
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
          .trim() === "Mã đơn vị tính" &&
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
          .trim() === "Vật liệu" &&
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
          .trim() === "Số lượng" &&
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
          .trim() === "Mã xưởng nhận" &&
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
          .trim() === "Ghi chú";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });

        const MVTCT = "Mã vật tư/chi tiết";
        const TVTCT = "Tên vật tư/chi tiết";
        const MDVT = "Mã đơn vị tính";
        const TSKT = "Thông số kỹ thuật";
        const VL = "Vật liệu";
        const DM = "Số lượng";
        const MXN = "Mã xưởng nhận";
        const MT = "Ghi chú";

        const Data = [];
        const NewData = [];
        data.forEach((d, index) => {
          if (
            data[index][TVTCT] &&
            data[index][TVTCT].toString().trim() === ""
          ) {
          } else {
            NewData.push({
              maVatTuChiTiet: data[index][MVTCT]
                ? data[index][MVTCT].toString().trim() !== ""
                  ? data[index][MVTCT].toString().trim()
                  : null
                : null,
              tenVatTuChiTiet: data[index][TVTCT]
                ? data[index][TVTCT].toString().trim() !== ""
                  ? data[index][TVTCT].toString().trim()
                  : null
                : null,
              maDonViTinh: data[index][MDVT]
                ? data[index][MDVT].toString().trim() !== ""
                  ? data[index][MDVT].toString().trim()
                  : null
                : null,
              thongSoKyThuat: data[index][TSKT]
                ? data[index][TSKT].toString().trim() !== ""
                  ? data[index][TSKT].toString().trim()
                  : null
                : null,
              vatLieu: data[index][VL]
                ? data[index][VL].toString().trim() !== ""
                  ? data[index][VL].toString().trim()
                  : null
                : null,
              dinhMuc: data[index][DM]
                ? data[index][DM].toString().trim() !== ""
                  ? data[index][DM].toString().trim()
                  : null
                : null,
              maXuong: data[index][MXN]
                ? data[index][MXN].toString().trim() !== ""
                  ? data[index][MXN].toString().trim()
                  : null
                : null,
              hinhAnh: null,
              moTa: data[index][MT]
                ? data[index][MT].toString().trim() !== ""
                  ? data[index][MT].toString().trim()
                  : null
                : null,
              ghiChuImport: null,
            });
          }
          Data.push(data[index][TVTCT]);
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
            setMessageError(
              `Hàng ${row.join(", ")} có vật tư/chi tiết trùng nhau`
            );
            Helper.alertError(
              `Hàng ${row.join(", ")} có vật tư/chi tiết trùng nhau`
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
    const newData = dataView.map((dataview) => {
      if (dataview.hinhAnh) {
        const formData = new FormData();
        formData.append("file", dataview.hinhAnh);
        return fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            return {
              ...dataview,
              hinhAnh: data.path,
            };
          });
      } else {
        return dataview;
      }
    });

    Promise.all(newData).then((Data) => {
      const newListSanPham = {
        donVi_Id: INFO.donVi_Id,
        list_SanPhams: Data,
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
              (item) => item.maVatTuChiTiet === data.maVatTuChiTiet
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
        }
      });
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
      HangTrung.forEach((maVatTuChiTiet) => {
        if (current.maVatTuChiTiet === maVatTuChiTiet) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.maVatTuChiTiet === null) {
      setCheckDanger(true);
      setMessageError("Mã vật tư/chi tiết không được rỗng");
      return "red-row";
    } else if (current.tenVatTuChiTiet === null) {
      setCheckDanger(true);
      setMessageError("Tên vật tư/chi tiết không được rỗng");
      return "red-row";
    } else if (current.maDonViTinh === null) {
      setCheckDanger(true);
      setMessageError("Mã đơn vị tính không được rỗng");
      return "red-row";
    } else if (current.vatLieu === null) {
      setCheckDanger(true);
      setMessageError("Vật liệu không được rỗng");
      return "red-row";
    } else if (DataLoi && DataLoi.length > 0) {
      let check = false;
      DataLoi.forEach((dt) => {
        if (
          current.maVatTuChiTiet.toString() === dt.maVatTuChiTiet.toString()
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
      title="Import sản phẩm"
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row style={{ marginTop: 10 }}>
            <Col
              xxl={2}
              xl={3}
              lg={4}
              md={4}
              sm={6}
              xs={7}
              style={{ marginTop: 10 }}
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
                onClick={() => TaiFileMau(itemData, INFO.donVi_Id)}
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

export default DanhSachImport;
