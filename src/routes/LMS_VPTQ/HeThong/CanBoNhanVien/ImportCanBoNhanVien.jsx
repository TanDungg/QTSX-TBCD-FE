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
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { Modal, Select } from "src/components/Common";
import { exportExcel, reDataForTable } from "src/util/Common";
import * as XLSX from "xlsx";
import { EditableTableRow, Table } from "src/components/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function ImportCanBoNhanVien({ openModalFS, openModal, loading, refesh }) {
  const dispatch = useDispatch();
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [dataView, setDataView] = useState([]);
  const [FileImport, setFileImport] = useState(null);
  const [checkDanger, setCheckDanger] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [page, setPage] = useState(1);
  const [HangTrung, setHangTrung] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListDonVi();
    }
  }, [openModal]);

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-by-user`,
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
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      align: "center",
    },
    {
      title: "Ngày vào làm",
      dataIndex: "ngayVaoLam",
      key: "ngayVaoLam",
      align: "center",
    },
    {
      title: "Email Thaco",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Email nhận thông báo",
      dataIndex: "emailThongBao",
      key: "emailThongBao",
      align: "center",
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
    },
    {
      title: "Mã chức vụ",
      dataIndex: "maChucVu",
      key: "maChucVu",
      align: "center",
    },
    {
      title: "Mã phòng ban",
      dataIndex: "maPhongBan",
      key: "maPhongBan",
      align: "center",
    },
    {
      title: "Tên phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
    },
    {
      title: "Mã bộ phận",
      dataIndex: "maBoPhan",
      key: "maBoPhan",
      align: "center",
    },
    {
      title: "Tên bộ phận",
      dataIndex: "tenBoPhan",
      key: "tenBoPhan",
      align: "center",
    },
    {
      title: "Mã đơn vị trả lương",
      dataIndex: "maDonViTraLuong",
      key: "maDonViTraLuong",
      align: "center",
    },
    {
      title: "Mã cấp độ nhân sự",
      dataIndex: "maCapDoNhanSu",
      key: "maCapDoNhanSu",
      align: "center",
    },
    {
      title: "Mã trường",
      dataIndex: "maTruong",
      key: "maTruong",
      align: "center",
    },
    {
      title: "Mã chuyên môn",
      dataIndex: "maChuyenMon",
      key: "maChuyenMon",
      align: "center",
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

  const TaiFileMau = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThongTinCBNV/export-file-mau?donVi_Id=${DonVi}`,
          "POST",
          null,
          "DOWLOAD",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        exportExcel("FileMauImportCBNV", res.data.dataexcel);
      }
    });
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
            range: { s: { c: 0, r: 3 }, e: { c: 0, r: 3 } },
          })[0]
          .toString()
          .trim() === "STT" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 1, r: 3 }, e: { c: 1, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã nhân viên" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 2, r: 3 }, e: { c: 2, r: 3 } },
          })[0]
          .toString()
          .trim() === "Họ tên" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 3, r: 3 }, e: { c: 3, r: 3 } },
          })[0]
          .toString()
          .trim() === "Ngày sinh" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 4, r: 3 }, e: { c: 4, r: 3 } },
          })[0]
          .toString()
          .trim() === "Ngày vào làm" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 5, r: 3 }, e: { c: 5, r: 3 } },
          })[0]
          .toString()
          .trim() === "Email Thaco" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 6, r: 3 }, e: { c: 6, r: 3 } },
          })[0]
          .toString()
          .trim() === "Email nhận thông báo" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 7, r: 3 }, e: { c: 7, r: 3 } },
          })[0]
          .toString()
          .trim() === "SĐT" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 8, r: 3 }, e: { c: 8, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã chức vụ" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 3 }, e: { c: 9, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã phòng ban" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 10, r: 3 }, e: { c: 10, r: 3 } },
          })[0]
          .toString()
          .trim() === "Tên phòng ban" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 11, r: 3 }, e: { c: 11, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã bộ phận" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 12, r: 3 }, e: { c: 12, r: 3 } },
          })[0]
          .toString()
          .trim() === "Tên bộ phận" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 13, r: 3 }, e: { c: 13, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã đơn vị trả lương" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 14, r: 3 }, e: { c: 14, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã cấp độ nhân sự" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 15, r: 3 }, e: { c: 15, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã trường" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 16, r: 3 }, e: { c: 16, r: 3 } },
          })[0]
          .toString()
          .trim() === "Mã chuyên môn" &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 17, r: 3 }, e: { c: 17, r: 3 } },
          })[0]
          .toString()
          .trim() === "Ghi chú";
      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
        });
        if (data.length === 0) {
          setFileImport(file.name);
          setDataView([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helper.alertError("Dữ liệu import không được rỗng");
        } else {
          const MNV = "Mã nhân viên";
          const HVT = "Họ tên";
          const NS = "Ngày sinh";
          const NVL = "Ngày vào làm";
          const ETC = "Email Thaco";
          const ETB = "Email nhận thông báo";
          const SDT = "SĐT";
          const MCV = "Mã chức vụ";
          const MPB = "Mã phòng ban";
          const TPB = "Tên phòng ban";
          const MBP = "Mã bộ phận";
          const TBP = "Tên bộ phận";
          const MDVTL = "Mã đơn vị trả lương";
          const MCDNS = "Mã cấp độ nhân sự";
          const MT = "Mã trường";
          const MCM = "Mã chuyên môn";
          const Data = [];
          const NewData = [];
          data.forEach((d, index) => {
            if (
              data[index][MNV] &&
              data[index][MNV].toString().trim() === "" &&
              data[index][HVT] &&
              data[index][HVT].toString().trim() === "" &&
              data[index][MBP] &&
              data[index][MBP].toString().trim() === "" &&
              data[index][MPB] &&
              data[index][MPB].toString().trim() === "" &&
              data[index][MDVTL] &&
              data[index][MDVTL].toString().trim() === ""
            ) {
            } else {
              NewData.push({
                maNhanVien: data[index][MNV]
                  ? data[index][MNV].toString().trim() !== ""
                    ? data[index][MNV].toString()
                    : null
                  : null,
                fullName: data[index][HVT]
                  ? data[index][HVT].toString().trim() !== ""
                    ? data[index][HVT].toString().trim()
                    : null
                  : null,
                ngaySinh: data[index][NS]
                  ? data[index][NS].toString().trim() !== ""
                    ? data[index][NS].toString().trim()
                    : null
                  : null,
                ngayVaoLam: data[index][NVL]
                  ? data[index][NVL].toString().trim() !== ""
                    ? data[index][NVL].toString().trim()
                    : null
                  : null,
                email: data[index][ETC]
                  ? data[index][ETC].toString().trim() !== ""
                    ? data[index][ETC].toString().trim()
                    : null
                  : null,
                emailThongBao: data[index][ETB]
                  ? data[index][ETB].toString().trim() !== ""
                    ? data[index][ETB].toString().trim()
                    : null
                  : null,
                phoneNumber: data[index][SDT]
                  ? data[index][SDT].toString().trim() !== ""
                    ? data[index][SDT].toString().trim()
                    : null
                  : null,
                maChucVu: data[index][MCV]
                  ? data[index][MCV].toString().trim() !== ""
                    ? data[index][MCV].toString().trim()
                    : null
                  : null,
                maPhongBan: data[index][MPB]
                  ? data[index][MPB].toString().trim() !== ""
                    ? data[index][MPB].toString().trim()
                    : null
                  : null,
                tenPhongBan: data[index][TPB]
                  ? data[index][TPB].toString().trim() !== ""
                    ? data[index][TPB].toString().trim()
                    : null
                  : null,
                maBoPhan: data[index][MBP]
                  ? data[index][MBP].toString().trim() !== ""
                    ? data[index][MBP].toString().trim()
                    : null
                  : null,
                tenBoPhan: data[index][TBP]
                  ? data[index][TBP].toString().trim() !== ""
                    ? data[index][TBP].toString().trim()
                    : null
                  : null,
                maDonViTraLuong: data[index][MDVTL]
                  ? data[index][MDVTL].toString().trim() !== ""
                    ? data[index][MDVTL].toString().trim()
                    : null
                  : null,
                maCapDoNhanSu: data[index][MCDNS]
                  ? data[index][MCDNS].toString().trim() !== ""
                    ? data[index][MCDNS].toString().trim()
                    : null
                  : null,
                maTruong: data[index][MT]
                  ? data[index][MT].toString().trim() !== ""
                    ? data[index][MT].toString().trim()
                    : null
                  : null,
                maChuyenMon: data[index][MCM]
                  ? data[index][MCM].toString().trim() !== ""
                    ? data[index][MCM].toString().trim()
                    : null
                  : null,
                moTa: data[index][MT]
                  ? data[index][MT].toString().trim() !== ""
                    ? data[index][MT].toString().trim()
                    : null
                  : null,
                ghiChuImport: null,
              });
            }
            Data.push(d.maNhanVien);
          });
          if (NewData.length === 0) {
            setFileImport(file.name);
            setDataView([]);
            setCheckDanger(true);
            setMessageError("Dữ liệu import không được rỗng");
            Helper.alertError("Dữ liệu import không được rỗng");
          } else {
            const indices = [];
            const row = [];

            for (let i = 0; i < Data.length; i++) {
              for (let j = i + 1; j < Data.length; j++) {
                if (Data[i] === Data[j]) {
                  indices.push(Data[i]);
                  row.push(i + 1);
                  row.push(j + 1);
                }
              }
            }
            setDataView(NewData);
            setFileImport(file.name);
            if (indices.length > 0) {
              setHangTrung(indices);
              setCheckDanger(true);
              setMessageError(
                `Hàng ${row.join(", ")} có mã nhân viên trùng nhau`
              );
            } else {
              setHangTrung([]);
              setCheckDanger(false);
            }
          }
        }
      } else {
        setFileImport(file.name);
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
      donVi_Id: DonVi,
      list_ChiTiets: dataView,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThongTinCBNV/import`,
          "POST",
          newData,
          "IMPORT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status === 409) {
          const newData = dataView.map((dt) => {
            const loi = res.data.find((l) => l.maNhanVien === dt.maNhanVien);
            if (loi) {
              return {
                ...dt,
                ghiChuImport: loi.ghiChuImport,
              };
            } else {
              return dt;
            }
          });
          setDataView(newData);
        } else {
          setFileImport(null);
          setDataView([]);
          openModalFS(false);
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận import CBNV",
    onOk: handleSubmit,
  };
  const modalXK = () => {
    Modal(prop);
  };

  const RowStyle = (current, index) => {
    if (HangTrung.length > 0) {
      HangTrung.forEach((maNhanVien) => {
        if (current.maNhanVien === maNhanVien) {
          setCheckDanger(true);
          return "red-row";
        }
      });
    } else if (current.maNhanVien === null) {
      setCheckDanger(true);
      setMessageError("Mã nhân viên không được rỗng");
      return "red-row";
    } else if (current.fullName === null) {
      setCheckDanger(true);
      setMessageError("Tên nhân viên không được rỗng");
      return "red-row";
    } else if (current.maDonViTraLuong === null) {
      setCheckDanger(true);
      setMessageError("Mã đơn vị trả lương không được rỗng");
      return "red-row";
    } else if (current.maPhongBan === null) {
      setCheckDanger(true);
      setMessageError("Mã phòng ban không được rỗng");
      return "red-row";
    } else if (current.ghiChuImport) {
      setCheckDanger(true);
      return "red-row";
    }
  };

  const handleCancel = () => {
    if (checkDanger === true) {
      openModalFS(false);
      setCheckDanger(false);
      setFileImport(null);
      refesh();
      setDataView([]);
      setHangTrung([]);
    } else {
      refesh();
      openModalFS(false);
    }
  };

  const handleOnSelectDonVi = (value) => {
    setDonVi(value);
  };

  return (
    <AntModal
      title="Import cán bộ nhân viên"
      open={openModal}
      width={`95%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row>
            <Col
              xxl={10}
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
                Đơn vị:
              </span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListDonVi ? ListDonVi : []}
                placeholder="Chọn đơn vị"
                optionsvalue={["id", "tenDonVi"]}
                style={{ width: "calc(100% - 80px)" }}
                value={DonVi}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectDonVi}
              />
            </Col>
            <Col
              xxl={5}
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
                    disabled={!DonVi}
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
                      setMessageError(null);
                    }}
                  />
                </Popover>
              )}
            </Col>
            <Col xxl={4} xl={5} lg={5} md={6} xs={7}>
              <Button
                icon={<DownloadOutlined />}
                onClick={TaiFileMau}
                className="th-margin-bottom-0"
                type="primary"
                disabled={!DonVi}
              >
                File mẫu
              </Button>
            </Col>
          </Row>
          <Table
            style={{ marginTop: 10 }}
            bordered
            scroll={{
              x: 1100,
              y: "55vh",
            }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(dataView)}
            size="small"
            loading={loading}
            rowClassName={(current, index) => RowStyle(current, index, page)}
            pagination={{
              onChange: (p) => setPage(p),
              pageSize: 20,
              showSizeChanger: false,
              showQuickJumper: true,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "15px",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Divider />
            <Button
              icon={<SaveOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={modalXK}
              disabled={dataView.length > 0 && !checkDanger ? false : true}
            >
              Lưu
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ImportCanBoNhanVien;
