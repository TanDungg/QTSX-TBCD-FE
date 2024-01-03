import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Row,
  Button,
  Upload,
  Card,
  Divider,
  Space,
} from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { BASE_URL_API, DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import Helpers from "src/helpers";
import { getLocalStorage, getTokenInfo } from "src/util/Common";
const FormItem = Form.Item;

function ModalThemHinhAnh({ openModalFS, openModal, itemData, refesh }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListFileAnh, setListFileAnh] = useState([]);

  const props = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        Helpers.alertError(`${file.name} không phải là file hình ảnh`);
        return false;
      } else {
        setListFileAnh((prevList) => [...prevList, file]);
        return false;
      }
    },
    showUploadList: false,
    maxCount: undefined,
  };

  const hanldeDeleteHinhAnh = (file) => {
    const newListHinhAnh = ListFileAnh.filter(
      (hinhanh) => hinhanh.name !== file.name
    );

    setListFileAnh(newListHinhAnh);
  };

  const onFinish = (values) => {
    const data = values.themhinhanh;
    const formData = new FormData();
    ListFileAnh.map((file) => {
      formData.append("lstFiles", file);
    });
    fetch(`${BASE_URL_API}/api/Upload/Multi/Image`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer ".concat(INFO.token),
      },
    })
      .then((res) => res.json())
      .then((path) => {
        const newData = {
          ...itemData,
          ...data,
          list_SanPhamHinhAnhs: path.map((p) => {
            return {
              hinhAnh: p.path,
            };
          }),
        };
        saveData(newData);
      })
      .catch(() => {
        console.log("upload failed.");
      });
  };

  const saveData = (data) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPhamHinhAnh`,
          "POST",
          data,
          "ADD",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          openModalFS(false);
          resetFields();
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    openModalFS(false);
    resetFields();
    refesh();
  };

  return (
    <AntModal
      title="Thêm mới hình ảnh sản phẩm"
      open={openModal}
      width={`60%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Tên khu vực"
              name={["themhinhanh", "tenKhuVuc"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Tên khu vực" />
            </FormItem>
            <FormItem
              label="Mô tả"
              name={["themhinhanh", "moTa"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Mô tả" />
            </FormItem>
            <FormItem
              label="Hình ảnh"
              name={["themhinhanh", "list_SanPhamHinhAnhs"]}
              rules={[
                {
                  type: "file",
                  required: true,
                },
              ]}
            >
              <Space direction="vertical">
                <Upload {...props}>
                  <Button
                    style={{
                      marginBottom: 0,
                    }}
                    icon={<UploadOutlined />}
                  >
                    Tải hình ảnh sản phẩm
                  </Button>
                </Upload>
                {ListFileAnh.length !== 0 &&
                  ListFileAnh.map((hinhanh, index) => (
                    <div
                      key={index}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => ""}
                      >
                        {hinhanh.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{
                          cursor: "pointer",
                          color: "red",
                          marginLeft: "8px",
                        }}
                        onClick={() => {
                          hanldeDeleteHinhAnh(hinhanh);
                        }}
                      />
                    </div>
                  ))}
              </Space>
            </FormItem>
            <Divider />
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm mới
              </Button>
            </Row>
          </Form>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalThemHinhAnh;
