import { RetweetOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Button,
  Card,
  Col,
  Divider,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";
import { getTokenInfo, getLocalStorage } from "src/util/Common";
const FormItem = Form.Item;

function ModalChuyenDaoTao({ openModalFS, openModal, hocvien, refesh }) {
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
    saveData(values.modalchuyendaotao);
  };

  const saveData = (modalchuyendaotao) => {
    const newData = {
      vptq_lms_LopHocChiTiet_Id: hocvien.vptq_lms_LopHocChiTiet_Id,
      ngayChuyenDaoTao: modalchuyendaotao.ngayChuyenDaoTao.format("DD/MM/YYYY"),
      lyDoChuyenDaoTao: modalchuyendaotao.lyDoChuyenDaoTao,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_TheoDoiDaoTao/chuyen-ngay-dao-tao/${hocvien.vptq_lms_LopHocChiTiet_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
          "PUT",
          newData,
          "CHUYEN",
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

  const disabledDate = (current) => {
    return current && current < dayjs().endOf("day");
  };

  const handleCancel = () => {
    resetFields();
    openModalFS(false);
    refesh();
  };

  return (
    <AntModal
      title={`CHUYỂN ĐÀO TẠO HỌC VIÊN (${
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
              label="Lý do chuyển"
              name={["modalchuyendaotao", "lyDoChuyenDaoTao"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Lý do chuyển đào tạo"
              />
            </FormItem>
          </Col>
          <Col lg={16} xs={24}>
            <FormItem
              label="Ngày chuyển"
              name={["modalchuyendaotao", "ngayChuyenDaoTao"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DatePicker
                format={"DD/MM/YYYY"}
                disabledDate={disabledDate}
                allowClear={false}
              />
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
                icon={<RetweetOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                htmlType={"submit"}
                disabled={!fieldTouch}
              >
                Chuyển đào tạo
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </AntModal>
  );
}

export default ModalChuyenDaoTao;
