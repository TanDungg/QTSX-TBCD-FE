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
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { Modal, Select } from "src/components/Common";
import { exportExcel, reDataForTable } from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportSoDuDauKy({ openModalFS, openModal, loading, refesh }) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const [message, setMessageError] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [Disable, setDisable] = useState(true);
  const [Kho, setKho] = useState("");

  useEffect(() => {
    if (openModal) {
      getKho();
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);
  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=1&&isThanhPham=false`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListKho(res.data);
        } else {
          setListKho([]);
        }
      })
      .catch((error) => console.error(error));
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
      title: "Mã vật tư/Mã sản phẩm",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư/Tên sản phẩm",
      dataIndex: "tenVatTu",
      align: "center",
      key: "tenVatTu",
    },
    {
      title: "Mã màu sắc",
      dataIndex: "maMauSac",
      align: "center",
      key: "maMauSac",
    },
    {
      title: "Số lượng",
      dataIndex: "soLuongNhap",
      align: "center",
      key: "soLuongNhap",
    },
    {
      title: "Thời gian sử dụng",
      dataIndex: "thoiGianSuDung",
      align: "center",
      key: "thoiGianSuDung",
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
          `lkn_SoDuDauKy/export-file-mau`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Import_So_Du_Dau_Ky_Vat_Tu", res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Số dư đầu kì"];

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
          .trim() === "Mã vật tư/Mã sản phẩm" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 2 }, e: { c: 2, r: 2 } },
          })[0]
          .toString()
          .trim() === "Tên vật tư/Tên sản phẩm" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 2 }, e: { c: 3, r: 2 } },
          })[0]
          .toString()
          .trim() === "Mã màu sắc" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 2 }, e: { c: 4, r: 2 } },
          })[0]
          .toString()
          .trim() === "Số lượng" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 2 }, e: { c: 5, r: 2 } },
          })[0]
          .toString()
          .trim() === "Thời gian sử dụng";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 2,
        });
        const TVT = "Mã vật tư/Mã sản phẩm";
        const MVT = "Tên vật tư/Tên sản phẩm";
        const MMS = "Mã màu sắc";
        const SL = "Số lượng";
        const TGSD = "Thời gian sử dụng";
        const Data = [];
        const NewData = [];
        data.forEach((d, index) => {
          if (d[TVT] && d[MVT] && d[SL]) {
            NewData.push({
              maVatTu: d[TVT]
                ? d[TVT].toString().trim() !== ""
                  ? d[TVT].toString().trim()
                  : undefined
                : undefined,
              tenVatTu: d[MVT]
                ? d[MVT].toString().trim() !== ""
                  ? d[MVT].toString().trim()
                  : undefined
                : undefined,
              maMauSac: d[MMS]
                ? d[MMS].toString().trim() !== ""
                  ? d[MMS].toString().trim()
                  : undefined
                : undefined,
              soLuongNhap: d[SL]
                ? d[SL].toString().trim() !== ""
                  ? d[SL].toString().trim()
                  : undefined
                : undefined,
              thoiGianSuDung: d[TGSD]
                ? d[TGSD].toString().trim() !== ""
                  ? d[TGSD].toString().trim()
                  : undefined
                : undefined,
            });
          }
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
            setMessageError(`Hàng ${row.join(", ")} có vật tư trùng nhau`);
            Helper.alertError(`Hàng ${row.join(", ")} có vật tư trùng nhau`);
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
    const newData = {
      cauTrucKho_Id: Kho,
      list_ChiTiets: dataView,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_SoDuDauKy/import`,
          "POST",
          newData,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res.status === 409) {
        setDataLoi(res.data);
        setMessageError(res.data.ghiChuImport);
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
    title: "Xác nhận import số dư đầu kỳ",
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
    } else if (current.maVatTu === undefined) {
      setCheckDanger(true);
      setMessageError("Mã vật tư không được rỗng");
      return "red-row";
    } else if (current.tenVatTu === undefined) {
      setCheckDanger(true);
      setMessageError("Tên vật tư không được rỗng");
      return "red-row";
    } else if (current.soLuongNhap === undefined) {
      setCheckDanger(true);
      setMessageError("Số lượng không được rỗng");
      return "red-row";
    } else if (DataLoi) {
      if (current.maVatTu.toString() === DataLoi.maVatTu) {
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
  const handleOnSelectKho = (val) => {
    setKho(val);
    setDisable(false);
  };
  return (
    <AntModal
      title="Import số dư đầu kỳ"
      open={openModal}
      width={`80%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row>
            <Col xxl={4} xl={5} lg={7} md={7} xs={17}>
              <h5>Kho</h5>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListKho ? ListKho : []}
                placeholder="Chọn kho"
                optionsvalue={["id", "tenCTKho"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectKho}
                value={Kho}
              />
            </Col>

            <Col xxl={4} xl={5} lg={7} md={7} xs={17}>
              <h5>Import</h5>
              <Upload {...props}>
                <Button
                  icon={<UploadOutlined />}
                  disabled={Disable}
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
              <h5>Tải file mẫu</h5>
              <Button
                icon={<DownloadOutlined />}
                onClick={TaiFileMau}
                className="th-btn-margin-bottom-0"
                type="primary"
                disabled={Disable}
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

export default ImportSoDuDauKy;
