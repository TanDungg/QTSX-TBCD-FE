import {
  Modal as AntModal,
  Form,
  Row,
  Button,
  Card,
  Input,
  Switch,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Select } from "src/components/Common";
import { DEFAULT_FORM_CONGDOAN } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;

function ModalCongDoan({ openModalFS, openModal, DataThemCongDoan, itemData }) {
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
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [ListXuong, setListXuong] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListCongDoan();
      setFieldsValue({
        themcongdoan: {
          isChoPhepSCL: true,
        },
      });
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListCongDoan = () => {
    const param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CongDoan?${param}&page=-1`,
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
        setListCongDoan(res.data);
      } else {
        setListCongDoan([]);
      }
    });
  };

  const getListXuong = (congDoan_Id) => {
    const param = convertObjectToUrlParams({
      congDoan_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?${param}&page=-1`,
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
        setListXuong(res.data);
      } else {
        setListXuong([]);
      }
    });
  };

  const onFinish = (values) => {
    const data = values.themcongdoan;
    const congdoan = ListCongDoan.filter(
      (d) => d.id === data.tits_qtsx_CongDoan_Id
    );
    const xuong = ListXuong.filter((d) => d.id === data.tits_qtsx_Xuong_Id);
    const newData = {
      ...data,
      tenCongDoan: congdoan[0].tenCongDoan,
      maCongDoan: congdoan[0].maCongDoan,
      tenXuong: xuong[0].tenXuong,
      maXuong: xuong[0].maXuong,
      list_Trams: [],
    };
    DataThemCongDoan(newData);
    resetFields();
    openModalFS(false);
  };

  const handleOnSelectCongDoan = (value) => {
    getListXuong(value);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm công đoạn"
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
              label="Công đoạn"
              name={["themcongdoan", "tits_qtsx_CongDoan_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListCongDoan}
                placeholder="Chọn công đoạn"
                optionsvalue={["id", "tenCongDoan"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                onSelect={handleOnSelectCongDoan}
              />
            </FormItem>
            <FormItem
              label="Xưởng"
              name={["themcongdoan", "tits_qtsx_Xuong_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListXuong}
                placeholder="Chọn xưởng"
                optionsvalue={["id", "tenXuong"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Thứ tự"
              name={["themcongdoan", "thuTu"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Thứ tự" />
            </FormItem>
            <FormItem
              label="Cho phép SCL"
              name={["themcongdoan", "isChoPhepSCL"]}
              valuePropName="checked"
            >
              <Switch />
            </FormItem>
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm công đoạn
              </Button>
            </Row>
          </Form>
        </div>
      </Card>
    </AntModal>
  );
}

export default ModalCongDoan;
