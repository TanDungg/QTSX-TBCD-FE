import React, { useState, useEffect } from "react";
import { Card, Form, Spin, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { getDateNow, setLocalStorage } from "src/util/Common";
import moment from "moment";
import dayjs from "dayjs";
const FormItem = Form.Item;

function VatTu({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [ListVatTu, setListVatTu] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (permission && !permission.view) {
      history.push("/home");
    } else {
      getVatTu();
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`VatTu/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setFieldsValue({
            vattu: {
              tenDonViTinh: res.data.tenDonViTinh,
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getVatTu = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("VatTu?page=-1", "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListVatTu(
            res.data.map((sp) => {
              return {
                ...sp,
                name: sp.maVatTu + " - " + sp.tenVatTu,
              };
            })
          );
        } else {
          setListVatTu([]);
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
    const newData = [];
    ListVatTu.forEach((sp) => {
      if (sp.id === values.vattu.vatTu_Id) {
        newData.push({
          id:
            sp.id +
            (values.vattu.hanSuDung ? "_" + values.vattu.hanSuDung._i : ""),
          maVatTu: sp.maVatTu,
          tenVatTu: sp.tenVatTu,
          hanSuDung: values.vattu.hanSuDung
            ? values.vattu.hanSuDung._i
            : undefined,
        });
      }
    });
    setLocalStorage("inMa", newData);
    window.open(`${match.url}/inMa`, "_blank");
  };

  const formTitle = "In Barcode vật tư";
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} />
      <Card className="th-card-margin-bottom">
        <Spin spinning={loading}>
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Vật tư"
              name={["vattu", "vatTu_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListVatTu ? ListVatTu : []}
                placeholder="Chọn vật tư"
                optionsvalue={["id", "name"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                onSelect={(val) => getInfo(val)}
              />
            </FormItem>
            <FormItem
              label="Đơn vị tính"
              name={["vattu", "tenDonViTinh"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input placeholder="Đơn vị tính" disabled={true} />
            </FormItem>
            <FormItem label="Hạn sử dụng" name={["vattu", "hanSuDung"]}>
              <DatePicker
                format={"DD/MM/YYYY"}
                placeholder="Chọn hạn sử dụng"
                style={{ width: 200 }}
                disabledDate={disabledDate}
                onChange={(date, dateString) => {
                  if (dateString === "") {
                    setFieldsValue({
                      vattu: {
                        hanSuDung: null,
                      },
                    });
                  } else {
                    setFieldsValue({
                      vattu: {
                        hanSuDung: moment(dateString, "DD/MM/YYYY"),
                      },
                    });
                  }
                }}
              />
            </FormItem>

            <FormSubmit content={"Tạo mã Barcode"} disabled={fieldTouch} />
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default VatTu;
