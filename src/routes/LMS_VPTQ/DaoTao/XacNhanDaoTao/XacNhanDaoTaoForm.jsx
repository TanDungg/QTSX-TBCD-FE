import {
  DeleteOutlined,
  DownloadOutlined,
  RollbackOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Popover,
  Row,
  Upload,
} from "antd";
import { includes, map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { EditableTableRow, Table } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import { messages } from "src/constants/Messages";
import Helpers from "src/helpers";
import {
  convertObjectToUrlParams,
  exportExcel,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import * as XLSX from "xlsx";

const { EditableRow, EditableCell } = EditableTableRow;

const XacNhanDaoTaoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState(null);
  const [id, setId] = useState(null);
  const [ThongTinLopHoc, setThongTinLopHoc] = useState(null);
  const [FileBaoCao, setFileBaoCao] = useState(null);
  const [DisableUploadBaoCao, setDisableUploadBaoCao] = useState(false);
  const [ListHocVien, setListHocVien] = useState([]);
  const [FileImportDanhSach, setFileImportDanhSach] = useState(null);
  const [CheckDanger, setCheckDanger] = useState(false);
  const [MessageError, setMessageError] = useState([]);
  const [DisabledCapNhat, setDisabledCapNhat] = useState(true);

  useEffect(() => {
    const { id } = match.params;
    setId(id);
    getInfo(id);
    if (includes(match.url, "xac-nhan-danh-sach")) {
      if (permission && permission.view) {
        console.log("object");
        setType("xacnhan");
      } else if (permission && !permission.view) {
        history.push("/home");
      }
    } else if (includes(match.url, "chinh-sua-danh-sach")) {
      if (permission && permission.edit) {
        setType("edit");
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_XacNhanDaoTao/${id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          const data = res.data;
          setThongTinLopHoc(data);
          if (data.fileBaoCao) {
            setDisableUploadBaoCao(true);
            setFileBaoCao(data.fileBaoCao);
          }
          const chitiet = data.list_ChiTiets && JSON.parse(data.list_ChiTiets);
          setListHocVien(chitiet);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleChangeCheckbox = (record, iskey) => {
    const newData = ListHocVien.map((hocvien) => {
      if (
        iskey === "isDiemDanh" &&
        record.user_Id.toLowerCase() === hocvien.user_Id.toLowerCase()
      ) {
        return {
          ...hocvien,
          isDiemDanh: !hocvien.isDiemDanh,
          isVangCoPhep: hocvien.isDiemDanh === false && false,
        };
      } else if (
        iskey === "isVangCoPhep" &&
        record.user_Id.toLowerCase() === hocvien.user_Id.toLowerCase()
      ) {
        return {
          ...hocvien,
          isDiemDanh: hocvien.isVangCoPhep === false && false,
          isVangCoPhep: !hocvien.isVangCoPhep,
        };
      } else {
        return hocvien;
      }
    });
    setListHocVien(newData);
    setDisabledCapNhat(false);
  };

  let columnhocvien = [
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
      width: 100,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 150,
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      key: "ngaySinh",
      align: "center",
      width: 100,
    },
    {
      title: "Chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
      width: 150,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 150,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 200,
    },
    {
      title: "Điểm danh",
      dataIndex: "isDiemDanh",
      key: "isDiemDanh",
      align: "center",
      width: 100,
      render: (value, record) => {
        return (
          <Checkbox
            checked={value}
            onChange={() => handleChangeCheckbox(record, "isDiemDanh")}
          />
        );
      },
    },
    {
      title: (
        <div>
          Tình trạng
          <br />
          vắng có phép
        </div>
      ),
      dataIndex: "isVangCoPhep",
      key: "isVangCoPhep",
      align: "center",
      width: 100,
      render: (value, record) => {
        return (
          <Checkbox
            checked={value}
            onChange={() => handleChangeCheckbox(record, "isVangCoPhep")}
          />
        );
      },
    },
    {
      title: (
        <div>
          Học phí
          <br />
          (VNĐ)
        </div>
      ),
      dataIndex: "hocPhi",
      key: "hocPhi",
      align: "center",
      width: 100,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 120,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(columnhocvien, (col) => {
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
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_LopHoc_Id: id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_XacNhanDaoTao/export-file-mau?${param}`,
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
        exportExcel("FileMauImport", res.data.dataexcel);
      }
    });
  };

  const xuLyExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, {
        type: "binary",
      });
      const worksheet = workbook.Sheets["Import"];

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
          .trim() === "Mã số nhân viên" &&
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
          .trim() === "Họ & tên" &&
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
          .trim() === "Ngày sinh" &&
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
          .trim() === "Chức danh" &&
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
          .trim() === "Phòng ban" &&
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
          .trim() === "Đơn vị" &&
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
          .trim() === "Điểm danh" &&
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
          .trim() === "Vắng có phép" &&
        XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: { s: { c: 8, r: 3 }, e: { c: 8, r: 3 } },
        })[0] &&
        XLSX.utils
          .sheet_to_json(worksheet, {
            header: 1,
            range: { s: { c: 9, r: 3 }, e: { c: 9, r: 3 } },
          })[0]
          .toString()
          .trim() === "Ghi chú";

      if (checkMau) {
        const data = XLSX.utils.sheet_to_json(worksheet, {
          range: 3,
        });
        const KEY = "STT";
        const MSNV = "Mã số nhân viên";
        const HVT = "Họ & tên";
        const NS = "Ngày sinh";
        const CD = "Chức danh";
        const PB = "Phòng ban";
        const DV = "Đơn vị";
        const DD = "Điểm danh";
        const VCP = "Vắng có phép";
        const GC = "Ghi chú";

        const listdanhsach = [];
        const DataHocVien = [];

        data.forEach((d, index) => {
          listdanhsach.push({
            key: data[index][KEY]
              ? data[index][KEY].toString().trim() !== ""
                ? data[index][KEY].toString().trim()
                : null
              : null,
            maNhanVien: data[index][MSNV]
              ? data[index][MSNV].toString().trim() !== ""
                ? data[index][MSNV].toString().trim()
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
            tenChucDanh: data[index][CD]
              ? data[index][CD].toString().trim() !== ""
                ? data[index][CD].toString().trim()
                : null
              : null,
            tenPhongBan: data[index][PB]
              ? data[index][PB].toString().trim() !== ""
                ? data[index][PB].toString().trim()
                : null
              : null,
            tenDonVi: data[index][DV]
              ? data[index][DV].toString().trim() !== ""
                ? data[index][DV].toString().trim()
                : null
              : null,
            isDiemDanh: data[index][DD]
              ? data[index][DD].toString().trim() !== ""
                ? data[index][DD].toString().trim()
                : null
              : null,
            isVangCoPhep: data[index][VCP]
              ? data[index][VCP].toString().trim() !== ""
                ? data[index][VCP].toString().trim()
                : null
              : null,
            moTa: data[index][GC]
              ? data[index][GC].toString().trim() !== ""
                ? data[index][GC].toString().trim()
                : null
              : null,
            ghiChuImport: null,
          });
          DataHocVien.push(d);
        });

        if (listdanhsach.length === 0) {
          setFileImportDanhSach(file.name);
          setListHocVien([]);
          setCheckDanger(true);
          setMessageError("Dữ liệu import không được rỗng");
          Helpers.alertError("Dữ liệu import không được rỗng");
        } else {
          const newData = listdanhsach.map((dt) => {
            if (!dt.maNhanVien) {
              return {
                ...dt,
                isDiemDanh: dt.isDiemDanh ? true : false,
                isVangCoPhep: dt.isVangCoPhep ? true : false,
                ghiChuImport: "Mã nhân viên không được trống",
              };
            } else {
              return {
                ...dt,
                isDiemDanh: dt.isDiemDanh ? true : false,
                isVangCoPhep: dt.isVangCoPhep ? true : false,
              };
            }
          });
          setListHocVien(newData);
          setFileImportDanhSach(file.name);
        }
      } else {
        setFileImportDanhSach(file.name);
        setListHocVien([]);
        setCheckDanger(true);
        setMessageError("Mẫu import không hợp lệ");
        Helpers.alertError("Mẫu file import không hợp lệ");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleXacNhan = () => {
    if (!FileBaoCao) {
      saveData();
    } else {
      const formData = new FormData();
      formData.append("file", FileBaoCao);

      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          saveData(data.path);
        })
        .catch(() => {
          Helpers.alertError("Tải file không thành công.");
        });
    }
  };

  const saveData = (filebaocao) => {
    const newData = {
      vptq_lms_LopHoc_Id: id,
      fileBaoCao: filebaocao && filebaocao,
      list_ChiTiets: ListHocVien && ListHocVien,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_XacNhanDaoTao/import?donViHienHanh_Id=${INFO.donVi_Id}`,
          "POST",
          newData,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          goBack();
          setFileImportDanhSach(null);
          setListHocVien([]);
          setFileBaoCao(null);
          setDisableUploadBaoCao(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCapNhat = () => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_LopHoc_Id: id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_XacNhanDaoTao?${param}`,
          "PUT",
          ListHocVien,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          goBack();
          setFileImportDanhSach(null);
          setListHocVien([]);
          setFileBaoCao(null);
          setDisableUploadBaoCao(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const filebaocao = {
    accept: ".pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx",
    beforeUpload: (file) => {
      const allowedFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedFileTypes.includes(file.type)) {
        Helpers.alertError(
          `${file.name} không phải là tệp PDF, Word, Excel, hoặc PowerPoint`
        );
        return false;
      }

      setFileBaoCao(file);
      setDisableUploadBaoCao(true);
      return false;
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propfileimport = {
    accept: ".xls, .xlsx",
    beforeUpload: (file) => {
      const isFile =
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (!isFile) {
        Helpers.alertError(messages.UPLOAD_ERROR);
        return isFile || Upload.LIST_IGNORE;
      } else {
        xuLyExcel(file);
        setCheckDanger(false);
        return false;
      }
    },

    showUploadList: false,
    maxCount: 1,
  };

  const handleOpenFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "xacnhan"
          ? `/${match.params.id}/xac-nhan-danh-sach`
          : `/${match.params.id}/chinh-sua-danh-sach`,
        ""
      )}`
    );
  };

  const formTitle = "Xác nhận đào tạo";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Thông tin lớp học"}
        >
          <Row gutter={[0, 12]}>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "95px",
                  fontWeight: "bold",
                }}
              >
                Tên lớp học:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 95px)",
                  }}
                >
                  {ThongTinLopHoc.tenLopHoc}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "145px",
                  fontWeight: "bold",
                }}
              >
                Chuyên đề đào tạo:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 145px)",
                  }}
                >
                  {ThongTinLopHoc.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "145px",
                  fontWeight: "bold",
                }}
              >
                Hình thức đào tạo:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 145px)",
                  }}
                >
                  {ThongTinLopHoc.tenHinhThucDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "135px",
                  fontWeight: "bold",
                }}
              >
                Thời gian đào tạo:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 135px)",
                  }}
                >
                  {ThongTinLopHoc.thoiGianDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "150px",
                  fontWeight: "bold",
                }}
              >
                Thời lượng đào tạo:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 150px)",
                  }}
                >
                  {ThongTinLopHoc.thoiLuongDaoTao} phút
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "115px",
                  fontWeight: "bold",
                }}
              >
                Người đăng ký:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 115px)",
                  }}
                >
                  {ThongTinLopHoc.tenNguoiTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "135px",
                  fontWeight: "bold",
                }}
              >
                Tổng số học viên:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 135px)",
                  }}
                >
                  {ThongTinLopHoc.soLuongDiemDanh} học viên
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "135px",
                  fontWeight: "bold",
                }}
              >
                Địa điểm đào tạo:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 135px)",
                  }}
                >
                  {ThongTinLopHoc.diaDiem}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "110px",
                  fontWeight: "bold",
                }}
              >
                Người duyệt:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 110px)",
                  }}
                >
                  {ThongTinLopHoc.tenNguoiDuyet}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "105px",
                  fontWeight: "bold",
                }}
              >
                Thi khảo sát:
              </span>
              {ThongTinLopHoc && (
                <span
                  style={{
                    width: "calc(100% - 105px)",
                  }}
                >
                  <Checkbox
                    checked={ThongTinLopHoc.isThi}
                    style={{ marginTop: "-10px" }}
                    disabled
                  />
                </span>
              )}
            </Col>
            {ThongTinLopHoc && ThongTinLopHoc.tenDeThi && (
              <Col
                xxl={8}
                xl={12}
                lg={12}
                md={24}
                sm={24}
                xs={24}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "65px",
                    fontWeight: "bold",
                  }}
                >
                  Đề thi:
                </span>
                <span
                  style={{
                    width: "calc(100% - 65px)",
                  }}
                >
                  {ThongTinLopHoc.tenDeThi}
                </span>
              </Col>
            )}
            {(ThongTinLopHoc && ThongTinLopHoc.fileBaoCao) ||
              (type === "xacnhan" && (
                <Col
                  xxl={8}
                  xl={12}
                  lg={12}
                  md={24}
                  sm={24}
                  xs={24}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: "100px",
                      fontWeight: "bold",
                    }}
                  >
                    File báo cáo:
                  </span>
                  {type === "xacnhan" ? (
                    !DisableUploadBaoCao ? (
                      <Upload {...filebaocao}>
                        <Button
                          className="th-margin-bottom-0"
                          style={{
                            marginBottom: 0,
                          }}
                          icon={<UploadOutlined />}
                        >
                          Tải file tài liệu
                        </Button>
                      </Upload>
                    ) : FileBaoCao && FileBaoCao.name ? (
                      <span style={{ width: "calc(100% - 100px)" }}>
                        <span
                          style={{
                            color: "#0469B9",
                            cursor: "pointer",
                            whiteSpace: "break-spaces",
                          }}
                          onClick={() => handleOpenFile(FileBaoCao)}
                        >
                          {FileBaoCao.name}{" "}
                        </span>
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => {
                            setFileBaoCao(null);
                            setDisableUploadBaoCao(false);
                          }}
                        />
                      </span>
                    ) : (
                      <span>
                        <a
                          target="_blank"
                          href={BASE_URL_API + FileBaoCao}
                          rel="noopener noreferrer"
                        >
                          {FileBaoCao && FileBaoCao.split("/")[5]}{" "}
                        </a>
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => {
                            setFileBaoCao(null);
                            setDisableUploadBaoCao(false);
                          }}
                        />
                      </span>
                    )
                  ) : (
                    ThongTinLopHoc &&
                    ThongTinLopHoc.fileBaoCao && (
                      <span
                        style={{
                          width: "calc(100% - 65px)",
                        }}
                      >
                        <a
                          target="_blank"
                          href={BASE_URL_API + ThongTinLopHoc.fileBaoCao}
                          rel="noopener noreferrer"
                        >
                          {ThongTinLopHoc.fileBaoCao.split("/")[5]}{" "}
                        </a>
                      </span>
                    )
                  )}
                </Col>
              ))}
          </Row>
        </Card>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách học viên"}
        >
          {type === "xacnhan" ? (
            <Row style={{ marginBottom: "20px" }}>
              <Col
                xxl={8}
                xl={12}
                lg={16}
                md={16}
                sm={20}
                xs={24}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    width: "130px",
                  }}
                >
                  Import danh sách:
                </span>
                {!FileImportDanhSach ? (
                  <Upload {...propfileimport}>
                    <Button
                      className="th-margin-bottom-0"
                      icon={<UploadOutlined />}
                      danger={CheckDanger}
                    >
                      Tải dữ liệu lên
                    </Button>
                  </Upload>
                ) : (
                  <Popover
                    content={
                      !CheckDanger ? (
                        FileImportDanhSach
                      ) : (
                        <Alert type="error" message={MessageError} banner />
                      )
                    }
                  >
                    <span
                      style={{
                        color: CheckDanger ? "red" : "#0469B9",
                        cursor: "pointer",
                      }}
                    >
                      {FileImportDanhSach.length > 30
                        ? FileImportDanhSach.substring(0, 30) + "..."
                        : FileImportDanhSach}{" "}
                    </span>
                    <DeleteOutlined
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() => {
                        setFileImportDanhSach(null);
                        setCheckDanger(false);
                        setListHocVien([]);
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
                  className="th-margin-bottom-0"
                  type="primary"
                >
                  File mẫu
                </Button>
              </Col>
            </Row>
          ) : null}
          <Table
            bordered
            columns={columns}
            components={components}
            scroll={{ x: 1350, y: "30vh" }}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(ListHocVien)}
            size="small"
            pagination={false}
          />
        </Card>
        <Divider />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Button
            icon={<RollbackOutlined />}
            className="th-margin-bottom-0"
            type="default"
            onClick={goBack}
          >
            Quay lại
          </Button>
          <Button
            icon={<SaveOutlined />}
            className="th-margin-bottom-0"
            type="primary"
            onClick={type === "xacnhan" ? handleXacNhan : handleCapNhat}
            disabled={type === "xacnhan" ? !ListHocVien : DisabledCapNhat}
          >
            {type === "xacnhan" ? " Xác nhận" : "Cập nhật"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default XacNhanDaoTaoForm;
