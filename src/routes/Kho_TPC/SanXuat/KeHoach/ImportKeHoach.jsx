import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Upload,
  Alert,
  Popover,
} from "antd";
import { messages } from "src/constants/Messages";
import Helper from "src/helpers";

import map from "lodash/map";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { Modal, Select } from "src/components/Common";
import {
  getNumberDayOfMonth,
  reDataForTable,
  removeDiacritics,
} from "src/util/Common";
import * as XLSX from "xlsx";

import { EditableTableRow, Table } from "src/components/Common";
import { getNamNow, getThangNow } from "src/util/Common";
import { BASE_URL_APP } from "src/constants/Config";
const { EditableRow, EditableCell } = EditableTableRow;

function ImportKeHoachSanXuat({ history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [dataView, setDataView] = useState([]);
  const [fileValid, setFileValid] = useState(true);
  const [fileName, setFileName] = useState("");
  const [checkDanger, setCheckDanger] = useState(false);
  const [Thang, setThang] = useState(getThangNow());
  const [Nam, setNam] = useState(getNamNow());
  const [ThangNam, setThangNam] = useState(`${Thang}/${Nam}`);
  const [KeHoach, setKeHoach] = useState("khsx");
  const [SanPham, setSanPham] = useState([]);
  const [activeSave, setActiveSave] = useState(false);
  const [rowError, setRowError] = useState([]);
  const [HangTrung, setHangTrung] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getSanPham();
    } else if (permission && !permission.view) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(fetchStart(`Xe`, "GET", null, "DETAIL", "", resolve, reject));
    })
      .then((res) => {
        if (res && res.data) {
          setSanPham(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Save item from table
   * @param {object} row
   * @memberof ChucNang
   */
  const handleSave = async (row) => {};
  const render = (val) => {
    if (val == 0) {
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
      dataIndex: "maSP",
      key: "maSP",
      align: "center",
      width: 150,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSP",
      align: "center",
      key: "tenSP",
      width: 150,
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
        handleSave: handleSave,
      }),
    };
  });

  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const checkMau =
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } },
        })[0] == "Loại kế hoạch:" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 1 }, e: { c: 0, r: 1 } },
        })[0] == "Tháng:" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 2 }, e: { c: 0, r: 2 } },
        })[0] == "Năm:" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 0, r: 3 }, e: { c: 0, r: 3 } },
        })[0] == "Mã SP" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 1, r: 3 }, e: { c: 1, r: 3 } },
        })[0] == "Tên SP";

      let thang = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: { s: { c: 1, r: 1 }, e: { c: 1, r: 1 } },
      });
      const kiemTraMau = () => {
        for (let i = 1; i <= getNumberDayOfMonth(thang[0]); i++) {
          const a = i + 1;
          if (
            XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: { s: { c: a, r: 3 }, e: { c: a, r: 3 } },
            })[0] != i
          ) {
            return false;
          }
        }
        return true;
      };
      if (checkMau && kiemTraMau()) {
        const keHoach = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 1, r: 0 }, e: { c: 1, r: 0 } },
        });
        const checkKH = removeDiacritics(keHoach[0]).toLowerCase();
        if (checkKH == "ke hoach san xuat" || checkKH == "ke hoach giao hang") {
          const data = XLSX.utils.sheet_to_json(worksheet, {
            range: 3,
          });
          thang =
            thang[0].toString().length == 1
              ? "0" + thang[0].toString()
              : thang[0].toString();
          const nam = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 2 }, e: { c: 1, r: 2 } },
          });
          if (
            thang == "01" ||
            thang == "02" ||
            thang == "03" ||
            thang == "04" ||
            thang == "05" ||
            thang == "06" ||
            thang == "07" ||
            thang == "08" ||
            thang == "09" ||
            thang == "10" ||
            thang == "11" ||
            thang == "12"
          ) {
            if (
              nam[0] == new Date().getFullYear() ||
              nam[0] == new Date().getFullYear() + 1 ||
              nam[0] == new Date().getFullYear() - 1
            ) {
              const MSP = ["Mã SP"];
              const TSP = ["Tên SP"];
              let checkData = false;
              for (
                let i = 1;
                i <= getNumberDayOfMonth(Number(thang[0].toString()));
                i++
              ) {
                data.forEach((d, index) => {
                  data[index].maSP = data[index][MSP];
                  data[index].tenSP = data[index][TSP];
                  if (data[index][MSP] == null || data[index][TSP] == null) {
                    data.splice(index, 1);
                  } else {
                    if (
                      !d[i] ||
                      (data[index][i] && data[index][i].toString().trim() == "")
                    ) {
                      data[index][i] = 0;
                    }
                  }
                  if (typeof d[i] != "number") {
                    checkData = true;
                  }
                });
              }
              if (!checkData) {
                if (data.length > 0) {
                  const AllMaXe = [];
                  const row = map(data, (d, index) => {
                    AllMaXe.push(d.maSP);
                    for (let i = 0; i < SanPham.length; i++) {
                      if (d.maSP != SanPham[i].maXe) {
                      } else {
                        return index;
                      }
                    }
                  });
                  const indices = [];

                  for (let i = 0; i < AllMaXe.length; i++) {
                    for (let j = i + 1; j < AllMaXe.length; j++) {
                      if (AllMaXe[i] === AllMaXe[j]) {
                        indices.push(i);
                        indices.push(j);
                      }
                    }
                  }

                  setHangTrung(indices);
                  setRowError(row);
                  setActiveSave(false);
                  setNam(nam[0].toString());
                  setThangNam(`${thang}/${nam[0].toString()}`);
                  setThang(thang.toString());
                  setKeHoach(checkKH == "ke hoach san xuat" ? "khsx" : "khgh");
                  setDataView(data);
                  setFileName(file.name);
                  setFileValid(false);
                  setCheckDanger(false);
                } else {
                  setFileValid(true);
                  setDataView([]);
                  setThang(getThangNow());
                  setNam(getNamNow());
                  setKeHoach("khsx");
                  setThangNam(`${getThangNow()}/${getNamNow()}`);
                  setCheckDanger(true);
                  Helper.alertError("Dữ liệu không được rỗng");
                }
              } else {
                setFileValid(true);
                setDataView([]);
                setThang(getThangNow());
                setNam(getNamNow());
                setKeHoach("khsx");
                setThangNam(`${getThangNow()}/${getNamNow()}`);
                setCheckDanger(true);
                Helper.alertError("Dữ liệu số lượng các ngày phải là số");
              }
            } else {
              setFileValid(true);
              setDataView([]);
              setThang(getThangNow());
              setNam(getNamNow());
              setKeHoach("khsx");
              setThangNam(`${getThangNow()}/${getNamNow()}`);
              setCheckDanger(true);
              Helper.alertError(
                "Dữ liệu năm phải bằng năm hiện tại hoặc bằng năm hiện tại +/- 1"
              );
            }
          } else {
            setFileValid(true);
            setDataView([]);
            setThang(getThangNow());
            setNam(getNamNow());
            setKeHoach("khsx");
            setThangNam(`${getThangNow()}/${getNamNow()}`);
            setCheckDanger(true);

            Helper.alertError("Dữ liệu tháng không hợp lệ");
          }
        } else {
          setFileValid(true);
          setDataView([]);
          setThang(getThangNow());
          setNam(getNamNow());
          setKeHoach("khsx");
          setThangNam(`${getThangNow()}/${getNamNow()}`);
          setCheckDanger(true);

          Helper.alertError(
            "Loại kế hoạch phải là Kế hoạch sản xuất hoặc Kế hoạch giao hàng"
          );
        }
      } else {
        setFileValid(true);
        setDataView([]);
        setThang(getThangNow());
        setNam(getNamNow());
        setKeHoach("khsx");
        setThangNam(`${getThangNow()}/${getNamNow()}`);
        setCheckDanger(true);

        Helper.alertError("Mẫu file import không hợp lệ");
      }
    };
    // }
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
    const MSP = ["Mã SP"];
    const TSP = ["Tên SP"];
    let dataP = [];
    for (let i = 1; i <= getNumberDayOfMonth(Number(Thang), Number(Nam)); i++) {
      const day = i.toString().length == 1 ? "0" + i.toString() : i.toString();
      dataView.forEach((d, index) => {
        dataView[index].maSP = dataView[index][MSP];
        dataView[index].tenSP = dataView[index][TSP];
        if (d[i]) {
          dataP.push({
            soLuong: d[i],
            maXe: d[MSP],
            thang: Thang,
            nam: Nam,
            ngay: day,
          });
        } else {
          dataP.push({
            soLuong: 0,
            maXe: d[MSP],
            thang: Thang,
            nam: Nam,
            ngay: day,
          });
        }
      });
    }
    dispatch(fetchStart(`Xe/import-${KeHoach}`, "POST", dataP, "IMPORT", ""));
    setFileValid(true);
    setDataView([]);
    setThang(getThangNow());
    setNam(getNamNow());
    setKeHoach("khsx");
    setThangNam(`${getThangNow()}/${getNamNow()}`);
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import kế hoạch",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };
  const disabledDate = (current) => {
    // Kiểm tra xem tháng có nhỏ hơn tháng hiện tại hay không
    return (
      (current && current.year() > moment().year() + 1) ||
      (current && current.year() < moment().year() - 1)
    );
  };
  const RowStyle = (current, index) => {
    let check = "red-row";
    const isIncluded = rowError.includes(undefined);
    if (!isIncluded && HangTrung.length == 0) {
      setActiveSave(false);
    } else {
      for (let i = 0; i < rowError.length; i++) {
        if (rowError[i] == undefined) {
          setActiveSave(true);
        } else if (index == rowError[i]) {
          check = "";
        }
      }
      HangTrung.forEach((d) => {
        if (d == index) {
          setActiveSave(true);
          check = "red-row";
        }
      });
      if (check == "red-row") {
        setCheckDanger(true);
      }
      return check;
    }
  };

  return (
    <div className="gx-main-content">
      <Card
        title={"Import kế hoạch"}
        className="th-card-margin-bottom th-card-reset-margin"
        extra={
          <a
            href={
              BASE_URL_APP + "/static/uploads/format_file_KeHoach_chuan.xlsx"
            }
            style={{ fontSize: width < 400 ? "10px" : "" }}
          >
            Download file mẫu kế hoạch
          </a>
        }
      >
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
                Import file kế hoạch
              </Button>
            </Upload>
            {fileName && !fileValid && (
              <>
                <Popover
                  content={
                    !activeSave ? (
                      fileName
                    ) : (
                      <Alert
                        type="error"
                        message="Mã sản phẩm không đúng hoặc trùng"
                        banner
                      />
                    )
                  }
                >
                  <p style={{ color: activeSave ? "red" : "#1890ff" }}>
                    {fileName.length > 25
                      ? fileName.substring(0, 25) + "..."
                      : fileName}{" "}
                    <DeleteOutlined
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setFileValid(true);
                        setDataView([]);
                        setFileName(null);
                        setThang(getThangNow());
                        setNam(getNamNow());
                        setKeHoach("khsx");
                        setCheckDanger(false);
                        setThangNam(`${getThangNow()}/${getNamNow()}`);
                      }}
                    />
                  </p>
                </Popover>
                {/* <p
                  style={{ color: activeSave ? "red" : "#1890ff" }}
                  onMouseEnter={activeSave && handleMouseEnter}
                  onMouseLeave={activeSave && handleMouseLeave}
                >
                  {fileName.length > 25
                    ? fileName.substring(0, 25) + "..."
                    : fileName}{" "}
                  <DeleteOutlined
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setFileValid(true);
                      setDataView([]);
                      setThang(getThangNow());
                      setNam(getNamNow());
                      setKeHoach("khsx");
                      setThangNam(`${getThangNow()}/${getNamNow()}`);
                    }}
                  />
                </p>
                {isHovered && (
                  <Alert
                    type="error"
                    message="Mã sản phẩm không đúng hoặc trùng"
                    banner
                  />
                )} */}
              </>
            )}
          </Col>
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
            Kế hoạch:
          </Col>
          <Col xxl={4} xl={5} lg={7} md={7} xs={17} style={{ marginBottom: 8 }}>
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                { id: "khsx", keHoach: "Kế hoạch sản xuất" },
                { id: "khgh", keHoach: "Kế hoạch giao hàng" },
              ]}
              placeholder="Chọn kế hoạch"
              optionsvalue={["id", "keHoach"]}
              style={{ width: "100%" }}
              onChange={(value) => setKeHoach(value)}
              value={KeHoach}
            />
          </Col>
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
            Tháng:
          </Col>
          <Col
            xxl={4}
            xl={5}
            lg={8}
            md={7}
            sm={10}
            xs={17}
            style={{ marginBottom: 8 }}
          >
            <DatePicker
              format={"MM/YYYY"}
              picker="month"
              disabledDate={disabledDate}
              value={moment(ThangNam, "MM/YYYY")}
              onChange={(date, dateString) => {
                setThangNam(dateString);
                setThang(dateString.slice(0, 2));
                setNam(dateString.slice(-4));
              }}
              allowClear={false}
            />
          </Col>
        </Row>
        <Table
          style={{ marginTop: 10 }}
          bordered
          scroll={{ x: 1500 }}
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
          disabled={dataView.length > 0 && !activeSave ? false : true}
        >
          Lưu
        </Button>
      </Card>
    </div>
  );
}

export default ImportKeHoachSanXuat;
