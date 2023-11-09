import {
  Modal as AntModal,
  Form,
  Card,
  Input,
  Row,
  Col,
  DatePicker,
} from "antd";
import React, { useState } from "react";
import { FormSubmit } from "src/components/Common";
import { useDispatch } from "react-redux";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { fetchStart } from "src/appRedux/actions/Common";
import moment from "moment";
const FormItem = Form.Item;
const initialState = {
  ngayNghiViec: "",
  ghiChu: "",
};
function ModalNghiViec({ openModalFS, openModal, data, loading, refesh }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { ngayNghiViec, ghiChu } = initialState;
  const { resetFields } = form;

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.nghiViec);
  };

  const saveData = (user) => {
    const newData = user;
    newData.ngayNghiViec = moment(newData.ngayNghiViec._d.toString()).format(
      "MM-DD-YYYY"
    );
    newData.id = data.id;
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/nghi-viec/${data.id}`,
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
        if (res.status === 409) {
        } else {
          resetFields();
          setFieldTouch(false);
          openModalFS(false);
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };
  const handleCancel = () => {
    openModalFS(false);
    refesh();
  };

  return (
    <AntModal
      title="Cán bộ nhân viên nghỉ việc"
      open={openModal}
      width={`50%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Row style={{ marginBottom: 8 }}>
            <Col span={24} align="center">
              {data && (
                <h4>
                  CBNV: {data.maNhanVien} - {data.fullName}
                </h4>
              )}
            </Col>
          </Row>
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Ngày nghỉ việc"
              name={["nghiViec", "ngayNghiViec"]}
              rules={[
                {
                  required: true,
                },
              ]}
              initialValue={ngayNghiViec}
            >
              <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} />
            </FormItem>
            <FormItem
              label="Ghi chú"
              name={["nghiViec", "ghiChu"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={ghiChu}
            >
              <Input className="input-item" placeholder="Ghi chú" />
            </FormItem>
            <FormSubmit disabled={fieldTouch} />
          </Form>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalNghiViec;
