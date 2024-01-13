import { Modal as AntModal, Button, Row, Form } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import Helpers from "src/helpers";
const FormItem = Form.Item;

function ModalAddSoVIN({
  openModalFS,
  openModal,
  tits_qtsx_SoLo_Id,
  tits_qtsx_SoLoChiTiet_Id,
  soVIN,
  refesh,
}) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { setFieldsValue } = form;
  const [ListSoVIN, setListSoVIN] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListSoVIN(tits_qtsx_SoLo_Id);
      if (soVIN) {
        setFieldsValue({
          soVIN: {
            tits_qtsx_SoVin_Id: soVIN.tits_qtsx_SoVin_Id,
          },
        });
      }
    }
  }, [openModal]);
  const getListSoVIN = (val) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SoVin/get-list-so-vin-chua-gan-ma-noi-bo?tits_qtsx_SoLo_Id=${val}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          if (soVIN) {
            setListSoVIN([...res.data, soVIN]);
          } else {
            setListSoVIN(res.data);
          }
        } else {
          setListSoVIN([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const handleCancel = () => {
    openModalFS(false);
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_SoVin_Id: values.soVIN.tits_qtsx_SoVin_Id,
      tits_qtsx_SoLoChiTiet_Id: tits_qtsx_SoLoChiTiet_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SoVin/put-gan-ma-noi-bo-vao-so-vin?${params}`,
          "PUT",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status === 200) {
          Helpers.alertSuccessMessage("Thêm số VIN thành công!!!");
          openModalFS(false);
          refesh();
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <AntModal
      title={"Số VIN"}
      open={openModal}
      width={`50%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Số VIN"
            name={["soVIN", "tits_qtsx_SoVin_Id"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSoVIN}
              placeholder="Chọn số VIN"
              optionsvalue={["tits_qtsx_SoVin_Id", "maSoVin"]}
              style={{ width: "100%" }}
            />
          </FormItem>

          <Row justify={"center"}>
            <Button
              className="th-margin-bottom-0"
              style={{ marginTop: 10, marginRight: 15 }}
              type="primary"
              htmlType="submit"
              disabled={!fieldTouch}
            >
              Lưu
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}
export default ModalAddSoVIN;
