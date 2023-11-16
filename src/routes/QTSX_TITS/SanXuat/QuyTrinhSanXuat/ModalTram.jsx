import { Modal as AntModal, Form, Row, Button, Card } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_CONGDOAN } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;

function ModalTram({ openModalFS, openModal, DataThemTram, itemData }) {
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
  const [ListTram, setListTram] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListTram();
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListTram = () => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id: itemData.tits_qtsx_Xuong_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Tram/tram-by-xuong?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        console.log(res.data);
        setListTram(res.data);
      } else {
        setListTram([]);
      }
    });
  };

  const onFinish = (values) => {
    const data = values.themtram;
    // const congdoan = ListCongDoan.filter(
    //   (d) => d.id === data.tits_qtsx_CongDoan_Id
    // );
    // const xuong = ListXuong.filter((d) => d.id === data.tits_qtsx_Xuong_Id);
    // const newData = {
    //   ...data,
    //   tenCongDoan: congdoan[0].tenCongDoan,
    //   maCongDoan: congdoan[0].maCongDoan,
    //   tenXuong: xuong[0].tenXuong,
    //   maXuong: xuong[0].maXuong,
    //   isChoPhepSCL: true,
    //   thuTu: 1,
    // };
    // DataThemTram(data);
    // resetFields();
    openModalFS(false);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm trạm"
      open={openModal}
      width={width > 1200 ? `50%` : `70%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <div className="gx-main-content">
          <Form
            {...DEFAULT_FORM_CONGDOAN}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Trạm"
              name={["themtram", "tits_qtsx_CongDoan_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListTram}
                placeholder="Chọn trạm"
                optionsvalue={["id", "temTram"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Trạm"
              name={["themtram", "tits_qtsx_CongDoan_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListTram}
                placeholder="Chọn trạm"
                optionsvalue={["id", "temTram"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm trạm
              </Button>
            </Row>
          </Form>
        </div>
      </Card>
    </AntModal>
  );
}

export default ModalTram;
