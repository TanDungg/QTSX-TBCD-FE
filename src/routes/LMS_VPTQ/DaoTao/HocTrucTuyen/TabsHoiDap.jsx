import {
  CloseCircleOutlined,
  DeleteOutlined,
  DislikeFilled,
  DislikeOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LikeFilled,
  LikeOutlined,
  SaveOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Image,
  Input,
  Row,
  Modal as AntModal,
  Upload,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import Helpers from "src/helpers";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";

const FormItem = Form.Item;
const { TextArea } = Input;
const { confirm } = AntModal;

const TabsHoiDap = ({ dataHoiDap }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [HoiDap, setHoiDap] = useState(null);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [DisableUploadHinhAnh, setDisableUploadHinhAnh] = useState(false);
  const [FileDinhKem, setFileDinhKem] = useState(null);
  const [DisableUploadFileDinhKem, setDisableUploadFileDinhKem] =
    useState(false);
  const [FileHinhAnhPhanHoi, setFileHinhAnhPhanHoi] = useState(null);
  const [DisableUploadHinhAnhPhanHoi, setDisableUploadHinhAnhPhanHoi] =
    useState(false);
  const [IndexPhanHoi, setIndexPhanHoi] = useState(null);
  const [IndexXemPhanHoi, setIndexXemPhanHoi] = useState(null);
  const [NoiDungPhanHoi, setNoiDungPhanHoi] = useState(null);
  /* Chỉnh sửa câu hỏi */
  const [CauHoi, setCauHoi] = useState(false);
  const [IsEditCauHoi, setIsEditCauHoi] = useState(false);
  const [FieldTouchEditCauHoi, setFieldTouchEditCauHoi] = useState(false);
  const [IndexChinhSuaCauHoi, setIndexChinhSuaCauHoi] = useState(null);
  const [FileHinhAnhEditHoiDap, setFileHinhAnhEditHoiDap] = useState(null);
  const [DisableUploadHinhAnhEditHoiDap, setDisableUploadHinhAnhEditHoiDap] =
    useState(false);
  const [FileDinhKemEditHoiDap, setFileDinhKemEditHoiDap] = useState(null);
  const [
    DisableUploadFileDinhKemEditHoiDap,
    setDisableUploadFileDinhKemEditHoiDap,
  ] = useState(false);
  /* Chỉnh sửa phản hồi */
  const [PhanHoi, setPhanHoi] = useState(false);
  const [IsEditPhanHoi, setIsEditPhanHoi] = useState(false);
  const [FieldTouchEditPhanHoi, setFieldTouchEditPhanHoi] = useState(false);
  const [IndexChinhSuaPhanHoi, setIndexChinhSuaPhanHoi] = useState(null);
  const [FileHinhAnhEditPhanHoi, setFileHinhAnhEditPhanHoi] = useState(null);
  const [DisableUploadHinhAnhEditPhanHoi, setDisableUploadHinhAnhEditPhanHoi] =
    useState(false);

  useEffect(() => {
    getInfo(dataHoiDap && dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
    return () => dispatch(fetchReset());
  }, [dataHoiDap]);

  const getInfo = (vptq_lms_ChuyenDeDaoTao_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/hoi-dap/${vptq_lms_ChuyenDeDaoTao_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setHoiDap(res.data);
      } else {
        setHoiDap(null);
      }
    });
  };

  const onFinish = (values) => {
    if (IsEditCauHoi) {
      const edithoidap = values.modaledithoidap;
      if (
        FileHinhAnhEditHoiDap &&
        FileHinhAnhEditHoiDap.name &&
        FileDinhKemEditHoiDap &&
        FileDinhKemEditHoiDap.name
      ) {
        const formData = new FormData();
        formData.append("lstFiles", FileHinhAnhEditHoiDap);
        formData.append("lstFiles", FileDinhKemEditHoiDap);
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            edithoidap.hinhAnh = data[0].path;
            edithoidap.fileDinhKem = data[1].path;
            saveData(edithoidap);
          })
          .catch(() => {
            Helpers.alertError("Tải file không thành công.");
          });
      } else if (
        (FileHinhAnhEditHoiDap && FileHinhAnhEditHoiDap.name) ||
        (FileDinhKemEditHoiDap && FileDinhKemEditHoiDap.name)
      ) {
        const formData = new FormData();
        FileHinhAnhEditHoiDap && FileHinhAnhEditHoiDap.name
          ? formData.append("file", FileHinhAnhEditHoiDap)
          : formData.append("file", FileDinhKemEditHoiDap);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            FileHinhAnhEditHoiDap && FileHinhAnhEditHoiDap.name
              ? (edithoidap.hinhAnh = data.path)
              : (edithoidap.fileDinhKem = data.path);
            saveData(edithoidap);
          })
          .catch(() => {
            Helpers.alertError(
              `Tải file ${
                FileHinhAnhEditHoiDap && FileHinhAnhEditHoiDap.name
                  ? "hình ảnh"
                  : "đính kèm"
              } không thành công.`
            );
          });
      } else {
        saveData(edithoidap);
      }
    } else if (IsEditPhanHoi) {
      const editphanhoi = values.modaleditphanhoi;
      if (FileHinhAnhEditPhanHoi && FileHinhAnhEditPhanHoi.name) {
        const formData = new FormData();
        formData.append("file", FileHinhAnhEditPhanHoi);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            editphanhoi.hinhAnh = data.path;
            saveData(editphanhoi);
          })
          .catch(() => {
            Helpers.alertError(`Tải file hình ảnh không thành công.`);
          });
      } else {
        saveData(editphanhoi);
      }
    } else {
      const newHoiDap = values.modalhoidap;
      if (FileHinhAnh && FileDinhKem) {
        const formData = new FormData();
        formData.append("lstFiles", FileHinhAnh);
        formData.append("lstFiles", FileDinhKem);
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            newHoiDap.hinhAnh = data[0].path;
            newHoiDap.FileDinhKem = data[1].path;
            saveData(newHoiDap);
          })
          .catch(() => {
            Helpers.alertError("Tải file không thành công.");
          });
      } else if (FileHinhAnh || FileDinhKem) {
        const formData = new FormData();
        FileHinhAnh
          ? formData.append("file", FileHinhAnh)
          : formData.append("file", FileDinhKem);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            FileHinhAnh
              ? (newHoiDap.hinhAnh = data.path)
              : (newHoiDap.FileDinhKem = data.path);
            saveData(newHoiDap);
          })
          .catch(() => {
            Helpers.alertError(
              `Tải file ${
                FileHinhAnh ? "hình ảnh" : "đính kèm"
              } không thành công.`
            );
          });
      } else {
        saveData(newHoiDap);
      }
    }
  };

  const saveData = (data) => {
    if (IsEditCauHoi) {
      const newData = {
        ...data,
        vptq_lms_HoiDap_Id: CauHoi && CauHoi.vptq_lms_HoiDap_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_HocTrucTuyen/hoi-dap/${CauHoi.vptq_lms_HoiDap_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          if (res.status !== 409) {
            resetFields();
            setFieldTouchEditCauHoi(false);
            setCauHoi(null);
            setIsEditCauHoi(false);
            setIndexChinhSuaCauHoi(null);
            setDisableUploadHinhAnhEditHoiDap(false);
            setFileHinhAnhEditHoiDap(null);
            setDisableUploadFileDinhKemEditHoiDap(false);
            setFileDinhKemEditHoiDap(null);
            getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
          }
        })
        .catch((error) => console.error(error));
    } else if (IsEditPhanHoi) {
      const newData = {
        ...data,
        vptq_lms_PhanHoi_Id: PhanHoi && PhanHoi.vptq_lms_PhanHoi_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_HocTrucTuyen/phan-hoi/${PhanHoi.vptq_lms_PhanHoi_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          if (res.status !== 409) {
            resetFields();
            setFieldTouchEditPhanHoi(false);
            setPhanHoi(null);
            setIsEditPhanHoi(false);
            setIndexChinhSuaPhanHoi(null);
            setDisableUploadHinhAnhEditPhanHoi(false);
            setFileHinhAnhEditPhanHoi(null);
            getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
          }
        })
        .catch((error) => console.error(error));
    } else {
      const newData = {
        ...data,
        vptq_lms_ChuyenDeDaoTao_Id: dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_HocTrucTuyen/hoi-dap?donViHienHanh_Id=${INFO.donVi_Id}`,
            "POST",
            newData,
            "CAUHOI",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            resetFields();
            setFieldTouch(false);
            setDisableUploadHinhAnh(false);
            setFileHinhAnh(null);
            setDisableUploadFileDinhKem(false);
            setFileDinhKem(null);
            getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleChangePhanHoi = (val) => {
    setNoiDungPhanHoi(val.target.value);
  };

  const handlePhanHoi = (vptq_lms_HoiDap_Id, index) => {
    if (FileHinhAnhPhanHoi) {
      const formData = new FormData();
      formData.append("file", FileHinhAnhPhanHoi);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const newData = {
            hinhAnh: data.path,
            vptq_lms_HoiDap_Id: vptq_lms_HoiDap_Id,
          };
          SavePhanHoi(newData);
        })
        .catch(() => {
          Helpers.alertError(`Tải file hình ảnh không thành công.`);
        });
    } else {
      SavePhanHoi({ vptq_lms_HoiDap_Id: vptq_lms_HoiDap_Id }, index);
    }
  };

  const SavePhanHoi = (phanhoi, index) => {
    const newData = {
      ...phanhoi,
      noiDung: NoiDungPhanHoi,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/phan-hoi`,
          "POST",
          newData,
          "PHANHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setDisableUploadHinhAnhPhanHoi(false);
          setFileHinhAnhPhanHoi(null);
          setNoiDungPhanHoi(null);
          setIndexPhanHoi(null);
          setIndexXemPhanHoi(index);
          getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleIsLikeHoiDap = (vptq_lms_HoiDap_Id, isLike) => {
    const param = convertObjectToUrlParams({
      vptq_lms_HoiDap_Id: vptq_lms_HoiDap_Id,
      isLike: isLike,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/hoi-dap-is-like?${param}`,
          "POST",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleXoaHoiDap = (vptq_lms_HoiDap_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/hoi-dap/${vptq_lms_HoiDap_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
          "DELETE",
          null,
          "DELETE",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
        }
      })
      .catch((error) => console.error(error));
  };

  const ModalXoaHoiDap = (vptq_lms_HoiDap_Id) => {
    confirm({
      title: "Xóa hỏi đáp!",
      icon: <ExclamationCircleOutlined />,
      content: "Xác nhận xóa hỏi đáp!",
      onOk() {
        handleXoaHoiDap(vptq_lms_HoiDap_Id);
      },
    });
  };

  const handleIsLikePhanHoi = (vptq_lms_PhanHoi_Id, isLike) => {
    const param = convertObjectToUrlParams({
      vptq_lms_PhanHoi_Id: vptq_lms_PhanHoi_Id,
      isLike: isLike,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/phan-hoi-is-like?${param}`,
          "POST",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleXoaPhanHoi = (vptq_lms_PhanHoi_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/phan-hoi/${vptq_lms_PhanHoi_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
          "DELETE",
          null,
          "DELETE",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
        }
      })
      .catch((error) => console.error(error));
  };

  const ModalXoaPhanHoi = (vptq_lms_PhanHoi_Id) => {
    confirm({
      title: "Xóa phản hồi!",
      icon: <ExclamationCircleOutlined />,
      content: "Xác nhận xóa phản hồi!",
      onOk() {
        handleXoaPhanHoi(vptq_lms_PhanHoi_Id);
      },
    });
  };

  const propshinhanh = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnh(file);
        setDisableUploadHinhAnh(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propfiledinhkem = {
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
      } else {
        setFileDinhKem(file);
        setDisableUploadFileDinhKem(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propshinhanhphanhoi = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnhPhanHoi(file);
        setDisableUploadHinhAnhPhanHoi(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propshinhanhedit = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnhEditHoiDap(file);
        setDisableUploadHinhAnhEditHoiDap(true);
        setFieldTouchEditCauHoi(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propfiledinhkemedit = {
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
      } else {
        setFileDinhKemEditHoiDap(file);
        setDisableUploadFileDinhKemEditHoiDap(true);
        setFieldTouchEditCauHoi(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propshinhanhphanhoiedit = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnhEditPhanHoi(file);
        setDisableUploadHinhAnhEditPhanHoi(true);
        setFieldTouchEditPhanHoi(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleViewFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  return (
    <div>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title="Đặt câu hỏi về bài giảng"
      >
        <Form
          form={form}
          layout="vertical"
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Tiêu đề câu hỏi"
            name={["modalhoidap", "tieuDe"]}
            rules={[
              {
                type: "string",
                required:
                  IsEditCauHoi === true || IsEditPhanHoi === true
                    ? false
                    : true,
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập tiêu đề câu hỏi" />
          </FormItem>
          <FormItem
            label="Mô tả tình huống bạn gặp phải (tùy chọn)"
            name={["modalhoidap", "noiDung"]}
            rules={[
              {
                type: "string",
                required:
                  IsEditCauHoi === true || IsEditPhanHoi === true
                    ? false
                    : true,
              },
            ]}
          >
            <TextArea
              rows={4}
              className="input-item"
              placeholder="Hãy mô tả tình huống bạn gặp phải..."
            />
          </FormItem>
          <Row style={{ width: "100%", display: "flex", flexDirection: "row" }}>
            <Col
              lg={12}
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
                Tải file hình ảnh:
              </span>
              {!DisableUploadHinhAnh ? (
                <Upload {...propshinhanh}>
                  <Button
                    className="th-margin-bottom-0"
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                  >
                    Tải file hình ảnh
                  </Button>
                </Upload>
              ) : (
                <span>
                  <span
                    style={{
                      color: "#0469B9",
                      cursor: "pointer",
                      whiteSpace: "break-spaces",
                    }}
                    onClick={() => handleViewFile(FileHinhAnh)}
                  >
                    {FileHinhAnh.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFileHinhAnh(null);
                      setDisableUploadHinhAnh(false);
                      setFieldsValue({
                        modalhoidap: {
                          hinhAnh: null,
                        },
                      });
                    }}
                  />
                </span>
              )}
            </Col>
            <Col
              lg={12}
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
                Tải file đính kèm:
              </span>
              {!DisableUploadFileDinhKem ? (
                <Upload {...propfiledinhkem}>
                  <Button
                    className="th-margin-bottom-0"
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                  >
                    Tải file đính kèm
                  </Button>
                </Upload>
              ) : (
                <span>
                  <span
                    style={{
                      color: "#0469B9",
                      cursor: "pointer",
                      whiteSpace: "break-spaces",
                    }}
                    onClick={() => handleViewFile(FileDinhKem)}
                  >
                    {FileDinhKem.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFileDinhKem(null);
                      setDisableUploadFileDinhKem(false);
                      setFieldsValue({
                        modalhoidap: {
                          fileDinhKem: null,
                        },
                      });
                    }}
                  />
                </span>
              )}
            </Col>
          </Row>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
              flexDirection: "column",
              alignItems: "end",
            }}
          >
            <Divider />
            <Button
              icon={<SendOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              htmlType={"submit"}
              disabled={!fieldTouch}
            >
              Gửi câu hỏi
            </Button>
          </div>
        </Form>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        {HoiDap &&
          HoiDap.results.length !== 0 &&
          HoiDap.results.map((hd, index) => {
            return IndexChinhSuaCauHoi === index ? (
              <div className="rate-edit">
                <div className="avatar">
                  <Image src={hd.hinhAnhUrl} className="avatar" />
                </div>
                <div className="title-edit">
                  <div className="user-info">
                    <span className="name">{hd.fullName}</span>
                  </div>
                  <Card className="th-card-margin-bottom th-card-reset-margin">
                    <Form
                      form={form}
                      layout="vertical"
                      name="nguoi-dung-control"
                      onFinish={onFinish}
                      onFieldsChange={() => setFieldTouchEditCauHoi(true)}
                    >
                      <FormItem
                        label="Tiêu đề câu hỏi"
                        name={["modaledithoidap", "tieuDe"]}
                        rules={[
                          {
                            type: "string",
                            required: true,
                          },
                        ]}
                      >
                        <Input
                          className="input-item"
                          placeholder="Nhập tiêu đề câu hỏi"
                        />
                      </FormItem>
                      <FormItem
                        label="Mô tả tình huống bạn gặp phải (tùy chọn)"
                        name={["modaledithoidap", "noiDung"]}
                        rules={[
                          {
                            type: "string",
                            required: true,
                          },
                        ]}
                      >
                        <TextArea
                          status="warning"
                          rows={5}
                          className="input-item"
                          placeholder="Hãy mô tả tình huống bạn gặp phải..."
                        />
                      </FormItem>
                      <Row
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <Col
                          lg={12}
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
                            Tải file hình ảnh:
                          </span>
                          {!DisableUploadHinhAnhEditHoiDap ? (
                            <Upload {...propshinhanhedit}>
                              <Button
                                className="th-margin-bottom-0"
                                style={{
                                  marginBottom: 0,
                                }}
                                icon={<UploadOutlined />}
                              >
                                Tải file hình ảnh
                              </Button>
                            </Upload>
                          ) : FileHinhAnhEditHoiDap &&
                            FileHinhAnhEditHoiDap.name ? (
                            <span>
                              <span
                                style={{
                                  color: "#0469B9",
                                  cursor: "pointer",
                                  whiteSpace: "break-spaces",
                                }}
                                onClick={() =>
                                  handleViewFile(FileHinhAnhEditHoiDap)
                                }
                              >
                                {FileHinhAnhEditHoiDap.name}{" "}
                              </span>
                              <DeleteOutlined
                                style={{ cursor: "pointer", color: "red" }}
                                onClick={() => {
                                  setFileHinhAnhEditHoiDap(null);
                                  setDisableUploadHinhAnhEditHoiDap(false);
                                  setFieldTouchEditCauHoi(true);
                                }}
                              />
                            </span>
                          ) : (
                            <span>
                              <a
                                target="_blank"
                                href={BASE_URL_API + FileHinhAnhEditHoiDap}
                                rel="noopener noreferrer"
                                style={{
                                  whiteSpace: "break-spaces",
                                  wordBreak: "break-all",
                                }}
                              >
                                {FileHinhAnhEditHoiDap &&
                                  FileHinhAnhEditHoiDap.split("/")[5]}{" "}
                              </a>
                              <DeleteOutlined
                                style={{ cursor: "pointer", color: "red" }}
                                onClick={() => {
                                  setFileHinhAnhEditHoiDap(null);
                                  setDisableUploadHinhAnhEditHoiDap(false);
                                  setFieldTouchEditCauHoi(true);
                                }}
                              />
                            </span>
                          )}
                        </Col>
                        <Col
                          lg={12}
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
                            Tải file đính kèm:
                          </span>
                          {!DisableUploadFileDinhKemEditHoiDap ? (
                            <Upload {...propfiledinhkemedit}>
                              <Button
                                className="th-margin-bottom-0"
                                style={{
                                  marginBottom: 0,
                                }}
                                icon={<UploadOutlined />}
                              >
                                Tải file đính kèm
                              </Button>
                            </Upload>
                          ) : FileDinhKemEditHoiDap &&
                            FileDinhKemEditHoiDap.name ? (
                            <span>
                              <span
                                style={{
                                  color: "#0469B9",
                                  cursor: "pointer",
                                  whiteSpace: "break-spaces",
                                }}
                                onClick={() =>
                                  handleViewFile(FileDinhKemEditHoiDap)
                                }
                              >
                                {FileDinhKemEditHoiDap.name}{" "}
                              </span>
                              <DeleteOutlined
                                style={{ cursor: "pointer", color: "red" }}
                                onClick={() => {
                                  setFileDinhKemEditHoiDap(null);
                                  setDisableUploadFileDinhKemEditHoiDap(false);
                                  setFieldTouchEditCauHoi(true);
                                }}
                              />
                            </span>
                          ) : (
                            <span>
                              <a
                                target="_blank"
                                href={BASE_URL_API + FileDinhKemEditHoiDap}
                                rel="noopener noreferrer"
                                style={{
                                  whiteSpace: "break-spaces",
                                  wordBreak: "break-all",
                                }}
                              >
                                {FileDinhKemEditHoiDap &&
                                  FileDinhKemEditHoiDap.split("/")[5]}{" "}
                              </a>
                              <DeleteOutlined
                                style={{ cursor: "pointer", color: "red" }}
                                onClick={() => {
                                  setFileDinhKemEditHoiDap(null);
                                  setDisableUploadFileDinhKemEditHoiDap(false);
                                  setFieldTouchEditCauHoi(true);
                                }}
                              />
                            </span>
                          )}
                        </Col>
                      </Row>
                      <div className="col-button">
                        <Divider />
                        <div style={{ display: "flex" }}>
                          <Button
                            icon={<CloseCircleOutlined />}
                            className="th-margin-bottom-0"
                            onClick={() => {
                              setIsEditCauHoi(false);
                              setIndexChinhSuaCauHoi(null);
                              setFileHinhAnhEditHoiDap(null);
                              setDisableUploadHinhAnhEditHoiDap(false);
                              setFileDinhKemEditHoiDap(null);
                              setDisableUploadFileDinhKemEditHoiDap(false);
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            icon={<SaveOutlined />}
                            className="th-margin-bottom-0"
                            type="primary"
                            htmlType={"submit"}
                            disabled={!FieldTouchEditCauHoi}
                          >
                            Cập nhật
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="question-container" key={index}>
                <div className="question-container">
                  <div className="user-info">
                    <Image src={hd.hinhAnhUrl} className="avatar" />
                    <div className="title">
                      <div>
                        <span className="name">{hd.fullName}</span>{" "}
                        {!hd.isDuyet && (
                          <Tag
                            color={!hd.isDuyet && "red"}
                            style={{
                              fontWeight: "normal",
                              fontSize: "13px",
                            }}
                          >
                            Chưa duyệt
                          </Tag>
                        )}
                      </div>
                      <span className="date">{hd.ngayTao}</span>
                    </div>
                  </div>
                  <div className="title">
                    <span
                      className="question-content"
                      style={{ fontSize: "14px", fontWeight: "bold" }}
                    >
                      {hd.tieuDe}
                    </span>
                    <span>{hd.noiDung}</span>
                  </div>
                  {hd.fileDinhKem && (
                    <span>
                      File đính kèm:{" "}
                      <a
                        target="_blank"
                        href={BASE_URL_API + hd.fileDinhKem}
                        rel="noopener noreferrer"
                      >
                        {hd.fileDinhKem.split("/")[5]}
                      </a>
                    </span>
                  )}
                  {hd.hinhAnh && (
                    <div className="question-image">
                      <Image
                        src={BASE_URL_API + hd.hinhAnh}
                        alt="Hình ảnh"
                        style={{ height: "150px" }}
                      />
                    </div>
                  )}
                </div>
                <div className="button-container">
                  <div className="button-container">
                    <span
                      className={`${hd.soLuongLike === 0 ? "like" : "liked"}`}
                    >
                      {hd.soLuongLike}
                    </span>
                    <span
                      className={`span-click ${
                        hd.isLike === true ? "liked" : "like"
                      }`}
                      title="Thích câu hỏi"
                      onClick={() =>
                        handleIsLikeHoiDap(hd.vptq_lms_HoiDap_Id, true)
                      }
                    >
                      {hd.isLike ? <LikeFilled /> : <LikeOutlined />} Like
                    </span>
                  </div>
                  <Divider type="vertical" />
                  <div className="button-container">
                    <span
                      className={`${
                        hd.soLuongDislike === 0 ? "dislike" : "disliked"
                      }`}
                    >
                      {hd.soLuongDislike}
                    </span>
                    <span
                      className={`span-click ${
                        hd.isLike === false ? "disliked" : "dislike"
                      }`}
                      title="Không thích câu hỏi"
                      onClick={() =>
                        handleIsLikeHoiDap(hd.vptq_lms_HoiDap_Id, false)
                      }
                    >
                      {hd.isDisLike ? <DislikeFilled /> : <DislikeOutlined />}{" "}
                      Dislike
                    </span>
                  </div>
                  <Divider type="vertical" />
                  <div className="button-container">
                    {hd.isSua ? (
                      <span
                        className={`span-click liked`}
                        title="Chỉnh sửa câu hỏi"
                        onClick={() => {
                          setFieldsValue({
                            modaledithoidap: hd,
                          });
                          setCauHoi(hd);
                          setIsEditCauHoi(true);
                          if (hd.hinhAnh) {
                            setFileHinhAnhEditHoiDap(hd && hd.hinhAnh);
                            setDisableUploadHinhAnhEditHoiDap(true);
                          }
                          if (hd.fileDinhKem) {
                            setFileDinhKemEditHoiDap(hd && hd.fileDinhKem);
                            setDisableUploadFileDinhKemEditHoiDap(true);
                          }
                          setIndexChinhSuaCauHoi(index);
                        }}
                      >
                        <EditOutlined /> Chỉnh sửa
                      </span>
                    ) : (
                      <span
                        className={`span-click like`}
                        title="Chỉnh sửa câu hỏi"
                      >
                        <EditOutlined /> Chỉnh sửa
                      </span>
                    )}
                  </div>
                  <Divider type="vertical" />
                  <div className="button-container">
                    {hd.isXoa ? (
                      <span
                        className={`span-click disliked`}
                        title="Xóa câu hỏi"
                        onClick={() => ModalXoaHoiDap(hd.vptq_lms_HoiDap_Id)}
                      >
                        <DeleteOutlined /> Xóa
                      </span>
                    ) : (
                      <span
                        className={`span-click dislike`}
                        title="Xóa câu hỏi"
                      >
                        <DeleteOutlined /> Xóa
                      </span>
                    )}
                  </div>
                  <Divider type="vertical" />
                  <div className="button-container">
                    <span
                      className={`span-click liked`}
                      title="Phản hồi"
                      onClick={() => {
                        setIndexPhanHoi(index === IndexPhanHoi ? null : index);
                        setIndexXemPhanHoi(
                          index === IndexXemPhanHoi ? null : index
                        );
                      }}
                    >
                      Phản hồi
                    </span>
                  </div>
                </div>
                {hd.phanHois.length === 0 ? null : IndexXemPhanHoi === null ? (
                  <span
                    className={`span-click liked`}
                    title="Phản hồi"
                    onClick={() => {
                      setIndexXemPhanHoi(index);
                      setIndexPhanHoi(index);
                    }}
                  >
                    Xem tất cả phản hồi ({hd.phanHois.length} phản hồi)
                  </span>
                ) : (
                  <span
                    className={`span-click liked`}
                    title="Phản hồi"
                    onClick={() => {
                      setIndexXemPhanHoi(null);
                      setIndexPhanHoi(null);
                    }}
                  >
                    Đóng tất cả phản hồi
                  </span>
                )}
                {IndexXemPhanHoi === index && hd.phanHois.length !== 0
                  ? hd.phanHois.map((ph, index) => {
                      console.log(ph);
                      return IndexChinhSuaPhanHoi === index ? (
                        <div className="feedback-container" key={index}>
                          <div className="avatar">
                            <Image src={ph.hinhAnhUrl} className="avatar" />
                          </div>
                          <div className="feedback" key={index}>
                            <span className="name">{ph.fullName}</span>
                            <Card className="th-card-margin-bottom th-card-reset-margin">
                              <Form
                                form={form}
                                layout="vertical"
                                name="nguoi-dung-control"
                                onFinish={onFinish}
                                onFieldsChange={() =>
                                  setFieldTouchEditPhanHoi(true)
                                }
                              >
                                <FormItem
                                  label="Phản hồi"
                                  name={["modaleditphanhoi", "noiDung"]}
                                  rules={[
                                    {
                                      type: "string",
                                      required: true,
                                    },
                                  ]}
                                >
                                  <TextArea
                                    rows={3}
                                    className="input-item"
                                    placeholder="Hãy nhập nội dung phản hồi của bạn..."
                                  />
                                </FormItem>
                                <Row
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <Col
                                    span={24}
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
                                      Tải file hình ảnh:
                                    </span>
                                    {!DisableUploadHinhAnhEditPhanHoi ? (
                                      <Upload {...propshinhanhphanhoiedit}>
                                        <Button
                                          className="th-margin-bottom-0"
                                          style={{
                                            marginBottom: 0,
                                          }}
                                          icon={<UploadOutlined />}
                                        >
                                          Tải file hình ảnh
                                        </Button>
                                      </Upload>
                                    ) : FileHinhAnhEditPhanHoi &&
                                      FileHinhAnhEditPhanHoi.name ? (
                                      <span>
                                        <span
                                          style={{
                                            color: "#0469B9",
                                            cursor: "pointer",
                                            whiteSpace: "break-spaces",
                                          }}
                                          onClick={() =>
                                            handleViewFile(
                                              FileHinhAnhEditPhanHoi
                                            )
                                          }
                                        >
                                          {FileHinhAnhEditPhanHoi.name}{" "}
                                        </span>
                                        <DeleteOutlined
                                          style={{
                                            cursor: "pointer",
                                            color: "red",
                                          }}
                                          onClick={() => {
                                            setFileHinhAnhEditPhanHoi(null);
                                            setDisableUploadHinhAnhEditPhanHoi(
                                              false
                                            );
                                            setFieldTouchEditPhanHoi(true);
                                            setFieldsValue({
                                              modaleditphanhoi: {
                                                hinhAnh: null,
                                              },
                                            });
                                          }}
                                        />
                                      </span>
                                    ) : (
                                      <span>
                                        <a
                                          target="_blank"
                                          href={
                                            BASE_URL_API +
                                            FileHinhAnhEditPhanHoi
                                          }
                                          rel="noopener noreferrer"
                                          style={{
                                            whiteSpace: "break-spaces",
                                            wordBreak: "break-all",
                                          }}
                                        >
                                          {FileHinhAnhEditPhanHoi &&
                                            FileHinhAnhEditPhanHoi.split(
                                              "/"
                                            )[5]}{" "}
                                        </a>
                                        <DeleteOutlined
                                          style={{
                                            cursor: "pointer",
                                            color: "red",
                                          }}
                                          onClick={() => {
                                            setFileHinhAnhEditPhanHoi(null);
                                            setDisableUploadHinhAnhEditPhanHoi(
                                              false
                                            );
                                            setFieldTouchEditPhanHoi(true);
                                            setFieldsValue({
                                              modaleditphanhoi: {
                                                hinhAnh: null,
                                              },
                                            });
                                          }}
                                        />
                                      </span>
                                    )}
                                  </Col>
                                </Row>
                                <div className="col-button">
                                  <Divider />
                                  <div style={{ display: "flex" }}>
                                    <Button
                                      icon={<CloseCircleOutlined />}
                                      className="th-margin-bottom-0"
                                      onClick={() => {
                                        setIsEditPhanHoi(false);
                                        setIndexChinhSuaPhanHoi(null);
                                        setFileHinhAnhEditPhanHoi(null);
                                        setDisableUploadHinhAnhEditPhanHoi(
                                          false
                                        );
                                      }}
                                    >
                                      Hủy
                                    </Button>
                                    <Button
                                      icon={<SaveOutlined />}
                                      className="th-margin-bottom-0"
                                      type="primary"
                                      htmlType={"submit"}
                                      disabled={!FieldTouchEditPhanHoi}
                                    >
                                      Cập nhật
                                    </Button>
                                  </div>
                                </div>
                              </Form>
                            </Card>
                          </div>
                        </div>
                      ) : (
                        <div className="feedback-container" key={index}>
                          <div className="avatar">
                            <Image src={ph.hinhAnhUrl} className="avatar" />
                          </div>
                          <div className="feedback" key={index}>
                            <div className="feedback-title">
                              <div className="title">
                                <div>
                                  <span className="name">{ph.fullName}</span>{" "}
                                  {!ph.isDuyet && (
                                    <Tag
                                      color={!ph.isDuyet && "red"}
                                      style={{
                                        fontWeight: "normal",
                                        fontSize: "13px",
                                      }}
                                    >
                                      Chưa duyệt
                                    </Tag>
                                  )}
                                </div>
                                <span className="date">{ph.ngayTao}</span>
                              </div>
                              <div className="title">
                                <span>{ph.noiDung}</span>
                              </div>
                              {ph.hinhAnh && (
                                <div className="question-image">
                                  <Image
                                    src={BASE_URL_API + ph.hinhAnh}
                                    style={{ width: "130px" }}
                                    alt="Hình ảnh"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="button-container">
                              <div className="button-container">
                                <span
                                  className={`${
                                    ph.soLuongLike === 0 ? "like" : "liked"
                                  }`}
                                >
                                  {ph.soLuongLike}
                                </span>
                                <span
                                  className={`span-click ${
                                    ph.isLike === true ? "liked" : "like"
                                  }`}
                                  title="Thích phản hồi"
                                  onClick={() =>
                                    handleIsLikePhanHoi(
                                      ph.vptq_lms_PhanHoi_Id,
                                      true
                                    )
                                  }
                                >
                                  {ph.isLike ? (
                                    <LikeFilled />
                                  ) : (
                                    <LikeOutlined />
                                  )}{" "}
                                  Like
                                </span>
                              </div>
                              <Divider type="vertical" />
                              <div className="button-container">
                                <span
                                  className={`${
                                    ph.soLuongDislike === 0
                                      ? "dislike"
                                      : "disliked"
                                  }`}
                                >
                                  {ph.soLuongDislike}
                                </span>
                                <span
                                  className={`span-click ${
                                    ph.isLike === false ? "disliked" : "dislike"
                                  }`}
                                  title="Không thích phản hồi"
                                  onClick={() =>
                                    handleIsLikePhanHoi(
                                      ph.vptq_lms_PhanHoi_Id,
                                      false
                                    )
                                  }
                                >
                                  {ph.isDisLike ? (
                                    <DislikeFilled />
                                  ) : (
                                    <DislikeOutlined />
                                  )}{" "}
                                  Dislike
                                </span>
                              </div>
                              <Divider type="vertical" />
                              <div className="button-container">
                                {ph.isSua ? (
                                  <span
                                    className={`span-click liked`}
                                    title="Chỉnh sửa phản hồi"
                                    onClick={() => {
                                      setFieldsValue({
                                        modaleditphanhoi: ph,
                                      });
                                      setPhanHoi(ph);
                                      setIsEditPhanHoi(true);
                                      if (ph.hinhAnh) {
                                        setFileHinhAnhEditPhanHoi(
                                          ph && ph.hinhAnh
                                        );
                                        setDisableUploadHinhAnhEditPhanHoi(
                                          true
                                        );
                                      }
                                      setIndexChinhSuaPhanHoi(index);
                                    }}
                                  >
                                    <EditOutlined /> Chỉnh sửa
                                  </span>
                                ) : (
                                  <span
                                    className={`span-click like`}
                                    title="Chỉnh sửa phản hồi"
                                  >
                                    <EditOutlined /> Chỉnh sửa
                                  </span>
                                )}
                              </div>
                              <Divider type="vertical" />
                              <div className="button-container">
                                {ph.isXoa ? (
                                  <span
                                    className={`span-click disliked`}
                                    title="Xóa phản hồi"
                                    onClick={() =>
                                      ModalXoaPhanHoi(ph.vptq_lms_PhanHoi_Id)
                                    }
                                  >
                                    <DeleteOutlined /> Xóa
                                  </span>
                                ) : (
                                  <span
                                    className={`span-click dislike`}
                                    title="Xóa phản hồi"
                                  >
                                    <DeleteOutlined /> Xóa
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : null}
                {IndexPhanHoi === index && (
                  <Card className="th-card-margin-bottom th-card-reset-margin">
                    <Row>
                      <Col span={24} className="col-textarea">
                        <TextArea
                          rows={2}
                          className="input-item"
                          placeholder="Hãy nhập nội dung phản hồi của bạn..."
                          value={NoiDungPhanHoi}
                          onChange={handleChangePhanHoi}
                          autoFocus
                        />
                      </Col>
                      <Col span={24} className="col-upload">
                        <span className="col-span">Tải file hình ảnh:</span>
                        {!DisableUploadHinhAnhPhanHoi ? (
                          <Upload {...propshinhanhphanhoi}>
                            <Button
                              className="th-margin-bottom-0"
                              icon={<UploadOutlined />}
                            >
                              Tải file hình ảnh
                            </Button>
                          </Upload>
                        ) : (
                          <span>
                            <span
                              className="attachment-link"
                              onClick={() => handleViewFile(FileHinhAnhPhanHoi)}
                            >
                              {FileHinhAnhPhanHoi.name}{" "}
                            </span>
                            <DeleteOutlined
                              style={{ cursor: "pointer", color: "red" }}
                              onClick={() => {
                                setFileHinhAnhPhanHoi(null);
                                setDisableUploadHinhAnhPhanHoi(false);
                              }}
                            />
                          </span>
                        )}
                      </Col>
                      <Col span={24} className="col-button">
                        <Divider />
                        <Button
                          icon={<SendOutlined />}
                          className="th-margin-bottom-0"
                          type="primary"
                          onClick={() =>
                            handlePhanHoi(hd.vptq_lms_HoiDap_Id, index)
                          }
                          disabled={!NoiDungPhanHoi}
                        >
                          Gửi phản hồi
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                )}
                {index !== HoiDap.results.length - 1 && (
                  <Divider className="divider" />
                )}
              </div>
            );
          })}
      </Card>
    </div>
  );
};

export default TabsHoiDap;
