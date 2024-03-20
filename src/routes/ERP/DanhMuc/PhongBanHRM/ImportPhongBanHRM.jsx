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

function ImportPhongBan({ openModalFS, openModal, loading, refresh }) {
  const dispatch = useDispatch();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [DataLoi, setDataLoi] = useState();
  const [HangTrung, setHangTrung] = useState([]);
  const [message, setMessageError] = useState([]);
  const [IsLoi, setIsLoi] = useState(false);

  let colValues = () => {
    const col = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 50,
        align: "center",
      },
      {
        title: "Mã phòng ban trực thuộc",
        dataIndex: "maPhongBanHRM",
        key: "maPhongBanHRM",
        align: "center",
      },
      {
        title: "Khối",
        dataIndex: "khoi",
        align: "center",
        key: "khoi",
      },
      {
        title: "Đơn vị",
        dataIndex: "tenDonViHRM",
        align: "center",
        key: "tenDonViHRM",
      },
      {
        title: "Mã Đơn vị Đào tạo",
        dataIndex: "maDonVi",
        align: "center",
        key: "maDonVi",
      },
      {
        title: "Cấp 1",
        dataIndex: "tenCapDoPhongBanBoPhanLevel1",
        align: "center",
        key: "tenCapDoPhongBanBoPhanLevel1",
      },
      {
        title: "Cấp 2",
        dataIndex: "tenCapDoPhongBanBoPhanLevel2",
        align: "center",
        key: "tenCapDoPhongBanBoPhanLevel2",
      },
      {
        title: "Cấp 3",
        dataIndex: "tenCapDoPhongBanBoPhanLevel3",
        align: "center",
        key: "tenCapDoPhongBanBoPhanLevel3",
      },
      {
        title: "Cấp 4",
        dataIndex: "tenCapDoPhongBanBoPhanLevel4",
        align: "center",
        key: "tenCapDoPhongBanBoPhanLevel4",
      },
      {
        title: "Cấp 5",
        dataIndex: "tenCapDoPhongBanBoPhanLevel5",
        align: "center",
        key: "tenCapDoPhongBanBoPhanLevel5",
      },
      {
        title: "Cấp 6",
        dataIndex: "tenCapDoPhongBanBoPhanLevel6",
        align: "center",
        key: "tenCapDoPhongBanBoPhanLevel6",
      },
      {
        title: "Cấp 7",
        dataIndex: "tenCapDoPhongBanBoPhanLevel7",
        align: "center",
        key: "tenCapDoPhongBanBoPhanLevel7",
      },
      {
        title: "Cấp 8",
        dataIndex: "tenCapDoPhongBanBoPhanLevel8",
        align: "center",
        key: "tenCapDoPhongBanBoPhanLevel8",
      },
    ];
    if (IsLoi) {
      col.splice(0, 0, {
        title: "Lỗi",
        dataIndex: "ghiChuImport",
        key: "ghiChuImport",
        align: "center",
      });
    }
    return col;
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues(), (col) => {
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
          `PhongBanHRM/file-mau-import`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("File_Mau_Ban_Phong", res.data.dataexcel);
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
            range: { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } },
          })[0]
          .toString()
          .trim() === "Check" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 0 }, e: { c: 1, r: 0 } },
          })[0]
          .toString()
          .trim() === "Mã phòng ban trực thuộc" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 0 }, e: { c: 2, r: 0 } },
          })[0]
          .toString()
          .trim() === "Khối" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 0 }, e: { c: 3, r: 0 } },
          })[0]
          .toString()
          .trim() === "Đơn vị" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 0 }, e: { c: 4, r: 0 } },
          })[0]
          .toString()
          .trim() === "Mã Đơn vị Đào tạo" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 0 }, e: { c: 5, r: 0 } },
          })[0]
          .toString()
          .trim() === "Cấp 1" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 0 }, e: { c: 6, r: 0 } },
          })[0]
          .toString()
          .trim() === "Cấp 2" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 0 }, e: { c: 7, r: 0 } },
          })[0]
          .toString()
          .trim() === "Cấp 3" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 0 }, e: { c: 8, r: 0 } },
          })[0]
          .toString()
          .trim() === "Cấp 4" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 0 }, e: { c: 9, r: 0 } },
          })[0]
          .toString()
          .trim() === "Cấp 5" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 0 }, e: { c: 10, r: 0 } },
          })[0]
          .toString()
          .trim() === "Cấp 6" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 11, r: 0 }, e: { c: 11, r: 0 } },
          })[0]
          .toString()
          .trim() === "Cấp 7" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 12, r: 0 }, e: { c: 12, r: 0 } },
          })[0]
          .toString()
          .trim() === "Cấp 8";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 0,
        });
        if (data.length === 0) {
          setFileName(file.name);
          setDataView([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const NewData = [];
          data.forEach((d) => {
            if (
              d["Mã phòng ban trực thuộc"] &&
              d["Mã phòng ban trực thuộc"].toString().trim() === "" &&
              d["Đơn vị"] &&
              d["Đơn vị"].toString().trim() === "" &&
              d["Mã Đơn vị Đào tạo"] &&
              d["Mã Đơn vị Đào tạo"].toString().trim() === "" &&
              d["Cấp 1"] &&
              d["Cấp 1"].toString().trim() === ""
            ) {
            } else {
              NewData.push({
                maPhongBanHRM: d["Mã phòng ban trực thuộc"]
                  ? d["Mã phòng ban trực thuộc"].toString().trim() !== ""
                    ? d["Mã phòng ban trực thuộc"].toString().trim()
                    : undefined
                  : undefined,
                khoi: d["Khối"]
                  ? d["Khối"].toString().trim() !== ""
                    ? d["Khối"].toString().trim()
                    : undefined
                  : undefined,
                tenDonViHRM: d["Đơn vị"]
                  ? d["Đơn vị"].toString().trim() !== ""
                    ? d["Đơn vị"].toString().trim()
                    : undefined
                  : undefined,
                maDonVi: d["Mã Đơn vị Đào tạo"]
                  ? d["Mã Đơn vị Đào tạo"].toString().trim() !== ""
                    ? d["Mã Đơn vị Đào tạo"].toString().trim()
                    : undefined
                  : undefined,
                tenCapDoPhongBanBoPhanLevel1: d["Cấp 1"]
                  ? d["Cấp 1"].toString().trim() !== ""
                    ? d["Cấp 1"].toString().trim()
                    : undefined
                  : undefined,
                tenCapDoPhongBanBoPhanLevel2: d["Cấp 2"]
                  ? d["Cấp 2"].toString().trim() !== ""
                    ? d["Cấp 2"].toString().trim()
                    : undefined
                  : undefined,
                tenCapDoPhongBanBoPhanLevel3: d["Cấp 3"]
                  ? d["Cấp 3"].toString().trim() !== ""
                    ? d["Cấp 3"].toString().trim()
                    : undefined
                  : undefined,
                tenCapDoPhongBanBoPhanLevel4: d["Cấp 4"]
                  ? d["Cấp 4"].toString().trim() !== ""
                    ? d["Cấp 4"].toString().trim()
                    : undefined
                  : undefined,
                tenCapDoPhongBanBoPhanLevel5: d["Cấp 5"]
                  ? d["Cấp 5"].toString().trim() !== ""
                    ? d["Cấp 5"].toString().trim()
                    : undefined
                  : undefined,
                tenCapDoPhongBanBoPhanLevel6: d["Cấp 6"]
                  ? d["Cấp 6"].toString().trim() !== ""
                    ? d["Cấp 6"].toString().trim()
                    : undefined
                  : undefined,
                tenCapDoPhongBanBoPhanLevel7: d["Cấp 7"]
                  ? d["Cấp 7"].toString().trim() !== ""
                    ? d["Cấp 7"].toString().trim()
                    : undefined
                  : undefined,
                tenCapDoPhongBanBoPhanLevel8: d["Cấp 8"]
                  ? d["Cấp 8"].toString().trim() !== ""
                    ? d["Cấp 8"].toString().trim()
                    : undefined
                  : undefined,
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
            let check = false;
            for (let i = 0; i < NewData.length; i++) {
              for (let j = i + 1; j < NewData.length; j++) {
                if (
                  NewData[i].maPhongBanHRM === NewData[j].maPhongBanHRM &&
                  NewData[j].maPhongBanHRM !== undefined &&
                  NewData[i].maPhongBanHRM !== undefined
                ) {
                  NewData[j].ghiChuImport = "Mã Ban/Phòng trùng nhau";
                  NewData[i].ghiChuImport = "Mã Ban/Phòng trùng nhau";
                  setIsLoi(true);
                  setCheckDanger(true);
                  Helper.alertError(`Mã nhân viên trùng nhau`);
                  setMessageError(`Mã nhân viên trùng nhau`);
                  check = true;
                }
              }
            }
            if (!check) {
              setIsLoi(false);
              setCheckDanger(false);
            }
            setDataView(NewData);
            setFileName(file.name);
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
    setCheckDanger(true);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongbanHRM`,
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
          res.data.forEach((dt) => {
            dataView.forEach((dtv) => {
              if (dt.maPhongBanHRM === dtv.maPhongBanHRM) {
                dtv.ghiChuImport = dt.ghiChuImport;
              }
            });
          });
          setIsLoi(true);
          setCheckDanger(true);
          setDataView([...dataView]);
          setMessageError("Import không thành công !!!");
          Helper.alertError("Import không thành công !!!");
        } else if (res.status === 200) {
          setFileName(null);
          setDataView([]);
          openModalFS(false);
          setCheckDanger(false);
          refresh();
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import Ban/Phòng",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (current.ghiChuImport && IsLoi) {
      setCheckDanger(true);
      return "red-row";
    } else if (current.maPhongBanHRM === undefined) {
      setCheckDanger(true);
      setMessageError("Mã phòng ban trực thuộc không được rỗng");
      return "red-row";
    } else if (current.tenDonViHRM === undefined) {
      setCheckDanger(true);
      setMessageError("Đơn vị không được rỗng");
      return "red-row";
    } else if (current.maDonVi === undefined) {
      setCheckDanger(true);
      setMessageError("Mã Đơn vị Đào tạo không được rỗng");
      return "red-row";
    }
  };

  const handleCancel = () => {
    if (checkDanger === true) {
      openModalFS(false);
      setCheckDanger(false);
      setFileName(null);
      setDataView([]);
      refresh();
    } else {
      refresh();
      openModalFS(false);
    }
  };
  return (
    <AntModal
      title="Import Ban/Phòng"
      open={openModal}
      width={`100%`}
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
            scroll={{ x: 1400, y: "65vh" }}
            columns={columns}
            components={components}
            className="gx-table-responsive  gx-table-resize"
            dataSource={reDataForTable(dataView)}
            size="small"
            loading={loading}
            rowClassName={RowStyle}
            pagination={false}
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

export default ImportPhongBan;
