import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Image,
  Input,
  Row,
  Switch,
  Modal as AntModal,
  Upload,
} from "antd";
import { map } from "lodash";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  ModalDeleteConfirm,
  Select,
  Table,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_ADD_2COL_150PX,
} from "src/constants/Config";
import Helpers from "src/helpers";
import { getLocalStorage, getTokenInfo, reDataForTable } from "src/util/Common";
import ModalThemDapAn from "./ModalThemDapAn";
import ReactPlayer from "react-player";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;
const { TextArea } = Input;

const NganHangCauHoiForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width, loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [FileAnh, setFileAnh] = useState(null);
  const [DisableUploadHinhAnh, setDisableUploadHinhAnh] = useState(false);
  const [OpenImage, setOpenImage] = useState(false);
  const [FileVideo, setFileVideo] = useState(null);
  const [DisableUploadVideo, setDisableUploadVideo] = useState(false);
  const [ListDapAn, setListDapAn] = useState([]);
  const [DapAn, setDapAn] = useState(null);
  const [DataTrung, setDataTrung] = useState(null);
  const [DataLuuBoQuaTrung, setDataLuuBoQuaTrung] = useState(null);
  const [ActiveModalThemDapAn, setActiveModalThemDapAn] = useState(false);
  const [ActiveModalCauHoiTrung, setActiveModalCauHoiTrung] = useState(false);
  const [id, setId] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && permission.add) {
        setType("new");
        getListChuyenDeDaoTao();
        setFieldsValue({
          formcauhoi: {
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

  const getListChuyenDeDaoTao = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao?page=-1`,
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
          setListChuyenDeDaoTao(res.data);
        } else {
          setListChuyenDeDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_CauHoi/${id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          setInfo(data);
          getListChuyenDeDaoTao();

          if (data.hinhAnh) {
            setFileHinhAnh(data.hinhAnh);
            setDisableUploadHinhAnh(true);
          }
          if (data.video) {
            setFileVideo(data.video);
            setDisableUploadVideo(true);
          }

          setFieldsValue({
            formcauhoi: data,
          });
          setListDapAn(data.list_ChiTiets);
        }
      })
      .catch((error) => console.error(error));
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.dapAn, "đáp án");
  };

  const deleteItemAction = (item) => {
    const newDanhSach = ListDapAn.filter((ds) => ds.dapAn !== item.dapAn);
    setListDapAn(newDanhSach);
  };

  const actionContent = (item) => {
    const editItem = {
      onClick: () => {
        setActiveModalThemDapAn(true);
        setDapAn(item);
      },
    };

    const deleteItem = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...editItem} title="Chỉnh sửa đáp án">
            <EditOutlined />
          </a>
          <Divider type="vertical" />
          <a {...deleteItem} title="Xóa đáp án">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const handleThayDoiDapAnDung = (value, record) => {
    if (record.isCorrect) {
      Helpers.alertError("Bắt buộc phải có 1 đáp án đúng");
      return;
    }

    const newListDapAn = ListDapAn.map((dapan) => {
      if (String(dapan.dapAn) === String(record.dapAn)) {
        return {
          ...dapan,
          isCorrect: !dapan.isCorrect,
        };
      } else {
        return {
          ...dapan,
          isCorrect: false,
        };
      }
    });
    setFieldTouch(true);
    setListDapAn(newListDapAn);
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
      title: "Nội dung đáp án",
      dataIndex: "dapAn",
      key: "dapAn",
      align: "left",
      width: 200,
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 120,
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "Đáp án đúng",
      dataIndex: "isCorrect",
      key: "isCorrect",
      align: "center",
      width: 120,
      render: (value, record) => {
        return (
          <Checkbox
            checked={value}
            onChange={() => handleThayDoiDapAnDung(value, record)}
            disabled={value === true}
          />
        );
      },
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

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    uploadFile(values.formcauhoi);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        uploadFile(values.formcauhoi, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const uploadFile = (formcauhoi, saveQuit) => {
    if (type === "new") {
      if (formcauhoi.hinhAnh && formcauhoi.video) {
        const formData = new FormData();
        formData.append("lstFiles", formcauhoi.hinhAnh.file);
        formData.append("lstFiles", formcauhoi.video.file);
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formcauhoi.hinhAnh = data[0].path;
            formcauhoi.video = data[1].path;
            saveData(formcauhoi, saveQuit);
          })
          .catch(() => {
            Helpers.alertError("Tải file không thành công.");
          });
      } else if (formcauhoi.hinhAnh || formcauhoi.video) {
        const formData = new FormData();
        formcauhoi.hinhAnh
          ? formData.append("file", formcauhoi.hinhAnh.file)
          : formData.append("file", formcauhoi.video.file);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formcauhoi.hinhAnh
              ? (formcauhoi.hinhAnh = data.path)
              : (formcauhoi.video = data.path);
            saveData(formcauhoi, saveQuit);
          })
          .catch(() => {
            Helpers.alertError(
              `Tải file ${
                formcauhoi.hinhAnh ? "hình ảnh" : "âm thanh/video"
              } không thành công.`
            );
          });
      } else {
        saveData(formcauhoi, saveQuit);
      }
    } else {
      if (
        formcauhoi.hinhAnh &&
        formcauhoi.hinhAnh.file &&
        formcauhoi.video &&
        formcauhoi.video.file
      ) {
        const formData = new FormData();
        formData.append("lstFiles", formcauhoi.hinhAnh.file);
        formData.append("lstFiles", formcauhoi.video.file);
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formcauhoi.hinhAnh = data[0].path;
            formcauhoi.video = data[1].path;
            saveData(formcauhoi, saveQuit);
          })
          .catch(() => {
            Helpers.alertError("Tải file không thành công.");
          });
      } else if (
        (formcauhoi.hinhAnh && formcauhoi.hinhAnh.file) ||
        (formcauhoi.video && formcauhoi.video.file)
      ) {
        const formData = new FormData();
        formcauhoi.hinhAnh.file
          ? formData.append("file", formcauhoi.hinhAnh.file)
          : formData.append("file", formcauhoi.video.file);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formcauhoi.hinhAnh.file
              ? (formcauhoi.hinhAnh = data.path)
              : (formcauhoi.video = data.path);
            saveData(formcauhoi, saveQuit);
          })
          .catch(() => {
            Helpers.alertError(
              `Tải file ${
                formcauhoi.hinhAnh.file ? "hình ảnh" : "âm thanh/video"
              } không thành công.`
            );
          });
      } else {
        saveData(formcauhoi, saveQuit);
      }
    }
  };

  const saveData = (formcauhoi, saveQuit = false) => {
    const newData = {
      ...formcauhoi,
      isSuDung: formcauhoi.isSuDung ? formcauhoi.isSuDung : false,
      isXaoDapAn: formcauhoi.isXaoDapAn ? formcauhoi.isXaoDapAn : false,
      list_ChiTiets: ListDapAn,
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_CauHoi/kiem-tra-cau-hoi?donViHienHanh_Id=${INFO.donVi_Id}`,
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
              setDisableUploadHinhAnh(false);
              setFileHinhAnh(null);
              setDisableUploadVideo(false);
              setFileVideo(null);
              setListDapAn([]);
              setFieldsValue({
                formcauhoi: {
                  isSuDung: true,
                },
              });
            }
          } else {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
              setDataTrung(res.data.cauHoiTrung);
              setDataLuuBoQuaTrung(res.data.data);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...formcauhoi,
        id: id,
        isSuDung: formcauhoi.isSuDung ? formcauhoi.isSuDung : false,
        isXaoDapAn: formcauhoi.isXaoDapAn ? formcauhoi.isXaoDapAn : false,
        list_ChiTiets: ListDapAn,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_CauHoi/${id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleLuuTrung = (quit) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_CauHoi/cau-hoi-sau-kiem-tra?donViHienHanh_Id=${INFO.donVi_Id}`,
          "POST",
          DataLuuBoQuaTrung,
          "ADD",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          if (quit) {
            goBack();
          } else {
            resetFields();
            setFieldTouch(false);
            setListDapAn([]);
            setDapAn(null);
            setDataTrung(null);
            setDataLuuBoQuaTrung(null);
            setDisableUploadHinhAnh(false);
            setFileHinhAnh(null);
            setDisableUploadVideo(false);
            setFileVideo(null);
            setFieldsValue({
              formcauhoi: {
                isSuDung: true,
              },
            });
          }
        } else {
          if (quit) {
            goBack();
          } else {
            setFieldTouch(false);
          }
        }
      })
      .catch((error) => console.error(error));
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
        const reader = new FileReader();
        reader.onload = (e) => setFileAnh(e.target.result);
        reader.readAsDataURL(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

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
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleThemDapAn = (data) => {
    if (type === "new" || (type === "edit" && !data.isChinhSua)) {
      const chitiet = ListDapAn.find(
        (listdapan) => String(listdapan.dapAn) === String(data.dapAn)
      );
      const title = (
        <span>
          Đáp án{" "}
          <span style={{ fontWeight: "bold", color: "red" }}>{data.dapAn}</span>{" "}
          đã được thêm
        </span>
      );

      if (chitiet) {
        Helpers.alertError(title);
      } else {
        setListDapAn([...ListDapAn, data]);
        setFieldTouch(true);
      }
    } else if (type === "edit" && data.isChinhSua) {
      const newListDapAn = [...ListDapAn];
      newListDapAn.forEach((dapan, index) => {
        if (
          dapan.vptq_lms_DapAn_Id.toLowerCase() ===
          data.vptq_lms_DapAn_Id.toLowerCase()
        ) {
          newListDapAn[index] = {
            ...dapan,
            dapAn: data.dapAn,
            hinhAnh: data.hinhAnh,
            moTa: data.moTa,
          };
        }
      });
      setListDapAn(newListDapAn);
      setFieldTouch(true);
    }
  };

  const handleRefesh = () => {
    setDapAn(null);
  };

  const handleViewFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  const formTitle = type === "new" ? "Thêm mới câu hỏi" : "Chỉnh sửa câu hỏi";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Form
          {...DEFAULT_FORM_ADD_2COL_150PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Thông tin câu hỏi"}
          >
            <Row
              align={width >= 1600 ? "" : "center"}
              style={{ width: "100%", padding: "0px 50px" }}
            >
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Nội dung"
                  name={["formcauhoi", "noiDung"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <TextArea
                    rows={2}
                    className="input-item"
                    placeholder="Nhập nội dung câu hỏi"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Chuyên đề"
                  name={["formcauhoi", "vptq_lms_ChuyenDeDaoTao_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListChuyenDeDaoTao ? ListChuyenDeDaoTao : []}
                    placeholder="Chọn chuyên đề đào tạo"
                    optionsvalue={["id", "tenChuyenDeDaoTao"]}
                    style={{ width: "100%" }}
                    optionFilterProp="name"
                    showSearch
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Hình ảnh"
                  name={["formcauhoi", "hinhAnh"]}
                  rules={[
                    {
                      type: "file",
                    },
                  ]}
                >
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
                  ) : FileHinhAnh && FileHinhAnh.name ? (
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
                            formcauhoi: {
                              hinhAnh: null,
                            },
                          });
                        }}
                      />
                      <Image
                        width={100}
                        src={FileAnh}
                        alt="preview"
                        style={{
                          display: "none",
                        }}
                        preview={{
                          visible: OpenImage,
                          scaleStep: 0.5,
                          src: FileAnh,
                          onVisibleChange: (value) => {
                            setOpenImage(value);
                          },
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + FileHinhAnh}
                        rel="noopener noreferrer"
                        style={{
                          whiteSpace: "break-spaces",
                          wordBreak: "break-all",
                        }}
                      >
                        {FileHinhAnh && FileHinhAnh.split("/")[5]}{" "}
                      </a>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFileHinhAnh(null);
                          setDisableUploadHinhAnh(false);
                          setFieldsValue({
                            formcauhoi: {
                              hinhAnh: null,
                            },
                          });
                        }}
                      />
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Âm thanh/Video"
                  name={["formcauhoi", "video"]}
                  rules={[
                    {
                      type: "file",
                    },
                  ]}
                >
                  {!DisableUploadVideo ? (
                    <Upload {...propsvideo}>
                      <Button
                        className="th-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                        disabled={type === "detail" ? true : false}
                      >
                        Tải file âm thanh/video
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
                        onClick={() => handleViewFile(FileVideo)}
                      >
                        {FileVideo.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        disabled={
                          type === "new" || type === "edit" ? false : true
                        }
                        onClick={() => {
                          setFileVideo(null);
                          setDisableUploadVideo(false);
                          setFieldsValue({
                            formcauhoi: {
                              video: null,
                            },
                          });
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + FileVideo}
                        rel="noopener noreferrer"
                        style={{
                          whiteSpace: "break-spaces",
                          wordBreak: "break-all",
                        }}
                      >
                        {FileVideo && FileVideo.split("/")[5]}{" "}
                      </a>
                      {(type === "new" || type === "edit") && (
                        <DeleteOutlined
                          style={{ cursor: "pointer", color: "red" }}
                          disabled={
                            type === "new" || type === "edit" ? false : true
                          }
                          onClick={() => {
                            setFileVideo(null);
                            setDisableUploadVideo(false);
                            setFieldsValue({
                              formcauhoi: {
                                video: null,
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
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Sử dụng"
                  name={["formcauhoi", "isSuDung"]}
                  valuePropName="checked"
                >
                  <Switch />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Xáo trộn đáp án"
                  name={["formcauhoi", "isXaoDapAn"]}
                  valuePropName="checked"
                >
                  <Switch />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={16}
                lg={18}
                md={20}
                sm={22}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Ghi chú"
                  name={["formcauhoi", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập ghi chú" />
                </FormItem>
              </Col>
              {DataTrung && (
                <Col
                  xxl={12}
                  xl={14}
                  lg={16}
                  md={16}
                  sm={20}
                  xs={24}
                  style={{
                    padding: "0px 30px",
                    marginBottom: "5px",
                  }}
                >
                  <FormItem label="Câu hỏi trùng">
                    <span
                      onClick={() => {
                        setActiveModalCauHoiTrung(true);
                      }}
                      title="Xem câu hỏi trùng"
                      style={{
                        color: "#0469b9",
                        fontWeight: "bold",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Xem câu hỏi trùng
                    </span>
                  </FormItem>
                </Col>
              )}
            </Row>
          </Card>
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Danh sách đáp án"}
          >
            <div align={"end"} style={{ marginBottom: "10px" }}>
              <Button
                className="th-margin-bottom-0"
                icon={<PlusCircleOutlined />}
                onClick={() => setActiveModalThemDapAn(true)}
                type="primary"
              >
                Thêm đáp án
              </Button>
            </div>
            <Table
              bordered
              columns={columns}
              scroll={{ x: 1300, y: "35vh" }}
              components={components}
              className="gx-table-responsive th-table"
              dataSource={reDataForTable(ListDapAn)}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
              loading={loading}
            />
          </Card>
          {!DataTrung ? (
            <FormSubmit
              goBack={goBack}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                icon={<RollbackOutlined />}
                type="default"
                className="th-margin-bottom-0"
                onClick={goBack}
              >
                Quay lại
              </Button>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                className="th-margin-bottom-0"
                onClick={() => handleLuuTrung(false)}
              >
                Lưu bỏ qua trùng
              </Button>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                className="th-margin-bottom-0"
                onClick={() => handleLuuTrung(true)}
              >
                Lưu bỏ qua trùng và thoát
              </Button>
              <Button
                icon={<SaveOutlined />}
                type="danger"
                className="th-margin-bottom-0"
                onClick={() => {
                  resetFields();
                  setFieldTouch(false);
                  setListDapAn([]);
                  setDapAn(null);
                  setDataTrung(null);
                  setDataLuuBoQuaTrung(null);
                  setDisableUploadHinhAnh(false);
                  setFileHinhAnh(null);
                  setDisableUploadVideo(false);
                  setFileVideo(null);
                  setFieldsValue({
                    formcauhoi: {
                      isSuDung: true,
                    },
                  });
                }}
              >
                Xóa dữ liệu
              </Button>
            </div>
          )}
        </Form>
      </Card>
      <ModalThemDapAn
        openModal={ActiveModalThemDapAn}
        openModalFS={setActiveModalThemDapAn}
        chitiet={DapAn}
        itemData={info}
        refesh={handleRefesh}
        DataThemDapAn={handleThemDapAn}
      />
      <AntModal
        title={`Chi tiết câu hỏi ${DataTrung && DataTrung.maCauHoi}`}
        className="th-card-reset-margin"
        open={ActiveModalCauHoiTrung}
        width={width >= 768 ? `50%` : "100%"}
        closable={true}
        onCancel={() => setActiveModalCauHoiTrung(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row>
            <Col
              span={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "70px",
                  fontWeight: "bold",
                }}
              >
                Câu hỏi:
              </span>
              {DataTrung && (
                <span
                  style={{
                    width: "calc(100% - 70px)",
                  }}
                >
                  {DataTrung.noiDung}
                </span>
              )}
            </Col>
            {DataTrung && DataTrung.hinhAnh && (
              <Col
                lg={12}
                xs={24}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Image
                  src={BASE_URL_API + DataTrung.hinhAnh}
                  alt="Hình ảnh"
                  style={{ maxWidth: "120px", maxHeight: "120px" }}
                />
              </Col>
            )}
            {DataTrung && DataTrung.video && (
              <Col
                lg={12}
                xs={24}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {DataTrung.video.endsWith(".mp4") ? (
                  <ReactPlayer
                    style={{ cursor: "pointer" }}
                    url={BASE_URL_API + DataTrung.video}
                    width="200px"
                    height="120px"
                    playing={true}
                    muted={true}
                    controls={false}
                    onClick={() => {
                      window.open(BASE_URL_API + DataTrung.video, "_blank");
                    }}
                  />
                ) : (
                  <a
                    target="_blank"
                    href={BASE_URL_API + DataTrung.video}
                    rel="noopener noreferrer"
                  >
                    {DataTrung.video.split("/")[5]}
                  </a>
                )}
              </Col>
            )}
          </Row>
          <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              color: "#0469b9",
              background: "none",
              fontWeight: "bold",
            }}
          >
            Đáp án
          </Divider>
          <Row gutter={[0, 10]}>
            {ListDapAn.length &&
              ListDapAn.map((dapan, index) => {
                return (
                  <Col
                    span={24}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      fontWeight: dapan.isCorrect && "bold",
                      backgroundColor: dapan.isCorrect && "#A9FABF",
                      color: dapan.isCorrect && "#0469b9",
                    }}
                  >
                    <span
                      style={{
                        width: "30px",
                        fontWeight: "bold",
                      }}
                    >
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {DataTrung && (
                      <span
                        style={{
                          width: "calc(100% - 30px)",
                        }}
                      >
                        {dapan.dapAn}
                      </span>
                    )}
                  </Col>
                );
              })}
          </Row>
        </Card>
      </AntModal>
    </div>
  );
};

export default NganHangCauHoiForm;
