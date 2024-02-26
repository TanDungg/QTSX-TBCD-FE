import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Card,
  Input,
  Col,
  Upload,
  Button,
  Image,
} from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FormSubmit } from "src/components/Common";
import { BASE_URL_API, DEFAULT_FORM_ADD_150PX } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
import Helpers from "src/helpers";

const FormItem = Form.Item;
const { TextArea } = Input;

function ModalThemDapAn({
  openModalFS,
  openModal,
  chitiet,
  refesh,
  DataThemDapAn,
  indexDapAn,
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [DisableUploadHinhAnh, setDisableUploadHinhAnh] = useState(false);
  const [FileAnh, setFileAnh] = useState(null);
  const [OpenImage, setOpenImage] = useState(false);
  const [isChinhSua, setIsChinhSua] = useState(false);

  useEffect(() => {
    if (openModal) {
      if (chitiet) {
        setIsChinhSua(true);
        setFieldsValue({
          modalthemdapan: chitiet,
        });
        if (chitiet.hinhAnh) {
          setFileHinhAnh(chitiet && chitiet.hinhAnh);
          setFileAnh(chitiet && chitiet.hinhAnh);
          setDisableUploadHinhAnh(true);
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
        const reader = new FileReader();
        reader.onload = (e) => setFileAnh(e.target.result);
        reader.readAsDataURL(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const onFinish = (values) => {
    UploadFile(values.modalthemdapan);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        UploadFile(values.modalthemdapan, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const UploadFile = (modalthemdapan, saveQuit) => {
    if (!chitiet && modalthemdapan.hinhAnh) {
      const formData = new FormData();
      formData.append("file", modalthemdapan.hinhAnh.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          modalthemdapan.hinhAnh = data.path;
          ThemDapAn(modalthemdapan, saveQuit);
        })
        .catch(() => {
          Helpers.alertError("Tải hình ảnh không thành công.");
        });
    } else if (
      chitiet &&
      modalthemdapan.hinhAnh &&
      modalthemdapan.hinhAnh.file
    ) {
      const formData = new FormData();
      formData.append("file", modalthemdapan.hinhAnh.file);
      fetch(
        chitiet.hinhAnh
          ? `${BASE_URL_API}/api/Upload?stringPath=${chitiet.hinhAnh}`
          : `${BASE_URL_API}/api/Upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          modalthemdapan.hinhAnh = data.path;
          ThemDapAn(modalthemdapan, saveQuit);
        })
        .catch(() => {
          Helpers.alertError("Tải hình ảnh không thành công.");
        });
    } else {
      ThemDapAn(modalthemdapan, saveQuit);
    }
  };

  const ThemDapAn = (modalthemdapan, saveQuit = false) => {
    DataThemDapAn({
      ...modalthemdapan,
      isCorrect: isChinhSua ? chitiet.isCorrect : false,
      isChinhSua: isChinhSua,
      vptq_lms_DapAn_Id: chitiet && chitiet.vptq_lms_DapAn_Id,
      indexDapAn: isChinhSua && indexDapAn,
    });
    resetFields();
    setDisableUploadHinhAnh(false);
    setFileAnh(null);
    setFileHinhAnh(null);
    setFieldTouch(false);
    if (saveQuit || chitiet) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    resetFields();
    setFieldTouch(false);
    setFileAnh(null);
    setFileHinhAnh(null);
    openModalFS(false);
    setIsChinhSua(false);
    refesh();
  };

  return (
    <AntModal
      title="Thêm đáp án"
      open={openModal}
      width={width > 1000 ? `60%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_150PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Nội dung đáp án"
              name={["modalthemdapan", "dapAn"]}
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
                placeholder="Nhập nội dung đáp án"
              />
            </FormItem>
          </Col>
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Hình ảnh"
              name={["modalthemdapan", "hinhAnh"]}
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
                    onClick={() => setOpenImage(true)}
                  >
                    {FileHinhAnh.name}{" "}
                  </span>
                  <DeleteOutlined
                    style={{ cursor: "pointer", color: "red" }}
                    onClick={() => {
                      setFileHinhAnh(null);
                      setDisableUploadHinhAnh(false);
                      setFieldTouch(true);
                      setFieldsValue({
                        modalthemdapan: {
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
                      setFieldTouch(true);
                      setFieldsValue({
                        modalthemdapan: {
                          hinhAnh: null,
                        },
                      });
                    }}
                  />
                </span>
              )}
            </FormItem>
          </Col>
          <Col xxl={18} xl={20} lg={22} xs={24}>
            <FormItem
              label="Ghi chú"
              name={["modalthemdapan", "moTa"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <TextArea
                rows={3}
                className="input-item"
                placeholder="Nhập ghi chú"
              />
            </FormItem>
          </Col>
          {!chitiet ? (
            <FormSubmit
              goBack={handleCancel}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          ) : (
            <FormSubmit goBack={handleCancel} disabled={fieldTouch} />
          )}
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalThemDapAn;
