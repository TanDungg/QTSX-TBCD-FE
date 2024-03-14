import { CloseCircleOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Button,
  Card,
  Col,
  Divider,
} from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";
import { getTokenInfo, getLocalStorage } from "src/util/Common";
const FormItem = Form.Item;

function ModalHuyDaoTao({ openModalFS, openModal, hocvien, refesh }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;

  const onFinish = (values) => {
    saveData(values.modalhuydaotao);
  };

  const saveData = (modalhuydaotao) => {
    const newData = {
      vptq_lms_LopHocChiTiet_Id: hocvien.vptq_lms_LopHocChiTiet_Id,
      lyDoHuy: modalhuydaotao.lyDoHuy,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_TheoDoiDaoTao/huy-dao-tao/${hocvien.vptq_lms_LopHocChiTiet_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
          "PUT",
          newData,
          "CANCEL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          handleCancel();
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    resetFields();
    openModalFS(false);
    refesh();
  };

  return (
    <AntModal
      title={`HỦY ĐÀO TẠO HỌC VIÊN (${
        hocvien && hocvien.fullName.toUpperCase()
      } - ${hocvien && hocvien.maNhanVien})`}
      open={openModal}
      width={width >= 1200 ? "50%" : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        align={"center"}
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col lg={16} xs={24}>
            <FormItem
              label="Lý do hủy"
              name={["modalhuydaotao", "lyDoHuy"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Lý do hủy đào tạo" />
            </FormItem>
          </Col>
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <Button
                icon={<CloseCircleOutlined />}
                className="th-margin-bottom-0 btn-margin-bottom-0"
                type="danger"
                htmlType={"submit"}
                disabled={!fieldTouch}
              >
                Hủy đào tạo
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalHuyDaoTao;
