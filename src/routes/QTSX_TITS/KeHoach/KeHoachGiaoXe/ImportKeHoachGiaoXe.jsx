import {
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import {
  DatePicker,
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
import { map, includes } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { Modal } from "src/components/Common";
import {
  convertObjectToUrlParams,
  exportExcel,
  getNamNow,
  getNumberDayOfMonth,
  getThangNow,
  reDataForTable,
} from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportKeHoachGiaoXe({ match, permission, history }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [dataView, setDataView] = useState([]);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [HangTrung, setHangTrung] = useState([]);
  const [DataLoi, setDataLoi] = useState();
  const [message, setMessageError] = useState([]);
  const [Thang, setThang] = useState(getThangNow());
  const [Nam, setNam] = useState(getNamNow());

  useEffect(() => {
    if (includes(match.url, "import")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else if (permission && permission.add) {
      }
    }

    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const render = (val) => {
    if (val === undefined) {
      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          -
        </div>
      );
    } else {
      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {val}
        </div>
      );
    }
  };
  const renderLoi = (val) => {
    let check = false;
    let messageLoi = "";
    if (DataLoi && DataLoi.length > 0) {
      DataLoi.forEach((dt) => {
        if (dt.maSanPham === val) {
          check = true;
          messageLoi = dt.ghiChuImport;
        }
      });
    }
    return check ? (
      <Popover content={<span style={{ color: "red" }}>{messageLoi}</span>}>
        <span style={{ fontWeight: "bold" }}>{val}</span>
      </Popover>
    ) : (
      <span>{val}</span>
    );
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
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      width: 120,
      render: (val) => renderLoi(val),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      align: "center",
      key: "tenSanPham",
      width: 120,
    },
    {
      title: `Tháng ${Thang} năm ${Nam}`,
      children: new Array(getNumberDayOfMonth(Thang, Nam))
        .fill(null)
        .map((_, i) => {
          const id = String(i + 1);
          return {
            title: id,
            dataIndex: `${id}`,
            key: `${id}`,
            align: "center",
            width: 40,
            render: (val) => render(val),
          };
        }),
    },
    {
      title: "Tổng",
      dataIndex: "tong",
      align: "center",
      key: "tong",
      width: 60,
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
    const params = convertObjectToUrlParams({
      IsSanXuat: false,
      thang: Thang,
      nam: Nam,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KeHoach/export-file-mau?${params}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel(`File_Mau_Ke_Hoach_Giao_Xe`, res.data.dataexcel);
    });
  };
  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Kế hoạch"];
      let checkMau =
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
          .trim() === "Mã sản phẩm" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 2, r: 3 }, e: { c: 2, r: 3 } },
        })[0] &&
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
          .trim() === "Tên sản phẩm";
      if (checkMau) {
        for (let index = 1; index <= getNumberDayOfMonth(Thang, Nam); index++) {
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: {
                s: { c: 2 + index, r: 3 },
                e: { c: 2 + index, r: 3 },
              },
            })[0] &&
            XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: {
                  s: { c: 2 + index, r: 3 },
                  e: { c: 2 + index, r: 3 },
                },
              })[0]
              .toString()
              .trim() !== index.toString()
          ) {
            checkMau = false;
          }
        }
      }
      if (!checkMau) {
        setFileName(file.name);
        setDataView([]);
        setCheckDanger(true);
        setMessageError("Mẫu import không hợp lệ");
        Helper.alertError("Mẫu file import không hợp lệ");
      } else {
        const checkKeHoach =
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 1 }, e: { c: 1, r: 1 } },
          })[0] &&
          XLSX.utils
            .sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: 1, r: 1 }, e: { c: 1, r: 1 } },
            })[0]
            .toString()
            .trim() === "Loại kế hoạch" &&
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 1 }, e: { c: 2, r: 1 } },
          })[0] &&
          XLSX.utils
            .sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: 2, r: 1 }, e: { c: 2, r: 1 } },
            })[0]
            .toString()
            .trim() === "Kế hoạch giao hàng";
        if (!checkKeHoach) {
          setFileName(file.name);
          setDataView([]);
          setCheckDanger(true);
          setMessageError("Kế hoạch không hợp lệ");
          Helper.alertError("Kế hoạch không hợp lệ");
        } else {
          const checkThangNam =
            XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: 3, r: 1 }, e: { c: 3, r: 1 } },
              })[0]
              .toString()
              .trim() === "Tháng:" &&
            XLSX.utils
              .sheet_to_json(worksheet, {
                header: 1,
                range: { s: { c: 5, r: 1 }, e: { c: 5, r: 1 } },
              })[0]
              .toString()
              .trim().length === 1
              ? "0" +
                XLSX.utils
                  .sheet_to_json(worksheet, {
                    header: 1,
                    range: { s: { c: 5, r: 1 }, e: { c: 5, r: 1 } },
                  })[0]
                  .toString()
                  .trim()
              : XLSX.utils
                  .sheet_to_json(worksheet, {
                    header: 1,
                    range: { s: { c: 5, r: 1 }, e: { c: 5, r: 1 } },
                  })[0]
                  .toString()
                  .trim() === Thang.toString() &&
                XLSX.utils
                  .sheet_to_json(worksheet, {
                    header: 1,
                    range: { s: { c: 7, r: 1 }, e: { c: 7, r: 1 } },
                  })[0]
                  .toString()
                  .trim() === "Năm:" &&
                XLSX.utils
                  .sheet_to_json(worksheet, {
                    header: 1,
                    range: { s: { c: 9, r: 1 }, e: { c: 9, r: 1 } },
                  })[0]
                  .toString()
                  .trim() === Nam.toString();
          if (!checkThangNam) {
            setFileName(file.name);
            setDataView([]);
            setCheckDanger(true);
            setMessageError("Tháng Năm không hợp lệ");
            Helper.alertError("Tháng Năm không hợp lệ");
          } else {
            const data = XLSX.utils.sheet_to_json(worksheet, {
              range: 3,
            });
            const MSP = "Mã sản phẩm";
            const TSP = "Tên sản phẩm";
            const Data = [];
            const NewData = [];
            data.forEach((d, index) => {
              if (
                d[MSP] &&
                d[MSP].toString().trim() === "" &&
                d[TSP] &&
                d[TSP].toString().trim() === ""
              ) {
              } else {
                const slNgay = {};
                let tong = 0;
                for (
                  let index = 1;
                  index <= getNumberDayOfMonth(Thang, Nam);
                  index++
                ) {
                  if (d[index]) {
                    slNgay[index] = d[index];
                    tong = tong + d[index];
                  }
                }
                NewData.push({
                  maSanPham: d[MSP]
                    ? d[MSP].toString().trim() !== ""
                      ? d[MSP].toString().trim()
                      : undefined
                    : undefined,
                  tenSanPham: d[TSP]
                    ? d[TSP].toString().trim() !== ""
                      ? d[TSP].toString().trim()
                      : undefined
                    : undefined,
                  ...slNgay,
                  tong: tong,
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
              setDataView(NewData);
              setFileName(file.name);
              setDataLoi();
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
              if (indices.length > 0) {
                setMessageError(
                  `Hàng ${row.join(", ")} có mã sản phẩm trùng nhau`
                );
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
          }
        }
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
    const newData = {
      isSanXuat: false,
      nam: Nam,
      thang: Thang,
      list_SanPhams: dataView.map((dt) => {
        return {
          maSanPham: dt.maSanPham,
          list_ChiTiets: Array.from(
            { length: getNumberDayOfMonth(Thang, Nam) },
            (_, i) => {
              return {
                ngay: i + 1,
                soLuong: dt[i + 1] ? dt[i + 1] : 0,
              };
            }
          ),
        };
      }),
    };

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KeHoach/import-excel`,
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
        setMessageError("Import không thành công");
      } else {
        setFileName("");
        setDataView([]);
      }
    });
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import kế hoạch giao xe",
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
    } else if (current.maSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Mã sản phẩm không được rỗng");
      return "red-row";
    } else if (current.tenSanPham === undefined) {
      setCheckDanger(true);
      setMessageError("Tên sản phẩm không được rỗng");
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
      }
    } else {
      let check = false;
      for (let index = 1; index <= getNumberDayOfMonth(Thang, Nam); index++) {
        if (current[index]) {
          check = true;
        }
      }
      if (!check) {
        setCheckDanger(true);
        setMessageError(`Số lượng kế hoạch không được rỗng`);
        return "red-row";
      }
    }
  };
  /**
   * Quay lại trang kế hoạch
   *
   */
  const goBack = () => {
    history.push(`${match.url.replace("/import", "")}`);
  };
  const formTitle = "Import kế hoạch giao xe";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={8}
            md={8}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Tháng:</h5>
            <DatePicker
              allowClear={false}
              format={"MM/YYYY"}
              style={{ width: "100%" }}
              placeholder="Chọn tháng"
              picker="month"
              value={moment(Thang + "/" + Nam, "MM/YYYY")}
              onChange={(date, dateString) => {
                setThang(dateString.split("/")[0]);
                setNam(dateString.split("/")[1]);
              }}
              disabled={fileName !== ""}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: 10 }}>
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
                        setFileName("");
                        setCheckDanger(false);
                        setDataLoi([]);
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
          scroll={{ x: 1500, y: "60vh" }}
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
  );
}

export default ImportKeHoachGiaoXe;
