import { Modal as AntModal, Form, Card, Input, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { FormSubmit } from "src/components/Common";
import { useDispatch } from "react-redux";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";

const FormItem = Form.Item;
const initialState = {
  donViTraLuong_id: "",
  ghiChu: "",
};
function ModalSetting({ openModalFS, openModal, openAddDVTL, CBNV }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { donViTraLuong_id, ghiChu } = initialState;
  const { resetFields, setFieldsValue } = form;
  const [donViSelect, setDonViSelect] = useState([]);
  useEffect(() => {
    if (openModal) {
      getDonVi();
      setFieldsValue({
        donvitraluong: {
          donViTraluong_Id:
            CBNV[0].donViTraLuong_Id === undefined
              ? CBNV[0].donViTraLuongNew_Id.toLowerCase()
              : CBNV[0].donViTraLuong_Id,
          ghiChu: CBNV[0].ghiChu,
        },
      });
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);
  const getDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`DonVi?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setDonViSelect(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.donvitraluong);
  };

  const saveData = (donvitraluong) => {
    const newData = donvitraluong;
    donViSelect.forEach((d) => {
      if (d.id === donvitraluong.donViTraluong_Id) {
        newData.dt = [d.id, d.tenDonVi];
      }
    });
    newData.NV = CBNV.map((d) => d.id);
    openAddDVTL(newData);
    openModalFS(false);
    resetFields();
  };
  const handleCancel = () => {
    openModalFS(false);
  };
  return (
    <AntModal
      title="Đơn vị trả lương"
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
              {CBNV && (
                <h4>
                  CBNV:{" "}
                  {CBNV.map((d) => (
                    <span style={{ marginRight: 2 }}>{d.fullName}</span>
                  ))}
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
              label="Đơn vị trả lương"
              name={["donvitraluong", "donViTraluong_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={donViTraLuong_id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={donViSelect ? donViSelect : []}
                placeholder="Chọn đơn vị"
                optionsvalue={["id", "tenDonVi"]}
                style={{ width: "100%" }}
                allowClear
                optionFilterProp={"name"}
                showSearch
              />
            </FormItem>
            <FormItem
              label="Ghi chú"
              name={["donvitraluong", "ghiChu"]}
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

export default ModalSetting;
