import {
  DeleteOutlined,
  DislikeFilled,
  DislikeOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LikeFilled,
  LikeOutlined,
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
import ModalEditHoiDap from "./ModalEditHoiDap";
import ModalEditPhanHoi from "./ModalEditPhanHoi";

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
  const [CauHoi, setCauHoi] = useState(null);
  const [ActiveModalEditHoiDap, setActiveModalEditHoiDap] = useState(false);
  const [PhanHoi, setPhanHoi] = useState(null);
  const [ActiveModalEditPhanHoi, setActiveModalEditPhanHoi] = useState(false);

  useEffect(() => {
    getInfo(dataHoiDap && dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
    return () => dispatch(fetchReset());
  }, [dataHoiDap]);

  const getInfo = (vptq_lms_ChuyenDeDaoTao_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/hoi-dap/${vptq_lms_ChuyenDeDaoTao_Id}`,
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
  };

  const saveData = (modalhoidap) => {
    const newData = {
      ...modalhoidap,
      vptq_lms_ChuyenDeDaoTao_Id: dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/hoi-dap`,
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
          `vptq_lms_HocTrucTuyen/hoi-dap/${vptq_lms_HoiDap_Id}`,
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
          `vptq_lms_HocTrucTuyen/phan-hoi/${vptq_lms_PhanHoi_Id}`,
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
          `${file.name} không phải là tệp PDF, Word, hoặc PowerPoint`
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

  const handleViewFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const handleRefesh = () => {
    getInfo(dataHoiDap.vptq_lms_ChuyenDeDaoTao_Id);
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
                required: true,
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
                required: true,
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
            return (
              <div className="question-container" key={index}>
                <div className="question-container">
                  <div className="user-info">
                    <Image src={hd.hinhAnhUrl} className="avatar" />
                    <div className="title">
                      <span className="name">{hd.fullName}</span>
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
                        style={{ width: "100%", height: "100%" }}
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
                          setCauHoi(hd);
                          setActiveModalEditHoiDap(true);
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
                {IndexXemPhanHoi === index && hd.phanHois
                  ? hd.phanHois.map((ph, index) => (
                      <div className="feedback-container" key={index}>
                        <div className="avatar">
                          <Image src={ph.hinhAnhUrl} className="avatar" />
                        </div>
                        <div className="feedback" key={index}>
                          <div className="feedback-title">
                            <div className="feedback-user">
                              <span className="name">{ph.fullName}</span>
                              <span className="date">{ph.ngayTao}</span>
                            </div>
                            <div className="title">
                              <span>{ph.noiDung}</span>
                            </div>
                            {ph.hinhAnh && (
                              <div className="question-image">
                                <Image
                                  src={BASE_URL_API + ph.hinhAnh}
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
                                {ph.isLike ? <LikeFilled /> : <LikeOutlined />}{" "}
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
                                    setPhanHoi(ph);
                                    setActiveModalEditPhanHoi(true);
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
                    ))
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
      <ModalEditHoiDap
        openModal={ActiveModalEditHoiDap}
        openModalFS={setActiveModalEditHoiDap}
        cauhoi={CauHoi}
        refesh={handleRefesh}
      />
      <ModalEditPhanHoi
        openModal={ActiveModalEditPhanHoi}
        openModalFS={setActiveModalEditPhanHoi}
        phanhoi={PhanHoi}
        refesh={handleRefesh}
      />
    </div>
  );
};

export default TabsHoiDap;
