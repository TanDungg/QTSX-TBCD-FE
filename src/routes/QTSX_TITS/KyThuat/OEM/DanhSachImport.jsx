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
  createGuid,
  exportExcel,
} from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";
const { EditableRow, EditableCell } = EditableTableRow;

function DanhSachImport({ openModalFS, openModal, DanhSachChiTiet, itemData }) {
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
  const [message, setMessageError] = useState([]);
  const [FileAnh, setFileAnh] = useState(null);
  const [OpenImage, setOpenImage] = useState(false);

  const handleViewFile = () => {
    setOpenImage(true);
  };

  const handleUploadFile = (file, index) => {
    const isPNG = file.type === "image/png" || file.type === "image/jpeg";
    if (!isPNG) {
      Helper.alertError(`${file.name} không phải hình ảnh`);
    } else {
      const newData = dataView.map((data) => {
        if (data.id === index.id) {
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
    const trunglap = HangTrung.find(
      (item) => item.maVatTuChiTiet === record.maVatTuChiTiet
    );
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
              if (data.id === record.id) {
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
            color: trunglap ? "red" : "",
            borderColor: trunglap ? "red" : "",
          }}
          icon={<UploadOutlined />}
          disabled={checkDanger ? true : false}
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
      render: (record) => renderHinhAnh(record),
      width: 200,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
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
      const worksheet = workbook.Sheets["Import OEM"];

      const checkMau =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 3 }, e: { c: 0, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 0, r: 3 }, e: { c: 0, r: 3 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 1, r: 3 }, e: { c: 1, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 3 }, e: { c: 1, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã vật tư/chi tiết" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 2, r: 3 }, e: { c: 2, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 3 }, e: { c: 2, r: 3 } },
          })[0]
          .toString()
          .trim() === "Tên vật tư/chi tiết" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 3, r: 3 }, e: { c: 3, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 3 }, e: { c: 3, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị tính" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 4, r: 3 }, e: { c: 4, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 3 }, e: { c: 4, r: 3 } },
          })[0]
          .toString()
          .trim() === "Thông số kỹ thuật" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 5, r: 3 }, e: { c: 5, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 3 }, e: { c: 5, r: 3 } },
          })[0]
          .toString()
          .trim() === "Vật liệu" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 6, r: 3 }, e: { c: 6, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 3 }, e: { c: 6, r: 3 } },
          })[0]
          .toString()
          .trim() === "Số lượng" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 7, r: 3 }, e: { c: 7, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 3 }, e: { c: 7, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã xưởng nhận" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 8, r: 3 }, e: { c: 8, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 3 }, e: { c: 8, r: 3 } },
          })[0]
          .toString()
          .trim() === "Ghi chú";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
        });
        const KEY = "STT";
        const MVTCT = "Mã vật tư/chi tiết";
        const TVTCT = "Tên vật tư/chi tiết";
        const MDVT = "Mã đơn vị tính";
        const TSKT = "Thông số kỹ thuật";
        const VL = "Vật liệu";
        const DM = "Số lượng";
        const MXN = "Mã xưởng nhận";
        const MT = "Ghi chú";

        const DataChiTiet = [];
        const DataVatTu = [];
        const NewData = [];
        data.forEach((d, index) => {
          if (
            data[index][KEY] &&
            data[index][KEY].toString().trim() === "" &&
            data[index][MVTCT] &&
            data[index][MVTCT].toString().trim() === "" &&
            data[index][TVTCT] &&
            data[index][TVTCT].toString().trim() === ""
          ) {
          } else {
            NewData.push({
              id: createGuid(),
              key: data[index][KEY]
                ? data[index][KEY].toString().trim() !== ""
                  ? data[index][KEY].toString().trim()
                  : null
                : null,
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
        });

        const ListChiTiet = [];
        let children = null;

        NewData.forEach((data) => {
          if (data.key === "*") {
            children = { ...data, list_VatTus: [] };
            ListChiTiet.push(children);
            DataChiTiet.push({
              tenVatTuChiTiet: data.tenVatTuChiTiet,
              maVatTuChiTiet: data.maVatTuChiTiet,
            });
          } else if (children) {
            children.list_VatTus.push(data);
            DataVatTu.push({
              tenVatTuChiTiet: children.tenVatTuChiTiet,
              maVatTuChiTiet: data.maVatTuChiTiet,
            });
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
          if (DataChiTiet) {
            if (!indices.length && DataChiTiet) {
              if (DataChiTiet) {
                const data = DataChiTiet;
                for (let i = 0; i < data.length - 1; i++) {
                  for (let j = i + 1; j < data.length; j++) {
                    if (
                      data[i].tenVatTuChiTiet === data[j].tenVatTuChiTiet &&
                      data[i].maVatTuChiTiet === data[j].maVatTuChiTiet
                    ) {
                      const isDuplicate = indices.some(
                        (item) =>
                          item.tenVatTuChiTiet === data[i].tenVatTuChiTiet &&
                          item.maVatTuChiTiet === data[i].maVatTuChiTiet
                      );

                      if (!isDuplicate) {
                        indices.push(data[i]);
                      }
                    }
                  }
                }
              }
            }
            setDataView(NewData);
            setFileName(file.name);
            if (indices.length > 0) {
              const item = indices
                .map((item) => item.maVatTuChiTiet)
                .join(", ");
              setMessageError(`Chi tiết ${item} đã bị lặp`);
              Helper.alertError(`Chi tiết ${item} đã bị lặp`);
              setHangTrung(indices);
              setCheckDanger(true);
            }
          }
          if (!indices.length && DataVatTu) {
            if (DataVatTu) {
              const data = DataVatTu;
              for (let i = 0; i < data.length - 1; i++) {
                for (let j = i + 1; j < data.length; j++) {
                  if (
                    data[i].tenVatTuChiTiet === data[j].tenVatTuChiTiet &&
                    data[i].maVatTuChiTiet === data[j].maVatTuChiTiet
                  ) {
                    const isDuplicate = indices.some(
                      (item) =>
                        item.tenVatTuChiTiet === data[i].tenVatTuChiTiet &&
                        item.maVatTuChiTiet === data[i].maVatTuChiTiet
                    );

                    if (!isDuplicate) {
                      indices.push(data[i]);
                    }
                  }
                }
              }
            }

            setDataView(NewData);
            setFileName(file.name);
            if (indices.length > 0) {
              const item = indices
                .map((item) => item.maVatTuChiTiet)
                .join(", ");
              setMessageError(`Vật tư ${item} đã bị lặp`);
              Helper.alertError(`Vật tư ${item} đã bị lặp`);
              setHangTrung(indices);
              setCheckDanger(true);
            }
          }
          if (!indices.length && !DataVatTu) {
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
        setCheckDanger(false);
        return false;
      }
    },

    showUploadList: false,
    maxCount: 1,
  };

  const XacNhanImport = () => {
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
      DanhSachChiTiet(Data);
      setFileName(null);
      setDataView([]);
      openModalFS(false);
    });
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import chi tiết/vật tư",
    onOk: XacNhanImport,
  };

  const modalXK = () => {
    Modal(prop);
  };
  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      const trunglap = HangTrung.find(
        (item) => item.maVatTuChiTiet === current.maVatTuChiTiet
      );

      if (trunglap) {
        setCheckDanger(true);
        return "red-row";
      }
    } else if (current.STT === null) {
      setCheckDanger(true);
      setMessageError("STT không được rỗng");
      return "red-row";
    } else if (current.STT === "*" && current.tenVatTuChiTiet === null) {
      setCheckDanger(true);
      setMessageError("Tên chi tiết không được rỗng");
      return "red-row";
    } else if (current.STT !== "*" && current.maVatTuChiTiet === null) {
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
      title="Import chi tiết/vật tư"
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
            scroll={{ x: 900, y: "40vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={dataView}
            size="small"
            rowClassName={RowStyle}
            pagination={false}
            // loading={loading}
          />
          <Button
            className="th-margin-bottom-0"
            style={{ marginTop: 10, float: "right" }}
            type="primary"
            onClick={modalXK}
            disabled={dataView.length > 0 && checkDanger}
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
