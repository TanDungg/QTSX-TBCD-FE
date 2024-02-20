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

function ModalEditPhanHoi({ openModalFS, openModal, phanhoi, refesh }) {
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

  useEffect(() => {
    if (openModal) {
      if (phanhoi) {
        setFieldsValue({
          modaleditphanhoi: phanhoi,
        });
        if (phanhoi.hinhAnh) {
          setFileHinhAnh(phanhoi && phanhoi.hinhAnh);
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
    UploadFile(values.modaleditphanhoi);
  };

  const UploadFile = (modaleditphanhoi) => {
    if (FileHinhAnh && FileHinhAnh.name) {
      const formData = new FormData();
      formData.append("file", FileHinhAnh);
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
            ...modaleditphanhoi,
            hinhAnh: data.path,
            vptq_lms_PhanHoi_Id: phanhoi.vptq_lms_PhanHoi_Id,
          };
          saveData(newData);
        })
        .catch(() => {
          Helpers.alertError(`Tải file hình ảnh không thành công.`);
        });
    } else {
      const newData = {
        ...modaleditphanhoi,
        hinhAnh: FileHinhAnh && FileHinhAnh,
        vptq_lms_PhanHoi_Id: phanhoi.vptq_lms_PhanHoi_Id,
      };
      saveData(newData);
    }
  };

  const saveData = (modaleditphanhoi) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/phan-hoi/${phanhoi.vptq_lms_PhanHoi_Id}`,
          "PUT",
          modaleditphanhoi,
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
    openModalFS(false);
  };

  return (
    <AntModal
      title="Chỉnh sửa phản hồi"
      open={openModal}
      width={width >= 1600 ? `60%` : width >= 1200 ? `75%` : `100%`}
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

export default ModalEditPhanHoi;
