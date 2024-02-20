import {
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Card,
  Input,
  Col,
  Upload,
  Button,
  Row,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL_API } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import Helpers from "src/helpers";
import { fetchStart } from "src/appRedux/actions";

const FormItem = Form.Item;
const { TextArea } = Input;

function ModalEditHoiDap({ openModalFS, openModal, cauhoi, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [DisableUploadHinhAnh, setDisableUploadHinhAnh] = useState(false);
  const [FileDinhKem, setFileDinhKem] = useState(null);
  const [DisableUploadFileDinhKem, setDisableUploadFileDinhKem] =
    useState(false);

  useEffect(() => {
    if (openModal) {
      if (cauhoi) {
        setFieldsValue({
          modaledithoidap: cauhoi,
        });
        if (cauhoi.hinhAnh) {
          setFileHinhAnh(cauhoi && cauhoi.hinhAnh);
          setDisableUploadHinhAnh(true);
        }
        if (cauhoi.fileDinhKem) {
          setFileDinhKem(cauhoi && cauhoi.fileDinhKem);
          setDisableUploadFileDinhKem(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const propshinhanh = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnh(file);
        setDisableUploadHinhAnh(true);
        setFieldTouch(true);
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
        setFieldTouch(true);
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

  const onFinish = (values) => {
    UploadFile(values.modaledithoidap);
  };

  const UploadFile = (modaledithoidap) => {
    if (FileHinhAnh && FileHinhAnh.name && FileDinhKem && FileDinhKem.name) {
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
          modaledithoidap.hinhAnh = data[0].path;
          modaledithoidap.FileDinhKem = data[1].path;
          saveData(modaledithoidap);
        })
        .catch(() => {
          Helpers.alertError("Tải file không thành công.");
        });
    } else if (
      (FileHinhAnh && FileHinhAnh.name) ||
      (FileDinhKem && FileDinhKem.name)
    ) {
      const formData = new FormData();
      FileHinhAnh.name
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
          const newData = FileHinhAnh.name
            ? {
                ...modaledithoidap,
                hinhAnh: data.path,
                fileDinhKem: FileDinhKem && FileDinhKem,
              }
            : {
                ...modaledithoidap,
                hinhAnh: FileHinhAnh && FileHinhAnh,
                fileDinhKem: data.path,
              };
          saveData(newData);
        })
        .catch(() => {
          Helpers.alertError(
            `Tải file ${
              FileHinhAnh.name ? "hình ảnh" : "đính kèm"
            } không thành công.`
          );
        });
    } else {
      const newData = {
        ...modaledithoidap,
        hinhAnh: FileHinhAnh && FileHinhAnh,
        fileDinhKem: FileDinhKem && FileDinhKem,
      };
      saveData(newData);
    }
  };

  const saveData = (modaledithoidap) => {
    const newData = {
      ...modaledithoidap,
      vptq_lms_HoiDap_Id: cauhoi.vptq_lms_HoiDap_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/hoi-dap/${cauhoi.vptq_lms_HoiDap_Id}`,
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
          handleCancel();
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    resetFields();
    setFieldTouch(false);
    setDisableUploadHinhAnh(false);
    setFileHinhAnh(null);
    setDisableUploadFileDinhKem(false);
    setFileDinhKem(null);
    openModalFS(false);
  };

  return (
    <AntModal
      title="Chỉnh sửa câu hỏi"
      open={openModal}
      width={width >= 1600 ? `70%` : width >= 1200 ? `80%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Form
          form={form}
          layout="vertical"
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
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
            <Input className="input-item" placeholder="Nhập tiêu đề câu hỏi" />
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
                      setFieldTouch(true);
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
                      setFieldTouch(true);
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
              ) : FileDinhKem && FileDinhKem.name ? (
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
                      setFieldTouch(true);
                    }}
                  />
                </span>
              ) : (
                <span>
                  <a
                    target="_blank"
                    href={BASE_URL_API + FileDinhKem}
                    rel="noopener noreferrer"
                    style={{
                      whiteSpace: "break-spaces",
                      wordBreak: "break-all",
                    }}
                  >
                    {FileDinhKem && FileDinhKem.split("/")[5]}{" "}
                  </a>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFileDinhKem(null);
                      setDisableUploadFileDinhKem(false);
                      setFieldTouch(true);
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
              alignItems: "center",
            }}
          >
            <Divider />
            <Button
              icon={<SaveOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              htmlType={"submit"}
              disabled={!fieldTouch}
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalEditHoiDap;
