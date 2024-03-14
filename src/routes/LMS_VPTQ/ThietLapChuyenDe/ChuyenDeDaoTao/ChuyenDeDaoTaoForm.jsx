import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Progress,
  Switch,
  Upload,
  message,
} from "antd";
import axios from "axios";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  HINHTHUCDAOTAO_ONLINE,
  DEFAULT_FORM_ADD_170PX,
  HINHTHUCDAOTAO_TUHOC,
  HINHTHUCDAOTAO_TAPTRUNG,
  HINHTHUCDAOTAO_NOIBO,
} from "src/constants/Config";
import Helpers from "src/helpers";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const { TextArea } = Input;
const FormItem = Form.Item;

const ChuyenDeDaoTaoForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [ListGiangVien, setListGiangVien] = useState([]);
  const [ListHinhThuc, setListHinhThuc] = useState([]);
  const [HinhThucDaoTao, setHinhThucDaoTao] = useState(null);
  const [FileVideo, setFileVideo] = useState(null);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [DisableUploadVideo, setDisableUploadVideo] = useState(false);
  const [FileTaiLieu, setFileTaiLieu] = useState(null);
  const [DisableUploadTaiLieu, setDisableUploadTaiLieu] = useState(false);
  const [id, setId] = useState(null);
  const [ImageUrl, setImageUrl] = useState();
  const [Path, setPath] = useState();
  const [LoadingVideo, setLoadingVideo] = useState(null);
  const [ErrorLoadingVideo, setErrorLoadingVideo] = useState(false);
  const [LoadingTaiLieu, setLoadingTaiLieu] = useState(null);
  const [ErrorLoadingTaiLieu, setErrorLoadingTaiLieu] = useState(false);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListKienThuc();
        getListGiangVien();
        getListHinhThuc();
        setFieldsValue({
          formchuyendedaotao: {
            isSuDung: true,
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

  const getListKienThuc = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_KienThuc?page=-1`,
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
          setListKienThuc(res.data);
        } else {
          setListKienThuc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListGiangVien = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_GiangVien?page=-1`,
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
          setListGiangVien(res.data);
        } else {
          setListGiangVien([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListHinhThuc = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HinhThucDaoTao?page=-1`,
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
          setListHinhThuc(res.data);
        } else {
          setListHinhThuc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const convertToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(BASE_URL_API + imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result;
        setImageUrl(base64Data);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Lỗi chuyển dữ liệu sang base64:", error);
    }
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao/${id}`,
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
          getListKienThuc();
          getListGiangVien();
          getListHinhThuc();
          setHinhThucDaoTao(data.vptq_lms_HinhThucDaoTao_Id);
          if (data.fileVideo) {
            setDisableUploadVideo(true);
            setFileVideo(data.fileVideo);
          }
          if (data.fileTaiLieu) {
            setDisableUploadTaiLieu(true);
            setFileTaiLieu(data.fileTaiLieu);
          }
          if (data.anhDaiDienChuyenDe) {
            setPath(data.anhDaiDienChuyenDe);
            convertToBase64(data.anhDaiDienChuyenDe);
            setFileHinhAnh(data.anhDaiDienChuyenDe);
          }
          setFieldsValue({
            formchuyendedaotao: data,
          });
        }
      })
      .catch((error) => console.error(error));
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
    setErrorLoadingVideo(false);
    setErrorLoadingTaiLieu(false);
    uploadFile(values.formchuyendedaotao);
  };

  const saveAndClose = () => {
    setErrorLoadingVideo(false);
    setErrorLoadingTaiLieu(false);
    validateFields()
      .then((values) => {
        uploadFile(values.formchuyendedaotao, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = async (formchuyendedaotao, saveQuit) => {
    if (type === "new") {
      if (
        (!FileVideo || !FileTaiLieu || !FileHinhAnh) &&
        formchuyendedaotao.vptq_lms_HinhThucDaoTao_Id === HINHTHUCDAOTAO_ONLINE
      ) {
        if (!FileVideo) {
          Helpers.alertWarning("Vui lòng tải file video lên!");
        }
        if (!FileTaiLieu) {
          Helpers.alertWarning("Vui lòng tải file tài liệu lên!");
        }
        if (!FileHinhAnh) {
          Helpers.alertWarning("Vui lòng tải hình ảnh đại diện lên!");
        }
      } else {
        if (FileVideo) {
          const formDataVideo = new FormData();
          formDataVideo.append("file", FileVideo);
          const responseVideo = await axios.post(
            BASE_URL_API + "/api/Upload",
            formDataVideo,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${INFO.token}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setLoadingVideo(percentCompleted);
              },
            }
          );
          formchuyendedaotao.fileVideo = await responseVideo.data.path;
        }
        if (FileTaiLieu || FileHinhAnh) {
          const formData = new FormData();
          FileTaiLieu && formData.append("lstFiles", FileTaiLieu);
          FileHinhAnh && formData.append("lstFiles", FileHinhAnh);
          const response = await axios.post(
            BASE_URL_API + "/api/Upload/Multi",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${INFO.token}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setLoadingTaiLieu(percentCompleted);
              },
            }
          );
          const dataPath = await response.data;
          formchuyendedaotao.fileTaiLieu = FileTaiLieu && dataPath[0].path;
          formchuyendedaotao.anhDaiDienChuyenDe = FileTaiLieu
            ? dataPath[1].path
            : dataPath[0].path;
        }
        saveData(formchuyendedaotao, saveQuit);
      }
    } else {
      if (
        (!FileVideo || !FileTaiLieu || !FileHinhAnh) &&
        formchuyendedaotao.vptq_lms_HinhThucDaoTao_Id === HINHTHUCDAOTAO_ONLINE
      ) {
        if (!FileVideo) {
          Helpers.alertWarning("Vui lòng tải file video lên!");
        }
        if (!FileTaiLieu) {
          Helpers.alertWarning("Vui lòng tải file tài liệu lên!");
        }
        if (!FileHinhAnh) {
          Helpers.alertWarning("Vui lòng tải hình ảnh đại diện lên!");
        }
      } else {
        if (FileVideo && FileVideo.name) {
          const formDataVideo = new FormData();
          formDataVideo.append("file", FileVideo);
          const responseVideo = await axios.post(
            BASE_URL_API + "/api/Upload",
            formDataVideo,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${INFO.token}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setLoadingVideo(percentCompleted);
              },
            }
          );
          formchuyendedaotao.fileVideo = await responseVideo.data.path;
        }
        if (
          (FileTaiLieu && FileTaiLieu.name) ||
          (FileHinhAnh && FileHinhAnh.name)
        ) {
          const formData = new FormData();
          FileTaiLieu &&
            FileTaiLieu.name &&
            formData.append("lstFiles", FileTaiLieu);
          FileHinhAnh &&
            FileHinhAnh.name &&
            formData.append("lstFiles", FileHinhAnh);
          const response = await axios.post(
            BASE_URL_API + "/api/Upload/Multi",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${INFO.token}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setLoadingTaiLieu(percentCompleted);
              },
            }
          );
          const dataPath = await response.data;
          formchuyendedaotao.fileTaiLieu =
            FileHinhAnh && FileHinhAnh.name && dataPath[0].path;
          formchuyendedaotao.anhDaiDienChuyenDe =
            FileHinhAnh && FileHinhAnh.name
              ? dataPath[1].path
              : dataPath[0].path;
        }
        saveData(formchuyendedaotao, saveQuit);
      }
    }
  };

  const saveData = (formchuyendedaotao, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...formchuyendedaotao,
        thoiLuongDaoTao: parseInt(formchuyendedaotao.thoiLuongDaoTao),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_ChuyenDeDaoTao`,
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
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setDisableUploadVideo(false);
              setFileVideo(null);
              setDisableUploadTaiLieu(false);
              setFileTaiLieu(null);
              setFileHinhAnh(null);
              setLoadingVideo(null);
              setLoadingTaiLieu(null);
              setPath(null);
              setImageUrl(null);
              setFieldsValue({
                formchuyendedaotao: {
                  isSuDung: true,
                },
              });
            }
          } else {
            if (saveQuit) {
              goBack();
            } else {
              setLoadingVideo(null);
              setLoadingTaiLieu(null);
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    } else if (type === "edit") {
      const newData = {
        ...formchuyendedaotao,
        id: id,
        anhDaiDienChuyenDe: Path,
        thoiLuongDaoTao: parseInt(formchuyendedaotao.thoiLuongDaoTao),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_ChuyenDeDaoTao/${id}`,
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
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            getInfo(id);
            setLoadingVideo(null);
            setLoadingTaiLieu(null);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleSelectHinhThucDaoTao = (value) => {
    setHinhThucDaoTao(value);
    setPath(null);
    setImageUrl(null);
    setFieldsValue({
      formchuyendedaotao: {
        anhDaiDienChuyenDe: null,
      },
    });
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  const propsvideo = {
    accept: "video/*",
    beforeUpload: (file) => {
      const isVideo = file.type.startsWith("video/");
      if (!isVideo) {
        Helpers.alertError(`${file.name} không phải là định dạng video hợp lệ`);
        return false;
      } else {
        setFileVideo(file);
        setDisableUploadVideo(true);
        setErrorLoadingVideo(false);
        setLoadingVideo(null);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const propstailieu = {
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

      setFileTaiLieu(file);
      setDisableUploadTaiLieu(true);
      setErrorLoadingTaiLieu(false);
      setLoadingTaiLieu(null);
      return false;
    },
    showUploadList: false,
    maxCount: 1,
  };
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Vui lòng tải file ảnh!");
    } else {
      const reader = new FileReader();
      setFileHinhAnh(file);
      reader.onload = (e) => setImageUrl(e.target.result);
      reader.readAsDataURL(file);
    }
    return false;
  };
  const handleOpenFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const formTitle =
    type === "new"
      ? "Thêm mới chuyên đề đào tạo"
      : "Chỉnh sửa chuyên đề đào tạo";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align={"center"}
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_170PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Tên chuyên đề"
              name={["formchuyendedaotao", "tenChuyenDeDaoTao"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên chuyên đề đào tạo không được quá 250 ký tự",
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Nhập tên chuyên đề đào tạo"
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Mô tả chuyên đề"
              name={["formchuyendedaotao", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <TextArea
                rows={5}
                className="input-item"
                placeholder="Nhập mô tả chuyên đề đào tạo"
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Kiến thức"
              name={["formchuyendedaotao", "vptq_lms_KienThuc_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListKienThuc ? ListKienThuc : []}
                placeholder="Chọn chuyên đề đào tạo"
                optionsvalue={["id", "tenKienThuc"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Hình thức đào tạo"
              name={["formchuyendedaotao", "vptq_lms_HinhThucDaoTao_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListHinhThuc ? ListHinhThuc : []}
                placeholder="Chọn hình thức đào tạo"
                optionsvalue={["id", "tenHinhThucDaoTao"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
                onSelect={handleSelectHinhThucDaoTao}
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Giảng viên"
              name={["formchuyendedaotao", "vptq_lms_GiangVien_Id"]}
              rules={[
                {
                  type: "string",
                  required:
                    (HinhThucDaoTao &&
                      HinhThucDaoTao === HINHTHUCDAOTAO_ONLINE) ||
                    (HinhThucDaoTao &&
                      HinhThucDaoTao === HINHTHUCDAOTAO_TAPTRUNG) ||
                    (HinhThucDaoTao && HinhThucDaoTao === HINHTHUCDAOTAO_NOIBO)
                      ? true
                      : false,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListGiangVien ? ListGiangVien : []}
                placeholder="Chọn giảng viên đào tạo"
                optionsvalue={["id", "tenGiangVien"]}
                style={{ width: "100%" }}
                optionFilterProp="name"
                showSearch
                disabled={type !== "new"}
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Thời lượng đào tạo"
              name={["formchuyendedaotao", "thoiLuongDaoTao"]}
              rules={[
                {
                  required:
                    HinhThucDaoTao && HinhThucDaoTao === HINHTHUCDAOTAO_TUHOC
                      ? false
                      : true,
                },
              ]}
            >
              <Input
                type="number"
                className="input-item"
                placeholder="Nhập thời lượng đào tạo (Phút)"
              />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Video đào tạo"
              name={["formchuyendedaotao", "fileVideo"]}
              rules={[
                {
                  type: "file",
                  required:
                    HinhThucDaoTao && HinhThucDaoTao === HINHTHUCDAOTAO_ONLINE,
                },
              ]}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                {!DisableUploadVideo ? (
                  <Upload {...propsvideo}>
                    <Button
                      className="th-margin-bottom-0 btn-margin-bottom-0"
                      style={{
                        marginBottom: 0,
                      }}
                      icon={<UploadOutlined />}
                    >
                      Tải file video
                    </Button>
                  </Upload>
                ) : FileVideo && FileVideo.name ? (
                  <span>
                    <span
                      style={{
                        color: "#0469B9",
                        cursor: "pointer",
                        whiteSpace: "break-spaces",
                      }}
                      onClick={() => handleOpenFile(FileVideo)}
                    >
                      {FileVideo.name}{" "}
                    </span>
                    {LoadingVideo !== null ? (
                      <DeleteOutlined
                        style={{ cursor: "no-drop", color: "#545454" }}
                      />
                    ) : (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFileVideo(null);
                          setDisableUploadVideo(false);
                          setFieldsValue({
                            formchuyendedaotao: {
                              fileVideo: null,
                            },
                          });
                        }}
                      />
                    )}
                  </span>
                ) : (
                  <span>
                    <a
                      target="_blank"
                      href={BASE_URL_API + FileVideo}
                      rel="noopener noreferrer"
                    >
                      {FileVideo && FileVideo.split("/")[5]}{" "}
                    </a>
                    {LoadingVideo !== null ? (
                      <DeleteOutlined
                        style={{ cursor: "no-drop", color: "#545454" }}
                      />
                    ) : (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFieldTouch(true);
                          setFileVideo(null);
                          setDisableUploadVideo(false);
                          setFieldsValue({
                            formchuyendedaotao: {
                              fileVideo: null,
                            },
                          });
                        }}
                      />
                    )}
                  </span>
                )}
                {LoadingVideo !== null && (
                  <Progress
                    percent={parseFloat(LoadingVideo.toFixed(2))}
                    type="line"
                    status={ErrorLoadingVideo ? "exception" : ""}
                  />
                )}
              </div>
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="File tài liệu"
              name={["formchuyendedaotao", "fileTaiLieu"]}
              rules={[
                {
                  type: "file",
                  required:
                    HinhThucDaoTao && HinhThucDaoTao === HINHTHUCDAOTAO_ONLINE
                      ? true
                      : false,
                },
              ]}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                {!DisableUploadTaiLieu ? (
                  <Upload {...propstailieu}>
                    <Button
                      className="th-margin-bottom-0 btn-margin-bottom-0"
                      style={{
                        marginBottom: 0,
                      }}
                      icon={<UploadOutlined />}
                    >
                      Tải file tài liệu
                    </Button>
                  </Upload>
                ) : FileTaiLieu && FileTaiLieu.name ? (
                  <span>
                    <span
                      style={{
                        color: "#0469B9",
                        cursor: "pointer",
                        whiteSpace: "break-spaces",
                      }}
                      onClick={() => handleOpenFile(FileTaiLieu)}
                    >
                      {FileTaiLieu.name}{" "}
                    </span>
                    {LoadingTaiLieu !== null ? (
                      <DeleteOutlined
                        style={{ cursor: "no-drop", color: "#545454" }}
                      />
                    ) : (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFileTaiLieu(null);
                          setDisableUploadTaiLieu(false);
                          setFieldsValue({
                            formchuyendedaotao: {
                              fileTaiLieu: null,
                            },
                          });
                        }}
                      />
                    )}
                  </span>
                ) : (
                  <span>
                    <a
                      target="_blank"
                      href={BASE_URL_API + FileTaiLieu}
                      rel="noopener noreferrer"
                    >
                      {FileTaiLieu && FileTaiLieu.split("/")[5]}{" "}
                    </a>
                    {LoadingTaiLieu !== null ? (
                      <DeleteOutlined
                        style={{ cursor: "no-drop", color: "#545454" }}
                      />
                    ) : (
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFieldTouch(true);
                          setFileTaiLieu(null);
                          setDisableUploadTaiLieu(false);
                          setFieldsValue({
                            formchuyendedaotao: {
                              fileTaiLieu: null,
                            },
                          });
                        }}
                      />
                    )}
                  </span>
                )}
                {LoadingTaiLieu !== null && (
                  <Progress
                    percent={parseFloat(LoadingTaiLieu.toFixed(2))}
                    type="line"
                    status={ErrorLoadingTaiLieu ? "exception" : ""}
                  />
                )}
              </div>
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Sử dụng"
              name={["formchuyendedaotao", "isSuDung"]}
              valuePropName="checked"
            >
              <Switch />
            </FormItem>
          </Col>
          <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
            <FormItem
              label="Ghi chú"
              name={["formchuyendedaotao", "ghiChu"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập ghi chú" />
            </FormItem>
          </Col>
          {HinhThucDaoTao && HinhThucDaoTao === HINHTHUCDAOTAO_ONLINE ? (
            <Col xxl={14} xl={16} lg={18} md={20} sm={24} xs={24}>
              <FormItem
                label="Hình ảnh đại diện"
                name={["formchuyendedaotao", "anhDaiDienChuyenDe"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  style={{ width: "250px", height: "250px" }}
                >
                  {ImageUrl ? (
                    <img
                      style={{ maxWidth: "100%", height: "100%" }}
                      src={ImageUrl}
                      alt="Hình ảnh đại diện chuyên đề"
                    />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </FormItem>
            </Col>
          ) : null}
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </div>
  );
};

export default ChuyenDeDaoTaoForm;
