import {
  DeleteOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Upload,
  message,
} from "antd";
import dayjs from "dayjs";
import { isEmpty, map } from "lodash";
import includes from "lodash/includes";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  FormSubmit,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_ADD_2COL_180PX,
} from "src/constants/Config";
import Helpers from "src/helpers";
import {
  getTokenInfo,
  getLocalStorage,
  reDataForTable,
  convertObjectToUrlParams,
} from "src/util/Common";
import ModalHangMucCongViec from "./ModalThemHangMucCongViec";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuYeuCauBaoGiaForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListUser, setListUser] = useState([]);
  const [ListKhachHang, setListKhachHang] = useState([]);
  const [ListDonViTinh, setListDonViTinh] = useState([]);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [ListDieuKienGiaoHang, setListDieuKienGiaoHang] = useState([]);
  const [FileTaiLieuBaoGia, setFileTaiLieuBaoGia] = useState(null);
  const [FileTomTatDuAn, setFileTomTatDuAn] = useState(null);
  const [ListHangMucCongViec, setListHangMucCongViec] = useState([]);
  const [ActiveModalHangMucCongViec, setActiveModalHangMucCongViec] =
    useState(false);
  const [EdittingRecord, setEdittingRecord] = useState([]);
  const [id, setId] = useState(null);

  useEffect(() => {
    getListUser();
    getListKhachHang();
    getListDonViTinh();
    getListLoaiSanPham();
    getListDieuKienGiaoHang();
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        setFieldsValue({
          formphieuyeucaubaogia: {
            nguoiTao_Id: INFO.user_Id.toLowerCase(),
            thoiGianHoanThanh: moment(
              moment().format("DD/MM/YYYY HH:mm"),
              "DD/MM/YYYY HH:mm"
            ),
          },
        });
      } else if (permission && !permission.add) {
        history.push("/home");
      }
    } else {
      if (permission && permission.edit) {
        setType("edit");
        const { id } = match.params;
        setId(id);
        getInfo(id);
      } else if (permission && !permission.edit) {
        history.push("/home");
      }
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListUser = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-cbnv-thuoc-don-vi-va-co-quyen?donVi_Id=${INFO.donVi_Id}`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              user: `${dt.maNhanVien} - ${dt.fullName}${
                dt.tenChucDanh ? ` (${dt.tenChucDanh})` : ""
              }`,
            };
          });
          setListUser(newData);
        } else {
          setListUser([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListKhachHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_KhachHang?page=-1`,
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
          setListKhachHang(res.data);
        } else {
          setListKhachHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonViTinh = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonViTinh?DonVi_Id=${INFO.donVi_Id}&page=-1`,
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
          setListDonViTinh(res.data);
        } else {
          setListDonViTinh([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_LoaiSanPham/list-filter`,
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
          setListLoaiSanPham(res.data);
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDieuKienGiaoHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_DieuKienGiaoHang?page=-1`,
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
          const newData = res.data.map((dt) => {
            return {
              ...dt,
              dieuKienGiaoHang: `${dt.maDieuKienGiaoHang} - ${dt.tenDieuKienGiaoHang}`,
            };
          });
          setListDieuKienGiaoHang(newData);
        } else {
          setListDieuKienGiaoHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_PhieuYeuCauBaoGia/${id}`,
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
          const newData = data.list_ChiTiets && JSON.parse(data.list_ChiTiets);
          setListHangMucCongViec(newData);

          if (data.fileTaiLieuBaoGia) {
            setFileTaiLieuBaoGia(data.fileTaiLieuBaoGia);
          }

          if (data.fileTomTatDuAn) {
            setFileTaiLieuBaoGia(data.fileTomTatDuAn);
          }

          setFieldsValue({
            formphieuyeucaubaogia: {
              ...data,
              thoiGianHoanThanh:
                data.thoiGianHoanThanh &&
                moment(data.thoiGianHoanThanh, "DD/MM/YYYY HH:mm"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.noiDungCongViec,
      "nội dung công việc"
    );
  };

  const deleteItemAction = (item) => {
    const newDanhSach = ListHangMucCongViec.filter(
      (list) => list.tsec_qtsx_CongViec_Id !== item.tsec_qtsx_CongViec_Id
    );
    setListHangMucCongViec(newDanhSach);

    setFieldTouch(true);
  };

  const actionContent = (item) => {
    const deleteItem = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItem} title="Xóa nội dung công việc">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const handleChangeThuTu = (val, item) => {
    const ThuTuChange = val.target.value;
    if (isEmpty(ThuTuChange) || Number(ThuTuChange) <= 0) {
      setFieldTouch(false);
      setEdittingRecord([...EdittingRecord, item]);
      item.message = "Thứ tự đặt hàng phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData = EdittingRecord.filter(
        (d) =>
          d.tsec_qtsx_CongViec_Id.toLowerCase(0) !==
          item.tsec_qtsx_CongViec_Id.toLowerCase(0)
      );
      setEdittingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListHangMucCongViec];
    newData.forEach((ct, index) => {
      if (
        ct.tsec_qtsx_CongViec_Id.toLowerCase(0) ===
        item.tsec_qtsx_CongViec_Id.toLowerCase(0)
      ) {
        ct.thuTu = ThuTuChange;
      }
    });
    setListHangMucCongViec(newData);
  };

  const handleLuuThuTu = (val, item) => {
    if (type === "new") {
      const newData = [...ListHangMucCongViec].sort((a, b) => {
        if (!a.thuTu) return 1;
        if (!b.thuTu) return -1;
        return a.thuTu - b.thuTu;
      });
      setListHangMucCongViec(newData);
    }
    if (type === "edit") {
      let param = convertObjectToUrlParams({
        thuTu: val.target.value,
      });
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCauBaoGia/thu-tu/${item.tsec_qtsx_PhieuYeuCauBaoGiaChiTiet_Id}?${param}`,
            "PUT",
            null,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      }).then((res) => {
        if (res && res.status === 200) {
          getInfo(id);
        }
      });
    }
  };

  const renderThuTu = (item) => {
    let isEditing = false;
    let message = "";
    EdittingRecord.forEach((ct) => {
      if (
        ct.tsec_qtsx_CongViec_Id.toLowerCase(0) ===
        item.tsec_qtsx_CongViec_Id.toLowerCase(0)
      ) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.thuTu}
          disabled={type === "detail" ? true : false}
          onChange={(val) => handleChangeThuTu(val, item)}
          onBlur={(val) => !isEditing && handleLuuThuTu(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      width: 150,
      align: "center",
      render: (record) => renderThuTu(record),
    },
    {
      title: "Mã công việc",
      dataIndex: "maCongViec",
      key: "maCongViec",
      align: "center",
      width: 150,
    },
    {
      title: "Nội dung công việc",
      dataIndex: "noiDungCongViec",
      key: "noiDungCongViec",
      align: "left",
      width: 250,
    },
    {
      title: "Loại thông tin",
      dataIndex: "tenLoaiThongTin",
      key: "tenLoaiThongTin",
      align: "center",
      width: 150,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
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

  const handleHangMucCongViec = (data) => {
    if (!ListHangMucCongViec || ListHangMucCongViec.length === 0) {
      setListHangMucCongViec(data);
    } else {
      const newListData = data.map((dt) => {
        const find = ListHangMucCongViec.find(
          (list) =>
            list.tsec_qtsx_CongViec_Id.toLowerCase() ===
            dt.tsec_qtsx_CongViec_Id.toLowerCase()
        );

        if (find) {
          return {
            ...dt,
            thuTu: find.thuTu,
          };
        } else {
          return dt;
        }
      });
      setListHangMucCongViec(newListData);
    }
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    uploadFile(values.formphieuyeucaubaogia);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.formphieuyeucaubaogia, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (formphieuyeucaubaogia, saveQuit) => {
    if (type === "new") {
      if (!FileTaiLieuBaoGia) {
        Helpers.alertError("Vui lòng tải file bộ tài liệu báo giá lên");
      } else if (!FileTomTatDuAn) {
        const formData = new FormData();
        formData.append("file", FileTaiLieuBaoGia);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formphieuyeucaubaogia.fileTaiLieuBaoGia = data.path;
            saveData(formphieuyeucaubaogia, saveQuit);
          })
          .catch(() => {
            message.error("Tải file không thành công.");
          });
      } else {
        const formData = new FormData();
        formData.append("lstFiles", FileTaiLieuBaoGia);
        formData.append("lstFiles", FileTomTatDuAn);
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formphieuyeucaubaogia.fileTaiLieuBaoGia = data[0].path;
            formphieuyeucaubaogia.fileTomTatDuAn = data[1].path;
            saveData(formphieuyeucaubaogia, saveQuit);
          })
          .catch(() => {
            message.error("Tải file không thành công.");
          });
      }
    } else if (type === "edit") {
      if (!FileTaiLieuBaoGia) {
        Helpers.alertError("Vui lòng tải file bộ tài liệu báo giá lên");
      } else if (!FileTomTatDuAn) {
        if (FileTaiLieuBaoGia && FileTaiLieuBaoGia.name) {
          const formData = new FormData();
          formData.append("file", FileTaiLieuBaoGia);
          fetch(`${BASE_URL_API}/api/Upload`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              formphieuyeucaubaogia.fileTaiLieuBaoGia = data.path;
              saveData(formphieuyeucaubaogia, saveQuit);
            })
            .catch(() => {
              message.error("Tải file không thành công.");
            });
        } else {
          saveData(formphieuyeucaubaogia, saveQuit);
        }
      } else {
        if (
          (FileTaiLieuBaoGia && FileTaiLieuBaoGia.name) ||
          (FileTomTatDuAn && FileTomTatDuAn.name)
        ) {
          const formData = new FormData();

          /* Tải file bộ tài liệu báo giá */
          FileTaiLieuBaoGia &&
            FileTaiLieuBaoGia.name &&
            formData.append("lstFiles", FileTaiLieuBaoGia);

          /* Tải file tóm tắt dự án */
          FileTomTatDuAn &&
            FileTomTatDuAn.name &&
            formData.append("lstFiles", FileTomTatDuAn);

          fetch(`${BASE_URL_API}/api/Upload/Multi`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Bearer ".concat(INFO.token),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              /* Lưu file bộ tài liệu báo giá */
              if (FileTaiLieuBaoGia && FileTaiLieuBaoGia.name) {
                formphieuyeucaubaogia.fileTaiLieuBaoGia = data[0].path;
              }

              /* Lưu file tóm tắt dự án */
              if (FileTomTatDuAn && FileTomTatDuAn.name) {
                if (FileTaiLieuBaoGia && FileTaiLieuBaoGia.name) {
                  formphieuyeucaubaogia.fileTomTatDuAn = data[1].path;
                } else {
                  formphieuyeucaubaogia.fileTomTatDuAn = data[0].path;
                }
              }

              saveData(formphieuyeucaubaogia, saveQuit);
            })
            .catch(() => {
              message.error("Tải file không thành công.");
            });
        } else {
          saveData(formphieuyeucaubaogia, saveQuit);
        }
      }
    }
  };

  const saveData = (formphieuyeucaubaogia, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...formphieuyeucaubaogia,
        thoiGianHoanThanh:
          formphieuyeucaubaogia.thoiGianHoanThanh.format("DD/MM/YYYY HH:mm"),
        list_ChiTiets: ListHangMucCongViec,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCauBaoGia`,
            "POST",
            newData,
            "ADD",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setListHangMucCongViec([]);
              setFileTaiLieuBaoGia(null);
              setFileTomTatDuAn(null);
              setFieldsValue({
                formphieuyeucaubaogia: {
                  nguoiTao_Id: INFO.user_Id.toLowerCase(),
                  thoiGianHoanThanh: moment(
                    moment().format("DD/MM/YYYY HH:mm"),
                    "DD/MM/YYYY HH:mm"
                  ),
                },
              });
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...formphieuyeucaubaogia,
        id: id,
        thoiGianHoanThanh:
          formphieuyeucaubaogia.thoiGianHoanThanh.format("DD/MM/YYYY HH:mm"),
        list_ChiTiets: ListHangMucCongViec,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tsec_qtsx_PhieuYeuCauBaoGia/${id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status === 200) {
            if (saveQuit) {
              goBack();
            } else {
              getInfo(id);
              setFieldTouch(false);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const handleOpenFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const propstailieubaogia = {
    accept: ".pdf, .doc, .docx, .ppt, .pptx",
    beforeUpload: (file) => {
      const allowedFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedFileTypes.includes(file.type)) {
        Helpers.alertError(
          `${file.name} không phải là tệp PDF, Word hoặc PowerPoint`
        );
        return false;
      } else {
        setFileTaiLieuBaoGia(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propstomtatduan = {
    accept: ".pdf, .doc, .docx, .ppt, .pptx",
    beforeUpload: (file) => {
      const allowedFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedFileTypes.includes(file.type)) {
        Helpers.alertError(
          `${file.name} không phải là tệp PDF, Word hoặc PowerPoint`
        );
        return false;
      } else {
        setFileTomTatDuAn(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const formTitle =
    type === "new"
      ? "Thêm mới phiếu yêu cầu báo giá"
      : "Chỉnh sửa phiếu yêu cầu báo giá";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_ADD_2COL_180PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card className="th-card-margin-bottom" title="Thông tin triển khai">
            <Row align={width >= 1600 ? "" : "center"} className="row-margin">
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Tên phiếu yêu cầu"
                  name={["formphieuyeucaubaogia", "tenPhieuYeuCauBaoGia"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                      message: "Tên phiếu yêu cầu không được quá 250 ký tự",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên phiếu yêu cầu"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Nội dung thực hiện"
                  name={["formphieuyeucaubaogia", "noiDungThucHien"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập nội dung thực hiện"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Người yêu cầu"
                  name={["formphieuyeucaubaogia", "nguoiTao_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListUser ? ListUser : []}
                    placeholder="Chọn người yêu cầu"
                    optionsvalue={["id", "user"]}
                    style={{ width: "100%" }}
                    optionFilterProp={"name"}
                    disabled
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Phòng ban"
                  name={["formphieuyeucaubaogia", "nguoiTao_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListUser ? ListUser : []}
                    placeholder="Chọn người yêu cầu"
                    optionsvalue={["id", "tenPhongBan"]}
                    style={{ width: "100%" }}
                    optionFilterProp={"name"}
                    disabled
                  />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom"
            title="Thông tin đơn hàng báo giá"
          >
            <Row align={width >= 1600 ? "" : "center"} className="row-margin">
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Khách hàng"
                  name={["formphieuyeucaubaogia", "tsec_qtsx_KhachHang_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListKhachHang ? ListKhachHang : []}
                    placeholder="Chọn khách hàng"
                    optionsvalue={["id", "tenKhachHang"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Đơn hàng"
                  name={["formphieuyeucaubaogia", "tenDonHang"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên đơn hàng"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Người gửi"
                  name={["formphieuyeucaubaogia", "tenNguoiGui"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên người gửi"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Phòng ban"
                  name={["formphieuyeucaubaogia", "tenPhongBan"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tên phòng ban"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Thời gian hoàn thành"
                  name={["formphieuyeucaubaogia", "thoiGianHoanThanh"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    showTime
                    format={"DD/MM/YYYY HH:mm"}
                    disabledDate={disabledDate}
                    allowClear={false}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Số lượng đặt hàng"
                  name={["formphieuyeucaubaogia", "soLuongDatHang"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    className="input-item"
                    placeholder="Nhập số lượng đặt hàng"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Đơn vị tính"
                  name={["formphieuyeucaubaogia", "donViTinh_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonViTinh ? ListDonViTinh : []}
                    placeholder="Chọn đơn vị tính"
                    optionsvalue={["id", "tenDonViTinh"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Loại sản phẩm"
                  name={["formphieuyeucaubaogia", "tsec_qtsx_LoaiSanPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListLoaiSanPham ? ListLoaiSanPham : []}
                    placeholder="Chọn loại sản phẩm"
                    optionsvalue={["id", "tenLoaiSanPham"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Điều kiện giao hàng"
                  name={[
                    "formphieuyeucaubaogia",
                    "tsec_qtsx_DieuKienGiaoHang_Id",
                  ]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDieuKienGiaoHang ? ListDieuKienGiaoHang : []}
                    placeholder="Chọn điều kiện giao hàng"
                    optionsvalue={["id", "dieuKienGiaoHang"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Ghi chú"
                  name={["formphieuyeucaubaogia", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập ghi chú" />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Người kiểm tra"
                  name={["formphieuyeucaubaogia", "nguoiKiemTra_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListUser ? ListUser : []}
                    placeholder="Chọn người kiểm tra"
                    optionsvalue={["id", "user"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Người duyệt"
                  name={["formphieuyeucaubaogia", "nguoiDuyet_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListUser ? ListUser : []}
                    placeholder="Chọn người duyệt"
                    optionsvalue={["id", "user"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Tài liệu báo giá"
                  name={["formphieuyeucaubaogia", "fileTaiLieuBaoGia"]}
                  rules={[
                    {
                      type: "file",
                      required: true,
                    },
                  ]}
                >
                  {!FileTaiLieuBaoGia ? (
                    <Upload {...propstailieubaogia}>
                      <Button
                        className="th-margin-bottom-0 btn-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "detail" ? true : false}
                      >
                        Tải file tài liệu báo giá
                      </Button>
                    </Upload>
                  ) : FileTaiLieuBaoGia && FileTaiLieuBaoGia.name ? (
                    <span>
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => handleOpenFile(FileTaiLieuBaoGia)}
                      >
                        {FileTaiLieuBaoGia.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFileTaiLieuBaoGia(null);
                          setFieldTouch(true);
                          setFieldsValue({
                            formphieuyeucaubaogia: {
                              fileTaiLieuBaoGia: null,
                            },
                          });
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + FileTaiLieuBaoGia}
                        rel="noopener noreferrer"
                      >
                        {FileTaiLieuBaoGia && FileTaiLieuBaoGia.split("/")[5]}{" "}
                      </a>
                      {(type === "new" || type === "edit") && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileTaiLieuBaoGia(null);
                            setFieldTouch(true);
                            setFieldsValue({
                              formphieuyeucaubaogia: {
                                fileTaiLieuBaoGia: null,
                              },
                            });
                          }}
                        />
                      )}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={18}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: width >= 1600 ? "0px 35px" : "0px",
                }}
              >
                <FormItem
                  label="Tóm tắt dự án"
                  name={["formphieuyeucaubaogia", "fileTomTatDuAn"]}
                  rules={[
                    {
                      type: "file",
                    },
                  ]}
                >
                  {!FileTomTatDuAn ? (
                    <Upload {...propstomtatduan}>
                      <Button
                        className="th-margin-bottom-0 btn-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "detail" ? true : false}
                      >
                        Tải file tóm tắt dự án
                      </Button>
                    </Upload>
                  ) : FileTomTatDuAn && FileTomTatDuAn.name ? (
                    <span>
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => handleOpenFile(FileTomTatDuAn)}
                      >
                        {FileTomTatDuAn.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFileTomTatDuAn(null);
                          setFieldTouch(true);
                          setFieldsValue({
                            formphieuyeucaubaogia: {
                              fileTomTatDuAn: null,
                            },
                          });
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + FileTomTatDuAn}
                        rel="noopener noreferrer"
                      >
                        {FileTomTatDuAn && FileTomTatDuAn.split("/")[5]}{" "}
                      </a>
                      {(type === "new" || type === "edit") && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileTomTatDuAn(null);
                            setFieldTouch(true);
                            setFieldsValue({
                              formphieuyeucaubaogia: {
                                fileTomTatDuAn: null,
                              },
                            });
                          }}
                        />
                      )}
                    </span>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom"
            title={"Thông tin danh sách nội dung công việc"}
          >
            <div align={"end"} style={{ marginBottom: "10px" }}>
              <Button
                className="th-margin-bottom-0 btn-margin-bottom-0"
                icon={<PlusCircleOutlined />}
                onClick={() => setActiveModalHangMucCongViec(true)}
                type="primary"
              >
                Thêm nội dung công việc
              </Button>
            </div>
            <Table
              bordered
              columns={columns}
              scroll={{ x: 1000, y: "35vh" }}
              components={components}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(ListHangMucCongViec)}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
            />
          </Card>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch && ListHangMucCongViec.length !== 0}
          />
        </Form>
      </Card>
      <ModalHangMucCongViec
        openModal={ActiveModalHangMucCongViec}
        openModalFS={setActiveModalHangMucCongViec}
        DataThemHangMucCongViec={handleHangMucCongViec}
        ListNoiDung={ListHangMucCongViec}
      />
    </div>
  );
};

export default PhieuYeuCauBaoGiaForm;
